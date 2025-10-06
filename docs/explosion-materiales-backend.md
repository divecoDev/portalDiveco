# Documentación Backend - Herramienta de Explosión de Materiales

## Resumen

Esta documentación detalla las funciones Lambda, APIs, modelos de datos y servicios del backend de la herramienta de Explosión de Materiales, construido con AWS Amplify Gen 2 y Azure Data Factory.

## Estructura del Backend

```
amplify/
├── data/
│   └── resource.ts                    # Esquemas de datos y GraphQL API
├── functions/
│   ├── boom/
│   │   ├── runPipeline/               # Ejecutar pipelines de ADF
│   │   ├── GetStatusPipeline/         # Consultar estado de pipelines
│   │   ├── boomFilesStore.ts/         # Almacenar archivos en S3
│   │   ├── GetPlanProduccion/         # Generar plan de producción
│   │   ├── GetMaterialesSinAprovicionamiento/ # Materiales sin aprovisionamiento
│   │   └── getMaterialesSinCentroProduccion/  # Materiales sin centro producción
│   ├── carga-insumos/
│   │   ├── saveBatch/                 # Guardar datos por lotes
│   │   └── getData/                   # Consultar datos guardados
│   └── admin-users/                   # Funciones de administración de usuarios
└── backend.ts                         # Configuración principal
```

## Modelos de Datos

### 1. Modelo Boom

#### Esquema Principal
```typescript
Boom: {
  // Identificadores básicos
  id: string,                          // ID único del boom
  version: string,                     // Versión del boom (ej: "275")
  descripcion: string,                 // Descripción del boom
  username: string,                    // Usuario que creó el boom
  status: string,                      // Estado actual del boom
  aditionalData: json,                 // Datos adicionales en formato JSON
  
  // IDs de ejecución de pipelines
  PiepelineRunIdInsumos: string,       // ID del pipeline de insumos
  PiepelineRunIdPlanVentas: string,    // ID del pipeline de plan de ventas
  PiepelineRunIdPlanDemandas: string,  // ID del pipeline de plan de demandas
  PiepelineRunIdExplocion: string,     // ID del pipeline de explosión
  
  // Estados de sincronización
  SyncInsumosStatus: string,           // Estado: Pendiente | En Proceso | Completado | Error
  SyncSalesPlanStatus: string,         // Estado del plan de ventas
  SyncDemandPlanStatus: string,        // Estado del plan de demandas
  ExecuteBoomStatus: string,           // Estado de la explosión final
  
  // Reportes y datos procesados
  reportePlanDemanda: json,            // Reporte de plan de demanda
  materialesSinAprovicion: json,       // Materiales sin aprovisionamiento
  materialesSinCentroProduccion: json, // Materiales sin centro de producción
  
  // Rutas de archivos de entrada
  insumoPlanVentasPath: string,        // Ruta del archivo de plan de ventas
  insumoExistenciasPath: string,       // Ruta del archivo de existencias
  insumoCoberturaPath: string,         // Ruta del archivo de cobertura
  
  // Timestamps automáticos
  createdAt: string,                   // Fecha de creación
  updatedAt: string                    // Fecha de última actualización
}
```

#### Estados del Boom
```typescript
enum BoomStatus {
  EN_PROCESO = "EN_PROCESO",           // Boom creado, proceso iniciado
  COMPLETADO = "COMPLETADO",           // Todos los procesos completados
  ERROR = "ERROR",                     // Error en algún proceso
  INACTIVO = "INACTIVO"                // Boom deshabilitado
}

enum PipelineStatus {
  PENDIENTE = "Pendiente",             // Proceso pendiente de ejecución
  EN_PROCESO = "En Proceso",           // Proceso ejecutándose
  COMPLETADO = "Completado",           // Proceso completado exitosamente
  ERROR = "Error"                      // Proceso falló
}
```

### 2. Modelo CargaInsumos

