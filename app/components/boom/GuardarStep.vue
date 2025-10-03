<script setup>
import { useCargaInsumosProcessStore } from './../stores/useCargaInsumosProcess'
import { generateClient } from "aws-amplify/data";

// Props para recibir los datos de los pasos anteriores
const props = defineProps({
  planVentasData: {
    type: Array,
    default: () => [],
  },
  existenciasData: {
    type: Array,
    default: () => [],
  },
  coberturaData: {
    type: Array,
    default: () => [],
  },
  boomId: {
    type: String,
    default: null,
  },
});

// Emits para comunicarse con el componente padre
const emit = defineEmits(['all-steps-completed']);

// Usar el store de Carga de Insumos
const cargaInsumosStore = useCargaInsumosProcessStore()

// Estado para el proceso de guardado (usar el store)
const isProcessing = computed(() => cargaInsumosStore.isProcessing)
const processedSteps = computed(() => cargaInsumosStore.processedSteps)

// Verificar si estamos en modo desarrollo
const isDev = import.meta.dev;

// Configuración de los pasos
const steps = computed(() => [
  {
    id: 'planVentas',
    title: 'Plan de Ventas',
    description: 'Datos del plan comercial',
    icon: 'i-heroicons-chart-bar',
    data: props.planVentasData,
    processed: processedSteps.value.planVentas,
  },
  {
    id: 'existencias',
    title: 'Existencias',
    description: 'Datos de inventario actual',
    icon: 'i-heroicons-shopping-cart',
    data: props.existenciasData,
    processed: processedSteps.value.existencias,
  },
  {
    id: 'cobertura',
    title: 'Días de Cobertura',
    description: 'Datos de cobertura temporal',
    icon: 'i-heroicons-shield-check',
    data: props.coberturaData,
    processed: processedSteps.value.cobertura,
  },
]);

// Computed para verificar si todos los pasos tienen datos
const allStepsHaveData = computed(() => {
  return steps.value.every(step => {
    const data = step.data;
    return data && Array.isArray(data) && data.length > 0;
  });
});

// Computed para verificar si todos los pasos están procesados
const allStepsProcessed = computed(() => {
  return cargaInsumosStore.allStepsProcessed;
});

// Watcher para emitir evento cuando todos los pasos se completen
watch(allStepsProcessed, (newValue) => {
  if (newValue) {
    // Emitir evento después de un pequeño delay para asegurar que la UI se actualice
    nextTick(() => {
      emit('all-steps-completed');
    });
  }
});

// Función para guardar los documentos usando el store
const guardarDocumentos = async () => {
  if (!allStepsHaveData.value || isProcessing.value) return;

  try {
    // Cargar los datos en el store antes de procesarlos
    if (props.planVentasData && props.planVentasData.length > 0) {
      cargaInsumosStore.planVentas.data = props.planVentasData;
      cargaInsumosStore.planVentas.fileName = 'plan_ventas.xlsx';
      cargaInsumosStore.planVentas.loadedAt = new Date();
      cargaInsumosStore.planVentas.isValid = true;
    }

    if (props.existenciasData && props.existenciasData.length > 0) {
      cargaInsumosStore.existencias.data = props.existenciasData;
      cargaInsumosStore.existencias.fileName = 'existencias.xlsx';
      cargaInsumosStore.existencias.loadedAt = new Date();
      cargaInsumosStore.existencias.isValid = true;
    }

    if (props.coberturaData && props.coberturaData.length > 0) {
      cargaInsumosStore.cobertura.data = props.coberturaData;
      cargaInsumosStore.cobertura.fileName = 'cobertura.xlsx';
      cargaInsumosStore.cobertura.loadedAt = new Date();
      cargaInsumosStore.cobertura.isValid = true;
    }

    // Establecer el boomId en el store si está disponible
    if (props.boomId) {
      cargaInsumosStore.setBoomId(props.boomId);
      console.log(`📋 BoomId establecido en el store: ${props.boomId}`);
    }

    // Procesar los documentos usando el store (esto enviará a MySQL)
    console.log('🚀 Iniciando guardado de documentos...');
    const result = await cargaInsumosStore.processDocuments();

    if (result.success) {
      console.log('✅ Documentos guardados exitosamente');
      
      // Ejecutar pipeline de Azure Data Factory si hay boomId
      if (props.boomId) {
        console.log('🚀 Ejecutando pipeline de Azure Data Factory...');
        await ejecutarPipelineADF(props.boomId);
      }

      useToast().add({
        title: 'Éxito',
        description: 'Documentos guardados exitosamente en la base de datos',
        color: 'green',
      });
    } else {
      console.error('❌ Error al guardar documentos:', result.error);
      useToast().add({
        title: 'Error',
        description: `Error al guardar documentos: ${result.error}`,
        color: 'red',
      });
    }
  } catch (error) {
    console.error('❌ Error al guardar documentos:', error);
    useToast().add({
      title: 'Error',
      description: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      color: 'red',
    });
  }
};

