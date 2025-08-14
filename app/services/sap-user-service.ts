/**
 * Servicio para gestionar usuarios SAP a través de endpoints de Nuxt
 */

export interface UnlockUserRequest {
  sapUser: string;
  email: string;
}

export interface UnlockUserResponse {
  mensaje: string;
  nombre: string;
  usuario: string;
}

export interface UnlockUserError {
  mensaje: string;
  codigo: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: UnlockUserError;
}

/**
 * Desbloquea un usuario SAP
 */
export async function unlockUser(
  request: UnlockUserRequest
): Promise<ApiResponse<UnlockUserResponse>> {
  try {
    console.log("🚀 ===== SERVICIO: INICIO DESBLOQUEO =====");
    console.log("📋 Datos de entrada:", request);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("🌐 Endpoint objetivo: /api/sap/unlock-user");

    // Log visual en la consola del navegador
    console.group("🔍 SERVICIO SAP - DESBLOQUEO DE USUARIO");
    console.log("📋 Datos de entrada:", request);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("🌐 Endpoint objetivo: /api/sap/unlock-user");
    console.groupEnd();

    const response = await $fetch<ApiResponse<UnlockUserResponse>>(
      "/api/sap/unlock-user",
      {
        method: "POST",
        body: request,
      }
    );

    console.log("📡 ===== RESPUESTA DEL ENDPOINT =====");
    console.log("📊 Respuesta completa:", response);
    console.log("✅ Success:", response.success);
    console.log("📝 Data:", response.data);
    console.log("🚨 Error:", response.error);

    // Log visual de la respuesta
    console.group("📡 RESPUESTA DEL ENDPOINT");
    console.log("📊 Respuesta completa:", response);
    console.log("✅ Success:", response.success);
    console.log("📝 Data:", response.data);
    console.log("🚨 Error:", response.error);
    console.groupEnd();

    if (response.success && response.data) {
      console.log("✅ ===== DESBLOQUEO EXITOSO =====");
      console.log("🎯 Usuario:", response.data.usuario);
      console.log("📝 Mensaje:", response.data.mensaje);
      console.log("👤 Nombre:", response.data.nombre);

      // Log visual de éxito
      console.group("✅ DESBLOQUEO EXITOSO");
      console.log("🎯 Usuario:", response.data.usuario);
      console.log("📝 Mensaje:", response.data.mensaje);
      console.log("👤 Nombre:", response.data.nombre);
      console.groupEnd();

      return {
        success: true,
        data: response.data,
      };
    } else if (response.error) {
      console.log("⚠️ ===== ERROR DEL SERVICIO =====");
      console.log("🚨 Código:", response.error.codigo);
      console.log("💬 Mensaje:", response.error.mensaje);

      // Log visual de error
      console.group("⚠️ ERROR DEL SERVICIO");
      console.log("🚨 Código:", response.error.codigo);
      console.log("💬 Mensaje:", response.error.mensaje);
      console.groupEnd();

      return {
        success: false,
        error: response.error,
      };
    } else {
      console.error("❌ ===== RESPUESTA INVÁLIDA =====");
      console.error("🚨 Respuesta no esperada:", response);

      // Log visual de respuesta inválida
      console.group("❌ RESPUESTA INVÁLIDA");
      console.error("🚨 Respuesta no esperada:", response);
      console.groupEnd();

      throw new Error("Respuesta inválida del servidor");
    }
  } catch (error) {
    console.error("💥 ===== ERROR EN EL SERVICIO =====");

    // Type guard para manejar el error correctamente
    const errorObj = error as Error;

    console.error("🚨 Tipo de error:", errorObj.constructor.name);
    console.error("💬 Mensaje:", errorObj.message);
    console.error("📚 Stack trace:", errorObj.stack);
    console.error("🔍 Error completo:", error);
    console.error("⏰ Timestamp del error:", new Date().toISOString());

    // Log visual de error crítico
    console.group("💥 ERROR CRÍTICO EN EL SERVICIO");
    console.error("🚨 Tipo de error:", errorObj.constructor.name);
    console.error("💬 Mensaje:", errorObj.message);
    console.error("📚 Stack trace:", errorObj.stack);
    console.error("🔍 Error completo:", error);
    console.error("⏰ Timestamp del error:", new Date().toISOString());
    console.groupEnd();

    let errorMessage = "Error interno del servidor";
    let codigo = -1;

    // Type guard para verificar si tiene statusCode
    if (error && typeof error === "object" && "statusCode" in error) {
      const statusError = error as { statusCode: number };

      if (statusError.statusCode === 400) {
        errorMessage = "Datos de entrada inválidos";
        codigo = 400;
        console.log("🔍 Error 400: Datos inválidos");
      } else if (statusError.statusCode === 502) {
        errorMessage = "Error del servidor SAP";
        codigo = 502;
        console.log("🔍 Error 502: Gateway SAP");
      } else if (statusError.statusCode === 503) {
        errorMessage = "Servicio SAP no disponible";
        codigo = 503;
        console.log("🔍 Error 503: Servicio no disponible");
      } else if (statusError.statusCode === 500) {
        errorMessage = "Error interno del servidor";
        codigo = 500;
        console.log("🔍 Error 500: Error interno");
      }
    } else if (errorObj.message) {
      if (errorObj.message.includes("Failed to fetch")) {
        errorMessage = "No se pudo conectar al servidor";
        codigo = 503;
        console.log("🔍 Error de conectividad detectado");
      } else {
        errorMessage = errorObj.message;
        console.log("🔍 Error genérico:", errorObj.message);
      }
    }

    console.log("🏁 ===== FIN DEL SERVICIO CON ERROR =====");
    return {
      success: false,
      error: {
        mensaje: errorMessage,
        codigo,
      },
    };
  }
}

/**
 * Valida que los campos del formulario sean correctos
 */
export function validateUnlockUserRequest(request: UnlockUserRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.sapUser || request.sapUser.trim() === "") {
    errors.push("El usuario SAP es requerido");
  }

  if (!request.email || request.email.trim() === "") {
    errors.push("El email es requerido");
  } else if (!isValidEmail(request.email)) {
    errors.push("El formato del email no es válido");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida el formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