#### Esquema de Datos
```typescript
CargaInsumosData: {
  id: string,                          // ID único del registro
  documentId: string,                  // ID del documento boom
  batchId: string,                     // ID del lote de procesamiento
  tipo: string,                        // Tipo de datos: "plan_ventas" | "existencias" | "cobertura"
  data: json,                          // Datos del archivo CSV
  metadata: json,                      // Metadatos del archivo
  createdAt: string,                   // Fecha de creación
  updatedAt: string                    // Fecha de actualización
}
```

### 3. Modelo SapUserActionHistory

#### Esquema de Auditoría
```typescript
SapUserActionHistory: {
  id: string,                          // ID único del registro
  sapUser: string,                     // Usuario SAP
  emailOwner: string,                  // Email del propietario
  accion: string,                      // Acción realizada: "RESET_PASSWORD" | "UNLOCK_USER"
  status: string,                      // Estado de la acción
  logs: string,                        // Logs detallados
  date: string,                        // Fecha de la acción
  createdAt: string,                   // Fecha de creación del registro
  updatedAt: string                    // Fecha de actualización
}
```

## Funciones Lambda

### 1. runPipeline

#### Propósito
Ejecuta pipelines de Azure Data Factory desde la aplicación.

#### Ubicación
`amplify/functions/boom/runPipeline/handler.ts`

#### Parámetros de Entrada
```typescript
interface RunPipelineInput {
  pipelineName: string,                // Nombre del pipeline a ejecutar
  Pversion?: string,                   // Versión del boom (opcional)
  boomId?: string                      // ID del boom (opcional)
}
```

#### Parámetros de Salida
```typescript
interface RunPipelineOutput {
  runId: string,                       // ID de ejecución del pipeline
  runGroupId: string,                  // ID del grupo de ejecución
  status: string,                      // Estado inicial del pipeline
  pipelineName: string,                // Nombre del pipeline ejecutado
  parameters: object,                  // Parámetros enviados al pipeline
  runStart: string,                    // Timestamp de inicio
  runEnd?: string                      // Timestamp de finalización (si aplica)
}
```

#### Implementación
```typescript
export const handler = async (event: any) => {
  const pipelineName = event.arguments.pipelineName || "";
  const Pversion = event.arguments.Pversion || "";
  const boomId = event.arguments.boomId || "";

  // Configuración de Azure
  const resourceGroupName = "ADF";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";

  // Autenticación con Azure
  const credential = new DefaultAzureCredential();
  const client = new DataFactoryManagementClient(credential, subscriptionId);

  // Parámetros del pipeline
  const parameters = {
    PVersion: Pversion,
    BoomId: boomId,
  };

  // Ejecutar pipeline
  const result = await client.pipelines.createRun(
    resourceGroupName,
    factoryName,
    pipelineName,
    { parameters }
  );

  return result;
};
```

#### Pipelines Soportados
- **`ExplocionarDesdePortal`**: Pipeline principal de explosión
- **`EjecutarExtraccionInsumos`**: Extracción de datos de insumos
- **`EjecutarCalcularPlanVentasBoom`**: Cálculo del plan de ventas
- **`EjecutarCalcularPlanDemadaBoom`**: Cálculo del plan de demanda

#### Variables de Entorno
```typescript
interface AzureEnvironment {
  AZURE_TENANT_ID: string,             // ID del tenant de Azure
  AZURE_CLIENT_ID: string,             // ID de la aplicación cliente
  AZURE_CLIENT_SECRET: string,         // Secreto de la aplicación cliente
  AZURE_SUBSCRIPTION_ID: string,       // ID de la suscripción de Azure
  AZURE_DATA_FACTORY_NAME: string      // Nombre del Data Factory
}
```

### 2. GetStatusPipeline

#### Propósito
Consulta el estado actual de un pipeline de Azure Data Factory en ejecución.

#### Ubicación
`amplify/functions/boom/GetStatusPipeline/handler.ts`

#### Parámetros de Entrada
```typescript
interface GetStatusInput {
  runId: string                        // ID de ejecución del pipeline
}
```

#### Parámetros de Salida
```typescript
interface PipelineStatusOutput {
  runId: string,                       // ID de ejecución
  status: string,                      // Estado: Queued | InProgress | Succeeded | Failed | Canceling | Cancelled
  runStart: string,                    // Timestamp de inicio
  runEnd?: string,                     // Timestamp de finalización
  durationInMs?: number,               // Duración en milisegundos
  message?: string,                    // Mensaje de estado
  error?: string,                      // Error si el pipeline falló
  parameters: object,                  // Parámetros utilizados
  pipelineName: string                 // Nombre del pipeline
}
```

