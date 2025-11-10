<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
          <UIcon name="i-heroicons-cpu-chip" class="w-6 h-6 text-white" />
        </div>
        Guadar SUIC
      </h2>
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

    <!-- RPA Restriction Warning -->
    <div v-if="isRestricted && getActiveWindow" class="mb-6">
      <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-500 dark:border-orange-400">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
              Guardar SUIC temporalmente deshabilitado
            </p>
            <p class="text-xs text-orange-700 dark:text-orange-300">
              <span class="font-medium">RPA en ejecución:</span> {{ getActiveWindow.name }}
            </p>
            <p class="text-xs text-orange-700 dark:text-orange-300 mt-1">
              <span class="font-medium">Horario:</span> {{ getActiveWindow.startTime }} - {{ getActiveWindow.endTime }} ({{ getActiveWindow.timezone }})
            </p>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-2 italic">
              ⏰ Estará disponible nuevamente después de las {{ getActiveWindow.endTime }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón Principal: Guardar SUIC -->
    <div v-if="!isRestricted" class="mb-8">
      <div 
        class="relative overflow-hidden bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl shadow-xl border-2 transition-all duration-300"
        :class="getCsvCardClass()"
      >
        <!-- Fondo con patrón sutil -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, cyan 1px, transparent 0); background-size: 24px 24px;"></div>
        </div>
        
        <div class="relative p-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <!-- Información y Descripción -->
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Guardar SUIC
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Genera los archivos CSV por sociedad y ejecuta el proceso automatizado
              </p>
              <!-- Estado del proceso -->
              <div v-if="csvState !== null" class="mt-3 flex items-center space-x-2">
                <div v-if="csvGenerating" class="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                <UIcon v-else-if="csvState === 'success'" name="i-heroicons-check-circle" class="w-4 h-4 text-green-600 dark:text-green-400" />
                <UIcon v-else-if="csvState === 'error'" name="i-heroicons-exclamation-circle" class="w-4 h-4 text-red-600 dark:text-red-400" />
                <span class="text-sm font-medium" :class="getCsvStatusTextClass()">
                  {{ getCsvStatusText() }}
                </span>
              </div>
            </div>
            
            <!-- Botón Principal Destacado -->
            <div class="flex-shrink-0">
              <button
                @click="generarCsvsPorSociedad"
                :disabled="csvGenerating || csvState === 'success' || !isStep2Completed || rpaProcessing"
                class="group relative px-8 py-4 text-base font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-75 min-w-[180px]"
                :class="getCsvButtonClass()"
              >
                <!-- Efecto de brillo en hover -->
                <span class="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                
                <!-- Contenido del botón -->
                <span class="relative flex items-center justify-center space-x-3">
                  <div v-if="csvGenerating" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <UIcon 
                    v-else-if="csvState === 'success'" 
                    name="i-heroicons-check-circle" 
                    class="w-5 h-5"
                  />
                  <UIcon 
                    v-else-if="csvState === 'error'" 
                    name="i-heroicons-arrow-path" 
                    class="w-5 h-5"
                  />
                  <UIcon 
                    v-else 
                    name="i-heroicons-arrow-down-tray" 
                    class="w-5 h-5"
                  />
                  <span>{{ getCsvButtonText() }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado de Procesamiento de la SUIC -->
    <div v-if="rpaProcessing" class="mb-6">
      <div 
        class="p-4 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-300"
        :class="getRpaProcessingCardClass()"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 flex-1">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="getRpaProcessingIconClass()"
            >
              <div v-if="rpaProcessingStatus === 'processing'" class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <UIcon v-else-if="rpaProcessingStatus === 'completed'" name="i-heroicons-check-circle" class="w-6 h-6 text-white" />
              <UIcon v-else-if="rpaProcessingStatus === 'error'" name="i-heroicons-exclamation-circle" class="w-6 h-6 text-white" />
              <UIcon v-else name="i-heroicons-cpu-chip" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Estado de la SUIC
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <span v-if="rpaProcessingStatus === 'processing'">
                  La SUIC está en proceso. Te notificaremos por email cuando termine.
                </span>
                <span v-else-if="rpaProcessingStatus === 'completed'" class="text-green-600 dark:text-green-400">
                  La SUIC se procesó correctamente.
                </span>
                <span v-else-if="rpaProcessingStatus === 'error'" class="text-red-600 dark:text-red-400 font-semibold">
                  Error al procesar la SUIC. Por favor, revisa los detalles o contacta al administrador.
                </span>
                <span v-else>
                  Iniciando proceso...
                </span>
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <span class="text-xs font-medium" :class="getRpaProcessingStatusTextClass()">
              {{ getRpaProcessingStatusText() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón para ver horarios RPA -->
    <div class="mt-6 flex justify-center">
      <button
        @click="showRpaSchedulesModal = true"
        type="button"
        class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 cursor-pointer"
      >
        <UIcon name="i-heroicons-clock" class="w-4 h-4" />
        Ver Horarios de RPA
      </button>
    </div>

    <!-- Modal de horarios RPA -->
    <RpaSchedulesModal v-model:open="showRpaSchedulesModal" />
  </div>
</template>

<script setup lang="ts">
import { executeRPA } from "~/services/rpa-service";
import { useRpaStatus } from "~/composables/useRpaStatus";
import { useSuicSociedadesCsv } from "~/composables/useSuicSociedadesCsv";
import { useSubscriptionManager } from "~/composables/useSubscriptionManager";
import { useRpaRestriction } from "~/composables/useRpaRestriction";
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "~/amplify/data/resource";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useToast } from "#imports";
import { createDefaultSuicFlowState, parseSuicFlowState, useSuicFlowState, type SuicFlowState, type SuicStepStatus } from "~/composables/useSuicFlowState";
import RpaSchedulesModal from "~/components/rpa/RpaSchedulesModal.vue";

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

// Estados para procesamiento RPA
const rpaProcessing = ref(false);
const rpaProcessingStatus = ref(null); // null, 'processing', 'completed', 'error'
let rpaSubscription = null;
let rpaSubscriptionTimeout = null; // Timeout para cerrar suscripción después de inactividad
const SUBSCRIPTION_TIMEOUT_MS = 5 * 60 * 60 * 1000; // 5 horas - tiempo de espera para cierre automático cuando hay error
const SUBSCRIPTION_ID = `rpa-${props.suicId}`; // ID único para esta suscripción

// Gestor global de suscripciones
const { registerSubscription, unregisterSubscription } = useSubscriptionManager();

// Composable para generar CSVs
const { generateSociedadesCsv } = useSuicSociedadesCsv();
const dataClient = generateClient<Schema>();
const { updateSuicFlowState } = useSuicFlowState();
const flowState = ref<SuicFlowState>(createDefaultSuicFlowState());
let lastPersistedStep3Status: SuicStepStatus | null = flowState.value.step3.status;
const isStep2Completed = computed(() => flowState.value.step2.status === 'completed');
const toast = useToast();

const persistStep3Status = async (status: SuicStepStatus, message?: string | null) => {
  const normalizedMessage = message ?? null;

  if (
    lastPersistedStep3Status === status &&
    flowState.value.step3.message === normalizedMessage
  ) {
    return;
  }

  try {
    const updatedState = await updateSuicFlowState(props.suicId, {
      step3: { status, message: normalizedMessage }
    });
    flowState.value = updatedState;
    lastPersistedStep3Status = updatedState.step3.status;
  } catch (error) {
    console.error('❌ Error actualizando estado del paso 3 en SUIC:', error);
  }
};

// Composable para monitorear estado del RPA
const {
  status: rpaStatus,
  statusData,
  startPolling,
  stopPolling,
  checkRpaStatus,
} = useRpaStatus(props.suicId, false);

// RPA Restriction
const { 
  isRestricted, 
  getActiveWindow, 
  checkRestrictionStatus,
  loading: loadingRestriction 
} = useRpaRestriction();
const showRpaSchedulesModal = ref(false);

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

watch(
  () => rpaProcessingStatus.value,
  async (status) => {
    if (!status) {
      return;
    }

    if (status === 'processing') {
      await persistStep3Status('processing', 'Procesando SUIC con RPA');
    } else if (status === 'completed') {
      await persistStep3Status('completed', 'Proceso RPA finalizado');
    } else if (status === 'error') {
      await persistStep3Status('error', 'Error en procesamiento RPA');
    }
  }
);

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
    case 'running': return 'Guardando...';
    case 'success': return 'Completado';
    case 'error': return 'Reintentar';
    default: return 'Guardar SUIC';
  }
};

