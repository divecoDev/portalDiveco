<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
        <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
          <UIcon name="i-heroicons-cog" class="w-6 h-6 text-white" />
        </div>
        Generar SUIC
      </h2>
      <p class="text-gray-600 dark:text-gray-400 ml-13">
        Procesa los datos SUIC mediante Azure Data Factory
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loadingData" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="errorLoadingData" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg mb-6">
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error cargando datos</p>
          <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ errorLoadingData }}</p>
        </div>
      </div>
    </div>

    <!-- Información del SUIC -->
    <div v-else-if="suicData" class="mb-6 p-4 bg-gradient-to-br from-cyan-50 to-green-50 dark:from-cyan-900/20 dark:to-green-900/20 rounded-lg border-2 border-cyan-200 dark:border-cyan-700 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-tag" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ suicData.type }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Primer Mes</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ primerMes ? monthNames[primerMes - 1] : 'Calculando...' }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-hashtag" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">ID SUIC</p>
            <p class="text-lg font-mono font-semibold text-gray-900 dark:text-white">
              {{ suicId }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado del proceso -->
    <div v-if="explosionStatus" class="mb-6">
      <!-- Running -->
      <div v-if="explosionStatus === 'running'" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500 dark:border-blue-400">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p class="text-sm font-semibold text-blue-800 dark:text-blue-200">Ejecutando pipeline...</p>
            <p class="text-xs text-blue-600 dark:text-blue-400">Este proceso puede tardar varios minutos</p>
          </div>
        </div>
      </div>

      <!-- Success -->
      <div v-else-if="explosionStatus === 'success'" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 dark:border-green-400">
        <div class="flex items-center space-x-3">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <p class="text-sm font-semibold text-green-800 dark:text-green-200">Pipeline iniciado exitosamente</p>
            <p class="text-xs text-green-600 dark:text-green-400">Run ID: {{ runId }}</p>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="explosionStatus === 'error'" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-500 dark:border-red-400">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-exclamation-circle" class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error en el pipeline</p>
            <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de acción -->
    <div class="flex justify-center">
      <button
        @click="ejecutarExplosion"
        :disabled="explosionInProgress || !suicData || !primerMes"
        class="rounded-md inline-flex items-center px-8 py-4 text-lg gap-2 shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <UIcon v-if="!explosionInProgress" name="i-heroicons-bolt" class="w-6 h-6" />
        <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {{ explosionInProgress ? 'Generando...' : 'Generar SUIC' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import { useSuicMySQL } from '~/composables/useSuicMySQL';

const props = defineProps({
  suicId: {
    type: String,
    required: true
  }
});

const client = generateClient();

// Nombres de meses
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Estado del proceso
const explosionInProgress = ref(false);
const explosionStatus = ref(null);
const runId = ref(null);
const errorMessage = ref('');
const loadingData = ref(true);
const errorLoadingData = ref(null);

// Datos SUIC
const suicData = ref(null);
const primerMes = ref(null);

// Composable para MySQL
const { getSuicSummary } = useSuicMySQL();

// Cargar datos SUIC y determinar primer mes
const loadSuicData = async () => {
  try {
    loadingData.value = true;
    errorLoadingData.value = null;

    // Cargar datos del SUIC
    const { data } = await client.models.SUIC.get({ id: props.suicId });
    suicData.value = data;
    
    console.log('📋 Datos SUIC cargados:', data);
    
    // Obtener resumen de MySQL para determinar primer mes
    const summary = await getSuicSummary(props.suicId);
    if (summary.success && summary.countries.length > 0) {
      // Usar el primer país como referencia (todos tienen los mismos meses validados)
      const firstCountry = summary.countries[0];
      if (firstCountry.availableMonths && firstCountry.availableMonths.length > 0) {
        primerMes.value = firstCountry.availableMonths.sort((a, b) => a - b)[0]; // Primer mes del array ordenado
        console.log(`📅 Primer mes detectado: ${primerMes.value}`);
      } else {
        errorLoadingData.value = 'No se encontraron meses disponibles en los datos';
      }
    } else {
      errorLoadingData.value = 'No se encontraron datos guardados en MySQL';
    }
  } catch (error) {
    console.error('Error cargando datos SUIC:', error);
    errorLoadingData.value = error.message || 'Error desconocido al cargar datos';
  } finally {
    loadingData.value = false;
  }
};

// Ejecutar explosión
const ejecutarExplosion = async () => {
  if (!suicData.value || !primerMes.value) {
    useToast().add({
      title: 'Error',
      description: 'Faltan datos para ejecutar la explosión',
      color: 'red'
    });
    return;
  }

  try {
    explosionInProgress.value = true;
    explosionStatus.value = 'running';

    // Preparar argumentos
    const pipelineArgs = {
      pipelineName: 'EjecutarExplosionSUIC',
      idSuic: props.suicId,
      tipo: suicData.value.type, // "Cierre" o "Recarga"
      primerMes: primerMes.value
    };

    console.log('🚀 Ejecutando pipeline SUIC:', pipelineArgs);

    // Mostrar toast de carga
    const loadingToast = useToast().add({
      title: 'Generando SUIC...',
      description: 'Iniciando pipeline de Azure Data Factory. Esto puede tomar varios minutos.',
      color: 'blue',
      timeout: 0
    });

    // Llamar a la mutación
    const { data } = await client.mutations.runExplosionSuic(pipelineArgs);

    console.log('📋 Respuesta del pipeline:', data);

    // Procesar respuesta
    let extractedRunId = null;
    const raw = data?.runExplosionSuic ?? data;

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        extractedRunId = parsed?.runId ?? null;
      } catch (e) {
        console.warn('Error parseando respuesta:', e);
      }
    } else if (raw && typeof raw === 'object') {
      extractedRunId = raw?.runId ?? raw?.data?.runId ?? null;
    }

    if (extractedRunId) {
      runId.value = extractedRunId;
      
      explosionStatus.value = 'success';

      // Cerrar toast de carga
      useToast().remove(loadingToast.id);

      useToast().add({
        title: 'Pipeline iniciado',
        description: `Generación SUIC iniciada. ID: ${extractedRunId}`,
        color: 'green',
        timeout: 5000
      });
    } else {
      throw new Error('No se recibió runId del pipeline');
    }

  } catch (error) {
    console.error('Error ejecutando explosión:', error);
    explosionStatus.value = 'error';
    errorMessage.value = error.message;

    useToast().add({
      title: 'Error en generación',
      description: error.message,
      color: 'red'
    });
  } finally {
    explosionInProgress.value = false;
  }
};

// Cargar datos al montar
onMounted(() => {
  loadSuicData();
});
</script>