#### Implementación
```typescript
export const handler = async (event: any) => {
  const runId = event.arguments.runId || "";
  
  const resourceGroupName = "ADF";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";

  const credential = new DefaultAzureCredential();
  const client = new DataFactoryManagementClient(credential, subscriptionId);
  
  const result = await client.pipelineRuns.get(resourceGroupName, factoryName, runId);
  
  return result;
};
```

#### Estados Posibles
- **`Queued`**: Pipeline en cola esperando recursos
- **`InProgress`**: Pipeline ejecutándose activamente
- **`Succeeded`**: Pipeline completado exitosamente
- **`Failed`**: Pipeline falló durante la ejecución
- **`Canceling`**: Pipeline siendo cancelado
- **`Cancelled`**: Pipeline cancelado

### 3. boomFilesStore

#### Propósito
Almacena archivos CSV generados por los pipelines en S3 para posterior descarga.

#### Ubicación
`amplify/functions/boom/boomFilesStore.ts/handler.ts`

#### Parámetros de Entrada
```typescript
interface BoomFilesStoreInput {
  boom_id: string,                     // ID del boom (header)
  file_type: string,                   // Tipo de archivo (header)
  body: any[]                          // Datos JSON a convertir a CSV
}
```

#### Tipos de Archivos Soportados
```typescript
enum FileType {
  APROVISIONAMIENTO_CONFIGURADO = "AprovisionamientoConfigurado",
  PLAN_MODELO_CON_SEMIELABORADOS = "PlanModeloConSemielaborados",
  PLAN_MODELO_MATERIAS_PRIMA = "PlanModeloMateriasPrimaConSemielaborados",
  PLAN_VENTAS = "PlanVentas",
  PLAN_PRODUCCION = "PlanProduccion",
  MATERIALES_SIN_APROVICIONAMIENTO = "materiales-sin-aprovicionamiento",
  MATERIALES_SIN_CENTRO_PRODUCCION = "materiales-sin-centro-produccion"
}
```

#### Implementación
```typescript
export const handler = async (event: any) => {
  const boomId = event.headers.boom_id;
  const fileType = event.headers.file_type;
  
  if (!boomId || !fileType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "boom_id and file_type are required" }),
    };
  }

  try {
    let data = event.body;
    
    // Parsear JSON si viene como string
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // Convertir a CSV
    const csv = await json2csv(Array.isArray(data) ? data : [data]);
    
    // Configurar S3
    const s3Client = new S3Client({});
    const fileName = `${boomId}/${fileType}.csv`;
    const bucketName = 'explosion-materiales-uts';
    
    // Subir a S3
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: csv,
      ContentType: 'text/csv',
      ContentDisposition: `attachment; filename="${fileName}"`
    }));
    
    return {
      success: true,
      message: "File stored successfully",
      fileName: fileName,
      bucketName: bucketName,
      s3Key: fileName
    };
  } catch (error) {
    console.error("Error storing file:", error);
    return {
      success: false,
      message: "Error storing file",
      error: error.message
    };
  }
};
```

### 4. GetPlanProduccion

#### Propósito
Genera y almacena el plan de producción como archivo CSV en S3.

#### Ubicación
`amplify/functions/boom/GetPlanProduccion/handler.ts`

#### Funcionalidades
- Convierte datos JSON a formato CSV
- Almacena el archivo en S3 con nombre específico
- Retorna información de ubicación del archivo

