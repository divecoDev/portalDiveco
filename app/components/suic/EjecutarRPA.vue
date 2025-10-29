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

    <!-- Botón de Generar CSVs por Sociedad -->
    <div class="mb-6">
      <div 
        class="p-4 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-300"
        :class="getCsvCardClass()"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 flex-1">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="getCsvIconClass()"
            >
              <UIcon name="i-heroicons-document-arrow-down" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                Generar CSVs por Sociedad
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Genera archivos CSV separados por sociedad desde meta_diaria_final
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3 ml-4">
            <!-- Estado del proceso -->
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <div v-if="csvGenerating" class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                <UIcon v-else-if="csvState === 'success'" name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
                <UIcon v-else-if="csvState === 'error'" name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
                <span class="text-xs font-medium" :class="getCsvStatusTextClass()">
                  {{ getCsvStatusText() }}
                </span>
              </div>
            </div>
            <button
              @click="generarCsvsPorSociedad"
              :disabled="csvGenerating || csvState === 'success'"
              class="px-4 py-2 text-sm rounded-md font-semibold transition-all duration-300"
              :class="getCsvButtonClass()"
            >
              {{ getCsvButtonText() }}
            </button>
          </div>
        </div>
        <!-- Mostrar información de archivos generados -->
        <div v-if="csvState === 'success' && csvFiles.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Archivos generados ({{ csvFiles.length }}):
          </p>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div 
              v-for="file in csvFiles" 
              :key="file.sociedad"
              class="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1"
            >
              <span class="text-gray-600 dark:text-gray-400">{{ file.fileName }}</span>
              <span class="text-gray-500 dark:text-gray-500">{{ file.recordCount }} registros</span>
            </div>
          </div>
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
import { executeRPA } from "~/services/rpa-service";
import { useRpaStatus } from "~/composables/useRpaStatus";
import { useSuicSociedadesCsv } from "~/composables/useSuicSociedadesCsv";
import { watch } from "vue";
import { generateClient } from "aws-amplify/data";

const props = defineProps({
  suicId: {
    type: String,
    required: true
  }
});

// Estados del componente
const loading = ref(false);
const error = ref(null);
const isProcessing = ref(false);

// Estados para generación de CSVs
const csvGenerating = ref(false);
const csvState = ref(null); // null, 'running', 'success', 'error'
const csvFiles = ref([]);

// Composable para generar CSVs
const { generateSociedadesCsv } = useSuicSociedadesCsv();
const dataClient = generateClient();

// Composable para monitorear estado del RPA
const {
  status: rpaStatus,
  statusData,
  startPolling,
  stopPolling,
  checkRpaStatus,
} = useRpaStatus(props.suicId, false);

// Estados de los dos RPAs individuales (mapeados desde el estado global)
const rpaStates = ref({
  'bloqueo-sap': null,      // null, 'running', 'success', 'error'
  'carga-plantilla': null   // null, 'running', 'success', 'error'
});

// Mapear estado global del RPA a estados individuales basados en el tipo
const updateRpaStatesFromStatus = () => {
  if (statusData.value.type && statusData.value.status) {
    const rpaKey = statusData.value.type;
    // Mapear estados: pending -> null (pendiente), running -> 'running', completed -> 'success', error -> 'error'
    if (statusData.value.status === 'pending' || statusData.value.status === null) {
      rpaStates.value[rpaKey] = null;
    } else if (statusData.value.status === 'running') {
      rpaStates.value[rpaKey] = 'running';
    } else if (statusData.value.status === 'completed') {
      rpaStates.value[rpaKey] = 'success';
    } else if (statusData.value.status === 'error') {
      rpaStates.value[rpaKey] = 'error';
    }
  }
};

// Watch para actualizar estados individuales cuando cambie el estado global
watch(
  () => [statusData.value.status, statusData.value.type],
  () => {
    updateRpaStatesFromStatus();
  },
  { deep: true }
);

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

// Métodos auxiliares para UI de CSVs
const getCsvStatusText = () => {
  switch (csvState.value) {
    case 'running': return 'Generando...';
    case 'success': return 'Completado';
    case 'error': return 'Error';
    default: return 'Pendiente';
  }
};

