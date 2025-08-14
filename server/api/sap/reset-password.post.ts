import { defineEventHandler, readBody, createError } from "h3";
import { SAP_WEB_SERVICE_CONFIG } from "~/config/sap-web-service";

// Interfaces para el reinicio de contraseñas
interface ResetPasswordRequest {
  sapUser: string;
  email: string;
}

interface ResetPasswordResponse {
  mensaje: string;
  nombre: string;
  usuario: string;
  emailEnviado: string;
}

interface ResetPasswordError {
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
  const MAX_RETRIES = 5;
  const BASE_DELAY = 1000; // 1 segundo base

  try {
    addLog(
      "info",
      "===== INICIO ENDPOINT REINICIO CONTRASEÑA =====",
      processLogs
    );

    // Leer el body de la petición
    const body = await readBody(event);
    addLog("info", "Body recibido:", processLogs);
    addLog("info", JSON.stringify(body, null, 2), processLogs);

    // Validar que el body contenga los campos requeridos
    if (!body || typeof body !== "object") {
      addLog("error", "Body inválido o faltante", processLogs);
      throw createError({
        statusCode: 400,
        statusMessage: "Body de la petición inválido",
      });
    }

    const { sapUser, email } = body as ResetPasswordRequest;

    // Validar campos requeridos
    if (!sapUser || !email) {
      addLog("error", "Campos requeridos faltantes", processLogs);
      addLog("error", `Usuario SAP: ${sapUser ? "OK" : "FALTA"}`, processLogs);
      addLog("error", `Email: ${email ? "OK" : "FALTA"}`, processLogs);
      throw createError({
        statusCode: 400,
        statusMessage: "Usuario SAP y email son requeridos",
      });
    }

    addLog("info", "Validación de campos exitosa", processLogs);
    addLog("info", `Usuario SAP: ${sapUser}`, processLogs);
    addLog("info", `Email: ${email}`, processLogs);

    // Generar el body SOAP para reinicio de contraseña
    addLog("info", "Generando body SOAP...", processLogs);
    const soapBody = generateResetPasswordSOAPBody(sapUser, email);
    addLog(
      "info",
      `Body SOAP generado (primeros 200 chars): ${soapBody.substring(0, 200)}...`,
      processLogs
    );

    // Crear credenciales para Basic Auth
    const credentials = btoa(
      `${SAP_WEB_SERVICE_CONFIG.credentials.username}:${SAP_WEB_SERVICE_CONFIG.credentials.password}`
    );
    addLog(
      "info",
      `Credenciales generadas (username): ${SAP_WEB_SERVICE_CONFIG.credentials.username}`,
      processLogs
    );

    // Sistema de reintentos
    let lastError: any = null;
    let attempt = 1;

    while (attempt <= MAX_RETRIES) {
      try {
        addLog(
          "info",
          `===== INTENTO ${attempt}/${MAX_RETRIES} =====`,
          processLogs
        );
        addLog("info", "===== ENVIANDO PETICIÓN A SAP =====", processLogs);
        addLog("info", `URL: ${SAP_WEB_SERVICE_CONFIG.url}`, processLogs);
        addLog(
          "info",
          `Acción: ${SAP_WEB_SERVICE_CONFIG.actions.RESET_PASSWORD}`,
          processLogs
        );
        addLog(
          "info",
          `Timestamp de envío: ${new Date().toISOString()}`,
          processLogs
        );

        // Realizar la llamada al web service SAP
        const response = await $fetch(SAP_WEB_SERVICE_CONFIG.url, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml;charset=UTF-8",
            Authorization: `Basic ${credentials}`,
          },
          body: soapBody,
        });

        addLog("info", "===== RESPUESTA RECIBIDA DE SAP =====", processLogs);
        addLog(
          "info",
          `Timestamp de respuesta: ${new Date().toISOString()}`,
          processLogs
        );
        addLog("info", `Tipo de respuesta: ${typeof response}`, processLogs);
        addLog(
          "info",
          `Respuesta (primeros 300 chars): ${String(response).substring(0, 300)}...`,
          processLogs
        );

        // Parsear la respuesta SOAP
        addLog("info", "Parseando respuesta SOAP...", processLogs);
        const responseString = String(response);
        const parsedResponse = parseSOAPResponse(responseString);
        addLog(
          "info",
          `Respuesta parseada: ${JSON.stringify(parsedResponse, null, 2)}`,
          processLogs
        );

        if (parsedResponse.success) {
          addLog("info", "===== REINICIO EXITOSO =====", processLogs);
          addLog("info", `Usuario: ${sapUser}`, processLogs);
          addLog("info", `Mensaje: ${parsedResponse.mensaje}`, processLogs);
          addLog("info", `Nombre: ${parsedResponse.nombre}`, processLogs);
          addLog("info", `Código: ${parsedResponse.codigo}`, processLogs);
          addLog("info", `Intentos realizados: ${attempt}`, processLogs);

          // Retornar respuesta exitosa
          return {
            success: true,
            data: {
              mensaje: parsedResponse.mensaje,
              nombre: parsedResponse.nombre,
              usuario: sapUser,
              emailEnviado: email,
            },
            logs: processLogs,
            attempts: attempt,
          };
        } else {
          addLog("error", "===== ERROR DEL SERVICIO SAP =====", processLogs);
          addLog(
            "error",
            `Código de error: ${parsedResponse.codigo}`,
            processLogs
          );
          addLog(
            "error",
            `Mensaje de error: ${parsedResponse.error?.mensaje || parsedResponse.mensaje}`,
            processLogs
          );

          // Si es un error del servicio SAP (no de conexión), no reintentar
          if (parsedResponse.codigo !== 500) {
            addLog(
              "info",
              "Error del servicio SAP, no se reintentará",
              processLogs
            );
            return {
              success: false,
              error: {
                codigo: parsedResponse.codigo,
                mensaje: parsedResponse.mensaje,
              },
              logs: processLogs,
              attempts: attempt,
            };
          }

          // Si es error 500, continuar con reintentos
          throw new Error("Error interno del servicio SAP (500)");
        }
      } catch (error) {
        lastError = error;

        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, attempt - 1); // Delay exponencial
          addLog(
            "warn",
            `Intento ${attempt} falló, reintentando en ${delay}ms...`,
            processLogs
          );

