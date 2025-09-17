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
  <div class="space-y-6">
    <!-- Header del paso -->
    <div
      class="bg-gradient-to-r from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-cloud-arrow-up"
            class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-3"
          />
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Guardar Documentos
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Procesar y guardar los datos cargados en los pasos anteriores
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span
            v-if="allStepsProcessed"
            class="text-sm text-green-600 dark:text-green-400 font-medium"
          >
            ✓ Completado
          </span>
          <span
            v-else-if="isProcessing"
            class="text-sm text-cyan-600 dark:text-cyan-400 font-medium"
          >
            Procesando...
          </span>
        </div>
      </div>
    </div>

    <!-- Lista de pasos -->
    <div class="space-y-4">
      <div
        v-for="step in steps"
        :key="step.id"
        class="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Icono principal del paso -->
            <div class="flex-shrink-0">
              <div
                class="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center shadow-sm"
              >
                <UIcon
                  :name="step.icon"
                  class="w-6 h-6 text-cyan-600 dark:text-cyan-400"
                />
              </div>
            </div>

            <!-- Información del paso -->
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ step.title }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ step.description }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ step.data?.length || 0 }} registros cargados
              </p>
            </div>
          </div>

          <!-- Estado del paso -->
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <!-- Icono de estado -->
              <UIcon
                :name="getStatusIcon(step, getStepStatus(step))"
                :class="[
                  getIconClasses(getStepStatus(step)),
                  getStepStatus(step) === 'processing' ? 'animate-spin' : ''
                ]"
              />

              <!-- Texto de estado -->
              <span class="text-sm font-medium">
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

    <!-- Botón de acción -->
    <div class="flex justify-center pt-6">
      <UButton
        v-if="!allStepsProcessed"
        :disabled="!allStepsHaveData || isProcessing"
        :loading="isProcessing"
        size="lg"
        color="cyan"
        icon="i-heroicons-cloud-arrow-up"
        @click="guardarDocumentos"
        class="px-8 py-3"
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

      <!-- Mensaje de éxito -->
      <div
        v-else
        class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-md p-4"
      >
        <div class="flex items-center justify-center">
          <UIcon
            name="i-heroicons-check-circle"
            class="w-6 h-6 text-green-600 dark:text-green-400 mr-2"
          />
          <span class="text-green-800 dark:text-green-200 font-medium">
            Todos los documentos han sido guardados exitosamente
          </span>
        </div>
      </div>
    </div>

    <!-- Información adicional -->
    <div
      v-if="!allStepsHaveData && !isProcessing"
      class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-md p-4"
    >
      <div class="flex items-center">
        <UIcon
          name="i-heroicons-information-circle"
          class="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2"
        />
        <p class="text-sm text-amber-800 dark:text-amber-200">
          Asegúrate de haber cargado los datos en todos los pasos anteriores antes de proceder con el guardado.
        </p>
      </div>
    </div>

    <!-- Panel de debug (solo en desarrollo) -->
    <div
      v-if="isDev"
      class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 mt-6"
    >
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        🐛 Debug - Props recibidas:
      </h4>
      <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div>Plan de Ventas: {{ props.planVentasData?.length || 0 }} registros</div>
        <div>Existencias: {{ props.existenciasData?.length || 0 }} registros</div>
        <div>Cobertura: {{ props.coberturaData?.length || 0 }} registros</div>
        <div class="mt-2 font-semibold">
          Todos tienen datos: {{ allStepsHaveData ? '✅ Sí' : '❌ No' }}
        </div>
        <div class="mt-2 text-xs">
          <div>🔍 Debug detallado:</div>
          <div v-for="step in steps" :key="step.id" class="ml-2">
            {{ step.title }}: {{ step.data?.length || 0 }} | Array: {{ Array.isArray(step.data) }} | Valid: {{ step.data && Array.isArray(step.data) && step.data.length > 0 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
