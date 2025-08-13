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