// Función para ejecutar el pipeline de Azure Data Factory
const ejecutarPipelineADF = async (boomId) => {
  try {
    const client = generateClient();
    
    // Preparar argumentos del pipeline
    const pipelineArgs = {
      pipelineName: 'ProcesarCargaInsumos', // Nombre del pipeline específico para carga de insumos
      boomId: boomId
    };

    console.log(`📋 Ejecutando pipeline con argumentos:`, pipelineArgs);

    // Llamar a la mutación runPipeline
    const { data } = await client.mutations.runPipeline(pipelineArgs);

    console.log('📋 Respuesta del pipeline:', data);

    // Procesar la respuesta del pipeline
    let runId = null;
    const raw = data?.runPipeline ?? data;

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        runId = parsed?.runId ?? null;
      } catch (e) {
        console.warn('No se pudo parsear runPipeline string:', e);
      }
    } else if (raw && typeof raw === 'object') {
      runId = raw?.runId ?? raw?.data?.runId ?? null;
    }

    if (runId) {
      console.log(`✅ Pipeline de carga de insumos iniciado con runId: ${runId}`);
      
      useToast().add({
        title: "Pipeline iniciado",
        description: `Pipeline de procesamiento iniciado. ID: ${runId}`,
        color: "blue",
        timeout: 3000
      });
    } else {
      console.warn('⚠️ No se recibió runId válido del pipeline');
    }

  } catch (error) {
    console.error('❌ Error ejecutando pipeline de Azure Data Factory:', error);
    
    useToast().add({
      title: "Error en pipeline",
      description: `Error al ejecutar pipeline: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      color: "red",
      timeout: 5000
    });
  }
};

// Función para obtener el estado visual de cada paso
const getStepStatus = (step) => {
  if (!step.data || step.data.length === 0) {
    return 'empty';
  }

  // Obtener el progreso del store para este tipo
  const progress = cargaInsumosStore.processedSteps[step.id];

  if (progress === true) {
    return 'completed';
  }

  if (typeof progress === 'number' && progress > 0 && progress < 1) {
    return 'processing';
  }

  if (isProcessing.value) {
    return 'processing';
  }

  return 'pending';
};

// Función para obtener las clases CSS del icono según el estado
const getIconClasses = (status) => {
  switch (status) {
    case 'empty':
      return 'w-8 h-8 text-gray-400';
    case 'pending':
      return 'w-8 h-8 text-amber-500';
    case 'processing':
      return 'w-8 h-8 text-cyan-500';
    case 'completed':
      return 'w-8 h-8 text-green-500';
    default:
      return 'w-8 h-8 text-gray-400';
  }
};

// Función para obtener el icono según el estado
const getStatusIcon = (step, status) => {
  switch (status) {
    case 'empty':
      return 'i-heroicons-exclamation-triangle';
    case 'pending':
      return 'i-heroicons-clock';
    case 'processing':
      return 'i-heroicons-arrow-path';
    case 'completed':
      return 'i-heroicons-check-circle';
    default:
      return step.icon;
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Header compacto -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <UIcon
              name="i-heroicons-cloud-arrow-up"
              class="w-5 h-5 text-white mr-3"
            />
            <div>
              <h3 class="text-lg font-semibold text-white">
                Guardar Documentos
              </h3>
              <p class="text-xs text-cyan-100">
                Procesar y guardar los datos cargados
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <div
              v-if="allStepsProcessed"
              class="flex items-center bg-green-500/20 px-2 py-1 rounded-full"
            >
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-200 mr-1" />
              <span class="text-xs text-green-200 font-medium">Completado</span>
            </div>
            <div
              v-else-if="isProcessing"
              class="flex items-center bg-white/20 px-2 py-1 rounded-full"
            >
              <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
              <span class="text-xs text-white font-medium">Procesando...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid de pasos más compacto -->
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            v-for="step in steps"
            :key="step.id"
            class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-md border border-gray-200/50 dark:border-gray-600/50 p-3 transition-all duration-300 hover:shadow-md hover:border-cyan-300/40 dark:hover:border-cyan-600/40"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center shadow-sm"
                >
                  <UIcon
                    :name="step.icon"
                    class="w-4 h-4 text-cyan-600 dark:text-cyan-400"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ step.title }}
                  </h4>
                </div>
              </div>

              <!-- Icono de estado compacto -->
              <UIcon
                :name="getStatusIcon(step, getStepStatus(step))"
                :class="[
                  'w-5 h-5 flex-shrink-0',
                  getStepStatus(step) === 'empty' ? 'text-gray-400' : '',
                  getStepStatus(step) === 'pending' ? 'text-amber-500' : '',
                  getStepStatus(step) === 'processing' ? 'text-cyan-500 animate-spin' : '',
                  getStepStatus(step) === 'completed' ? 'text-green-500' : ''
                ]"
              />
            </div>

            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600 dark:text-gray-300">
                {{ step.data?.length || 0 }} registros
              </span>
              <span class="font-medium">
                <template v-if="getStepStatus(step) === 'empty'">
                  <span class="text-gray-500">Sin datos</span>
                </template>
                <template v-else-if="getStepStatus(step) === 'pending'">
                  <span class="text-amber-600 dark:text-amber-400">Pendiente</span>
                </template>
                <template v-else-if="getStepStatus(step) === 'processing'">
                  <template v-if="typeof cargaInsumosStore.processedSteps[step.id] === 'number'">
                    <span class="text-cyan-600 dark:text-cyan-400">
                      {{ Math.round(cargaInsumosStore.processedSteps[step.id] * 100) }}%
                    </span>
                  </template>
                  <template v-else>
                    <span class="text-cyan-600 dark:text-cyan-400">Procesando...</span>
                  </template>
                </template>
                <template v-else-if="getStepStatus(step) === 'completed'">
                  <span class="text-green-600 dark:text-green-400">Completado</span>
                </template>
              </span>
            </div>

            <!-- Barra de progreso para pasos en procesamiento -->
            <div
              v-if="getStepStatus(step) === 'processing' && typeof cargaInsumosStore.processedSteps[step.id] === 'number'"
              class="mt-2"
            >
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-1 rounded-full transition-all duration-300"
                  :style="{ width: `${cargaInsumosStore.processedSteps[step.id] * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de acciones compacta -->
    <div class="flex flex-col items-center space-y-3">
      <!-- Botón de acción -->
      <UButton
        v-if="!allStepsProcessed"
        :disabled="!allStepsHaveData || isProcessing"
        :loading="isProcessing"
        icon="i-heroicons-cloud-arrow-up"
        @click="guardarDocumentos"
        class="rounded-md inline-flex items-center px-6 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 disabled:hover:scale-100 disabled:hover:shadow-lg"
      >
        <template v-if="isProcessing">
          Guardando documentos...
        </template>
        <template v-else-if="!allStepsHaveData">
          Faltan datos por cargar
        </template>
        <template v-else>
          Guardar documentos
        </template>
      </UButton>

      <!-- Mensaje de éxito compacto -->
      <div
        v-else
        class="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700/50 rounded-md px-4 py-2"
      >
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-check-circle"
            class="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
          />
          <span class="text-sm text-green-800 dark:text-green-200 font-medium">
            Documentos guardados exitosamente
          </span>
        </div>
      </div>

      <!-- Información adicional compacta -->
      <div
        v-if="!allStepsHaveData && !isProcessing"
        class="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700/50 rounded-md px-3 py-2"
      >
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0"
          />
          <p class="text-xs text-amber-800 dark:text-amber-200">
            Carga los datos en todos los pasos antes de proceder
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
