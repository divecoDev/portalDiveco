/**
 * Composable para verificar restricciones de RPA
 * Verifica directamente en la tabla RpaExecutionWindow si hay ventanas activas
 * en el horario actual
 */

import { ref, computed } from "vue";
import { generateClient } from "aws-amplify/data";
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

/**
 * Obtiene el día de la semana actual en formato Amplify
 */
function getCurrentDayOfWeek(): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[new Date().getDay()];
}

/**
 * Convierte hora HH:MM a minutos desde medianoche
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Obtiene la hora actual en una zona horaria específica
 */
function getCurrentTimeInTimezone(timezone: string): { hour: number; minute: number; dayOfWeek: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "long",
  });

  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "";

  const weekdayMap: Record<string, string> = {
    Sunday: "SUNDAY",
    Monday: "MONDAY",
    Tuesday: "TUESDAY",
    Wednesday: "WEDNESDAY",
    Thursday: "THURSDAY",
    Friday: "FRIDAY",
    Saturday: "SATURDAY",
  };

  return {
    hour,
    minute,
    dayOfWeek: weekdayMap[weekday] || getCurrentDayOfWeek(),
  };
}

/**
 * Verifica si la hora actual está dentro del rango de una ventana
 */
function isTimeInRange(
  currentHour: number,
  currentMinute: number,
  startTime: string,
  endTime: string
): boolean {
  const currentMinutes = currentHour * 60 + currentMinute;
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Si la hora de fin es menor que la de inicio, significa que cruza medianoche
  if (endMinutes < startMinutes) {
    // Rango que cruza medianoche: ej. 22:00 - 06:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Rango normal: ej. 09:00 - 17:00
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

export const useRpaRestriction = () => {
  const client = generateClient<Schema>();

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
   * Consulta directamente RpaExecutionWindow y verifica horarios en el cliente
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
      console.log("🔒 Consultando ventanas de ejecución RPA activas");

      // Consultar todas las ventanas activas directamente
      const { data: windows, errors } = await client.models.RpaExecutionWindow.list({
        filter: {
          isActive: {
            eq: true,
          },
        },
      });

      if (errors && errors.length > 0) {
        throw new Error(`Error consultando ventanas: ${errors.map((e) => e.message).join(", ")}`);
      }

      if (!windows || windows.length === 0) {
        console.log("✅ No hay ventanas activas configuradas");
        const status: RestrictionStatus = {
          isRestricted: false,
          message: "No hay restricciones activas",
        };
        
        cachedStatus = status;
        cacheTimestamp = Date.now();
        restrictionStatus.value = status;
        return status;
      }

      console.log(`📋 Encontradas ${windows.length} ventanas activas`);

      // Verificar cada ventana para ver si alguna está activa en este momento
      for (const window of windows) {
        if (!window.startTime || !window.endTime || !window.timezone || !window.daysOfWeek) {
          console.warn("⚠️ Ventana con datos incompletos:", window.id);
          continue;
        }

        // Obtener hora actual en la zona horaria de la ventana
        const currentTime = getCurrentTimeInTimezone(window.timezone);
        console.log(
          `🕐 Hora actual en ${window.timezone}: ${currentTime.hour}:${currentTime.minute
            .toString()
            .padStart(2, "0")} (${currentTime.dayOfWeek})`
        );

        // Verificar si el día actual está en los días de la semana configurados
        if (!window.daysOfWeek.includes(currentTime.dayOfWeek)) {
          console.log(`⏭️ Ventana "${window.name}" no aplica para ${currentTime.dayOfWeek}`);
          continue;
        }

        // Verificar si la hora actual está dentro del rango
        const isInRange = isTimeInRange(
          currentTime.hour,
          currentTime.minute,
          window.startTime,
          window.endTime
        );

        if (isInRange) {
          console.log(`🚫 Ventana activa encontrada: "${window.name}" (${window.startTime} - ${window.endTime})`);
          
          const status: RestrictionStatus = {
            isRestricted: true,
            activeWindow: {
              id: window.id,
              name: window.name,
              description: window.description || undefined,
              startTime: window.startTime,
              endTime: window.endTime,
              timezone: window.timezone,
            },
            endTime: window.endTime,
            message: `Sistema restringido por: ${window.name} (${window.startTime} - ${window.endTime} ${window.timezone})`,
          };

          cachedStatus = status;
          cacheTimestamp = Date.now();
          restrictionStatus.value = status;
          return status;
        } else {
          console.log(`✅ Ventana "${window.name}" no está activa en este momento`);
        }
      }

      // No se encontró ninguna ventana activa
      console.log("✅ No hay restricciones activas en este momento");
      const status: RestrictionStatus = {
        isRestricted: false,
        message: "No hay restricciones activas",
      };

      cachedStatus = status;
      cacheTimestamp = Date.now();
      restrictionStatus.value = status;
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

