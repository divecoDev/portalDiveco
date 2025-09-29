/**
 * Servicio para gestionar el reinicio de contraseñas SAP a través de endpoints de Nuxt
 */

export interface ResetPasswordRequest {
  sapUser: string;
  email: string;
}

export interface ResetPasswordResponse {
  mensaje: string;
  nombre: string;
  usuario: string;
  emailEnviado: string;
}

export interface ResetPasswordError {
  mensaje: string;
  codigo: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ResetPasswordError;
  attempts?: number;
  exhausted?: boolean;
}

/**
 * Reinicia la contraseña de un usuario SAP
 */
export async function resetPassword(
  request: ResetPasswordRequest,
): Promise<ApiResponse<ResetPasswordResponse>> {
  console.group("🔑 ===== SERVICIO DE REINICIO DE CONTRASEÑA =====");
  console.log("📝 Request recibido:", request);
  console.log("⏰ Timestamp:", new Date().toISOString());

  try {
    console.log("📤 Enviando petición al endpoint...");
    console.log("📍 URL: /api/sap/reset-password");

    const response = await $fetch("/api/sap/reset-password", {
      method: "POST",
      body: request,
    });

    console.log("📡 Respuesta recibida:", response);
    console.log("📊 Tipo de respuesta:", typeof response);
    console.log("✅ Success:", response.success);

    if (response.success && "data" in response && response.data) {
      console.log("🎉 ===== REINICIO EXITOSO =====");
      console.log("📝 Mensaje:", response.data.mensaje);
      console.log("👤 Usuario:", response.data.usuario);
      console.log("📧 Email:", response.data.emailEnviado);

      if ("attempts" in response && response.attempts) {
        console.log("🔄 Intentos realizados:", response.attempts);
        if (response.attempts > 1) {
          console.log(
            "⚠️ Se requirieron reintentos para completar la operación",
          );
        }
      }

      console.groupEnd();
      return response;
    } else if ("error" in response && response.error) {
      console.log("❌ ===== ERROR DEL SERVICIO =====");
      console.log("🚨 Código de error:", response.error.codigo);
      console.log("💬 Mensaje de error:", response.error.mensaje);

      if ("attempts" in response && response.attempts) {
        console.log("🔄 Intentos realizados:", response.attempts);
      }

      if ("exhausted" in response && response.exhausted) {
        console.log("💥 Se agotaron todos los reintentos");
      }

      console.groupEnd();
      return response;
    } else {
      console.error("❌ Respuesta inválida del servidor:", response);
      console.groupEnd();
      throw new Error("Respuesta inválida del servidor");
    }
  } catch (error) {
    console.error("💥 ===== ERROR CRÍTICO =====");

    let errorMessage = "Error desconocido";
    let errorStack = "No disponible";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || "No disponible";
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = String(error);
    }

    console.error("🚨 Tipo de error:", error.constructor.name);
    console.error("💬 Mensaje:", errorMessage);
    console.error("📚 Stack trace:", errorStack);
    console.error("🔍 Error completo:", error);
    console.groupEnd();

    // Manejar diferentes tipos de errores
    if (error && typeof error === "object" && "statusCode" in error) {
      const statusError = error as {
        statusCode: number;
        statusMessage: string;
      };

      if (statusError.statusCode === 400) {
        throw new Error(`Error de validación: ${statusError.statusMessage}`);
      } else if (statusError.statusCode === 500) {
        throw new Error(`Error del servidor: ${statusError.statusMessage}`);
      } else {
        throw new Error(
          `Error HTTP ${statusError.statusCode}: ${statusError.statusMessage}`,
        );
      }
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Error inesperado: ${String(error)}`);
    }
  }
}
