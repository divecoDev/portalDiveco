/**
 * Servicio para gestionar la ejecución de RPAs externos
 */

import { generateClient } from "aws-amplify/data";

const client = generateClient();

export type RpaType = "bloqueo-sap" | "carga-plantilla";

export interface ExecuteRpaResponse {
  success: boolean;
  executionId: string;
  message?: string;
  error?: string;
}

/**
 * Genera un UUID único para el executionId
 */
function generateExecutionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Ejecuta un RPA externo
 * @param rpaType Tipo de RPA a ejecutar
 * @param suicId ID del registro SUIC asociado
 * @returns executionId y resultado de la ejecución
 */
export async function executeRPA(
  rpaType: RpaType,
  suicId: string,
): Promise<ExecuteRpaResponse> {
  console.group(`🚀 ===== EJECUTANDO RPA: ${rpaType} =====`);
  console.log("📝 SUIC ID:", suicId);
  console.log("⏰ Timestamp:", new Date().toISOString());

  try {
    // Generar executionId único
    const executionId = generateExecutionId();
    console.log("🆔 Execution ID generado:", executionId);

    // Actualizar el modelo SUIC con el executionId y estado 'pending'
    console.log("💾 Actualizando modelo SUIC...");
    await (client.models as any).SUIC.update({
      id: suicId,
      rpaExecutionId: executionId,
      rpaStatus: "pending",
      rpaType: rpaType,
      rpaLastUpdate: new Date().toISOString(),
    });
    console.log("✅ Modelo SUIC actualizado");

    // Obtener la URL de la API externa del RPA desde runtimeConfig
    const config = useRuntimeConfig();
    const rpaApiUrl = config.public?.rpaApiUrl || config.rpaApiUrl;

    if (!rpaApiUrl) {
      throw new Error("RPA_API_URL no está configurada");
    }

    // Construir callbackUrl del webhook
    // En el cliente, usar window.location.origin, en servidor usar variable de entorno o configuración
    let callbackUrl = "/api/rpa/webhook";
    if (typeof window !== "undefined") {
      callbackUrl = `${window.location.origin}${callbackUrl}`;
    } else {
      // En servidor, usar variable de entorno si está disponible
      const baseUrl = process.env.APP_URL || process.env.NUXT_PUBLIC_APP_URL || "";
      callbackUrl = baseUrl ? `${baseUrl}${callbackUrl}` : callbackUrl;
    }

    // Preparar payload para la API externa
    const payload = {
      executionId,
      suicId,
      type: rpaType,
      callbackUrl,
    };

    console.log("📤 Enviando petición a API externa del RPA...");
    console.log("📍 URL:", `${rpaApiUrl}/execute`);
    console.log("📦 Payload:", payload);

    // Llamar a la API externa del RPA
    const response = await $fetch(`${rpaApiUrl}/execute`, {
      method: "POST",
      body: payload,
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((error) => {
      console.error("❌ Error llamando a API externa:", error);
      // Si falla la llamada, actualizar estado a 'error'
      (client.models as any).SUIC.update({
        id: suicId,
        rpaStatus: "error",
        rpaLastUpdate: new Date().toISOString(),
      });
      throw new Error(
        `Error al ejecutar RPA: ${error.message || "Error desconocido"}`,
      );
    });

    console.log("📡 Respuesta de API externa:", response);

    // Actualizar estado a 'running' después de iniciar exitosamente
    await (client.models as any).SUIC.update({
      id: suicId,
      rpaStatus: "running",
      rpaLastUpdate: new Date().toISOString(),
    });

    console.log("✅ RPA iniciado correctamente");
    console.groupEnd();

    return {
      success: true,
      executionId,
      message: "RPA ejecutándose correctamente",
    };
  } catch (error: any) {
    console.error("❌ Error ejecutando RPA:", error);
    console.groupEnd();

    return {
      success: false,
      executionId: "",
      error: error.message || "Error desconocido al ejecutar RPA",
    };
  }
}

/**
 * Obtiene el estado actual de un RPA desde el modelo SUIC
 * @param suicId ID del registro SUIC
 * @returns Estado actual del RPA o null si no hay ejecución
 */
export async function getRpaStatus(suicId: string) {
  try {
    const { data } = await (client.models as any).SUIC.get({ id: suicId });

    if (!data) {
      return null;
    }

    return {
      executionId: data.rpaExecutionId,
      status: data.rpaStatus,
      type: data.rpaType,
      lastUpdate: data.rpaLastUpdate,
    };
  } catch (error) {
    console.error("❌ Error obteniendo estado del RPA:", error);
    return null;
  }
}

