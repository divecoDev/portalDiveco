# API Reference - Herramienta de Explosión de Materiales

## Resumen

Esta documentación proporciona una referencia completa de todos los endpoints, contratos de datos y ejemplos de uso de la API de la herramienta de Explosión de Materiales.

## Información General

### Base URL
```
https://api.portaldiveco.com/graphql
```

### Autenticación
Todas las requests requieren un API key válido en el header:
```
x-api-key: your-api-key-here
```

### Formato de Respuesta
Todas las respuestas siguen el formato estándar de GraphQL:
```json
{
  "data": {
    // Datos de respuesta
  },
  "errors": [
    // Errores si los hay
  ]
}
```

## Mutations

### 1. runPipeline

Ejecuta un pipeline de Azure Data Factory.

#### Request
```graphql
mutation RunPipeline(
  $pipelineName: String!
  $Pversion: String
  $boomId: String
) {
  runPipeline(
    pipelineName: $pipelineName
    Pversion: $Pversion
    boomId: $boomId
  ) {
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

#### Variables
```json
{
  "pipelineName": "ExplocionarDesdePortal",
  "Pversion": "275",
  "boomId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response Success
```json
{
  "data": {
    "runPipeline": {
      "runId": "12345678-1234-1234-1234-123456789012",
      "runGroupId": "12345678-1234-1234-1234-123456789012",
      "status": "Queued",
      "pipelineName": "ExplocionarDesdePortal",
      "parameters": {
        "PVersion": "275",
        "BoomId": "123e4567-e89b-12d3-a456-426614174000"
      },
      "runStart": "2024-01-15T10:30:00Z",
      "runEnd": null
    }
  }
}
```

#### Response Error
```json
{
  "data": null,
  "errors": [
    {
      "message": "Pipeline 'InvalidPipeline' not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["runPipeline"],
      "extensions": {
        "code": "PIPELINE_NOT_FOUND",
        "exception": {
          "stacktrace": ["..."]
        }
      }
    }
  ]
}
```

#### Pipelines Disponibles
- `ExplocionarDesdePortal`: Pipeline principal de explosión
- `EjecutarExtraccionInsumos`: Extracción de datos de insumos
- `EjecutarCalcularPlanVentasBoom`: Cálculo del plan de ventas
- `EjecutarCalcularPlanDemadaBoom`: Cálculo del plan de demanda

### 2. saveCargaInsumosBatch

Guarda datos de carga de insumos por lotes.

#### Request
```graphql
mutation SaveCargaInsumosBatch(
  $tipo: String!
  $data: AWSJSON!
  $metadata: AWSJSON!
) {
  saveCargaInsumosBatch(
    tipo: $tipo
    data: $data
    metadata: $metadata
  ) {
    success
    message
    batchId
    totalRecords
  }
}
```

#### Variables
```json
{
  "tipo": "plan_ventas",
  "data": [
    {
      "material": "MAT001",
      "cantidad": 100,
      "fecha": "2024-01-15"
    },
    {
      "material": "MAT002",
      "cantidad": 200,
      "fecha": "2024-01-16"
    }
  ],
  "metadata": {
    "fileName": "plan_ventas_2024.csv",
    "fileSize": 1024,
    "uploadDate": "2024-01-15T10:30:00Z",
    "documentId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

#### Response Success
```json
{
  "data": {
    "saveCargaInsumosBatch": {
      "success": true,
      "message": "Batch saved successfully",
      "batchId": "batch_12345678-1234-1234-1234-123456789012",
      "totalRecords": 2
    }
  }
}
```

#### Tipos de Datos Soportados
- `plan_ventas`: Datos del plan de ventas
- `existencias`: Datos de existencias/inventario
- `cobertura`: Datos de cobertura de materiales

### 3. Model CRUD Operations

#### createBoom
```graphql
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
```

#### updateBoom
```graphql
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
```

#### deleteBoom
```graphql
mutation DeleteBoom($input: DeleteBoomInput!) {
  deleteBoom(input: $input) {
    id
    version
    descripcion
  }
}
```

## Queries

### 1. getStatusPipeline

Consulta el estado de un pipeline en ejecución.

#### Request
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

#### Variables
```json
{
  "runId": "12345678-1234-1234-1234-123456789012"
}
```

#### Response Success
```json
{
  "data": {
    "getStatusPipeline": {
      "runId": "12345678-1234-1234-1234-123456789012",
      "status": "Succeeded",
      "runStart": "2024-01-15T10:30:00Z",
      "runEnd": "2024-01-15T10:35:00Z",
      "durationInMs": 300000,
      "message": "Pipeline completed successfully",
      "error": null,
      "parameters": {
        "PVersion": "275",
        "BoomId": "123e4567-e89b-12d3-a456-426614174000"
      },
      "pipelineName": "ExplocionarDesdePortal"
    }
  }
}
```

#### Estados Posibles
- `Queued`: Pipeline en cola esperando recursos
- `InProgress`: Pipeline ejecutándose activamente
- `Succeeded`: Pipeline completado exitosamente
- `Failed`: Pipeline falló durante la ejecución
- `Canceling`: Pipeline siendo cancelado
- `Cancelled`: Pipeline cancelado

### 2. getCargaInsumosData

Consulta datos de carga de insumos guardados.

#### Request
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

#### Variables
```json
{
  "documentId": "123e4567-e89b-12d3-a456-426614174000",
  "tipo": "plan_ventas",
  "limit": 100,
  "offset": 0
}
```

#### Response Success
```json
{
  "data": {
    "getCargaInsumosData": {
      "success": true,
      "data": [
        {
          "material": "MAT001",
          "cantidad": 100,
          "fecha": "2024-01-15"
        }
      ],
      "summary": {
        "totalRecords": 150,
        "returnedRecords": 100,
        "documentId": "123e4567-e89b-12d3-a456-426614174000",
        "batchId": "batch_12345678-1234-1234-1234-123456789012",
        "tipo": "plan_ventas"
      },
      "pagination": {
        "limit": 100,
        "offset": 0,
        "hasMore": true
      }
    }
  }
}
```

### 3. getMaterialesSinAprovicionamiento

Consulta materiales sin aprovisionamiento.

#### Request
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

#### Variables
```json
{
  "boomId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response Success
```json
{
  "data": {
    "getMaterialesSinAprovicionamiento": {
      "success": true,
      "message": "Materiales sin aprovisionamiento procesados",
      "fileName": "123e4567-e89b-12d3-a456-426614174000/materiales-sin-aprovicionamiento.csv",
      "bucketName": "explosion-materiales-uts",
      "s3Key": "123e4567-e89b-12d3-a456-426614174000/materiales-sin-aprovicionamiento.csv"
    }
  }
}
```

### 4. getMaterialesSinCentroProduccion

Consulta materiales sin centro de producción.

#### Request
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

#### Variables
```json
{
  "boomId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Response Success
```json
{
  "data": {
    "getMaterialesSinCentroProduccion": {
      "success": true,
      "message": "Materiales sin centro de producción procesados",
      "fileName": "123e4567-e89b-12d3-a456-426614174000/materiales-sin-centro-produccion.csv",
      "bucketName": "explosion-materiales-uts",
      "s3Key": "123e4567-e89b-12d3-a456-426614174000/materiales-sin-centro-produccion.csv"
    }
  }
}
```

### 5. Model CRUD Operations

#### getBoom
```graphql
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
```

#### listBooms
```graphql
query ListBooms(
  $filter: ModelBoomFilterInput
  $limit: Int
  $nextToken: String
) {
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
```

## Tipos de Datos

### 1. Boom

```graphql
type Boom {
  id: ID!
  version: String!
  descripcion: String!
  username: String!
  status: String!
  aditionalData: AWSJSON
  PiepelineRunIdInsumos: String
  PiepelineRunIdPlanVentas: String
  PiepelineRunIdPlanDemandas: String
  PiepelineRunIdExplocion: String
  SyncInsumosStatus: String
  SyncSalesPlanStatus: String
  SyncDemandPlanStatus: String
  ExecuteBoomStatus: String
  reportePlanDemanda: AWSJSON
  materialesSinAprovicion: AWSJSON
  materialesSinCentroProduccion: AWSJSON
  insumoPlanVentasPath: String
  insumoExistenciasPath: String
  insumoCoberturaPath: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

### 2. Input Types

#### CreateBoomInput
```graphql
input CreateBoomInput {
  version: String!
  descripcion: String!
  username: String!
  status: String!
  aditionalData: AWSJSON
  PiepelineRunIdInsumos: String
  PiepelineRunIdPlanVentas: String
  PiepelineRunIdPlanDemandas: String
  PiepelineRunIdExplocion: String
  SyncInsumosStatus: String
  SyncSalesPlanStatus: String
  SyncDemandPlanStatus: String
  ExecuteBoomStatus: String
  reportePlanDemanda: AWSJSON
  materialesSinAprovicion: AWSJSON
  materialesSinCentroProduccion: AWSJSON
  insumoPlanVentasPath: String
  insumoExistenciasPath: String
  insumoCoberturaPath: String
}
```

#### UpdateBoomInput
```graphql
input UpdateBoomInput {
  id: ID!
  version: String
  descripcion: String
  username: String
  status: String
  aditionalData: AWSJSON
  PiepelineRunIdInsumos: String
  PiepelineRunIdPlanVentas: String
  PiepelineRunIdPlanDemandas: String
  PiepelineRunIdExplocion: String
  SyncInsumosStatus: String
  SyncSalesPlanStatus: String
  SyncDemandPlanStatus: String
  ExecuteBoomStatus: String
  reportePlanDemanda: AWSJSON
  materialesSinAprovicion: AWSJSON
  materialesSinCentroProduccion: AWSJSON
  insumoPlanVentasPath: String
  insumoExistenciasPath: String
  insumoCoberturaPath: String
}
```

#### DeleteBoomInput
```graphql
input DeleteBoomInput {
  id: ID!
}
```

### 3. Filter Types

#### ModelBoomFilterInput
```graphql
input ModelBoomFilterInput {
  id: ModelIDInput
  version: ModelStringInput
  descripcion: ModelStringInput
  username: ModelStringInput
  status: ModelStringInput
  createdAt: ModelStringInput
  updatedAt: ModelStringInput
  and: [ModelBoomFilterInput]
  or: [ModelBoomFilterInput]
  not: ModelBoomFilterInput
}
```

#### ModelStringInput
```graphql
input ModelStringInput {
  ne: String
  eq: String
  le: String
  lt: String
  ge: String
  gt: String
  contains: String
  notContains: String
  between: [String]
  beginsWith: String
}
```

#### ModelIDInput
```graphql
input ModelIDInput {
  ne: ID
  eq: ID
  le: ID
  lt: ID
  ge: ID
  gt: ID
  contains: ID
  notContains: ID
  between: [ID]
  beginsWith: ID
}
```

## Códigos de Error

### 1. Errores de Autenticación

#### UNAUTHORIZED
```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHORIZED"
      }
    }
  ]
}
```

#### FORBIDDEN
```json
{
  "errors": [
    {
      "message": "Access denied",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

### 2. Errores de Validación

#### VALIDATION_ERROR
```json
{
  "errors": [
    {
      "message": "Validation error",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "field": "pipelineName",
        "details": "Pipeline name is required"
      }
    }
  ]
}
```

### 3. Errores de Pipeline

#### PIPELINE_NOT_FOUND
```json
{
  "errors": [
    {
      "message": "Pipeline not found",
      "extensions": {
        "code": "PIPELINE_NOT_FOUND",
        "pipelineName": "InvalidPipeline"
      }
    }
  ]
}
```

#### PIPELINE_EXECUTION_FAILED
```json
{
  "errors": [
    {
      "message": "Pipeline execution failed",
      "extensions": {
        "code": "PIPELINE_EXECUTION_FAILED",
        "runId": "12345678-1234-1234-1234-123456789012",
        "error": "Azure authentication failed"
      }
    }
  ]
}
```

### 4. Errores de Datos

#### BOOM_NOT_FOUND
```json
{
  "errors": [
    {
      "message": "Boom not found",
      "extensions": {
        "code": "BOOM_NOT_FOUND",
        "boomId": "123e4567-e89b-12d3-a456-426614174000"
      }
    }
  ]
}
```

#### DATA_VALIDATION_ERROR
```json
{
  "errors": [
    {
      "message": "Data validation error",
      "extensions": {
        "code": "DATA_VALIDATION_ERROR",
        "field": "data",
        "details": "Data array cannot be empty"
      }
    }
  ]
}
```

## Rate Limiting

### 1. Límites por Endpoint

#### Mutations
- `runPipeline`: 10 requests/minuto
- `saveCargaInsumosBatch`: 100 requests/minuto
- Model CRUD: 1000 requests/minuto

#### Queries
- `getStatusPipeline`: 100 requests/minuto
- `getCargaInsumosData`: 1000 requests/minuto
- Model queries: 1000 requests/minuto

### 2. Headers de Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
X-RateLimit-Retry-After: 60
```

### 3. Respuesta de Rate Limit Excedido

```json
{
  "errors": [
    {
      "message": "Rate limit exceeded",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED",
        "retryAfter": 60
      }
    }
  ]
}
```

## Ejemplos de Uso

### 1. Flujo Completo de Explosión

#### Paso 1: Crear Boom
```javascript
const createBoom = async () => {
  const mutation = `
    mutation CreateBoom($input: CreateBoomInput!) {
      createBoom(input: $input) {
        id
        version
        descripcion
        status
      }
    }
  `;
  
  const variables = {
    input: {
      version: "275",
      descripcion: "08-04 2025",
      username: "usuario@ejemplo.com",
      status: "EN_PROCESO"
    }
  };
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({ query: mutation, variables })
  });
  
  return response.json();
};
```

#### Paso 2: Ejecutar Pipeline de Insumos
```javascript
const executeInsumosPipeline = async (boomId) => {
  const mutation = `
    mutation RunPipeline($pipelineName: String!, $boomId: String) {
      runPipeline(pipelineName: $pipelineName, boomId: $boomId) {
        runId
        status
      }
    }
  `;
  
  const variables = {
    pipelineName: "EjecutarExtraccionInsumos",
    boomId: boomId
  };
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({ query: mutation, variables })
  });
  
  return response.json();
};
```

#### Paso 3: Monitorear Estado del Pipeline
```javascript
const monitorPipeline = async (runId) => {
  const query = `
    query GetStatusPipeline($runId: String!) {
      getStatusPipeline(runId: $runId) {
        runId
        status
        runStart
        runEnd
        message
      }
    }
  `;
  
  const variables = { runId };
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({ query, variables })
  });
  
  return response.json();
};
```

#### Paso 4: Ejecutar Pipeline Principal
```javascript
const executeMainPipeline = async (boomId, version) => {
  const mutation = `
    mutation RunPipeline($pipelineName: String!, $Pversion: String, $boomId: String) {
      runPipeline(pipelineName: $pipelineName, Pversion: $Pversion, boomId: $boomId) {
        runId
        status
        pipelineName
      }
    }
  `;
  
  const variables = {
    pipelineName: "ExplocionarDesdePortal",
    Pversion: version,
    boomId: boomId
  };
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({ query: mutation, variables })
  });
  
  return response.json();
};
```

### 2. Carga de Datos por Lotes

```javascript
const saveBatchData = async (tipo, data, metadata) => {
  const mutation = `
    mutation SaveCargaInsumosBatch($tipo: String!, $data: AWSJSON!, $metadata: AWSJSON!) {
      saveCargaInsumosBatch(tipo: $tipo, data: $data, metadata: $metadata) {
        success
        message
        batchId
        totalRecords
      }
    }
  `;
  
  const variables = {
    tipo,
    data: JSON.stringify(data),
    metadata: JSON.stringify(metadata)
  };
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({ query: mutation, variables })
  });
  
  return response.json();
};

// Uso
const planVentasData = [
  { material: "MAT001", cantidad: 100, fecha: "2024-01-15" },
  { material: "MAT002", cantidad: 200, fecha: "2024-01-16" }
];

const metadata = {
  fileName: "plan_ventas_2024.csv",
  fileSize: 1024,
  uploadDate: new Date().toISOString(),
  documentId: "123e4567-e89b-12d3-a456-426614174000"
};

await saveBatchData("plan_ventas", planVentasData, metadata);
```

### 3. Consulta de Datos con Paginación

```javascript
const getDataWithPagination = async (documentId, tipo, limit = 100, offset = 0) => {
  const query = `
    query GetCargaInsumosData($documentId: String, $tipo: String, $limit: Int, $offset: Int) {
      getCargaInsumosData(documentId: $documentId, tipo: $tipo, limit: $limit, offset: $offset) {
        success
        data
        summary {
          totalRecords
          returnedRecords
        }
        pagination {
          limit
          offset
          hasMore
        }
      }
    }
  `;
  
  const variables = {
    documentId,
    tipo,
    limit,
    offset
  };
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key'
    },
    body: JSON.stringify({ query, variables })
  });
  
  return response.json();
};

// Uso con paginación
const loadAllData = async (documentId, tipo) => {
  let allData = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const result = await getDataWithPagination(documentId, tipo, 100, offset);
    
    if (result.data.getCargaInsumosData.success) {
      allData = allData.concat(result.data.getCargaInsumosData.data);
      hasMore = result.data.getCargaInsumosData.pagination.hasMore;
      offset += 100;
    } else {
      break;
    }
  }
  
  return allData;
};
```

### 4. Manejo de Errores

```javascript
const handleApiError = (error) => {
  if (error.extensions) {
    switch (error.extensions.code) {
      case 'UNAUTHORIZED':
        console.error('Authentication required');
        // Redirigir al login
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('Rate limit exceeded, retry after:', error.extensions.retryAfter);
        // Esperar y reintentar
        break;
      case 'PIPELINE_NOT_FOUND':
        console.error('Pipeline not found:', error.extensions.pipelineName);
        // Mostrar error al usuario
        break;
      case 'VALIDATION_ERROR':
        console.error('Validation error:', error.extensions.details);
        // Mostrar errores de validación
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  } else {
    console.error('GraphQL error:', error.message);
  }
};

// Uso en requests
try {
  const result = await fetch('/graphql', { /* ... */ });
  const data = await result.json();
  
  if (data.errors) {
    data.errors.forEach(handleApiError);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## SDKs y Clientes

### 1. JavaScript/TypeScript

```javascript
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

// Ejecutar pipeline
const result = await client.mutations.runPipeline({
  pipelineName: 'ExplocionarDesdePortal',
  Pversion: '275',
  boomId: '123e4567-e89b-12d3-a456-426614174000'
});

// Consultar estado
const status = await client.queries.getStatusPipeline({
  runId: result.runId
});
```

### 2. Python

```python
import requests
import json

class ExplosionAPI:
    def __init__(self, api_key, base_url):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'x-api-key': api_key
        }
    
    def run_pipeline(self, pipeline_name, pversion=None, boom_id=None):
        mutation = """
        mutation RunPipeline($pipelineName: String!, $Pversion: String, $boomId: String) {
            runPipeline(pipelineName: $pipelineName, Pversion: $Pversion, boomId: $boomId) {
                runId
                status
                pipelineName
            }
        }
        """
        
        variables = {
            'pipelineName': pipeline_name,
            'Pversion': pversion,
            'boomId': boom_id
        }
        
        response = requests.post(
            self.base_url,
            headers=self.headers,
            json={'query': mutation, 'variables': variables}
        )
        
        return response.json()
    
    def get_pipeline_status(self, run_id):
        query = """
        query GetStatusPipeline($runId: String!) {
            getStatusPipeline(runId: $runId) {
                runId
                status
                runStart
                runEnd
                message
            }
        }
        """
        
        variables = {'runId': run_id}
        
        response = requests.post(
            self.base_url,
            headers=self.headers,
            json={'query': query, 'variables': variables}
        )
        
        return response.json()

# Uso
api = ExplosionAPI('your-api-key', 'https://api.portaldiveco.com/graphql')

# Ejecutar pipeline
result = api.run_pipeline('ExplocionarDesdePortal', '275', 'boom-id')

# Monitorear estado
status = api.get_pipeline_status(result['data']['runPipeline']['runId'])
```

### 3. cURL

```bash
# Ejecutar pipeline
curl -X POST https://api.portaldiveco.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "query": "mutation RunPipeline($pipelineName: String!, $Pversion: String, $boomId: String) { runPipeline(pipelineName: $pipelineName, Pversion: $Pversion, boomId: $boomId) { runId status pipelineName } }",
    "variables": {
      "pipelineName": "ExplocionarDesdePortal",
      "Pversion": "275",
      "boomId": "123e4567-e89b-12d3-a456-426614174000"
    }
  }'

# Consultar estado
curl -X POST https://api.portaldiveco.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "query": "query GetStatusPipeline($runId: String!) { getStatusPipeline(runId: $runId) { runId status runStart runEnd message } }",
    "variables": {
      "runId": "12345678-1234-1234-1234-123456789012"
    }
  }'
```

---

*Esta documentación proporciona una referencia completa para el uso de la API de la herramienta de Explosión de Materiales, incluyendo ejemplos prácticos y mejores prácticas.*
