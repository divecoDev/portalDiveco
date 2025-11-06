/**
 * Composable para verificar restricciones de RPA
 * Proporciona funciones para consultar el estado de bloqueo del sistema
 * debido a ventanas de ejecución de RPA activas
 */

import { ref, computed } from "vue";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

interface RestrictionStatus {
  isRestricted: boolean;
  activeWindow?: {
    id: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  endTime?: string;
  message?: string;
}

// Cache con TTL de 30 segundos
const CACHE_TTL = 30 * 1000; // 30 segundos en milisegundos
let cachedStatus: RestrictionStatus | null = null;
let cacheTimestamp: number = 0;

export const useRpaRestriction = () => {
  const client = generateClient<Schema>({
    authMode: "apiKey",
  });

  const loading = ref(false);
  const error = ref<string | null>(null);
  const restrictionStatus = ref<RestrictionStatus | null>(null);

  /**
   * Verifica si el cache es válido
   */
  const isCacheValid = (): boolean => {
    if (!cachedStatus || !cacheTimestamp) return false;
    const now = Date.now();
    return now - cacheTimestamp < CACHE_TTL;
  };

  /**
   * Consulta el estado de restricción del sistema
   * Utiliza cache para evitar consultas excesivas
   */
  const checkRestrictionStatus = async (forceRefresh = false): Promise<RestrictionStatus> => {
    // Verificar cache si no se fuerza refresh
    if (!forceRefresh && isCacheValid() && cachedStatus) {
      console.log("📦 Usando cache de restricción");
      restrictionStatus.value = cachedStatus;
      return cachedStatus;
    }

    loading.value = true;
    error.value = null;

    try {
      console.log("🔒 Consultando estado de restricción RPA");

      const response = await client.queries.getSystemRestrictionStatus();

      // La respuesta puede venir en diferentes formatos
      let status: RestrictionStatus;

      if (typeof response.data === "string") {
        status = JSON.parse(response.data);
      } else if (response.data?.getSystemRestrictionStatus) {
        if (typeof response.data.getSystemRestrictionStatus === "string") {
          status = JSON.parse(response.data.getSystemRestrictionStatus);
        } else {
          status = response.data.getSystemRestrictionStatus;
        }
      } else {
        status = response.data as RestrictionStatus;
      }

      // Actualizar cache
      cachedStatus = status;
      cacheTimestamp = Date.now();
      restrictionStatus.value = status;

      console.log("✅ Estado de restricción obtenido:", status);

      return status;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      error.value = errorMessage;
      console.error("❌ Error consultando restricción:", errorMessage);

      // En caso de error, retornar que NO está restringido para evitar bloquear el sistema
      const fallbackStatus: RestrictionStatus = {
        isRestricted: false,
        message: `Error verificando restricción: ${errorMessage}`,
      };

      restrictionStatus.value = fallbackStatus;
      return fallbackStatus;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Retorna un boolean indicando si el sistema está restringido
   */
  const isRestricted = computed(() => {
    return restrictionStatus.value?.isRestricted ?? false;
  });

  /**
   * Retorna la ventana activa si existe
   */
  const getActiveWindow = computed(() => {
    return restrictionStatus.value?.activeWindow ?? null;
  });

  /**
   * Retorna el mensaje de restricción
   */
  const getRestrictionMessage = computed(() => {
    if (!restrictionStatus.value?.isRestricted) return null;

    const window = restrictionStatus.value.activeWindow;
    if (window) {
      return `Esta herramienta está deshabilitada temporalmente (${window.startTime} a ${window.endTime}) debido a la ejecución de procesos críticos (RPA). Intente de nuevo más tarde.`;
    }

    return restrictionStatus.value.message || "El sistema está restringido temporalmente.";
  });

  /**
   * Limpia el cache (útil para forzar una nueva consulta)
   */
  const clearCache = () => {
    cachedStatus = null;
    cacheTimestamp = 0;
    console.log("🗑️ Cache de restricción limpiado");
  };

  /**
   * Inicializa la verificación de restricción
   * Útil para llamar en onMounted
   */
  const initialize = async () => {
    await checkRestrictionStatus();
  };

  return {
    // Estado
    loading,
    error,
    restrictionStatus,

    // Funciones
    checkRestrictionStatus,
    clearCache,
    initialize,

    // Computed
    isRestricted,
    getActiveWindow,
    getRestrictionMessage,
  };
};

