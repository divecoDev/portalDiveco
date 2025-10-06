# Documentación Frontend - Herramienta de Explosión de Materiales

## Resumen

Esta documentación detalla los componentes, páginas y funcionalidades del frontend de la herramienta de Explosión de Materiales, construido con Nuxt 3, Vue 3 Composition API y Tailwind CSS.

## Estructura de Archivos

```
app/
├── pages/tools/explosion-materiales/
│   ├── index.vue              # Lista principal de explosiones
│   ├── new.vue                # Crear nueva explosión
│   ├── edit/[id].vue          # Editar explosión existente
│   └── view/[id].vue          # Vista detallada con proceso completo
├── components/boom/
│   ├── ExplosionProcess.vue   # Proceso final de explosión
│   ├── PlanProduccionProcess.vue # Procesos de plan de producción
│   └── ValidacionAprovisionamiento.vue # Validación de materiales
├── components/
│   ├── CargaInsumosProcess.vue # Proceso de carga de datos
│   └── CargaInsumosDataView.vue # Visualización de datos cargados
└── composables/
    ├── useBoomProcess.ts      # Lógica de procesos BOOM
    ├── useCargaInsumosData.ts # Gestión de datos de insumos
    ├── useAuth.ts             # Autenticación
    └── useLayoutState.ts      # Estado global
```

## Páginas

### 1. Página Principal (`/tools/explosion-materiales/index.vue`)

#### Propósito
Lista todas las explosiones de materiales con funcionalidades de búsqueda, filtrado y gestión básica.

#### Características Principales
- **Lista de Explosiones**: Visualización de todas las explosiones con información clave
- **Búsqueda**: Filtrado por versión o descripción
- **Filtros**: Filtrado por estado (Activo, Inactivo, En Proceso, Completado)
- **Acciones**: Ver, editar y eliminar explosiones
- **Navegación**: Enlace para crear nuevas explosiones

#### Componentes Utilizados
```vue
<template>
  <!-- Header con título y botón de nueva explosión -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
    <!-- Título principal con icono -->
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
      <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl">
        <UIcon name="i-heroicons-squares-2x2" class="w-7 h-7 text-white" />
      </div>
      Explosión de Materiales
    </h1>
  </div>

  <!-- Filtros y búsqueda -->
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg">
    <UInput v-model="searchQuery" placeholder="Buscar por versión o descripción..." />
    <USelect v-model="selectedStatus" :options="statusOptions" placeholder="Filtrar por estado" />
  </div>

  <!-- Lista de explosiones -->
  <div class="space-y-3">
    <div v-for="explosion in filteredExplosions" :key="explosion.id" class="card">
      <!-- Información de la explosión -->
      <!-- Botones de acción -->
    </div>
  </div>
</template>
```

#### Funcionalidades
- **`fetchExplosions()`**: Carga todas las explosiones desde la API
- **`viewExplosion()`**: Navega a la vista detallada
- **`editExplosion()`**: Navega al formulario de edición
- **`deleteExplosion()`**: Elimina una explosión con confirmación
- **`filteredExplosions`**: Computed que filtra explosiones según criterios

#### Estados
```typescript
const explosions = ref([]);           // Lista de explosiones
const loading = ref(true);            // Estado de carga
const searchQuery = ref("");          // Término de búsqueda
const selectedStatus = ref("");       // Estado seleccionado para filtro
```

### 2. Crear Nueva Explosión (`/tools/explosion-materiales/new.vue`)

#### Propósito
Formulario para crear una nueva explosión de materiales con validación y manejo de errores.

#### Características Principales
- **Formulario Simple**: Solo campos esenciales (versión y descripción)
- **Validación**: Validación en tiempo real de campos requeridos
- **Tour Guiado**: Tutorial interactivo para nuevos usuarios
- **Estados de UI**: Loading states y manejo de errores

#### Campos del Formulario
```typescript
const formData = ref({
  descripcion: "",    // Descripción del boom (ej: "08-04 2025")
  version: null,      // Número de versión (ej: 275)
});

const errors = ref({
  descripcion: "",    // Errores de validación
  version: "",
});
```