#### Implementación
```typescript
export const handler = async (event: any) => {
  try {
    const boomId = event.headers.boom_id;
    let data = event.body;
    
    // Procesar datos de entrada
    const dataArray = Array.isArray(data) ? data : [data];
    
    // Convertir a CSV
    const csv = await json2csv(dataArray);
    
    // Configurar S3
    const s3Client = new S3Client({});
    const fileName = `plan-produccion-${boomId}.csv`;
    const bucketName = 'explosion-materiales-uts';
    
    // Subir archivo
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: csv,
      ContentType: 'text/csv',
      ContentDisposition: `attachment; filename="${fileName}"`
    }));
    
    return {
      success: true,
      message: "Plan de Produccion obtenido y guardado en S3",
      fileName: fileName,
      bucketName: bucketName,
      s3Key: fileName
    };
  } catch (error) {
    console.error("Error in GetPlanProduccion handler:", error);
    return {
      success: false,
      message: "Error processing plan de producción",
      error: error.message
    };
  }
};
```

### 5. GetMaterialesSinAprovicionamiento

#### Propósito
Procesa y almacena materiales sin aprovisionamiento en formato CSV.

#### Ubicación
`amplify/functions/boom/GetMaterialesSinAprovicionamiento/handler.ts`

#### Funcionalidades
- Identifica materiales sin aprovisionamiento adecuado
- Genera reporte en formato CSV
- Almacena en S3 para descarga

#### Implementación
```typescript
export const handler = async (event: any) => {
  try {
    const boomId = event.headers.boom_id;
    let data = event.body;
    
    // Procesar datos
    const dataArray = Array.isArray(data) ? data : [data];
    const csv = await json2csv(dataArray);
    
    // Configurar S3
    const s3Client = new S3Client({});
    const fileName = `${boomId}/materiales-sin-aprovicionamiento.csv`;
    const bucketName = 'explosion-materiales-uts';
    
    // Subir archivo
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: csv,
      ContentType: 'text/csv',
      ContentDisposition: `attachment; filename="${fileName}"`
    }));
    
    return {
      success: true,
      message: "Materiales sin aprovisionamiento procesados",
      fileName: fileName,
      bucketName: bucketName,
      s3Key: fileName
    };
  } catch (error) {
    console.error("Error processing materiales sin aprovisionamiento:", error);
    return {
      success: false,
      message: "Error processing materiales sin aprovisionamiento",
      error: error.message
    };
  }
};
```

### 6. getMaterialesSinCentroProduccion

#### Propósito
Procesa y almacena materiales sin centro de producción en formato CSV.

#### Ubicación
`amplify/functions/boom/getMaterialesSinCentroProduccion/handler.ts`

#### Funcionalidades
- Identifica materiales sin centro de producción asignado
- Genera reporte en formato CSV
- Almacena en S3 para descarga

#### Implementación
Similar a `GetMaterialesSinAprovicionamiento` pero enfocado en centros de producción.

## Funciones de Carga de Insumos

### 1. saveBatch

#### Propósito
Guarda datos de carga de insumos por lotes en la base de datos.

#### Ubicación
`amplify/functions/carga-insumos/saveBatch/handler.ts`

#### Parámetros de Entrada
```typescript
interface SaveBatchInput {
  tipo: string,                        // Tipo de datos: "plan_ventas" | "existencias" | "cobertura"
  data: any[],                         // Array de datos a guardar
  metadata: {                          // Metadatos del archivo
    fileName: string,
    fileSize: number,
    uploadDate: string,
    documentId: string
  }
}
```

#### Funcionalidades
- Procesa datos en lotes para optimizar rendimiento
- Valida formato de datos antes de guardar
- Genera IDs únicos para cada lote
- Maneja errores de validación

### 2. getData

#### Propósito
Consulta datos de carga de insumos guardados previamente.

#### Ubicación
`amplify/functions/carga-insumos/getData/handler.ts`

#### Parámetros de Entrada
```typescript
interface GetDataInput {
  documentId?: string,                 // ID del documento boom
  batchId?: string,                    // ID del lote específico
  tipo?: string,                       // Tipo de datos a consultar
  limit?: number,                      // Límite de registros
  offset?: number                      // Offset para paginación
}
```

#### Parámetros de Salida
```typescript
interface GetDataOutput {
  success: boolean,
  data: any[],                         // Datos consultados
  summary: {                           // Resumen de la consulta
    totalRecords: number,
    returnedRecords: number,
    documentId: string,
    batchId: string,
    tipo: string
  },
  pagination: {                        // Información de paginación
    limit: number,
    offset: number,
    hasMore: boolean
  }
}
```

