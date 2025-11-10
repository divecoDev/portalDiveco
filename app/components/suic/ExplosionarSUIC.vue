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
    <!-- Estado del proceso -->
    <div v-if="explosionStatus || pipelineStatus" class="mb-6">
      <!-- Queued -->
      <div v-if="pipelineStatus === 'Queued'" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-500 dark:border-yellow-400">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 border-3 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Pipeline en cola</p>
            <p class="text-xs text-yellow-600 dark:text-yellow-400">Preparándose para ejecutar...</p>
          </div>
        </div>
      </div>

      <!-- InProgress -->
      <div v-else-if="pipelineStatus === 'InProgress'" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500 dark:border-blue-400">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p class="text-sm font-semibold text-blue-800 dark:text-blue-200">Generando SUIC...</p>
            <p class="text-xs text-blue-600 dark:text-blue-400">Run ID: {{ runId }}</p>
          </div>
        </div>
      </div>

      <!-- Succeeded -->
      <div v-else-if="pipelineStatus === 'Succeeded'" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 dark:border-green-400">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-semibold text-green-800 dark:text-green-200">Pipeline completado exitosamente</p>
            <p class="text-xs text-green-600 dark:text-green-400">El SUIC ha sido generado correctamente</p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1">Puedes regenerar el SUIC si necesitas actualizar los datos</p>
          </div>
        </div>
      </div>

      <!-- Transferring -->
      <div v-if="transferInProgress" class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-cyan-500 dark:border-cyan-400 mt-4">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p class="text-sm font-semibold text-cyan-800 dark:text-cyan-200">Transferiendo datos...</p>
          </div>
        </div>
      </div>

      <!-- Failed/Cancelled -->
      <div v-else-if="pipelineStatus === 'Failed' || pipelineStatus === 'Cancelled'" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-500 dark:border-red-400">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-exclamation-circle" class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-red-800 dark:text-red-200">Pipeline falló o fue cancelado</p>
            <p class="text-xs text-red-700 dark:text-red-300 mt-1">Estado: {{ pipelineStatus }}</p>
          </div>
        </div>
      </div>

      <!-- Running (estado temporal antes de recibir status) -->
      <div v-else-if="explosionStatus === 'running'" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500 dark:border-blue-400">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p class="text-sm font-semibold text-blue-800 dark:text-blue-200">Iniciando pipeline...</p>
            <p class="text-xs text-blue-600 dark:text-blue-400">Este proceso puede tardar varios minutos</p>
          </div>
        </div>
      </div>

      <!-- Success (estado temporal) -->
      <div v-else-if="explosionStatus === 'success' && !pipelineStatus" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 dark:border-green-400">
        <div class="flex items-center space-x-3">
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <p class="text-sm font-semibold text-green-800 dark:text-green-200">Pipeline iniciado exitosamente</p>
            <p class="text-xs text-green-600 dark:text-green-400">Run ID: {{ runId }}</p>
          </div>
        </div>
      </div>

      <!-- Error (estado temporal) -->
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
    <div class="flex flex-col items-center">
      <button
        @click="ejecutarExplosion"
        :disabled="explosionInProgress || !suicData || !primerMes || pipelineStatus === 'InProgress' || pipelineStatus === 'Queued' || !isStep1Completed"
        class="rounded-md inline-flex items-center px-8 py-4 text-lg gap-2 shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <UIcon v-if="!explosionInProgress" name="i-heroicons-bolt" class="w-6 h-6" />
        <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {{ explosionInProgress ? 'Generando...' : (pipelineStatus === 'Succeeded' ? 'Regenerar SUIC' : 'Generar SUIC') }}
      </button>
    </div>

    <!-- Visualización de meta_diaria_final después de éxito -->
    <div v-if="pipelineStatus === 'Succeeded'" class="mt-8">
      <MetaDiariaFinalDisplay
        :data="metaDiariaData"
        :summary="metaDiariaSummary"
        :loading="loadingMetaDiaria"
        :error="errorMetaDiaria"
      />
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import { createDefaultSuicFlowState, parseSuicFlowState, useSuicFlowState } from '~/composables/useSuicFlowState';
import { useSuicMySQL } from '~/composables/useSuicMySQL';
import { useSuicMetaDiariaFinal } from '~/composables/useSuicMetaDiariaFinal';
import MetaDiariaFinalDisplay from '~/components/suic/MetaDiariaFinalDisplay.vue';

const props = defineProps({
  suicId: {
    type: String,
    required: true
  }
});

