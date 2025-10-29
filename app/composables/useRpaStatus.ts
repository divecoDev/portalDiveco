/**
 * Composable para monitorear el estado de ejecución de RPAs mediante polling
 */

import { ref, onUnmounted, watch } from "vue";
import { getRpaStatus } from "~/services/rpa-service";

export type RpaStatus = "pending" | "running" | "completed" | "error" | null;

interface RpaStatusData {
  executionId: string | null;
  status: RpaStatus;
  type: string | null;
  lastUpdate: string | null;
}

const POLLING_INTERVAL = 17000; // 17 segundos (entre 15-20)
const MAX_POLLING_TIME = 30 * 60 * 1000; // 30 minutos máximo

/**
 * Composable para monitorear el estado de un RPA mediante polling
 * @param suicId ID del registro SUIC
 * @param autoStart Si debe iniciar polling automáticamente
 */
export function useRpaStatus(suicId: string, autoStart: boolean = false) {
  const status = ref<RpaStatus>(null);
  const statusData = ref<RpaStatusData>({
    executionId: null,
    status: null,
    type: null,
    lastUpdate: null,
  });

  const pollingInterval = ref<NodeJS.Timeout | null>(null);
  const isPolling = ref(false);
  const pollingStartTime = ref<number | null>(null);

  // Estados finales que detienen el polling
  const finalStates: RpaStatus[] = ["completed", "error"];

  /**
   * Consulta el estado actual del RPA desde la base de datos
   */
  const checkRpaStatus = async () => {
    try {
      const currentStatus = await getRpaStatus(suicId);

      if (!currentStatus) {
        console.log("📊 No hay estado de RPA para SUIC:", suicId);
        return;
      }

      // Actualizar estado reactivo
      status.value = currentStatus.status as RpaStatus;
      statusData.value = {
        executionId: currentStatus.executionId || null,
        status: currentStatus.status as RpaStatus,
        type: currentStatus.type || null,
        lastUpdate: currentStatus.lastUpdate || null,
      };

      console.log(`📊 Estado RPA actualizado:`, {
        executionId: currentStatus.executionId,
        status: currentStatus.status,
        type: currentStatus.type,
      });

      // Si el estado es final, detener polling
      if (finalStates.includes(status.value)) {
        console.log("🛑 Estado final alcanzado, deteniendo polling");
        stopPolling();
      }

      return currentStatus;
    } catch (error) {
      console.error("❌ Error consultando estado del RPA:", error);
      return null;
    }
  };

  /**
   * Inicia el polling del estado del RPA
   */
  const startPolling = () => {
    if (pollingInterval.value) {
      console.log("⚠️ Polling ya está activo");
      return;
    }

    if (!suicId) {
      console.warn("⚠️ No se puede iniciar polling sin suicId");
      return;
    }

    isPolling.value = true;
    pollingStartTime.value = Date.now();

    console.log(`🔄 Iniciando polling para SUIC: ${suicId}`);

    // Consultar estado inicial inmediatamente
    checkRpaStatus();

    // Configurar interval para polling periódico
    pollingInterval.value = setInterval(async () => {
      try {
        // Verificar timeout
        if (
          pollingStartTime.value &&
          Date.now() - pollingStartTime.value > MAX_POLLING_TIME
        ) {
          console.warn("⏰ Timeout del polling alcanzado");
          stopPolling();
          return;
        }

        // Verificar si el polling fue detenido
        if (!pollingInterval.value) {
          return;
        }

        await checkRpaStatus();
      } catch (error) {
        console.error("❌ Error en polling:", error);
        // Continuar intentando, no detener el polling
      }
    }, POLLING_INTERVAL);

    console.log(`⏰ Polling configurado cada ${POLLING_INTERVAL / 1000} segundos`);
  };

  /**
   * Detiene el polling
   */
  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
      isPolling.value = false;
      pollingStartTime.value = null;
      console.log("⏹️ Polling detenido");
    }
  };

  /**
   * Reinicia el polling (detiene y vuelve a iniciar)
   */
  const restartPolling = () => {
    stopPolling();
    startPolling();
  };

  // Iniciar polling automáticamente si se solicita
  if (autoStart && suicId) {
    startPolling();
  }

  // Limpiar interval al desmontar
  onUnmounted(() => {
    stopPolling();
  });

  // Watch para iniciar polling cuando cambie el suicId
  watch(
    () => suicId,
    (newSuicId) => {
      if (newSuicId && autoStart && !isPolling.value) {
        startPolling();
      }
    },
  );

  return {
    status,
    statusData,
    isPolling,
    startPolling,
    stopPolling,
    restartPolling,
    checkRpaStatus,
  };
}

