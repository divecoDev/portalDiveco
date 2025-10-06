# Arquitectura de la Herramienta de Explosión de Materiales

## Resumen Ejecutivo

La herramienta de Explosión de Materiales es un sistema integral para la gestión y procesamiento de datos de producción, diseñado para automatizar el análisis de materiales, generación de planes de producción y validación de aprovisionamiento. El sistema está construido con una arquitectura moderna basada en AWS Amplify Gen 2, Nuxt 3 y Azure Data Factory.

## Arquitectura General

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Nuxt 3)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Páginas       │  │  Componentes    │  │   Composables   │  │
│  │   - index.vue   │  │  - ExplosionProcess │  │  - useAuth    │  │
│  │   - edit/[id]   │  │  - PlanProduccionProcess │  │  - useBoomProcess │  │
│  │   - view/[id]   │  │  - ValidacionAprovisionamiento │  │  - useCargaInsumosData │  │
│  │   - new.vue     │  │  - CargaInsumosProcess │  │  - useLayoutState │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS AMPLIFY GEN 2                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   GraphQL API   │  │   Lambda Functions │  │   DynamoDB     │  │
│  │   - Mutations   │  │   - runPipeline │  │   - Boom Table  │  │
│  │   - Queries     │  │   - getStatusPipeline │  │   - CargaInsumos │  │
│  │   - Subscriptions │  │   - boomFilesStore │  │   - SapUserActionHistory │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AZURE DATA FACTORY                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Pipelines     │  │   Data Sources  │  │   Storage       │  │
│  │   - ExplocionarDesdePortal │  │   - SAP Systems │  │   - S3 Buckets │  │
│  │   - EjecutarExtraccionInsumos │  │   - SQL Server │  │   - CloudFront │  │
│  │   - EjecutarCalcularPlanVentasBoom │  │   - CSV Files │  │   - Azure Blob │  │
│  │   - EjecutarCalcularPlanDemadaBoom │  │   - Excel Files │  │   - Azure Data Lake │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Frontend (Nuxt 3)

#### Páginas
- **`/tools/explosion-materiales/index.vue`**: Lista principal de explosiones
- **`/tools/explosion-materiales/new.vue`**: Formulario para crear nuevas explosiones
- **`/tools/explosion-materiales/edit/[id].vue`**: Edición de explosiones existentes
- **`/tools/explosion-materiales/view/[id].vue`**: Vista detallada con proceso completo

#### Componentes Especializados
- **`ExplosionProcess.vue`**: Manejo del proceso final de explosión
- **`PlanProduccionProcess.vue`**: Gestión de los 3 procesos de producción
- **`ValidacionAprovisionamiento.vue`**: Validación de materiales
- **`CargaInsumosProcess.vue`**: Proceso de carga de datos iniciales
- **`CargaInsumosDataView.vue`**: Visualización de datos cargados

#### Composables
- **`useBoomProcess.ts`**: Lógica de negocio para procesos BOOM
- **`useCargaInsumosData.ts`**: Gestión de datos de carga de insumos
- **`useAuth.ts`**: Autenticación y autorización
- **`useLayoutState.ts`**: Estado global de la aplicación

### 2. Backend (AWS Amplify Gen 2)

#### Modelos de Datos
```typescript
Boom: {
  version: string,                    // Versión del boom (ej: "275")
  descripcion: string,                // Descripción del boom
  username: string,                   // Usuario que creó el boom
  status: string,                     // Estado actual
  aditionalData: json,                // Datos adicionales
  PiepelineRunIdInsumos: string,      // ID de ejecución pipeline insumos
  PiepelineRunIdPlanVentas: string,   // ID de ejecución pipeline ventas
  PiepelineRunIdPlanDemandas: string, // ID de ejecución pipeline demandas
  PiepelineRunIdExplocion: string,    // ID de ejecución pipeline explosión
  SyncInsumosStatus: string,          // Estado sincronización insumos
  SyncSalesPlanStatus: string,        // Estado sincronización ventas
  SyncDemandPlanStatus: string,       // Estado sincronización demandas
  ExecuteBoomStatus: string,          // Estado ejecución explosión
  reportePlanDemanda: json,           // Reporte de plan de demanda
  materialesSinAprovicion: json,      // Materiales sin aprovisionamiento
  materialesSinCentroProduccion: json, // Materiales sin centro producción
  insumoPlanVentasPath: string,       // Ruta archivo plan ventas
  insumoExistenciasPath: string,      // Ruta archivo existencias
  insumoCoberturaPath: string         // Ruta archivo cobertura
}
```

#### Funciones Lambda
- **`runPipeline`**: Ejecuta pipelines de Azure Data Factory
- **`getStatusPipeline`**: Consulta el estado de pipelines ejecutándose
- **`boomFilesStore`**: Almacena archivos CSV en S3
- **`GetPlanProduccion`**: Genera y almacena plan de producción
- **`GetMaterialesSinAprovicionamiento`**: Procesa materiales sin aprovisionamiento
- **`getMaterialesSinCentroProduccion`**: Procesa materiales sin centro de producción