const client = generateClient();
const { updateSuicFlowState } = useSuicFlowState();
const flowState = ref(createDefaultSuicFlowState());
let lastPersistedStep2Status = flowState.value.step2.status;
const isStep1Completed = computed(() => flowState.value.step1.status === 'completed');

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

// Datos de meta_diaria_final
const metaDiariaData = ref([]);
const metaDiariaSummary = ref({ sociedades: [], mesesDisponibles: [] });
const loadingMetaDiaria = ref(false);
const errorMetaDiaria = ref(null);
const transferInProgress = ref(false);
const transferExecuted = ref(false); // Flag para prevenir transferencias duplicadas

// Composable para meta_diaria_final
const { getMetaDiariaFinal, getMetaDiariaFinalCount } = useSuicMetaDiariaFinal();

// Polling del pipeline
const explosionPollingInterval = ref(null);
const pipelineStatus = ref(null); // 'Queued', 'InProgress', 'Succeeded', 'Failed', etc.

// Composable para MySQL
const { getSuicSummary } = useSuicMySQL();

const persistStep2Status = async (status, message) => {
  const normalizedMessage = message ?? null;

  if (
    lastPersistedStep2Status === status &&
    flowState.value.step2.message === normalizedMessage
  ) {
    return;
  }

  try {
    const updatedState = await updateSuicFlowState(props.suicId, {
      step2: { status, message: normalizedMessage }
    });
    flowState.value = updatedState;
    lastPersistedStep2Status = updatedState.step2.status;
  } catch (error) {
    console.error('❌ Error actualizando estado del paso 2 en SUIC:', error);
  }
};