## GraphQL API

### 1. Mutations

#### runPipeline
```graphql
mutation RunPipeline($pipelineName: String!, $Pversion: String, $boomId: String) {
  runPipeline(pipelineName: $pipelineName, Pversion: $Pversion, boomId: $boomId) {
    runId
    runGroupId
    status
    pipelineName
    parameters
    runStart
    runEnd
  }
}
```

#### saveCargaInsumosBatch
```graphql
mutation SaveCargaInsumosBatch(
  $tipo: String!
  $data: AWSJSON!
  $metadata: AWSJSON!
) {
  saveCargaInsumosBatch(tipo: $tipo, data: $data, metadata: $metadata) {
    success
    message
    batchId
    totalRecords
  }
}
```

### 2. Queries

#### getStatusPipeline
```graphql
query GetStatusPipeline($runId: String!) {
  getStatusPipeline(runId: $runId) {
    runId
    status
    runStart
    runEnd
    durationInMs
    message
    error
    parameters
    pipelineName
  }
}
```

#### getCargaInsumosData
```graphql
query GetCargaInsumosData(
  $documentId: String
  $batchId: String
  $tipo: String
  $limit: Int
  $offset: Int
) {
  getCargaInsumosData(
    documentId: $documentId
    batchId: $batchId
    tipo: $tipo
    limit: $limit
    offset: $offset
  ) {
    success
    data
    summary {
      totalRecords
      returnedRecords
      documentId
      batchId
      tipo
    }
    pagination {
      limit
      offset
      hasMore
    }
  }
}
```

#### getMaterialesSinAprovicionamiento
```graphql
query GetMaterialesSinAprovicionamiento($boomId: String!) {
  getMaterialesSinAprovicionamiento(boomId: $boomId) {
    success
    message
    fileName
    bucketName
    s3Key
  }
}
```

#### getMaterialesSinCentroProduccion
```graphql
query GetMaterialesSinCentroProduccion($boomId: String!) {
  getMaterialesSinCentroProduccion(boomId: $boomId) {
    success
    message
    fileName
    bucketName
    s3Key
  }
}
```

### 3. Modelos CRUD

#### Boom Model
```graphql
# Crear boom
mutation CreateBoom($input: CreateBoomInput!) {
  createBoom(input: $input) {
    id
    version
    descripcion
    username
    status
    createdAt
    updatedAt
  }
}

# Consultar boom
query GetBoom($id: ID!) {
  getBoom(id: $id) {
    id
    version
    descripcion
    username
    status
    PiepelineRunIdInsumos
    PiepelineRunIdPlanVentas
    PiepelineRunIdPlanDemandas
    PiepelineRunIdExplocion
    SyncInsumosStatus
    SyncSalesPlanStatus
    SyncDemandPlanStatus
    ExecuteBoomStatus
    createdAt
    updatedAt
  }
}

# Listar booms
query ListBooms($filter: ModelBoomFilterInput, $limit: Int, $nextToken: String) {
  listBooms(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      version
      descripcion
      username
      status
      createdAt
      updatedAt
    }
    nextToken
  }
}

# Actualizar boom
mutation UpdateBoom($input: UpdateBoomInput!) {
  updateBoom(input: $input) {
    id
    version
    descripcion
    username
    status
    PiepelineRunIdInsumos
    PiepelineRunIdPlanVentas
    PiepelineRunIdPlanDemandas
    PiepelineRunIdExplocion
    SyncInsumosStatus
    SyncSalesPlanStatus
    SyncDemandPlanStatus
    ExecuteBoomStatus
    updatedAt
  }
}

# Eliminar boom
mutation DeleteBoom($input: DeleteBoomInput!) {
  deleteBoom(input: $input) {
    id
    version
    descripcion
  }
}
```

## Integración con Azure Data Factory

### 1. Configuración de Autenticación

#### Service Principal
```typescript
interface AzureCredentials {
  tenantId: string,                    // ID del tenant de Azure
  clientId: string,                    // ID de la aplicación
  clientSecret: string,                // Secreto de la aplicación
  subscriptionId: string               // ID de la suscripción
}
```