#### Validaciones
- **Descripción**: Campo requerido, no puede estar vacío
- **Versión**: Campo requerido, debe ser un número mayor a 0
- **Unicidad**: Validación de versión única (implementar si es necesario)

#### Funcionalidades
- **`validateForm()`**: Valida todos los campos del formulario
- **`createExplosion()`**: Crea la nueva explosión en la base de datos
- **`startTour()`**: Inicia el tour guiado para nuevos usuarios

### 3. Editar Explosión (`/tools/explosion-materiales/edit/[id].vue`)

#### Propósito
Permite editar los datos básicos de una explosión existente.

#### Características Principales
- **Carga de Datos**: Carga automática de datos existentes
- **Formulario Pre-poblado**: Los campos se llenan con datos actuales
- **Validación**: Misma validación que el formulario de creación
- **Estados**: Control de estados de carga y actualización

#### Parámetros de Ruta
```typescript
const route = useRoute();
const explosionId = route.params.id; // ID de la explosión a editar
```

#### Funcionalidades
- **`fetchExplosion()`**: Carga los datos de la explosión por ID
- **`updateExplosion()`**: Actualiza la explosión en la base de datos
- **`validateForm()`**: Validación de campos antes de actualizar

### 4. Vista Detallada (`/tools/explosion-materiales/view/[id].vue`)

#### Propósito
Vista completa del proceso de explosión con stepper de 4 pasos y monitoreo en tiempo real.

#### Características Principales
- **Stepper de 4 Pasos**: Navegación secuencial por el proceso completo
- **Monitoreo en Tiempo Real**: Polling automático del estado de pipelines
- **Tours Guiados**: Tutoriales específicos para cada sección
- **Estados Dinámicos**: Control automático de pasos habilitados/deshabilitados

#### Estructura del Stepper
```vue
<UStepper v-model="currentMainStep" :items="availableSteps">
  <template #carga-de-insumos>
    <CargaInsumosDataView v-if="hasSavedData" />
    <CargaInsumosProcess v-else />
  </template>
  
  <template #generar-plan-de-produccion>
    <PlanProduccionProcess />
  </template>
  
  <template #validacion-de-aprovisionamiento>
    <ValidacionAprovisionamiento />
  </template>
  
  <template #explocionar>
    <ExplosionProcess />
  </template>
</UStepper>
```

#### Estados del Proceso
```typescript
const completedSteps = ref({
  'carga-de-insumos': false,
  'generar-plan-de-produccion': false,
  'validacion-de-aprovisionamiento': false,
  'explocionar': false
});
```

#### Funcionalidades Principales
- **`checkForSavedData()`**: Verifica si hay datos guardados para el boom
- **`checkProcessStates()`**: Verifica el estado de todos los procesos
- **`handleBoomProcessCompleted()`**: Maneja la finalización del primer paso
- **`handlePlanProduccionCompleted()`**: Maneja la finalización del segundo paso
- **`handleValidacionAprovisionamientoCompleted()`**: Maneja la finalización del tercer paso
- **`handleExplosionCompleted()`**: Maneja la finalización del proceso completo

## Componentes Especializados

### 1. ExplosionProcess.vue

#### Propósito
Componente que maneja el proceso final de explosión y la generación de reportes.

#### Características Principales
- **Ejecución de Pipeline**: Ejecuta el pipeline `ExplocionarDesdePortal`
- **Monitoreo en Tiempo Real**: Polling del estado del pipeline cada 10 segundos
- **Descarga de Archivos**: 5 archivos CSV generados como resultado
- **Re-ejecución**: Capacidad de re-ejecutar el proceso completo

#### Estados del Componente
```typescript
const explosionInProgress = ref(false);      // Pipeline en ejecución
const explosionPollingInterval = ref(null);  // Intervalo de polling
const reexecutingExplosion = ref(false);     // Re-ejecución en progreso
```