### 3. Azure Data Factory Pipelines

#### Pipelines Principales
1. **`ExplocionarDesdePortal`**: Pipeline principal de explosión
2. **`EjecutarExtraccionInsumos`**: Extracción y procesamiento de insumos
3. **`EjecutarCalcularPlanVentasBoom`**: Cálculo del plan de ventas
4. **`EjecutarCalcularPlanDemadaBoom`**: Cálculo del plan de demanda

#### Flujo de Datos
```
Datos de Entrada → Procesamiento → Almacenamiento → Reportes
     ↓                ↓              ↓            ↓
  CSV Files    →   ADF Pipelines  →  S3 Bucket  →  CloudFront
  Excel Files  →   Data Transform →  Azure Blob →  Download Links
  SAP Systems  →   Data Validation →  Data Lake →  CSV Reports
```

## Flujo de Trabajo

### 1. Proceso de 4 Pasos

#### Paso 1: Carga de Insumos
- **Propósito**: Cargar datos iniciales necesarios para el análisis
- **Componente**: `CargaInsumosProcess.vue`
- **Archivos**: Plan de Ventas, Existencias, Cobertura
- **Almacenamiento**: S3 Bucket `explosion-materiales-uts`

#### Paso 2: Generar Plan de Producción
- **Propósito**: Ejecutar 3 procesos secuenciales para generar el plan
- **Componente**: `PlanProduccionProcess.vue`
- **Procesos**:
  1. Sincronizar Insumos (`EjecutarExtraccionInsumos`)
  2. Sincronizar Plan de Ventas (`EjecutarCalcularPlanVentasBoom`)
  3. Calcular Plan de Demanda (`EjecutarCalcularPlanDemadaBoom`)

#### Paso 3: Validación de Aprovisionamiento
- **Propósito**: Validar materiales y configuraciones
- **Componente**: `ValidacionAprovisionamiento.vue`
- **Funciones**: Verificar materiales sin aprovisionamiento y sin centro de producción

#### Paso 4: Explosionar
- **Propósito**: Ejecutar el proceso final de explosión
- **Componente**: `ExplosionProcess.vue`
- **Pipeline**: `ExplocionarDesdePortal`
- **Resultados**: 5 archivos CSV con reportes finales

### 2. Estados y Transiciones

```
NUEVO → EN_PROCESO → COMPLETADO
  ↓         ↓           ↓
ERROR ←─────┴───────────┘
```

#### Estados Detallados
- **EN_PROCESO**: Boom creado, proceso en ejecución
- **COMPLETADO**: Todos los pasos completados exitosamente
- **ERROR**: Error en algún paso del proceso
- **INACTIVO**: Boom deshabilitado temporalmente

### 3. Monitoreo y Polling

#### Sistema de Polling
- **Frecuencia**: Cada 10 segundos
- **Timeout**: 30 minutos máximo
- **Estados Monitoreados**: Queued, InProgress, Succeeded, Failed
- **Cleanup**: Limpieza automática al completar o fallar

#### Notificaciones
- **Toast Messages**: Feedback inmediato al usuario
- **Estados Visuales**: Indicadores de progreso en tiempo real
- **Logs**: Registro detallado en consola para debugging

## Integración con Servicios Externos

### 1. AWS Services
- **S3**: Almacenamiento de archivos CSV y datos temporales
- **CloudFront**: Distribución de archivos para descarga
- **DynamoDB**: Base de datos principal para metadatos
- **Lambda**: Procesamiento serverless
- **Cognito**: Autenticación y autorización

### 2. Azure Services
- **Data Factory**: Orquestación de pipelines de datos
- **SQL Server**: Fuente de datos empresariales
- **Blob Storage**: Almacenamiento de datos procesados
- **Data Lake**: Repositorio de datos estructurados

### 3. SAP Integration
- **SAP Systems**: Fuente principal de datos de producción
- **Web Services**: APIs para consulta de datos en tiempo real
- **Data Extraction**: Procesos automatizados de extracción

## Seguridad y Autorización

### 1. Autenticación
- **AWS Cognito**: Autenticación federada
- **Microsoft Graph**: Integración con Active Directory
- **JWT Tokens**: Manejo de sesiones seguras

### 2. Autorización
- **Roles**: Sistema de roles basado en grupos
- **Permisos**: Control granular de acceso por funcionalidad
- **Middleware**: Validación automática en rutas protegidas

### 3. Datos Sensibles
- **Encriptación**: Datos en tránsito y en reposo
- **API Keys**: Rotación automática de claves
- **Audit Logs**: Registro de todas las operaciones

