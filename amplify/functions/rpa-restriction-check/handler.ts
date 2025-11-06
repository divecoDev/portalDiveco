import type { Handler } from "aws-lambda";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";

// Cliente de Amplify para acceder a los datos
const client = generateClient<Schema>({
  authMode: "apiKey",
});

interface RestrictionStatusResponse {
  isRestricted: boolean;
  activeWindow?: {
    id: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  endTime?: string; // Hora de fin del bloqueo actual
  message?: string;
}

/**
 * Obtiene el nombre del día de la semana en inglés (formato Amplify)
 */
function getDayOfWeek(date: Date): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[date.getDay()];
}

/**
 * Convierte una hora HH:MM a minutos desde medianoche
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

  // Convertir weekday a formato Amplify
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
    dayOfWeek: weekdayMap[weekday] || getDayOfWeek(now),
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

/**
 * Handler principal que verifica si hay una ventana de restricción activa
 */
export const handler: Handler = async (event: any): Promise<RestrictionStatusResponse> => {
  console.log("🔒 Verificando estado de restricción RPA");
  console.log("📝 Evento recibido:", JSON.stringify(event, null, 2));

  try {
    // Obtener todas las ventanas activas
    const { data: windows, errors } = await client.models.RpaExecutionWindow.list({
      filter: {
        isActive: {
          eq: true,
        },
      },
    });

    if (errors && errors.length > 0) {
      console.error("❌ Error consultando ventanas:", errors);
      throw new Error(`Error consultando ventanas: ${errors.map((e) => e.message).join(", ")}`);
    }

    if (!windows || windows.length === 0) {
      console.log("✅ No hay ventanas activas configuradas");
      return {
        isRestricted: false,
        message: "No hay restricciones activas",
      };
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
      console.log(`🕐 Hora actual en ${window.timezone}: ${currentTime.hour}:${currentTime.minute.toString().padStart(2, "0")} (${currentTime.dayOfWeek})`);

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
        return {
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
      } else {
        console.log(`✅ Ventana "${window.name}" no está activa en este momento`);
      }
    }

    // No se encontró ninguna ventana activa
    console.log("✅ No hay restricciones activas en este momento");
    return {
      isRestricted: false,
      message: "No hay restricciones activas",
    };
  } catch (error: any) {
    console.error("❌ Error verificando restricción:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    // En caso de error, por seguridad retornamos que NO está restringido
    // para evitar bloquear el sistema por errores técnicos
    return {
      isRestricted: false,
      message: `Error verificando restricción: ${errorMessage}`,
    };
  }
};