const getCsvStatusTextClass = () => {
  switch (csvState.value) {
    case 'running': return 'text-cyan-600 dark:text-cyan-400';
    case 'success': return 'text-green-600 dark:text-green-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
};

const getCsvButtonText = () => {
  switch (csvState.value) {
    case 'running': return 'Generando...';
    case 'success': return 'Completado';
    default: return 'Generar CSVs';
  }
};

const getCsvButtonClass = () => {
  switch (csvState.value) {
    case 'running':
      return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 cursor-wait';
    case 'success':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed';
    case 'error':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40';
    default:
      return 'bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer';
  }
};

const getCsvIconClass = () => {
  switch (csvState.value) {
    case 'running': return 'bg-cyan-500 dark:bg-cyan-600';
    case 'success': return 'bg-green-500 dark:bg-green-600';
    case 'error': return 'bg-red-500 dark:bg-red-600';
    default: return 'bg-cyan-400 dark:bg-cyan-500';
  }
};

const getCsvCardClass = () => {
  switch (csvState.value) {
    case 'running': 
      return 'border-cyan-400 dark:border-cyan-600 bg-cyan-50/50 dark:bg-cyan-900/10';
    case 'success': 
      return 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10';
    case 'error': 
      return 'border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10';
    default: 
      return 'border-gray-300 dark:border-gray-600';
  }
};

// Generar CSVs por sociedad
const generarCsvsPorSociedad = async () => {
  if (!props.suicId) {
    useToast().add({
      title: 'Error',
      description: 'Falta el ID del SUIC',
      color: 'red'
    });
    return;
  }

  try {
    csvGenerating.value = true;
    csvState.value = 'running';
    csvFiles.value = [];

    useToast().add({
      title: 'Generando CSVs',
      description: 'Generando archivos CSV por sociedad...',
      color: 'blue'
    });

    const result = await generateSociedadesCsv(props.suicId);

    if (!result.success) {
      throw new Error(result.error || result.message || 'Error al generar CSVs');
    }

    csvState.value = 'success';
    csvFiles.value = result.files || [];

    // Guardar paths en el modelo SUIC (campo csvFilesPath)
    try {
      const csvFilesPathAsString = JSON.stringify(csvFiles.value || []);
      await dataClient.models.SUIC.update({
        id: props.suicId,
        csvFilesPath: csvFilesPathAsString
      });
      console.log('💾 csvFilesPath actualizado en modelo SUIC');
    } catch (e) {
      console.error('❌ Error actualizando csvFilesPath en SUIC:', e);
    }

    useToast().add({
      title: 'CSVs generados exitosamente',
      description: `Se generaron ${result.totalSocieties} archivos CSV`,
      color: 'green'
    });

    console.log(`✅ CSVs generados: ${result.totalSocieties} archivos`);

  } catch (err) {
    console.error('❌ Error generando CSVs:', err);
    csvState.value = 'error';

    useToast().add({
      title: 'Error generando CSVs',
      description: err.message || 'Error desconocido',
      color: 'red'
    });
  } finally {
    csvGenerating.value = false;
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
    const rpaNames = {
      'bloqueo-sap': 'Bloqueo de usuarios SAP',
      'carga-plantilla': 'Carga de Plantilla SUIC BW'
    };

    // Actualizar estado local inicialmente
    rpaStates.value[rpaKey] = 'running';

    useToast().add({
      title: 'Iniciando RPA',
      description: `${rpaNames[rpaKey]} ha comenzado`,
      color: 'blue'
    });

    // Ejecutar RPA usando el servicio
    const result = await executeRPA(rpaKey, props.suicId);

    if (!result.success) {
      throw new Error(result.error || 'Error al ejecutar RPA');
    }

    console.log(`✅ RPA ${rpaKey} ejecutado, executionId: ${result.executionId}`);

    // Iniciar polling para monitorear el estado
    await checkRpaStatus(); // Consulta inicial
    startPolling();

    // El polling actualizará automáticamente el estado cuando el webhook actualice la BD

  } catch (err) {
    console.error(`❌ Error ejecutando RPA ${rpaKey}:`, err);
    rpaStates.value[rpaKey] = 'error';

    useToast().add({
      title: 'Error en RPA',
      description: err.message || 'Error desconocido',
      color: 'red'
    });

    stopPolling();
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
onMounted(async () => {
  console.log('Componente EjecutarRPA montado para SUIC:', props.suicId);
  
  // Verificar estado inicial del RPA al cargar
  try {
    await checkRpaStatus();
    updateRpaStatesFromStatus();
    
    // Si hay un RPA en ejecución, iniciar polling
    if (statusData.value.status === 'running' || statusData.value.status === 'pending') {
      startPolling();
    }
  } catch (err) {
    console.error('Error verificando estado inicial del RPA:', err);
  }
});

// Limpiar polling al desmontar
onUnmounted(() => {
  stopPolling();
});
</script>

