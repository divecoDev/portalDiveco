# Arquitectura de Consulta de Datos de Carga de Insumos

## Resumen

Se ha implementado un sistema completo para consultar y visualizar los datos de carga de insumos guardados, siguiendo los principios SOLID y Clean Code.

## Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Frontend (Vue 3 + Nuxt)"
        A[Página [id].vue] --> B[CargaInsumosDataView]
        B --> C[CargaInsumosDataTable]
        A --> D[CargaInsumosProcess]

        E[useCargaInsumosData] --> B
        E --> A
    end

    subgraph "Backend (AWS Amplify)"
        F[Lambda getData] --> G[MySQL Database]
        F --> H[plan_ventas table]
        F --> I[existencias table]
        F --> J[cobertura table]
    end

    subgraph "Data Flow"
        K[Query Parameters] --> F
        F --> L[Query Response]
        L --> E
        E --> B
    end

    A -.->|"Consulta datos guardados"| E
    E -.->|"API Call"| F
```

## Componentes Implementados

### 1. Función Lambda de Consulta (`getData`)

**Ubicación**: `amplify/functions/carga-insumos/getData/`

**Responsabilidades**:
- Consultar datos de las tablas MySQL (plan_ventas, existencias, cobertura)
- Proporcionar resúmenes estadísticos
- Manejar paginación y filtros
- Implementar manejo de errores robusto

**Principios SOLID aplicados**:
- **Single Responsibility**: Solo maneja consultas de datos
- **Open/Closed**: Extensible para nuevos tipos de consultas
- **Dependency Inversion**: Depende de abstracciones (MySQL connection)

### 2. Composable de Datos (`useCargaInsumosData`)

**Ubicación**: `app/composables/useCargaInsumosData.ts`

**Responsabilidades**:
- Abstraer la lógica de consulta de datos
- Proporcionar estado reactivo
- Manejar diferentes tipos de consultas
- Implementar utilidades de formateo

**Principios SOLID aplicados**:
- **Single Responsibility**: Solo maneja consultas de datos
- **Interface Segregation**: Composable especializado para lectura
- **Dependency Inversion**: Depende de abstracciones (Amplify client)

### 3. Componente de Visualización (`CargaInsumosDataView`)

**Ubicación**: `app/components/CargaInsumosDataView.vue`

**Responsabilidades**:
- Mostrar resumen de datos
- Implementar tabs para diferentes tipos
- Manejar estados de carga y error
- Proporcionar controles de actualización

**Principios SOLID aplicados**:
- **Single Responsibility**: Solo visualización de datos
- **Open/Closed**: Extensible para nuevos tipos de datos

### 4. Componente de Tabla (`CargaInsumosDataTable`)

**Ubicación**: `app/components/CargaInsumosDataTable.vue`

**Responsabilidades**:
- Mostrar datos en formato tabular
- Implementar paginación
- Manejar diferentes tipos de columnas
- Proporcionar formateo de datos

**Principios SOLID aplicados**:
- **Single Responsibility**: Solo presentación de datos en tabla
- **Open/Closed**: Configurable para diferentes tipos de datos

### 5. Integración en Página (`[id].vue`)

**Ubicación**: `app/pages/tools/explosion-materiales/view/[id].vue`

**Responsabilidades**:
- Integrar componentes de visualización y proceso
- Implementar lógica condicional
- Manejar estados de la aplicación
- Proporcionar navegación entre vistas

## Flujo de Datos

### 1. Carga Inicial
1. La página `[id].vue` se carga
2. Se ejecuta `fetchExplosion()` para obtener datos de la explosión
3. Se ejecuta `checkForSavedData()` para verificar datos guardados
4. Se determina qué componente mostrar (proceso vs visualización)

### 2. Consulta de Datos
1. El composable `useCargaInsumosData` recibe parámetros de consulta
2. Se hace llamada a la función Lambda `cargaInsumosGetData`
3. La función Lambda consulta MySQL y retorna datos
4. Los datos se procesan y se actualiza el estado reactivo

### 3. Visualización
1. El componente `CargaInsumosDataView` recibe los datos
2. Se muestra el resumen estadístico
3. Se implementan tabs para diferentes tipos de datos
4. Cada tab usa `CargaInsumosDataTable` para mostrar datos específicos

## Características Implementadas

### ✅ Consulta de Datos
- Consulta por documento ID
- Consulta por tipo de datos
- Consulta por batch ID
- Resumen estadístico general

### ✅ Visualización
- Tabs organizados por tipo de datos
- Tablas paginadas con formateo apropiado
- Resumen estadístico con métricas clave
- Estados de carga y error

### ✅ Navegación
- Alternancia entre vista de datos y proceso de carga
- Botones de actualización
- Navegación automática en el stepper

### ✅ Manejo de Estados
- Estados de carga reactivos
- Manejo de errores
- Actualización de datos en tiempo real

## Principios de Clean Code Aplicados

### 1. Nombres Descriptivos
- `CargaInsumosDataView`: Nombre claro del propósito
- `useCargaInsumosData`: Composable específico y descriptivo
- `getDataByDocument`: Método con nombre descriptivo

### 2. Funciones Pequeñas
- Cada función tiene una responsabilidad específica
- Métodos de utilidad separados por funcionalidad
- Composable dividido en secciones lógicas

### 3. Comentarios Apropiados
- Documentación JSDoc en funciones principales
- Comentarios explicativos en lógica compleja
- Logs informativos para debugging

### 4. Manejo de Errores
- Try-catch en todas las operaciones asíncronas
- Mensajes de error descriptivos
- Estados de error reactivos en la UI

## Beneficios de la Implementación

### 1. Mantenibilidad
- Código modular y bien organizado
- Separación clara de responsabilidades
- Fácil extensión para nuevos tipos de datos

### 2. Reutilización
- Composable reutilizable en otros componentes
- Componentes independientes y configurables
- Funciones Lambda modulares

### 3. Escalabilidad
- Paginación implementada desde el inicio
- Consultas optimizadas con límites
- Arquitectura preparada para grandes volúmenes

### 4. Usabilidad
- Interfaz intuitiva con estados claros
- Navegación fluida entre vistas
- Feedback visual apropiado

## Próximos Pasos Sugeridos

1. **Implementar filtros avanzados** en las consultas
2. **Agregar exportación de datos** a Excel/CSV
3. **Implementar búsqueda** en tiempo real
4. **Agregar gráficos** para visualización de tendencias
5. **Implementar caché** para mejorar performance

## Conclusión

La implementación sigue los principios SOLID y Clean Code, proporcionando una arquitectura robusta, mantenible y escalable para la consulta y visualización de datos de carga de insumos.
