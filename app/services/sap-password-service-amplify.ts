/**
 * Servicio alternativo para gestionar el reinicio de contraseñas SAP usando AWS Amplify Functions
 * Esta implementación mantiene la misma interfaz que el servicio original para facilitar las pruebas
 */

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

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
 * Reinicia la contraseña de un usuario SAP usando la función de Amplify
 */
export async function resetPasswordAmplify(
  request: ResetPasswordRequest,
): Promise<ApiResponse<ResetPasswordResponse>> {
  console.group("🔑 ===== SERVICIO AMPLIFY DE REINICIO DE CONTRASEÑA =====");
  console.log("📝 Request recibido:", request);
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("🚀 Usando función de Amplify (Lambda)");

  try {
    console.log("📤 Enviando petición a la función de Amplify...");

    // Verificar que generateClient esté disponible
    if (typeof generateClient === "undefined") {
      throw new Error(
        "generateClient no está disponible. Verifica que Amplify esté instalado y configurado.",
      );
    }

    // Generar el cliente de datos de Amplify
    console.log("🔧 Generando cliente de Amplify...");
    const client = generateClient<Schema>();
    console.log("✅ Cliente de Amplify generado:", client);
    console.log("🔍 Verificando disponibilidad de ResetPassword...");
    console.log("📋 Cliente completo:", Object.keys(client));
    console.log("📋 Modelos disponibles:", Object.keys(client.models || {}));

    if (!client.models) {
      throw new Error("El cliente de Amplify no tiene modelos disponibles");
    }

    if (!client.models.ResetPassword) {
      throw new Error(
        "La función ResetPassword no está disponible en el cliente de Amplify. Verifica que esté desplegada.",
      );
    }

    // Llamar a la función de Amplify
    console.log("🚀 Llamando a la función ResetPassword.mutate...");
    const response = await client.models.ResetPassword.mutate({
      sapUser: request.sapUser,
      email: request.email,
    });

    console.log("📡 Respuesta recibida de Amplify:", response);
    console.log("📊 Tipo de respuesta:", typeof response);

    // Parsear la respuesta JSON que viene como string desde la Lambda
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      console.log("✅ Respuesta parseada exitosamente:", parsedResponse);
    } catch (parseError) {
      console.error("❌ Error parseando respuesta JSON:", parseError);
      throw new Error(
        "Error al procesar la respuesta de la función de Amplify",
      );
    }

    if (
      parsedResponse.success &&
      "data" in parsedResponse &&
      parsedResponse.data
    ) {
      console.log("🎉 ===== REINICIO EXITOSO (AMPLIFY) =====");
      console.log("📝 Mensaje:", parsedResponse.data.mensaje);
      console.log("👤 Usuario:", parsedResponse.data.usuario);
      console.log("📧 Email enviado:", parsedResponse.data.emailEnviado);

      if ("attempts" in parsedResponse && parsedResponse.attempts) {
        console.log("🔄 Intentos realizados:", parsedResponse.attempts);
        if (parsedResponse.attempts > 1) {
          console.log(
            "⚠️ Se requirieron reintentos para completar la operación",
          );
        }
      }

      console.groupEnd();
      return parsedResponse;
    } else if ("error" in parsedResponse && parsedResponse.error) {
      console.log("❌ ===== ERROR DEL SERVICIO (AMPLIFY) =====");
      console.log("🚨 Código de error:", parsedResponse.error.codigo);
      console.log("💬 Mensaje de error:", parsedResponse.error.mensaje);

      if ("attempts" in parsedResponse && parsedResponse.attempts) {
        console.log("🔄 Intentos realizados:", parsedResponse.attempts);
      }

      if ("exhausted" in parsedResponse && parsedResponse.exhausted) {
        console.log("💥 Se agotaron todos los reintentos");
      }

      console.groupEnd();
      return parsedResponse;
    } else {
      console.error(
        "❌ Respuesta inválida de la función de Amplify:",
        parsedResponse,
      );
      console.groupEnd();
      throw new Error("Respuesta inválida de la función de Amplify");
    }
  } catch (error) {
    console.error("💥 ===== ERROR CRÍTICO (AMPLIFY) =====");

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

/**
 * Función helper para comparar respuestas entre ambas implementaciones
 */
export function compareResponses(
  nuxtResponse: ApiResponse<ResetPasswordResponse>,
  amplifyResponse: ApiResponse<ResetPasswordResponse>,
): {
  successMatch: boolean;
  dataMatch: boolean;
  errorMatch: boolean;
  attemptsMatch: boolean;
  differences: string[];
} {
  const differences: string[] = [];

  // Comparar éxito
  const successMatch = nuxtResponse.success === amplifyResponse.success;
  if (!successMatch) {
    differences.push(
      `Success no coincide: Nuxt=${nuxtResponse.success}, Amplify=${amplifyResponse.success}`,
    );
  }

  // Comparar datos si ambos son exitosos
  let dataMatch = true;
  if (nuxtResponse.success && amplifyResponse.success) {
    if (nuxtResponse.data && amplifyResponse.data) {
      dataMatch =
        nuxtResponse.data.mensaje === amplifyResponse.data.mensaje &&
        nuxtResponse.data.nombre === amplifyResponse.data.nombre &&
        nuxtResponse.data.usuario === amplifyResponse.data.usuario &&
        nuxtResponse.data.emailEnviado === amplifyResponse.data.emailEnviado;

      if (!dataMatch) {
        differences.push("Los datos de respuesta no coinciden");
      }
    } else {
      dataMatch = false;
      differences.push("Uno de los dos no tiene datos");
    }
  }

  // Comparar errores si ambos fallaron
  let errorMatch = true;
  if (!nuxtResponse.success && !amplifyResponse.success) {
    if (nuxtResponse.error && amplifyResponse.error) {
      errorMatch =
        nuxtResponse.error.codigo === amplifyResponse.error.codigo &&
        nuxtResponse.error.mensaje === amplifyResponse.error.mensaje;

      if (!errorMatch) {
        differences.push("Los errores no coinciden");
      }
    } else {
      errorMatch = false;
      differences.push("Uno de los dos no tiene error");
    }
  }

  // Comparar intentos
  const attemptsMatch = nuxtResponse.attempts === amplifyResponse.attempts;
  if (!attemptsMatch) {
    differences.push(
      `Intentos no coinciden: Nuxt=${nuxtResponse.attempts}, Amplify=${amplifyResponse.attempts}`,
    );
  }

  return {
    successMatch,
    dataMatch,
    errorMatch,
    attemptsMatch,
    differences,
  };
}
