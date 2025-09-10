// Configuración del Web Service SAP
export const SAP_WEB_SERVICE_CONFIG = {
  // URL del web service
  url: "http://QASAP.diveco.intranet:8000/sap/bc/srt/rfc/sap/zsdsrv_webservice_srvusrsap/410/zws_srvusrsap/zbn_srvusrsap",

  // Credenciales de autenticación
  credentials: {
    username: "JOB_USER",
    password: "Sapdiv+2024",
  },

  // Headers por defecto
  headers: {
    "Content-Type": "text/xml;charset=UTF-8",
  },

  // Acciones disponibles
  actions: {
    UNLOCK_USER: "D", // Desbloqueo de usuario
    RESET_PASSWORD: "R", // Reinicio de contraseña (para futuras implementaciones)
  },
} as const;

// Tipos para las respuestas del web service
export interface SAPWebServiceResponse {
  mensaje: string;
  nombre: string;
  codigo: number;
  success: boolean;
  responseType: "success" | "error" | "warning";
}

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

// Función para desbloquear usuario SAP
export async function unlockUserSAP(
  sapUser: string,
  email: string
): Promise<{
  success: boolean;
  data?: UnlockUserResponse;
  error?: UnlockUserError;
}> {
  try {
    // Importar el cliente SAP dinámicamente para evitar dependencias circulares
    const { getSAPWebServiceClient } = await import(
      "~/utils/sap-web-service-client"
    );
    const sapClient = getSAPWebServiceClient();

    // Generar el body SOAP para desbloquear usuario
    const soapBody = sapClient.generateUnlockUserSOAPBody(sapUser, email);
    // Llamar al web service SAP real
    const sapResponse = await sapClient.callSOAPService(soapBody); // Procesar la respuesta basada en el código
    if (sapResponse.success && sapResponse.codigo === 0) {
      return {
        success: true,
        data: {
          mensaje: sapResponse.mensaje || "Usuario desbloqueado exitosamente",
          nombre: sapResponse.nombre || "Usuario SAP",
          usuario: sapUser,
        },
      };
    } else {
      // Código 1: Usuario inexistente, otros códigos: errores del sistema
      console.error(
        `❌ Error SAP - Código: ${sapResponse.codigo}, Mensaje: ${sapResponse.mensaje}`
      );
      return {
        success: false,
        error: {
          codigo: sapResponse.codigo,
          mensaje: sapResponse.mensaje || "Error en el servicio SAP",
        },
      };
    }
  } catch (error) {
    console.error("💥 Error en el web service SAP:", error);
    return {
      success: false,
      error: {
        codigo: -1,
        mensaje: "Error de conexión con el servicio SAP",
      },
    };
  }
}

// Función para reiniciar contraseña SAP
export async function resetPasswordSAP(
  sapUser: string,
  email: string
): Promise<{
  success: boolean;
  data?: ResetPasswordResponse;
  error?: ResetPasswordError;
}> {
  try {
    console.log("🚀 ===== SAP WEB SERVICE: REINICIO CONTRASEÑA =====");
    console.log("👤 Usuario:", sapUser);
    console.log("📧 Email:", email);

    // Importar el cliente SAP dinámicamente para evitar dependencias circulares
    const { getSAPWebServiceClient } = await import(
      "~/utils/sap-web-service-client"
    );
    const sapClient = getSAPWebServiceClient();

    // Generar el body SOAP para reiniciar contraseña
    const soapBody = sapClient.generateResetPasswordSOAPBody(sapUser, email);
    console.log("📦 Body SOAP generado:", soapBody.substring(0, 200) + "...");

    // Llamar al web service SAP real
    console.log("🌐 Llamando al web service SAP...");
    const sapResponse = await sapClient.callSOAPService(soapBody);

    console.log("📡 Respuesta del web service SAP:", {
      codigo: sapResponse.codigo,
      mensaje: sapResponse.mensaje,
      nombre: sapResponse.nombre,
      success: sapResponse.success,
      responseType: sapResponse.responseType,
    });

    // Procesar la respuesta basada en el código
    if (sapResponse.success && sapResponse.codigo === 0) {
      console.log("✅ Contraseña reiniciada exitosamente en SAP");
      return {
        success: true,
        data: {
          mensaje:
            sapResponse.mensaje ||
            "Contraseña reiniciada exitosamente. Se ha enviado un email con la nueva contraseña.",
          nombre: sapResponse.nombre || "Usuario SAP",
          usuario: sapUser,
          emailEnviado: email,
        },
      };
    } else {
      // Código 1: Usuario inexistente, otros códigos: errores del sistema
      console.log(
        `❌ Error SAP - Código: ${sapResponse.codigo}, Mensaje: ${sapResponse.mensaje}`
      );
      return {
        success: false,
        error: {
          codigo: sapResponse.codigo,
          mensaje: sapResponse.mensaje || "Error en el servicio SAP",
        },
      };
    }
  } catch (error) {
    console.error("💥 Error en el web service SAP:", error);
    return {
      success: false,
      error: {
        codigo: -1,
        mensaje: "Error de conexión con el servicio SAP",
      },
    };
  }
}
