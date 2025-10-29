<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
          <UIcon name="i-heroicons-cpu-chip" class="w-6 h-6 text-white" />
        </div>
        Ejecutar RPA
      </h2>
      <p class="text-gray-600 dark:text-gray-400 ml-13">
        Ejecución de robots
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg mb-6">
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error</p>
          <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Lista de RPAs -->
    <div class="space-y-4 mb-6">
      <!-- RPA 1: Bloqueo de usuarios SAP -->
      <div 
        class="p-4 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-300"
        :class="getRpaCardClass('bloqueo-sap')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 flex-1">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="getRpaIconClass('bloqueo-sap')"
            >
              <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                Bloqueo de usuarios SAP
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Inhabilita usuarios en el sistema SAP
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3 ml-4">
            <!-- Estado del RPA -->
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <div v-if="rpaStates['bloqueo-sap'] === 'running'" class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <UIcon v-else-if="rpaStates['bloqueo-sap'] === 'success'" name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
                <UIcon v-else-if="rpaStates['bloqueo-sap'] === 'error'" name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
                <span class="text-xs font-medium" :class="getRpaStatusTextClass('bloqueo-sap')">
                  {{ getRpaStatusText('bloqueo-sap') }}
                </span>
              </div>
            </div>
            <button
              @click="ejecutarRPAIndividual('bloqueo-sap')"
              :disabled="rpaStates['bloqueo-sap'] === 'running' || rpaStates['bloqueo-sap'] === 'success'"
              class="px-4 py-2 text-sm rounded-md font-semibold transition-all duration-300"
              :class="getRpaButtonClass('bloqueo-sap')"
            >
              {{ getRpaButtonText('bloqueo-sap') }}
            </button>
          </div>
        </div>
      </div>

      <!-- RPA 2: Carga de Plantilla SUIC BW -->
      <div 
        class="p-4 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-300"
        :class="getRpaCardClass('carga-plantilla')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 flex-1">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="getRpaIconClass('carga-plantilla')"
            >
              <UIcon name="i-heroicons-document-arrow-up" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                Carga de Plantilla SUIC BW
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Actualiza datos en SAP BW
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3 ml-4">
            <!-- Estado del RPA -->
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <div v-if="rpaStates['carga-plantilla'] === 'running'" class="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <UIcon v-else-if="rpaStates['carga-plantilla'] === 'success'" name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
                <UIcon v-else-if="rpaStates['carga-plantilla'] === 'error'" name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
                <span class="text-xs font-medium" :class="getRpaStatusTextClass('carga-plantilla')">
                  {{ getRpaStatusText('carga-plantilla') }}
                </span>
              </div>
            </div>
            <button
              @click="ejecutarRPAIndividual('carga-plantilla')"
              :disabled="rpaStates['carga-plantilla'] === 'running' || rpaStates['carga-plantilla'] === 'success'"
              class="px-4 py-2 text-sm rounded-md font-semibold transition-all duration-300"
              :class="getRpaButtonClass('carga-plantilla')"
            >
              {{ getRpaButtonText('carga-plantilla') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de acción: Ejecutar todos -->
    <div class="flex justify-center">
      <button
        @click="ejecutarTodosRPA"
        :disabled="isProcessing || !suicId || rpaStates['bloqueo-sap'] === 'success' && rpaStates['carga-plantilla'] === 'success'"
        class="rounded-md inline-flex items-center px-8 py-4 text-lg gap-2 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <UIcon v-if="!isProcessing" name="i-heroicons-arrow-path" class="w-6 h-6" />
        <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {{ isProcessing ? 'Ejecutando RPAs...' : 'Ejecutar Todos los RPAs' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

const props = defineProps({
  suicId: {
    type: String,
    required: true
  }
});

const client = generateClient();

// Estados del componente
const loading = ref(false);
const error = ref(null);
const isProcessing = ref(false);

// Estados de los dos RPAs individuales
const rpaStates = ref({
  'bloqueo-sap': null,      // null, 'running', 'success', 'error'
  'carga-plantilla': null   // null, 'running', 'success', 'error'
});

// Métodos auxiliares para UI
const getRpaStatusText = (rpaKey) => {
  const state = rpaStates.value[rpaKey];
  switch (state) {
    case 'running': return 'Ejecutando';
    case 'success': return 'Completado';
    case 'error': return 'Error';
    default: return 'Pendiente';
  }
};

const getRpaStatusTextClass = (rpaKey) => {
  const state = rpaStates.value[rpaKey];
  switch (state) {
    case 'running': return 'text-emerald-600 dark:text-emerald-400';
    case 'success': return 'text-green-600 dark:text-green-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
};

const getRpaButtonText = (rpaKey) => {
  const state = rpaStates.value[rpaKey];
  switch (state) {
    case 'running': return 'Ejecutando...';
    case 'success': return 'Completado';
    default: return 'Ejecutar';
  }
};

const getRpaButtonClass = (rpaKey) => {
  const state = rpaStates.value[rpaKey];
  switch (state) {
    case 'running':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-wait';
    case 'success':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed';
    case 'error':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40';
    default:
      return 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer';
  }
};

const getRpaIconClass = (rpaKey) => {
  const state = rpaStates.value[rpaKey];
  switch (state) {
    case 'running': return 'bg-emerald-500 dark:bg-emerald-600';
    case 'success': return 'bg-green-500 dark:bg-green-600';
    case 'error': return 'bg-red-500 dark:bg-red-600';
    default: return 'bg-gray-400 dark:bg-gray-500';
  }
};

const getRpaCardClass = (rpaKey) => {
  const state = rpaStates.value[rpaKey];
  switch (state) {
    case 'running': 
      return 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10';
    case 'success': 
      return 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10';
    case 'error': 
      return 'border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10';
    default: 
      return 'border-gray-300 dark:border-gray-600';
  }
};

// Ejecutar RPA individual
const ejecutarRPAIndividual = async (rpaKey) => {
  if (!props.suicId) {
    useToast().add({
      title: 'Error',
      description: 'Falta el ID del SUIC',
      color: 'red'
    });
    return;
  }

  try {
    // Actualizar estado a running
    rpaStates.value[rpaKey] = 'running';

    const rpaNames = {
      'bloqueo-sap': 'Bloqueo de usuarios SAP',
      'carga-plantilla': 'Carga de Plantilla SUIC BW'
    };

    useToast().add({
      title: 'Iniciando RPA',
      description: `${rpaNames[rpaKey]} ha comenzado`,
      color: 'blue'
    });

    // TODO: Implementar lógica de integración con servicio externo
    // Ejemplo para Bloqueo SAP:
    // if (rpaKey === 'bloqueo-sap') {
    //   const result = await client.mutations.executeBloqueoSAP({ suicId: props.suicId });
    // }
    
    // Ejemplo para Carga Plantilla:
    // if (rpaKey === 'carga-plantilla') {
    //   const result = await client.mutations.executeCargaPlantilla({ suicId: props.suicId });
    // }

    // Simular proceso por 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Marcar como exitoso
    rpaStates.value[rpaKey] = 'success';

    useToast().add({
      title: 'RPA completado',
      description: `${rpaNames[rpaKey]} finalizó exitosamente`,
      color: 'green'
    });

  } catch (err) {
    console.error(`Error ejecutando RPA ${rpaKey}:`, err);
    rpaStates.value[rpaKey] = 'error';

    useToast().add({
      title: 'Error en RPA',
      description: err.message,
      color: 'red'
    });
  }
};

// Ejecutar todos los RPAs secuencialmente
const ejecutarTodosRPA = async () => {
  if (!props.suicId) {
    useToast().add({
      title: 'Error',
      description: 'Falta el ID del SUIC',
      color: 'red'
    });
    return;
  }

  try {
    isProcessing.value = true;

    useToast().add({
      title: 'Iniciando RPAs',
      description: 'Ejecutando todos los procesos automatizados',
      color: 'blue'
    });

    // Ejecutar primero Bloqueo SAP
    if (rpaStates.value['bloqueo-sap'] !== 'success') {
      await ejecutarRPAIndividual('bloqueo-sap');
    }

    // Ejecutar luego Carga de Plantilla (después de que el primero termine)
    if (rpaStates.value['carga-plantilla'] !== 'success') {
      await ejecutarRPAIndividual('carga-plantilla');
    }

    useToast().add({
      title: 'Proceso completado',
      description: 'Todos los RPAs se ejecutaron exitosamente',
      color: 'green'
    });

  } catch (err) {
    console.error('Error ejecutando todos los RPAs:', err);
    useToast().add({
      title: 'Error',
      description: err.message,
      color: 'red'
    });
  } finally {
    isProcessing.value = false;
  }
};

// Lifecycle
onMounted(() => {
  console.log('Componente EjecutarRPA montado para SUIC:', props.suicId);
});
</script>

