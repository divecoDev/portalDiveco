<script setup>
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
});

// Estado para el proceso de guardado
const isProcessing = ref(false);
const processedSteps = ref({
  planVentas: false,
  existencias: false,
  cobertura: false,
});

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
  return Object.values(processedSteps.value).every(processed => processed);
});

// Función para simular el proceso de guardado
const guardarDocumentos = async () => {
  if (!allStepsHaveData.value || isProcessing.value) return;

  isProcessing.value = true;

  // Resetear estados
  processedSteps.value = {
    planVentas: false,
    existencias: false,
    cobertura: false,
  };

  try {
    // Simular proceso para cada paso con delay
    for (const step of steps.value) {
      if (step.data && step.data.length > 0) {
        // Simular tiempo de procesamiento (2 segundos por paso)
        await new Promise(resolve => setTimeout(resolve, 2000));
        processedSteps.value[step.id] = true;
      }
    }
  } catch (error) {
    console.error('Error al guardar documentos:', error);
    // Aquí podrías agregar manejo de errores
  } finally {
    isProcessing.value = false;
  }
};

// Función para obtener el estado visual de cada paso
const getStepStatus = (step) => {
  if (!step.data || step.data.length === 0) {
    return 'empty';
  }
  if (isProcessing.value && !step.processed) {
    return 'processing';
  }
  if (step.processed) {
    return 'completed';
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
                  <span class="text-cyan-600 dark:text-cyan-400">Procesando...</span>
                </template>
                <template v-else-if="getStepStatus(step) === 'completed'">
                  <span class="text-green-600 dark:text-green-400">Completado</span>
                </template>
              </span>
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