#### Archivos Generados
1. **AprovisionamientoConfigurado.csv**: Configuración de aprovisionamiento
2. **PlanModeloConSemielaborados.csv**: Explosión por modelo con semielaborados
3. **PlanModeloMateriasPrimaConSemielaborados.csv**: Explosión por materia prima
4. **PlanVentas.csv**: Plan de ventas procesado
5. **PlanProduccion.csv**: Plan de producción final

#### Funcionalidades
- **`executeExplosion()`**: Ejecuta el pipeline principal de explosión
- **`downloadFile()`**: Descarga archivos desde CloudFront
- **`reexecuteExplosion()`**: Re-ejecuta todo el proceso de explosión
- **`consultarEstadoPipelineExplosion()`**: Consulta el estado del pipeline
- **`procesarEstadoPipeline()`**: Procesa la respuesta del estado

#### Polling y Monitoreo
```typescript
// Configuración de polling cada 10 segundos
const iniciarPollingExplosion = async (runId) => {
  const intervalId = setInterval(async () => {
    await consultarEstadoPipelineExplosion(runId);
  }, 10000);
  
  explosionPollingInterval.value = intervalId;
};
```

### 2. PlanProduccionProcess.vue

#### Propósito
Gestiona los 3 procesos secuenciales para generar el plan de producción.

#### Procesos Secuenciales
1. **Sincronizar Insumos**: `EjecutarExtraccionInsumos`
2. **Sincronizar Plan de Ventas**: `EjecutarCalcularPlanVentasBoom`
3. **Calcular Plan de Demanda**: `EjecutarCalcularPlanDemadaBoom`

#### Configuración de Procesos
```typescript
const procesosConfig = {
  'sincronizar-insumos': {
    nombre: 'Sincronizar Insumos',
    pipelineName: 'EjecutarExtraccionInsumos',
    boomFields: {
      runId: 'PiepelineRunIdInsumos',
      status: 'SyncInsumosStatus'
    }
  },
  'sincronizar-plan-ventas': {
    nombre: 'Sincronizar Plan de Ventas',
    pipelineName: 'EjecutarCalcularPlanVentasBoom',
    boomFields: {
      runId: 'PiepelineRunIdPlanVentas',
      status: 'SyncSalesPlanStatus'
    }
  },
  'calcular-plan-demanda': {
    nombre: 'Calcular Plan Demanda',
    pipelineName: 'EjecutarCalcularPlanDemadaBoom',
    boomFields: {
      runId: 'PiepelineRunIdPlanDemandas',
      status: 'SyncDemandPlanStatus'
    }
  }
};
```

#### Estados de Procesos
```typescript
const procesosProduccion = ref([
  {
    id: 'sincronizar-insumos',
    nombre: 'Sincronizar Insumos',
    status: 'pendiente',        // pendiente | ejecutando | completado | error
    executionId: null,          // ID de ejecución del pipeline
    duracion: null,             // Duración del proceso
    inicioTiempo: null,         // Timestamp de inicio
    finTiempo: null             // Timestamp de finalización
  }
]);
```

#### Funcionalidades
- **`ejecutarPipeline()`**: Ejecuta un pipeline específico
- **`consultarEstadoPipeline()`**: Consulta el estado de un pipeline
- **`actualizarEstadoProceso()`**: Actualiza el estado de un proceso
- **`iniciarPolling()`**: Inicia polling para un proceso específico
- **`puedeEjecutarProceso()`**: Verifica dependencias secuenciales

#### Dependencias Secuenciales
```typescript
const puedeEjecutarProceso = (procesoId) => {
  const procesoIndex = procesosProduccion.value.findIndex(p => p.id === procesoId);
  
  // El primer proceso siempre se puede ejecutar
  if (procesoIndex === 0) return true;
  
  // Verificar que todos los procesos anteriores estén completados
  for (let i = 0; i < procesoIndex; i++) {
    if (procesosProduccion.value[i].status !== 'completado') {
      return false;
    }
  }
  
  return true;
};
```