          let errorMessage = "Error desconocido";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else {
            errorMessage = String(error);
          }

          addLog("warn", `Error: ${errorMessage}`, processLogs);

          // Esperar antes del siguiente intento
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
        } else {
          addLog(
            "error",
            `===== AGOTADOS LOS ${MAX_RETRIES} INTENTOS =====`,
            processLogs
          );

          let errorMessage = "Error desconocido";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else {
            errorMessage = String(error);
          }

          addLog("error", `Último error: ${errorMessage}`, processLogs);
          break;
        }
      }
    }

    // Si llegamos aquí, se agotaron los reintentos
    addLog(
      "error",
      "===== ERROR CRÍTICO DESPUÉS DE REINTENTOS =====",
      processLogs
    );
    addLog(
      "error",
      `Total de intentos realizados: ${MAX_RETRIES}`,
      processLogs
    );

    let lastErrorMessage = "Error desconocido";
    if (lastError instanceof Error) {
      lastErrorMessage = lastError.message;
    } else if (typeof lastError === "string") {
      lastErrorMessage = lastError;
    } else if (
      lastError &&
      typeof lastError === "object" &&
      "message" in lastError
    ) {
      lastErrorMessage = String(lastError.message);
    }
    addLog("error", `Último error: ${lastErrorMessage}`, processLogs);

    // Retornar error después de agotar reintentos
    return {
      success: false,
      error: {
        codigo: 500,
        mensaje: `Servicio en SAP no disponible después de ${MAX_RETRIES} intentos. Por favor, intente más tarde.`,
      },
      logs: processLogs,
      attempts: MAX_RETRIES,
      exhausted: true,
    };
  } catch (error) {
    addLog("error", "===== ERROR CRÍTICO EN EL ENDPOINT =====", processLogs);

    if (error && typeof error === "object" && "statusCode" in error) {
      const statusError = error as {
        statusCode: number;
        statusMessage: string;
      };
      addLog(
        "error",
        `Código de estado: ${statusError.statusCode}`,
        processLogs
      );
      addLog("error", `Mensaje: ${statusError.statusMessage}`, processLogs);

      // Retornar error con el código de estado apropiado
      return {
        success: false,
        error: {
          codigo: statusError.statusCode,
          mensaje: statusError.statusMessage,
        },
        logs: processLogs,
        attempts: 0,
      };
    } else {
      addLog("error", "Error inesperado:", processLogs);

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = String(error);
      }

      addLog("error", errorMessage, processLogs);

      // Retornar error genérico
      return {
        success: false,
        error: {
          codigo: 500,
          mensaje: "Servicio en SAP no disponible por momento",
        },
        logs: processLogs,
        attempts: 0,
      };
    }
  }
});

/**
 * Genera el body SOAP para reiniciar la contraseña
 */
function generateResetPasswordSOAPBody(sapUser: string, email: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZGLFU_WS_SRVUSERSAP>
      <PC_ACCION>R</PC_ACCION>
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
  error?: {
    mensaje: string;
  };
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
      error: codigo !== 0 ? { mensaje } : undefined,
    };
  } catch (error) {
    console.error("Error parsing SOAP response:", error);
    return {
      mensaje: "Error al procesar la respuesta del servidor",
      nombre: "",
      codigo: -1,
      success: false,
      error: { mensaje: "Error interno del servidor" },
    };
  }
}
