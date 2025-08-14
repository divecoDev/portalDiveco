import { defineEventHandler, readBody, createError } from "h3";
import { unlockUserSAP } from "~/config/sap-web-service";

// Interfaces para el desbloqueo de usuarios
interface UnlockUserRequest {
  sapUser: string;
  email: string;
}

interface UnlockUserResponse {
  mensaje: string;
  nombre: string;
  usuario: string;
}

interface UnlockUserError {
  mensaje: string;
  codigo: number;
}

interface ProcessLog {
  timestamp: string;
  level: string;
  message: string;
}

// Función helper para agregar logs
function addLog(
  level: string,
  message: string,
  processLogs: ProcessLog[]
): void {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  processLogs.push(log);
  console.log(`${log.timestamp} ${level.toUpperCase()} ${message}`);
}

export default defineEventHandler(async (event) => {
  const processLogs: ProcessLog[] = [];

  try {
    addLog(
      "info",
      "🚀 ===== INICIO ENDPOINT DESBLOQUEO USUARIO =====",
      processLogs
    );

    // Leer el body de la petición
    const body = await readBody(event);
    addLog("info", "📋 Body recibido:", processLogs);
    addLog("info", JSON.stringify(body, null, 2), processLogs);

    // Validar que el body contenga los campos requeridos
    if (!body || typeof body !== "object") {
      addLog("error", "❌ Body inválido o faltante", processLogs);
      throw createError({
        statusCode: 400,
        statusMessage: "Body de la petición inválido",
      });
    }

    const { sapUser, email } = body as UnlockUserRequest;

    // Validar campos requeridos
    if (!sapUser || !email) {
      addLog("error", "❌ Campos requeridos faltantes", processLogs);
      addLog("error", `Usuario SAP: ${sapUser ? "✅" : "❌"}`, processLogs);
      addLog("error", `Email: ${email ? "✅" : "❌"}`, processLogs);
      throw createError({
        statusCode: 400,
        statusMessage: "Usuario SAP y email son requeridos",
      });
    }

    addLog("info", "✅ Validación de campos exitosa", processLogs);
    addLog("info", `👤 Usuario SAP: ${sapUser}`, processLogs);
    addLog("info", `📧 Email: ${email}`, processLogs);

    // Llamar al servicio SAP para desbloquear el usuario
    addLog(
      "info",
      "🌐 Llamando al servicio SAP para desbloqueo de usuario...",
      processLogs
    );

    const sapResponse = await unlockUserSAP(sapUser, email);
    addLog("info", "📡 Respuesta del servicio SAP recibida", processLogs);
    addLog("info", JSON.stringify(sapResponse, null, 2), processLogs);

    // Procesar la respuesta del servicio SAP
    if (sapResponse.success && sapResponse.data) {
      addLog("info", "✅ ===== DESBLOQUEO EXITOSO =====", processLogs);
      addLog("info", `🎯 Usuario: ${sapResponse.data.usuario}`, processLogs);
      addLog("info", `📝 Mensaje: ${sapResponse.data.mensaje}`, processLogs);
      addLog("info", `👤 Nombre: ${sapResponse.data.nombre}`, processLogs);

      // Retornar respuesta exitosa
      return {
        success: true,
        data: {
          mensaje: sapResponse.data.mensaje,
          nombre: sapResponse.data.nombre,
          usuario: sapResponse.data.usuario,
        },
        logs: processLogs,
      };
    } else if (sapResponse.error) {
      addLog("error", "⚠️ ===== ERROR DEL SERVICIO SAP =====", processLogs);
      addLog("error", `🚨 Código: ${sapResponse.error.codigo}`, processLogs);
      addLog("error", `💬 Mensaje: ${sapResponse.error.mensaje}`, processLogs);

      // Retornar error del servicio SAP
      return {
        success: false,
        error: {
          codigo: sapResponse.error.codigo,
          mensaje: sapResponse.error.mensaje,
        },
        logs: processLogs,
      };
    } else {
      addLog("error", "❌ Respuesta inválida del servicio SAP", processLogs);
      throw createError({
        statusCode: 500,
        statusMessage: "Respuesta inválida del servicio SAP",
      });
    }
  } catch (error) {
    addLog("error", "💥 ===== ERROR CRÍTICO EN EL ENDPOINT =====", processLogs);

    if (error && typeof error === "object" && "statusCode" in error) {
      const statusError = error as {
        statusCode: number;
        statusMessage: string;
      };
      addLog(
        "error",
        `🌐 Código de estado: ${statusError.statusCode}`,
        processLogs
      );
      addLog("error", `💬 Mensaje: ${statusError.statusMessage}`, processLogs);

      // Retornar error con el código de estado apropiado
      return {
        success: false,
        error: {
          codigo: statusError.statusCode,
          mensaje: statusError.statusMessage,
        },
        logs: processLogs,
      };
    } else {
      addLog("error", "🚨 Error inesperado:", processLogs);
      addLog(
        "error",
        error instanceof Error ? error.message : String(error),
        processLogs
      );

      // Retornar error genérico
      return {
        success: false,
        error: {
          codigo: 500,
          mensaje: "Error interno del servidor",
        },
        logs: processLogs,
      };
    }
  }
});