### 3. ValidacionAprovisionamiento.vue

#### Propósito
Valida materiales y configuraciones antes del proceso final de explosión.

#### Características Principales
- **Validación de Materiales**: Verifica materiales sin aprovisionamiento
- **Validación de Centros**: Verifica materiales sin centro de producción
- **Reportes de Validación**: Genera reportes de materiales problemáticos
- **Decisión de Continuar**: Permite al usuario decidir si continuar o no

#### Funcionalidades
- **`validarMateriales()`**: Ejecuta validaciones de materiales
- **`generarReportes()`**: Genera reportes de validación
- **`continuarProceso()`**: Continúa al siguiente paso
- **`detenerProceso()`**: Detiene el proceso por problemas encontrados

### 4. CargaInsumosProcess.vue

#### Propósito
Maneja la carga inicial de archivos CSV necesarios para el proceso.

#### Tipos de Archivos
1. **Plan de Ventas**: Datos de ventas planificadas
2. **Existencias**: Inventario actual de materiales
3. **Cobertura**: Datos de cobertura de materiales

#### Características Principales
- **Upload de Archivos**: Drag & drop o selección de archivos
- **Validación de Formatos**: Verificación de formato CSV
- **Procesamiento por Lotes**: Carga masiva de datos
- **Feedback Visual**: Indicadores de progreso y estado

#### Funcionalidades
- **`uploadFile()`**: Sube archivos al servidor
- **`processBatch()`**: Procesa datos en lotes
- **`validateFormat()`**: Valida formato de archivos CSV
- **`saveData()`**: Guarda datos procesados en la base de datos

### 5. CargaInsumosDataView.vue

#### Propósito
Visualiza los datos de carga de insumos ya procesados y guardados.

#### Características Principales
- **Visualización de Datos**: Muestra datos cargados en formato tabular
- **Filtros y Búsqueda**: Filtrado de datos por diferentes criterios
- **Exportación**: Exportación de datos a CSV
- **Estadísticas**: Resumen estadístico de datos cargados

#### Funcionalidades
- **`loadData()`**: Carga datos desde la base de datos
- **`filterData()`**: Aplica filtros a los datos
- **`exportData()`**: Exporta datos filtrados
- **`getStatistics()`**: Calcula estadísticas de los datos

## Composables

### 1. useBoomProcess.ts

#### Propósito
Lógica de negocio centralizada para todos los procesos BOOM.

#### Funcionalidades Principales
```typescript
export const useBoomProcess = () => {
  // Estado global del proceso
  const processState = ref({
    currentStep: 0,
    isCompleted: false,
    isLoading: false
  });

  // Ejecutar pipeline
  const executePipeline = async (pipelineName: string, params: any) => {
    // Lógica de ejecución de pipeline
  };

  // Consultar estado de pipeline
  const getPipelineStatus = async (runId: string) => {
    // Lógica de consulta de estado
  };

  // Actualizar estado del boom
  const updateBoomStatus = async (boomId: string, status: string) => {
    // Lógica de actualización de estado
  };

  return {
    processState,
    executePipeline,
    getPipelineStatus,
    updateBoomStatus
  };
};
```

### 2. useCargaInsumosData.ts

#### Propósito
Gestión de datos de carga de insumos con operaciones CRUD.

#### Funcionalidades Principales
```typescript
export const useCargaInsumosData = () => {
  // Guardar datos por lotes
  const saveBatch = async (tipo: string, data: any[], metadata: any) => {
    // Lógica de guardado por lotes
  };

  // Consultar datos por documento
  const getDataByDocument = async (documentId: string) => {
    // Lógica de consulta por documento
  };

  // Verificar si hay datos
  const hasData = computed(() => {
    // Lógica de verificación de datos
  });

  return {
    saveBatch,
    getDataByDocument,
    hasData
  };
};
```

### 3. useAuth.ts

#### Propósito
Gestión de autenticación y autorización de usuarios.