#### Variables de Entorno
```bash
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_DATA_FACTORY_NAME=your-data-factory-name
```

### 2. Pipelines de Data Factory

#### ExplocionarDesdePortal
- **Propósito**: Pipeline principal que ejecuta todo el proceso de explosión
- **Parámetros**: `PVersion`, `BoomId`
- **Output**: 5 archivos CSV con resultados finales

#### EjecutarExtraccionInsumos
- **Propósito**: Extrae y procesa datos de insumos desde fuentes SAP
- **Parámetros**: `BoomId`
- **Output**: Datos procesados de insumos

#### EjecutarCalcularPlanVentasBoom
- **Propósito**: Calcula el plan de ventas basado en datos cargados
- **Parámetros**: `PVersion`
- **Output**: Plan de ventas calculado

#### EjecutarCalcularPlanDemadaBoom
- **Propósito**: Calcula el plan de demanda basado en ventas e insumos
- **Parámetros**: `PVersion`, `BoomId`
- **Output**: Plan de demanda calculado

### 3. Monitoreo de Pipelines

#### Estados de Ejecución
```typescript
enum PipelineRunStatus {
  QUEUED = "Queued",                   // En cola
  IN_PROGRESS = "InProgress",          // En progreso
  SUCCEEDED = "Succeeded",             // Completado exitosamente
  FAILED = "Failed",                   // Falló
  CANCELING = "Canceling",             // Cancelando
  CANCELLED = "Cancelled"              // Cancelado
}
```

#### Polling Strategy
- **Frecuencia**: Cada 10 segundos
- **Timeout**: 30 minutos máximo
- **Retry Logic**: Reintentos automáticos en caso de fallos de red
- **Cleanup**: Limpieza automática de recursos al completar

## Almacenamiento S3

### 1. Estructura de Buckets

#### Bucket Principal
```
explosion-materiales-uts/
├── {boomId}/
│   ├── AprovisionamientoConfigurado.csv
│   ├── PlanModeloConSemielaborados.csv
│   ├── PlanModeloMateriasPrimaConSemielaborados.csv
│   ├── PlanVentas.csv
│   ├── PlanProduccion.csv
│   ├── materiales-sin-aprovicionamiento.csv
│   └── materiales-sin-centro-produccion.csv
└── temp/
    └── {batchId}/
        └── processed-files/
```

### 2. Configuración de Archivos

#### Headers HTTP
```typescript
interface S3FileHeaders {
  'Content-Type': 'text/csv',
  'Content-Disposition': 'attachment; filename="filename.csv"',
  'Cache-Control': 'max-age=3600'
}
```

#### Lifecycle Policies
- **Transición a IA**: Después de 30 días
- **Transición a Glacier**: Después de 90 días
- **Eliminación**: Después de 365 días

### 3. CloudFront Distribution

#### Configuración
- **Domain**: `d1p0twkya81b3k.cloudfront.net`
- **Caching**: Cache de 1 hora para archivos CSV
- **Compression**: Compresión GZIP habilitada
- **Security**: HTTPS obligatorio

#### URLs de Descarga
```
https://d1p0twkya81b3k.cloudfront.net/{boomId}/{filename}.csv
```

## Seguridad y Autorización

### 1. Autenticación

#### API Key Authentication
```typescript
interface ApiKeyConfig {
  expiresInDays: 30,                   // Expiración en 30 días
  description: "Portal Diveco API Key"
}
```

#### IAM Roles
- **Lambda Execution Role**: Permisos para S3, DynamoDB y Azure
- **API Gateway Role**: Permisos para invocar funciones Lambda
- **Cognito Role**: Permisos para autenticación de usuarios

### 2. Autorización

#### GraphQL Schema Authorization
```typescript
.authorization((allow) => [allow.publicApiKey()])
```

#### Lambda Function Authorization
- **API Key Required**: Todas las funciones requieren API key válida
- **Rate Limiting**: Límite de 1000 requests por minuto por API key
- **CORS**: Configuración CORS para dominios permitidos

### 3. Validación de Datos

