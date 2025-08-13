import { SAP_WEB_SERVICE_CONFIG } from "~/config/sap-web-service";

export default defineEventHandler(async (event) => {
  try {
    // Obtener el body de la petición
    const body = await readBody(event);
    const { sapUser, email } = body;

    // Validar campos requeridos
    if (!sapUser || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          message: "Usuario SAP y email son requeridos",
        },
      });
    }

    console.log("🚀 Procesando desbloqueo de usuario:", { sapUser, email });

    // Generar el body SOAP
    const soapBody = generateUnlockUserSOAPBody(sapUser, email);

    // Crear credenciales para Basic Auth
    const credentials = btoa(
      `${SAP_WEB_SERVICE_CONFIG.credentials.username}:${SAP_WEB_SERVICE_CONFIG.credentials.password}`
    );

    console.log("📤 Enviando petición SOAP a SAP...");
    console.log("📍 URL:", SAP_WEB_SERVICE_CONFIG.url);

    // Realizar la llamada al web service SAP
    const response = await $fetch(SAP_WEB_SERVICE_CONFIG.url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        Authorization: `Basic ${credentials}`,
      },
      body: soapBody,
    });

    console.log("✅ Respuesta recibida de SAP");

    // Parsear la respuesta SOAP
    const parsedResponse = parseSOAPResponse(response);

    if (parsedResponse.success) {
      console.log("✅ Usuario desbloqueado exitosamente:", parsedResponse);
      return {
        success: true,
        data: {
          mensaje: parsedResponse.mensaje,
          nombre: parsedResponse.nombre,
          usuario: sapUser,
        },
      };
    } else {
      console.log("⚠️ Error del servicio SAP:", parsedResponse);
      return {
        success: false,
        error: {
          mensaje: parsedResponse.mensaje || "Error en el servicio SAP",
          codigo: parsedResponse.codigo,
        },
      };
    }
  } catch (error) {
    console.error("💥 Error en el endpoint de desbloqueo:", error);

    // Si es un error de validación, devolver 400
    if (error.statusCode === 400) {
      throw error;
    }

    // Si es un error de red o del servidor SAP
    let errorMessage = "Error interno del servidor";
    let statusCode = 500;

    if (error.message) {
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "No se pudo conectar al servicio SAP";
        statusCode = 503; // Service Unavailable
      } else if (error.message.includes("HTTP error")) {
        errorMessage = `Error del servidor SAP: ${error.message}`;
        statusCode = 502; // Bad Gateway
      }
    }

    throw createError({
      statusCode,
      statusMessage: errorMessage,
      data: {
        message: errorMessage,
        originalError: error.message,
      },
    });
  }
});

/**
 * Genera el body SOAP para desbloquear un usuario
 */
function generateUnlockUserSOAPBody(sapUser: string, email: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZGLFU_WS_SRVUSERSAP>
      <PC_ACCION>${SAP_WEB_SERVICE_CONFIG.actions.UNLOCK_USER}</PC_ACCION>
      <PC_EMAIL>${email}</PC_EMAIL>
      <PC_USER>${sapUser}</PC_USER>
    </urn:ZGLFU_WS_SRVUSERSAP>
  </soapenv:Body>
</soapenv:Envelope>`;
}

/**
 * Parsea la respuesta SOAP del web service
 */
function parseSOAPResponse(xmlString: string): {
  mensaje: string;
  nombre: string;
  codigo: number;
  success: boolean;
} {
  try {
    // En el servidor, usar una librería XML o regex simple
    // Por simplicidad, usaremos regex para extraer la información

    const mensajeMatch = xmlString.match(/<PC_MENSAJE>(.*?)<\/PC_MENSAJE>/);
    const nombreMatch = xmlString.match(/<PC_NOMBRE>(.*?)<\/PC_NOMBRE>/);
    const codigoMatch = xmlString.match(/<PN_CODIGO>(.*?)<\/PN_CODIGO>/);

    const mensaje = mensajeMatch ? mensajeMatch[1] : "";
    const nombre = nombreMatch ? nombreMatch[1] : "";
    const codigo = codigoMatch ? parseInt(codigoMatch[1]) : -1;

    return {
      mensaje,
      nombre,
      codigo,
      success: codigo === 0,
    };
  } catch (error) {
    console.error("Error parsing SOAP response:", error);
    return {
      mensaje: "Error al procesar la respuesta del servidor",
      nombre: "",
      codigo: -1,
      success: false,
    };
  }
}