#### Funcionalidades Principales
```typescript
export const useAuth = () => {
  // Usuario actual
  const currentUser = ref(null);

  // Verificar autenticación
  const isAuthenticated = computed(() => {
    return !!currentUser.value;
  });

  // Verificar rol
  const hasRole = (role: string) => {
    // Lógica de verificación de rol
  };

  // Cerrar sesión
  const signOut = async () => {
    // Lógica de cierre de sesión
  };

  return {
    currentUser,
    isAuthenticated,
    hasRole,
    signOut
  };
};
```

### 4. useLayoutState.ts

#### Propósito
Estado global de la aplicación y navegación.

#### Funcionalidades Principales
```typescript
export const useLayoutState = () => {
  // Breadcrumbs
  const breadcrumbs = ref([]);

  // Configurar breadcrumbs
  const setBreadcrumbs = (items: BreadcrumbItem[]) => {
    breadcrumbs.value = items;
  };

  // Estado de carga global
  const globalLoading = ref(false);

  // Configurar estado de carga
  const setGlobalLoading = (loading: boolean) => {
    globalLoading.value = loading;
  };

  return {
    breadcrumbs,
    setBreadcrumbs,
    globalLoading,
    setGlobalLoading
  };
};
```

## Patrones de Diseño

### 1. Component Composition
- **Composición sobre Herencia**: Uso de composables en lugar de mixins
- **Props y Emits**: Comunicación clara entre componentes padre e hijo
- **Slots**: Flexibilidad en la estructura de componentes

### 2. State Management
- **Reactive State**: Uso de `ref()` y `reactive()` para estado local
- **Computed Properties**: Propiedades calculadas para datos derivados
- **Watchers**: Observadores para reaccionar a cambios de estado

### 3. Error Handling
- **Try-Catch**: Manejo de errores en operaciones asíncronas
- **Toast Notifications**: Feedback visual para el usuario
- **Fallback UI**: Estados de error y carga

### 4. Performance Optimization
- **Lazy Loading**: Carga diferida de componentes pesados
- **Memoization**: Cache de resultados computados
- **Debouncing**: Optimización de búsquedas y filtros

## Estilos y UI

### 1. Design System
- **Tailwind CSS**: Framework de utilidades para estilos
- **Nuxt UI**: Componentes pre-construidos
- **Heroicons**: Iconografía consistente
- **Gradientes**: Paleta de colores cyan como primario

### 2. Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Puntos de quiebre estándar
- **Flexible Layouts**: Layouts que se adaptan a diferentes pantallas

### 3. Dark Mode
- **Toggle Automático**: Cambio automático según preferencias del sistema
- **Variables CSS**: Colores adaptativos para modo oscuro
- **Contraste**: Cumplimiento de estándares de accesibilidad

## Testing

### 1. Unit Testing
- **Vitest**: Framework de testing para Vue 3
- **Vue Test Utils**: Utilidades para testing de componentes
- **Mocking**: Simulación de APIs y servicios

### 2. Integration Testing
- **Cypress**: Testing end-to-end
- **API Testing**: Verificación de integración con backend
- **User Flows**: Testing de flujos completos de usuario

### 3. Performance Testing
- **Lighthouse**: Auditoría de rendimiento
- **Bundle Analysis**: Análisis de tamaño de bundles
- **Load Testing**: Pruebas de carga para componentes críticos

## Deployment y Build

### 1. Build Process
- **Nuxt Build**: Proceso de build optimizado
- **Code Splitting**: División automática de código
- **Asset Optimization**: Optimización de imágenes y assets

### 2. Environment Configuration
- **Environment Variables**: Configuración por entorno
- **API Endpoints**: URLs dinámicas según entorno
- **Feature Flags**: Control de funcionalidades por entorno

### 3. CI/CD Integration
- **GitHub Actions**: Pipeline automatizado
- **Automated Testing**: Ejecución automática de tests
- **Deployment Automation**: Despliegue automático a producción

---

*Esta documentación proporciona una guía completa para el desarrollo, mantenimiento y escalabilidad del frontend de la herramienta de Explosión de Materiales.*
