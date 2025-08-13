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
    console.log("🚀 Iniciando desbloqueo de usuario:", request);

    const response = await $fetch<ApiResponse<UnlockUserResponse>>(
      "/api/sap/unlock-user",
      {
        method: "POST",
        body: request,
      }
    );

    console.log("📡 Respuesta del endpoint:", response);

    if (response.success && response.data) {
      console.log("✅ Usuario desbloqueado exitosamente:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } else if (response.error) {
      console.log("⚠️ Error del servicio:", response.error);
      return {
        success: false,
        error: response.error,
      };
    } else {
      throw new Error("Respuesta inválida del servidor");
    }
  } catch (error) {
    console.error("💥 Error en el servicio de desbloqueo:", error);

    let errorMessage = "Error interno del servidor";
    let codigo = -1;

    if (error.statusCode === 400) {
      errorMessage = "Datos de entrada inválidos";
      codigo = 400;
    } else if (error.statusCode === 502) {
      errorMessage = "Error del servidor SAP";
      codigo = 502;
    } else if (error.statusCode === 503) {
      errorMessage = "Servicio SAP no disponible";
      codigo = 503;
    } else if (error.statusCode === 500) {
      errorMessage = "Error interno del servidor";
      codigo = 500;
    }

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