const getCsvButtonClass = () => {
  switch (csvState.value) {
    case 'running':
      return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white cursor-wait shadow-lg shadow-cyan-500/50';
    case 'success':
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed shadow-lg shadow-green-500/50';
    case 'error':
      return 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 cursor-pointer shadow-lg shadow-red-500/50';
    default:
      return 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white cursor-pointer shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60';
  }
};

const getCsvIconClass = () => {
  switch (csvState.value) {
    case 'running': return 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50';
    case 'success': return 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50';
    case 'error': return 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50';
    default: return 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50';
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
      return 'border-cyan-400 dark:border-cyan-500 border-2 shadow-lg shadow-cyan-500/10';
  }
};

// Generar CSVs por sociedad
const generarCsvsPorSociedad = async () => {
  if (!props.suicId) {
    toast.add({
      title: 'Error',
      description: 'Falta el ID del SUIC',
      color: 'red'
    });
    return;
  }

  if (!isStep2Completed.value) {
    toast.add({
      title: 'Paso pendiente',
      description: 'Genera la SUIC en el paso anterior antes de guardar.',
      color: 'yellow'
    });
    return;
  }

  try {
    csvGenerating.value = true;
    csvState.value = 'running';
    csvFiles.value = [];
    await persistStep3Status('processing', 'Generando archivos CSV para RPA');

    toast.add({
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

    // Guardar paths en el modelo SUIC (campo csvFilesPath) y rpaExecutedBy
    try {
      // Obtener el email del usuario actual
      const attributes = await fetchUserAttributes();
      const userEmail = attributes.email;
      
      const csvFilesPathAsString = JSON.stringify(csvFiles.value || []);
      await dataClient.models.SUIC.update({
        id: props.suicId,
        csvFilesPath: csvFilesPathAsString,
        rpaExecutedBy: userEmail
      });
      console.log('💾 csvFilesPath y rpaExecutedBy actualizados en modelo SUIC');
      console.log('👤 Usuario que ejecutó el RPA:', userEmail);
    } catch (e) {
      console.error('❌ Error actualizando csvFilesPath y rpaExecutedBy en SUIC:', e);
    }

    toast.add({
      title: 'CSVs generados exitosamente',
      description: `Se generaron ${result.totalSocieties} archivos CSV`,
      color: 'green'
    });

    console.log(`✅ CSVs generados: ${result.totalSocieties} archivos`);

    // Disparar ejecución del RPA (operación 2) con las URLs generadas
    try {
      // Valores hardcodeados solicitados
      const rpaEndpoint = 'https://roc.myrb.io/s4/api/formData/addQueue/SPWODKMSUKGJHSRG';
      const rpaApiToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9yb2MubXlyYi5pb1wvYXBpXC91c2Vyc1wvYXBpa2V5XC9nZW5lcmF0ZSIsImlhdCI6MTc2MTE1ODczMywiZXhwIjoxODI0MjMwNzMzLCJuYmYiOjE3NjExNTg3MzMsImp0aSI6IngzT3c1WVcyUnhweHgyeUoiLCJzdWIiOjY5MSwicHJ2IjoiODdlMGFmMWVmOWZkMTU4MTJmZGVjOTcxNTNhMTRlMGIwNDc1NDZhYSIsIm5vYyI6bnVsbH0.MVEdHauGwHh_wiFqKFZazseE52iN076FOMoMDew-0UQ';

      const payloadObject = {
        suicId: props.suicId,
        sociedades: (csvFiles.value || []).map((f) => ({
          sociedad: f.sociedad,
          url: f.publicUrl || f.s3Path,
          fileName: f.fileName,
          recordCount: f.recordCount
        }))
      };

      const form = new URLSearchParams();
      form.set('Id_Suic', props.suicId);
      form.set('txt_Datos_Suic', JSON.stringify(payloadObject)); // JSON como texto
      form.set('slc_Id_Operacion', '2'); // 2 = Ejecutar SUIC

      const response = await fetch(rpaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${rpaApiToken}`
        },
        body: form
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`RPA API respondió ${response.status}: ${text}`);
      }

      toast.add({
        title: 'Procesamiento iniciado',
        description: 'La SUIC está siendo procesada. Te notificaremos por email cuando termine.',
        color: 'green'
      });
      console.log('🚀 RPA Operación 2 enviado exitosamente');

      // Actualizar rpaStatus en BD a 'running' inmediatamente
      await dataClient.models.SUIC.update({
        id: props.suicId,
        rpaStatus: 'running'
      });
      console.log('💾 rpaStatus actualizado a "running" en BD');

      // Iniciar monitoreo del proceso RPA
      rpaProcessing.value = true;
      rpaProcessingStatus.value = 'processing';
      
      // Iniciar suscripción si no está activa
      startRpaSubscription();
    } catch (rpaErr) {
      console.error('❌ Error enviando RPA Operación 2:', rpaErr);
      
      // Actualizar rpaStatus a 'error' en BD
      await dataClient.models.SUIC.update({
        id: props.suicId,
        rpaStatus: 'error'
      });
      
      await persistStep3Status('error', 'Error al iniciar RPA');
      
      toast.add({
        title: 'Error al procesar la SUIC',
        description: rpaErr instanceof Error ? rpaErr.message : 'Error desconocido al iniciar el procesamiento',
        color: 'red'
      });
    }

  } catch (err) {
    console.error('❌ Error generando CSVs:', err);
    csvState.value = 'error';
    await persistStep3Status(
      'error',
      err instanceof Error ? err.message : 'Error generando archivos CSV'
    );

    toast.add({
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
    toast.add({
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

    toast.add({
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

    toast.add({
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
    toast.add({
      title: 'Error',
      description: 'Falta el ID del SUIC',
      color: 'red'
    });
    return;
  }

  try {
    isProcessing.value = true;

    toast.add({
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

    toast.add({
      title: 'Proceso completado',
      description: 'Todos los RPAs se ejecutaron exitosamente',
      color: 'green'
    });

  } catch (err) {
    console.error('Error ejecutando todos los RPAs:', err);
    toast.add({
      title: 'Error',
      description: err.message,
      color: 'red'
    });
  } finally {
    isProcessing.value = false;
  }
};

// Función para detener el monitoreo del RPA
const stopRpaMonitoring = () => {
  if (rpaSubscription) {
    console.log('🔕 Cerrando suscripción RPA para ahorrar costos');
    rpaSubscription.unsubscribe();
    rpaSubscription = null;
    // Desregistrar del gestor global
    unregisterSubscription(SUBSCRIPTION_ID);
  }
  if (rpaSubscriptionTimeout) {
    clearTimeout(rpaSubscriptionTimeout);
    rpaSubscriptionTimeout = null;
  }
};

// Función para programar el cierre automático de la suscripción después de inactividad
const scheduleSubscriptionClose = () => {
  // Limpiar timeout anterior si existe
  if (rpaSubscriptionTimeout) {
    clearTimeout(rpaSubscriptionTimeout);
    rpaSubscriptionTimeout = null;
  }

  // Si el proceso está completado, cerrar inmediatamente
  if (rpaProcessingStatus.value === 'completed') {
    console.log('✅ Proceso completado: Cerrando suscripción inmediatamente');
    stopRpaMonitoring();
    
    toast.add({
      title: 'Monitoreo finalizado',
      description: 'El proceso se completó exitosamente. La suscripción se cerró automáticamente.',
      color: 'green',
      timeout: 5000
    });
  } 
  // Si el proceso tiene error, esperar 5 horas para dar tiempo de respuesta
  else if (rpaProcessingStatus.value === 'error') {
    console.log(`⏰ Proceso con error: Programando cierre de suscripción en ${SUBSCRIPTION_TIMEOUT_MS / 1000 / 60 / 60} horas para dar tiempo de respuesta`);
    
    rpaSubscriptionTimeout = setTimeout(() => {
      console.log('⏰ Timeout alcanzado: Cerrando suscripción después de error');
      stopRpaMonitoring();
      
      toast.add({
        title: 'Monitoreo pausado',
        description: 'La suscripción se cerró automáticamente después de 5 horas. Se reabrirá si el estado cambia.',
        color: 'blue',
        timeout: 5000
      });
    }, SUBSCRIPTION_TIMEOUT_MS);
  }
  // Si el proceso está en ejecución, no cerrar (mantener suscripción activa)
};

// Función para iniciar suscripción en tiempo real
const startRpaSubscription = () => {
  // Evitar crear múltiples suscripciones
  if (rpaSubscription) {
    console.log('⚠️ Suscripción RPA ya está activa');
    return;
  }

  try {
    console.log('🔔 Iniciando suscripción en tiempo real para SUIC:', props.suicId);
    
    // Suscripción según la documentación de Amplify Gen 2
    // onUpdate() recibe directamente el objeto del modelo actualizado
    rpaSubscription = dataClient.models.SUIC.onUpdate({
      filter: { id: { eq: props.suicId } }
    }).subscribe({
      next: async (data) => {
        console.log('📨 Actualización recibida del SUIC:', data);
        console.log('📨 Tipo de data:', typeof data);
        console.log('📨 Data completo:', JSON.stringify(data, null, 2));

        flowState.value = parseSuicFlowState((data as any)?.flowState);
        lastPersistedStep3Status = flowState.value.step3.status;
        
        // Según la documentación, data es directamente el objeto del modelo
        // con todas sus propiedades, incluyendo rpaStatus
        const rpaStatusValue = data?.rpaStatus;
        
        console.log('📨 rpaStatusValue:', rpaStatusValue);
        
        // IMPORTANTE: Seguimos escuchando cambios, pero programamos cierre automático para optimizar costos
        if (rpaStatusValue === 'completed' && rpaProcessingStatus.value !== 'completed') {
          console.log('✅ Suscripción: Proceso completado detectado');
          rpaProcessingStatus.value = 'completed';
          rpaProcessing.value = true;
          
          toast.add({
            title: 'SUIC procesada correctamente',
            description: 'La SUIC se procesó exitosamente',
            color: 'green'
          });
          
          // Cerrar suscripción inmediatamente al completar
          scheduleSubscriptionClose();
        } else if (rpaStatusValue === 'error' && rpaProcessingStatus.value !== 'error') {
          console.log('❌ Suscripción: Proceso con error detectado');
          rpaProcessingStatus.value = 'error';
          rpaProcessing.value = true;
          
          toast.add({
            title: 'Error al procesar la SUIC',
            description: 'La SUIC terminó con errores. Por favor, revisa los detalles o contacta al administrador.',
            color: 'red',
            timeout: 8000
          });
          
          // Programar cierre automático después de 5 horas para dar tiempo de respuesta
          scheduleSubscriptionClose();
        } else if (rpaStatusValue === 'running' || rpaStatusValue === 'pending') {
          console.log('🔄 Suscripción: Proceso en ejecución detectado');
          // Cancelar timeout si el proceso vuelve a ejecutarse
          if (rpaSubscriptionTimeout) {
            clearTimeout(rpaSubscriptionTimeout);
            rpaSubscriptionTimeout = null;
            console.log('⏰ Cancelando cierre automático - proceso en ejecución');
          }
          // Mantener estado de procesamiento si aún está corriendo
          if (rpaProcessingStatus.value !== 'processing') {
            rpaProcessingStatus.value = 'processing';
            rpaProcessing.value = true;
          }
        } else {
          console.log('⚠️ Suscripción: rpaStatusValue no reconocido o sin cambio:', rpaStatusValue);
          console.log('⚠️ Suscripción: Estado actual en UI:', rpaProcessingStatus.value);
        }
      },
      error: (error) => {
        console.error('❌ Error en suscripción RPA:', error);
        console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
        toast.add({
          title: 'Error en suscripción',
          description: 'No se pudo conectar al servicio en tiempo real',
          color: 'red'
        });
      }
    });
    
    // Registrar suscripción en el gestor global para limpieza al cerrar sesión
    registerSubscription(SUBSCRIPTION_ID, rpaSubscription, 'EjecutarRPA');
    
    console.log('✅ Suscripción RPA iniciada correctamente');
  } catch (err) {
    console.error('❌ Error iniciando suscripción RPA:', err);
  }
};

// Función para verificar y reconectar suscripción si es necesario
const checkAndReconnectSubscription = async () => {
  // Si hay un proceso en ejecución o estado final, verificar si la suscripción sigue activa
  if (rpaProcessing.value && !rpaSubscription) {
    console.log('🔄 Suscripción perdida detectada, reconectando...');
    
    // Verificar estado actual en BD
    try {
      const { data: suicRecord } = await dataClient.models.SUIC.get({ id: props.suicId });
      
      if (suicRecord) {
        const currentStatus = suicRecord.rpaStatus;
        const normalizedFlowState = parseSuicFlowState(suicRecord.flowState);
        flowState.value = normalizedFlowState;
        lastPersistedStep3Status = normalizedFlowState.step3.status;
        
        // Si el proceso está en ejecución o hay un estado final, reconectar
        if (currentStatus === 'running' || currentStatus === 'pending' || 
            currentStatus === 'completed' || currentStatus === 'error') {
          console.log(`🔄 Estado actual: ${currentStatus}, reconectando suscripción...`);
          startRpaSubscription();
          
          // Actualizar estado en UI
          if (currentStatus === 'completed') {
            rpaProcessingStatus.value = 'completed';
          } else if (currentStatus === 'error') {
            rpaProcessingStatus.value = 'error';
          } else {
            rpaProcessingStatus.value = 'processing';
          }
        }
      }
    } catch (err) {
      console.error('❌ Error verificando estado para reconexión:', err);
    }
  }
};

// Métodos auxiliares para UI de procesamiento del SUIC
const getRpaProcessingStatusText = () => {
  switch (rpaProcessingStatus.value) {
    case 'processing': return 'Procesando...';
    case 'completed': return 'Completado';
    case 'error': return 'Error';
    default: return 'Iniciando...';
  }
};

const getRpaProcessingStatusTextClass = () => {
  switch (rpaProcessingStatus.value) {
    case 'processing': return 'text-cyan-600 dark:text-cyan-400';
    case 'completed': return 'text-green-600 dark:text-green-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
};

const getRpaProcessingIconClass = () => {
  switch (rpaProcessingStatus.value) {
    case 'processing': return 'bg-cyan-500 dark:bg-cyan-600';
    case 'completed': return 'bg-green-500 dark:bg-green-600';
    case 'error': return 'bg-red-500 dark:bg-red-600';
    default: return 'bg-gray-400 dark:bg-gray-500';
  }
};

const getRpaProcessingCardClass = () => {
  switch (rpaProcessingStatus.value) {
    case 'processing': 
      return 'border-cyan-400 dark:border-cyan-600 bg-cyan-50/50 dark:bg-cyan-900/10';
    case 'completed': 
      return 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10';
    case 'error': 
      return 'border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10';
    default: 
      return 'border-gray-300 dark:border-gray-600';
  }
};

// Lifecycle
onMounted(async () => {
  console.log('Componente EjecutarRPA montado para SUIC:', props.suicId);
  
  // Verificar estado inicial del RPA al cargar
  try {
    await checkRpaStatus();
    updateRpaStatesFromStatus();
    
    // Verificar si hay un proceso RPA en ejecución o si ya terminó
    console.log('🔍 Verificando estado inicial del SUIC:', props.suicId);
    const { data: suicRecord } = await dataClient.models.SUIC.get({ id: props.suicId });
    
    if (suicRecord) {
      console.log('🔍 Estado inicial del SUIC:', suicRecord.rpaStatus);
      const normalizedFlowState = parseSuicFlowState(suicRecord.flowState);
      flowState.value = normalizedFlowState;
      lastPersistedStep3Status = normalizedFlowState.step3.status;
      
      if (suicRecord.rpaStatus === 'running' || suicRecord.rpaStatus === 'pending') {
        console.log('🔄 Estado en ejecución detectado, iniciando monitoreo');
        rpaProcessing.value = true;
        rpaProcessingStatus.value = 'processing';
        startRpaSubscription();
      } else if (suicRecord.rpaStatus === 'error') {
        console.log('❌ Estado de error detectado inicialmente');
        rpaProcessing.value = true;
        rpaProcessingStatus.value = 'error';
        toast.add({
          title: 'Error al procesar la SUIC',
          description: 'La SUIC terminó con errores. Por favor, revisa los detalles.',
          color: 'red'
        });
        // Iniciar monitoreo por si el estado cambia
        startRpaSubscription();
        // Programar cierre automático después de 5 horas para dar tiempo de respuesta
        scheduleSubscriptionClose();
      } else if (suicRecord.rpaStatus === 'completed') {
        console.log('✅ Estado completado detectado inicialmente');
        rpaProcessing.value = true;
        rpaProcessingStatus.value = 'completed';
        // Iniciar monitoreo por si el estado cambia
        startRpaSubscription();
        // Cerrar suscripción inmediatamente al completar
        scheduleSubscriptionClose();
      } else {
        console.log('⚠️ Estado desconocido o null:', suicRecord.rpaStatus);
      }
    } else {
      console.log('⚠️ No se encontró registro SUIC');
    }
    
    // Si hay un RPA en ejecución, iniciar polling
    if (statusData.value.status === 'running' || statusData.value.status === 'pending') {
      startPolling();
    }
  } catch (err) {
    console.error('Error verificando estado inicial del RPA:', err);
  }

  // Verificar restricciones de RPA
  console.log('🔒 Verificando restricciones de RPA en EjecutarRPA');
  try {
    const status = await checkRestrictionStatus();
    console.log('📊 Estado de restricción recibido:', status);
    console.log('📊 isRestricted.value:', isRestricted.value);
    console.log('📊 getActiveWindow.value:', getActiveWindow.value);
  } catch (error) {
    console.error('❌ Error verificando restricciones:', error);
  }
});

// Escuchar eventos de verificación de suscripciones (cuando la ventana vuelve a estar visible)
onMounted(() => {
  const handleSubscriptionsCheck = () => {
    console.log('🔍 Verificación de suscripciones solicitada');
    checkAndReconnectSubscription();
  };

  window.addEventListener('subscriptions-check-needed', handleSubscriptionsCheck);

  return () => {
    window.removeEventListener('subscriptions-check-needed', handleSubscriptionsCheck);
  };
});

// Limpiar polling y suscripción al desmontar
onUnmounted(() => {
  stopPolling();
  stopRpaMonitoring();
});
</script>