// Cargar datos SUIC y determinar primer mes
const loadSuicData = async () => {
  try {
    loadingData.value = true;
    errorLoadingData.value = null;

    // Cargar datos del SUIC
    const { data } = await client.models.SUIC.get({ id: props.suicId });
    suicData.value = data;

    if (data) {
      const normalizedFlowState = parseSuicFlowState(data.flowState);
      flowState.value = normalizedFlowState;
      lastPersistedStep2Status = normalizedFlowState.step2.status;
    }
    
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

// Consultar estado del pipeline de explosión
const consultarEstadoPipelineExplosion = async (runId) => {
  try {
    console.log(`🔍 Consultando estado del pipeline SUIC: ${runId}`);
    
    const { data } = await client.queries.getStatusPipeline({ runId });
    
    console.log('📋 Respuesta completa de getStatusPipeline:', data);
    
    if (!data) {
      console.warn('No se recibió respuesta del estado del pipeline');
      return;
    }

    // La respuesta viene directamente en data, no en data.getStatusPipeline
    let pipelineInfo = data.getStatusPipeline || data;
    console.log('📋 Pipeline info raw:', pipelineInfo);
    
    // Si pipelineInfo es un string JSON, parsearlo
    if (typeof pipelineInfo === 'string') {
      try {
        pipelineInfo = JSON.parse(pipelineInfo);
        console.log('📋 Pipeline info parseado:', pipelineInfo);
      } catch (e) {
        console.warn('No se pudo parsear pipelineInfo string:', e);
        return;
      }
    }
    
    if (!pipelineInfo) {
      console.warn('Información del pipeline no disponible - el pipeline puede estar aún inicializándose');
      return;
    }

    const status = pipelineInfo.status;
    console.log('🔄 Estado del pipeline SUIC:', status);

    // Actualizar el estado visual del pipeline
    pipelineStatus.value = status;

    // Procesar según el estado
    switch (status) {
      case 'Succeeded':
        console.log('✅ Pipeline de explosión SUIC completado exitosamente');
        explosionInProgress.value = false;
        await persistStep2Status('completed', 'Generación SUIC finalizada');
        
        // Actualizar SUIC con estado completado
        await actualizarSuicStatus('Completado');
        
        // Transferir datos de MSSQL a MySQL SOLO si no se ha ejecutado para este runId
        if (!transferExecuted.value) {
          transferExecuted.value = true;
          console.log('🔄 Ejecutando transferencia única para runId:', runId);
          const recordsTransferred = await transferirMetaDiariaFinal();
          
          // Esperar a que los datos estén sincronizados en MySQL antes de consultar
          if (recordsTransferred && recordsTransferred > 0) {
            console.log('⏳ Esperando sincronización de datos en MySQL antes de consultar...');
            await waitForDataSync(recordsTransferred);
          }
        } else {
          console.log('⏭️ Transferencia ya ejecutada para este runId, omitiendo');
        }
        
        // Consultar datos de meta_diaria_final
        await consultarMetaDiariaFinal();
        
        useToast().add({
          title: "SUIC generado exitosamente",
          description: "El proceso de generación SUIC ha finalizado correctamente",
          color: "green",
          timeout: 5000
        });
        break;

      case 'Failed':
      case 'Cancelled':
      case 'Canceling':
        console.log('❌ Pipeline de explosión SUIC falló o fue cancelado');
        explosionInProgress.value = false;
        await persistStep2Status('error', `Pipeline finalizado con estado ${status}`);
        
        // Actualizar SUIC con estado de error
        await actualizarSuicStatus('Error');
        
        useToast().add({
          title: "Error en generación SUIC",
          description: `El pipeline falló o fue cancelado con estado: ${status}`,
          color: "red",
          timeout: 5000
        });
        break;

      case 'Queued':
        console.log('⏳ Pipeline de explosión SUIC en cola, preparándose para ejecutar...');
        await persistStep2Status('processing', 'Pipeline en cola');
        break;

      case 'InProgress':
        console.log('⏳ Pipeline de explosión SUIC aún en progreso...');
        await persistStep2Status('processing', 'Generación SUIC en progreso');
        break;

      default:
        console.warn('⚠️ Estado desconocido del pipeline de explosión SUIC:', status);
    }
    
    // Manejar polling usando la función centralizada
    await managePolling(runId, status);
    
  } catch (error) {
    console.error('Error consultando estado del pipeline:', error);
  }
};

// Función centralizada para manejar todo el polling del pipeline
const managePolling = async (runId, status) => {
  console.log(`🔄 managePolling llamado con runId: ${runId}, status: ${status}`);
  
  // Estados que requieren polling activo
  const pollingStates = ['Queued', 'InProgress'];
  
  // Estados finales que detienen el polling COMPLETAMENTE
  const finalStates = ['Succeeded', 'Failed', 'Canceling', 'Cancelled'];
  
  if (finalStates.includes(status)) {
    // Detener polling si está activo y NO permitir más consultas
    if (explosionPollingInterval.value) {
      console.log('🛑 Pipeline terminado, deteniendo polling completamente - estado:', status);
      clearInterval(explosionPollingInterval.value);
      explosionPollingInterval.value = null;
    }
    console.log('🛑 Pipeline en estado final, no se realizarán más consultas hasta reinicio');
    return;
  }
  
  if (pollingStates.includes(status) || !status) {
    // Solo iniciar polling si no hay uno activo
    if (!explosionPollingInterval.value) {
      console.log('🔄 Iniciando polling para estado:', status || 'desconocido');
      await iniciarPollingExplosion(runId);
    } else {
      console.log('🔄 Polling ya activo, no iniciando nuevo interval');
    }
  }
};

// Función para iniciar polling del estado del pipeline de explosión
const iniciarPollingExplosion = async (runId) => {
  try {
    console.log(`🔄 Iniciando polling para pipeline SUIC con runId: ${runId}`);
    
    // Configurar polling cada 10 segundos con timeout de 30 minutos
    const startTime = Date.now();
    const timeoutMs = 30 * 60 * 1000; // 30 minutos
    
    const intervalId = setInterval(async () => {
      try {
        console.log('🔄 Ejecutando polling de explosión SUIC...', new Date().toISOString());
        
        // Verificar timeout
        if (Date.now() - startTime > timeoutMs) {
          console.warn('⏰ Timeout del polling de explosión SUIC alcanzado');
          clearInterval(intervalId);
          explosionPollingInterval.value = null;
          
          // Resetear estado de progreso
          explosionInProgress.value = false;
          
          useToast().add({
            title: "Timeout del pipeline",
            description: "El pipeline de generación SUIC ha tardado más de lo esperado. Verifica el estado manualmente.",
            color: "orange",
            timeout: 5000
          });
          return;
        }
        
        await consultarEstadoPipelineExplosion(runId);
        
        // Si el intervalo fue detenido por estado final, no continuar
        if (!explosionPollingInterval.value) {
          console.log('🛑 Polling detenido por estado final, cancelando interval');
          clearInterval(intervalId);
          return;
        }
      } catch (error) {
        console.error('Error en polling de explosión SUIC:', error);
        // No limpiar el interval aquí, continuar intentando
      }
    }, 10000);
    
    console.log('⏰ Polling configurado cada 10 segundos para runId:', runId);
    
    // Guardar el intervalId para poder detenerlo después
    explosionPollingInterval.value = intervalId;
    
    // Consultar el estado inicial inmediatamente después de configurar el interval
    await consultarEstadoPipelineExplosion(runId);
    
  } catch (error) {
    console.error('Error iniciando polling de explosión SUIC:', error);
  }
};

// Función para actualizar el estado de explosión en SUIC
const actualizarSuicStatus = async (nuevoEstado) => {
  try {
    console.log('📝 Intentando actualizar SUIC con estado:', nuevoEstado);
    console.log('📝 ID del SUIC a actualizar:', props.suicId);
    
    const result = await client.models.SUIC.update({
      id: props.suicId,
      explosionStatus: nuevoEstado
    });
    
    console.log('📝 Resultado de la actualización de SUIC:', result);
    
    console.log(`📝 SUIC actualizado con estado de explosión: ${nuevoEstado}`);
  } catch (error) {
    console.error('❌ Error actualizando estado de explosión en SUIC:', error);
    console.error('❌ Detalles del error:', error.message);
  }
};

// Función para transferir datos de MSSQL a MySQL
const transferirMetaDiariaFinal = async () => {
  try {
    transferInProgress.value = true;
    console.log('🔄 Iniciando transferencia de meta_diaria_final desde MSSQL a MySQL');

    const { data } = await client.mutations.transferMetaDiariaFinal({ suicId: props.suicId });

    console.log('📋 Respuesta de transferencia:', data);

    // Parsear respuesta si viene como string
    let result;
    if (typeof data === 'string') {
      result = JSON.parse(data);
    } else if (data && typeof data === 'object') {
      result = data.transferMetaDiariaFinal || data;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }

    if (result.success) {
      console.log('✅ Transferencia completada:', result.message);
      console.log('📊 Registros transferidos:', result.recordsTransferred);
      
      useToast().add({
        title: "Transferencia completada",
        description: `${result.recordsTransferred} registros transferidos exitosamente`,
        color: "green",
        timeout: 5000
      });
      
      return result.recordsTransferred;
    } else {
      throw new Error(result.message || 'Error en la transferencia');
    }
  } catch (error) {
    console.error('❌ Error transfiriendo meta_diaria_final:', error);
    
    useToast().add({
      title: "Error en transferencia",
      description: error instanceof Error ? error.message : 'Error desconocido al transferir datos',
      color: "red",
      timeout: 7000
    });
    
    return null;
  } finally {
    transferInProgress.value = false;
  }
};

// Función para esperar a que los datos estén sincronizados en MySQL
const waitForDataSync = async (expectedCount) => {
  try {
    console.log(`🔄 Esperando sincronización de datos en MySQL (esperados: ${expectedCount} registros)`);
    
    // Delay inicial de 2-3 segundos
    console.log('⏱️ Esperando 3 segundos iniciales para que MySQL procese los INSERTs...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const maxRetries = 6; // Máximo 6 intentos (3s inicial + 6 * 10s = ~63s máximo)
    const retryDelay = 10000; // 10 segundos entre intentos
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`🔍 Verificando sincronización (intento ${attempt + 1}/${maxRetries})...`);
        
        const currentCount = await getMetaDiariaFinalCount(props.suicId);
        console.log(`📊 MySQL tiene ${currentCount} registros, esperados ${expectedCount}`);
        
        if (currentCount === expectedCount) {
          console.log(`✅ Sincronización completa: ${currentCount} registros disponibles en MySQL`);
          return true;
        } else {
          const progress = ((currentCount / expectedCount) * 100).toFixed(1);
          console.log(`⏳ Sincronización en progreso: ${currentCount}/${expectedCount} (${progress}%)`);
          
          if (attempt < maxRetries - 1) {
            console.log(`⏱️ Esperando ${retryDelay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      } catch (error) {
        console.error(`❌ Error verificando conteo (intento ${attempt + 1}):`, error);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // Si llegamos aquí, no se pudo verificar completamente
    console.warn(`⚠️ No se pudo verificar completamente la sincronización después de ${maxRetries} intentos. Continuando de todas formas...`);
    return false;
  } catch (error) {
    console.error('❌ Error en waitForDataSync:', error);
    return false;
  }
};

// Función para consultar datos de meta_diaria_final
const consultarMetaDiariaFinal = async () => {
  try {
    loadingMetaDiaria.value = true;
    errorMetaDiaria.value = null;

    console.log('🔍 Consultando datos de meta_diaria_final para SUIC:', props.suicId);

    const response = await getMetaDiariaFinal(props.suicId);

    if (response.success && response.data) {
      metaDiariaData.value = response.data;
      metaDiariaSummary.value = response.summary;
      
      console.log('✅ Datos de meta_diaria_final obtenidos:', {
        registros: response.data.length,
        sociedades: response.summary.sociedades.length,
        meses: response.summary.mesesDisponibles.length
      });
    } else {
      errorMetaDiaria.value = response.message || 'Error al consultar datos';
    }
  } catch (error) {
    console.error('❌ Error consultando meta_diaria_final:', error);
    errorMetaDiaria.value = error.message || 'Error desconocido';
  } finally {
    loadingMetaDiaria.value = false;
  }
};

// Función para verificar el estado inicial del pipeline de explosión
const checkInitialExplosionState = async () => {
  try {
    const { data } = await client.models.SUIC.get({ id: props.suicId });
    if (!data) return;

    const normalizedFlowState = parseSuicFlowState(data.flowState);
    flowState.value = normalizedFlowState;
    lastPersistedStep2Status = normalizedFlowState.step2.status;

    const runIdExplosion = data.explosionRunId;
    const statusExplosion = data.explosionStatus;

    console.log('🔍 Estado inicial del pipeline SUIC:', { runIdExplosion, statusExplosion });

    if (runIdExplosion && statusExplosion) {
      // Mapear estados de la base de datos a estados del pipeline
      let pipelineStatusValue = null;
      
      if (statusExplosion === 'En Proceso') {
        pipelineStatusValue = 'InProgress'; // Asumir que está en progreso si no sabemos el estado exacto
        await persistStep2Status('processing', 'Generación SUIC en progreso');
      } else if (statusExplosion === 'Completado') {
        pipelineStatusValue = 'Succeeded';
        explosionInProgress.value = false;
        pipelineStatus.value = 'Succeeded';
        runId.value = runIdExplosion;
        console.log('✅ Pipeline de explosión SUIC ya completado');
        await persistStep2Status('completed', 'Generación SUIC finalizada');
        
        // Consultar datos de meta_diaria_final si ya está completado
        await consultarMetaDiariaFinal();
        
        return; // No necesitamos polling para estado completado
      } else if (statusExplosion === 'Error') {
        explosionInProgress.value = false;
        pipelineStatus.value = 'Failed';
        console.log('❌ Pipeline de explosión SUIC en estado de error, permitiendo reintento');
        await persistStep2Status('error', 'El pipeline de generación falló');
        return; // No necesitamos polling para estado de error
      }
      
      // Si necesitamos polling, usar la función centralizada
      if (pipelineStatusValue) {
        runId.value = runIdExplosion;
        explosionInProgress.value = true;
        await managePolling(runIdExplosion, pipelineStatusValue);
      }
    }
  } catch (error) {
    console.error('❌ Error verificando estado inicial del pipeline de explosión SUIC:', error);
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

  // Si hay un pipeline completado, resetear estados para nueva ejecución
  if (pipelineStatus.value === 'Succeeded' || pipelineStatus.value === 'Failed') {
    console.log('🔄 Reejecutando pipeline SUIC desde estado:', pipelineStatus.value);
    pipelineStatus.value = null;
    explosionStatus.value = null;
    runId.value = null;
    transferExecuted.value = false; // Resetear flag de transferencia
  }

  try {
    explosionInProgress.value = true;
    explosionStatus.value = 'running';
    await persistStep2Status('processing', 'Iniciando generación de SUIC');

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
      description: 'Iniciando pipeline. Esto puede tomar varios minutos.',
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

      // Actualizar SUIC con runId y estado "En Proceso"
      await client.models.SUIC.update({
        id: props.suicId,
        explosionRunId: extractedRunId,
        explosionStatus: 'En Proceso'
      });

      // Resetear flag para permitir transferencia en este nuevo pipeline
      transferExecuted.value = false;

      // Iniciar polling para monitorear el estado
      await iniciarPollingExplosion(extractedRunId);

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
    await persistStep2Status('error', error instanceof Error ? error.message : 'Error ejecutando pipeline');

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
onMounted(async () => {
  await loadSuicData();
  await checkInitialExplosionState();
});

// Limpiar polling al desmontar
onUnmounted(() => {
  if (explosionPollingInterval.value) {
    clearInterval(explosionPollingInterval.value);
    explosionPollingInterval.value = null;
  }
});
</script>