#### Input Validation
```typescript
interface ValidationRules {
  pipelineName: {
    required: true,
    pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    maxLength: 100
  },
  boomId: {
    required: false,
    pattern: /^[a-f0-9-]{36}$/,
    description: "UUID format"
  },
  Pversion: {
    required: false,
    pattern: /^\d+$/,
    description: "Numeric version"
  }
}
```

#### Error Handling
```typescript
interface ErrorResponse {
  success: false,
  message: string,
  error: string,
  code?: string,
  details?: any
}
```

## Monitoreo y Logging

### 1. CloudWatch Logs

#### Log Groups
- `/aws/lambda/runPipeline`
- `/aws/lambda/getStatusPipeline`
- `/aws/lambda/boomFilesStore`
- `/aws/lambda/saveBatch`
- `/aws/lambda/getData`

#### Log Format
```typescript
interface LogEntry {
  timestamp: string,
  level: 'INFO' | 'WARN' | 'ERROR',
  message: string,
  context: {
    functionName: string,
    requestId: string,
    userId?: string,
    boomId?: string,
    pipelineName?: string,
    runId?: string
  },
  data?: any
}
```

### 2. Métricas Personalizadas

#### Business Metrics
- **Boom Creation Rate**: Número de booms creados por día
- **Pipeline Success Rate**: Tasa de éxito de pipelines
- **File Generation Time**: Tiempo promedio de generación de archivos
- **User Activity**: Actividad de usuarios por funcionalidad

#### Technical Metrics
- **Lambda Duration**: Duración de ejecución de funciones
- **Lambda Errors**: Número de errores por función
- **API Gateway Latency**: Latencia de API Gateway
- **S3 Operations**: Operaciones de S3 (GET, PUT, DELETE)

### 3. Alertas

#### CloudWatch Alarms
```typescript
interface AlarmConfig {
  name: "High Error Rate",
  metric: "Errors",
  threshold: 5,
  period: 300,
  evaluationPeriods: 2,
  comparisonOperator: "GreaterThanThreshold"
}
```

#### SNS Notifications
- **Email Alerts**: Alertas por email para errores críticos
- **Slack Integration**: Notificaciones en Slack para el equipo
- **PagerDuty**: Alertas de alta prioridad para incidentes

## Performance y Optimización

### 1. Lambda Optimization

#### Memory Configuration
```typescript
interface LambdaConfig {
  runPipeline: {
    memoryMB: 1024,
    timeoutSeconds: 300
  },
  getStatusPipeline: {
    memoryMB: 256,
    timeoutSeconds: 30
  },
  boomFilesStore: {
    memoryMB: 512,
    timeoutSeconds: 60
  }
}
```

#### Cold Start Mitigation
- **Provisioned Concurrency**: Para funciones críticas
- **Connection Pooling**: Pool de conexiones para Azure y S3
- **Warm-up**: Funciones de warm-up para mantener conexiones activas

### 2. Database Optimization

#### DynamoDB Configuration
```typescript
interface DynamoDBConfig {
  Boom: {
    billingMode: "PAY_PER_REQUEST",
    pointInTimeRecovery: true,
    globalSecondaryIndexes: [
      {
        indexName: "version-index",
        partitionKey: "version",
        sortKey: "createdAt"
      }
    ]
  }
}
```

#### Query Optimization
- **Batch Operations**: Operaciones por lotes para mejor rendimiento
- **Pagination**: Paginación para consultas grandes
- **Filtering**: Filtros en el cliente para reducir transferencia de datos

### 3. API Optimization

#### GraphQL Optimization
- **Query Depth Limiting**: Límite de profundidad de queries
- **Query Complexity Analysis**: Análisis de complejidad de queries
- **Response Caching**: Cache de respuestas para queries frecuentes

#### Rate Limiting
```typescript
interface RateLimitConfig {
  default: {
    requests: 1000,
    window: 60, // seconds
    burst: 100
  },
  runPipeline: {
    requests: 10,
    window: 60,
    burst: 5
  }
}
```

---

*Esta documentación proporciona una guía completa para el desarrollo, mantenimiento y optimización del backend de la herramienta de Explosión de Materiales.*
