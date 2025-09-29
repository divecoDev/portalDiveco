import type { Handler } from "aws-lambda";
import * as xml2js from "xml2js";

// Configuración SAP hardcodeada para la función Lambda
const SAP_WEB_SERVICE_CONFIG = {
  url: process.env.SAP_URL || "",
  credentials: {
    username: "JOB_USER",
    password: process.env.SAP_PASSWORD || "",
  },
  actions: {
    RESET_PASSWORD: "R",
    UNLOCK_USER: "D",
  },
};

// Interfaces para las operaciones SAP
interface SapOperationRequest {
  sapUser: string;
  email: string;
  accion?: string;
}

interface SapOperationResponse {
  mensaje: string;
  nombre: string;
  usuario: string;
  emailEnviado: string;
}

interface SapOperationError {
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
  processLogs: ProcessLog[],
): void {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  processLogs.push(log);
  console.log(`${log.timestamp} ${level.toUpperCase()} ${message}`);
}

// Función helper para buscar elementos por nombre sin importar el namespace
function findElementByKey(obj: any, keyName: string): any {
  if (!obj || typeof obj !== "object") return undefined;

  console.log(
    `[SOAP Service] Buscando elemento '${keyName}' en:`,
    Object.keys(obj),
  );

  // Buscar en las claves directas
  for (const key of Object.keys(obj)) {
    // Extraer el nombre sin namespace (después del último ':')
    const cleanKey = key.includes(":") ? key.split(":").pop() : key;
    if (cleanKey === keyName) {
      console.log(
        `[SOAP Service] Elemento '${keyName}' encontrado en clave: '${key}'`,
      );
      return obj[key];
    }
  }

  // Buscar recursivamente en objetos anidados
  for (const key of Object.keys(obj)) {
    if (obj[key] && typeof obj[key] === "object") {
      const result = findElementByKey(obj[key], keyName);
      if (result !== undefined) return result;
    }
  }

  console.log(`[SOAP Service] Elemento '${keyName}' no encontrado`);
  return undefined;
}

// Función para generar el body SOAP de las operaciones SAP
function generateSapOperationSOAPBody(
  sapUser: string,
  email: string,
  accion: string = "R",
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZGLFU_WS_SRVUSERSAP>
      <PC_ACCION>${accion}</PC_ACCION>
      <PC_USER>${sapUser}</PC_USER>
      <PC_EMAIL>${email}</PC_EMAIL>
    </urn:ZGLFU_WS_SRVUSERSAP>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// Función para llamar al web service SAP
async function callSOAPService(soapBody: string): Promise<any> {
  const credentials = Buffer.from(
    `${SAP_WEB_SERVICE_CONFIG.credentials.username}:${SAP_WEB_SERVICE_CONFIG.credentials.password}`,
  ).toString("base64");

  try {
    console.log(
      `[SOAP Service] Iniciando llamada a: ${SAP_WEB_SERVICE_CONFIG.url}`,
    );
    console.log(`[SOAP Service] Headers de la petición:`, {
      "Content-Type": "text/xml; charset=utf-8",
      Authorization: `Basic ${credentials.substring(0, 10)}...`,
      SOAPAction: "urn:sap-com:document:sap:rfc:functions:ZGLFU_WS_SRVUSERSAP",
    });

    const response = await fetch(SAP_WEB_SERVICE_CONFIG.url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        Authorization: `Basic ${credentials}`,
        SOAPAction:
          "urn:sap-com:document:sap:rfc:functions:ZGLFU_WS_SRVUSERSAP",
      },
      body: soapBody,
    });

    console.log(
      `[SOAP Service] Respuesta recibida - Status: ${response.status} ${response.statusText}`,
    );
    console.log(
      `[SOAP Service] Headers de respuesta:`,
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "No se pudo leer el contenido de error");
      console.error(
        `[SOAP Service] Error HTTP ${response.status}: ${response.statusText}`,
      );
      console.error(`[SOAP Service] Contenido del error:`, errorText);
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText} - Content: ${errorText}`,
      );
    }

    const responseText = await response.text();
    console.log(
      `[SOAP Service] Contenido de respuesta (primeros 500 chars):`,
      responseText,
    );
    console.log(
      `[SOAP Service] Longitud total de respuesta: ${responseText.length} caracteres`,
    );

    // Parsear respuesta SOAP básica
    const parser = new xml2js.Parser();
    let xmlDoc;

    try {
      xmlDoc = await parser.parseStringPromise(responseText);
      console.log(
        `[SOAP Service] XML parseado exitosamente:`,
        JSON.stringify(xmlDoc, null, 2),
      );
    } catch (parseError) {
      console.error(`[SOAP Service] Error parseando XML:`, parseError);
      console.error(`[SOAP Service] XML recibido:`, responseText);
      throw new Error(`Error parseando respuesta XML: ${parseError}`);
    }

    // PRIMERO: Buscar la estructura real del web service SAP (n0:ZGLFU_WS_SRVUSERSAPResponse)
    const sapResponseElement = findElementByKey(
      xmlDoc,
      "ZGLFU_WS_SRVUSERSAPResponse",
    );
    if (
      sapResponseElement &&
      Array.isArray(sapResponseElement) &&
      sapResponseElement.length > 0
    ) {
      console.log(`[SOAP Service] Usando parsing para estructura SAP Response`);
      console.log(
        `[SOAP Service] Elemento encontrado:`,
        JSON.stringify(sapResponseElement, null, 2),
      );
      const responseData = sapResponseElement[0];

      const mensaje = responseData.PC_MENSAJE?.[0];
      const nombre = responseData.PC_NOMBRE?.[0];
      const password = responseData.PC_PASS?.[0];
      const codigo = responseData.PN_CODIGO?.[0];

      console.log(`[SOAP Service] Elementos SAP Response parseados:`, {
        mensaje,
        nombre,
        password: password ? "***" : undefined, // No logear la contraseña por seguridad
        codigo,
      });

      // Validar que tenemos los campos mínimos requeridos
      if (codigo !== undefined && mensaje !== undefined) {
        const isSuccess = codigo === "0" || codigo === 0;

        console.log(
          `[SOAP Service] Parsing exitoso - Código: ${codigo}, Éxito: ${isSuccess}`,
        );

        return {
          success: isSuccess,
          codigo: parseInt(codigo || "0"),
          mensaje: mensaje || "Respuesta del servicio SAP",
          nombre: nombre || "Usuario SAP",
          // Incluir información adicional si está disponible
          additionalData: {
            hasPassword: !!password,
            // No incluir la contraseña en la respuesta por seguridad
          },
        };
      } else {
        console.log(
          `[SOAP Service] Campos requeridos faltantes - Código: ${codigo}, Mensaje: ${mensaje}`,
        );
      }
    } else {
      console.log(`[SOAP Service] No se encontró estructura SAP Response`);
    }

    // SEGUNDO: Intentar parsing para elemento 'Return' (estructura estándar)
    const returnElement = findElementByKey(xmlDoc, "Return");
    if (returnElement) {
      console.log(`[SOAP Service] Usando parsing para elemento 'Return'`);
      const type = returnElement.Type?.[0];
      const message = returnElement.Message?.[0];
      const code = returnElement.Code?.[0];

      console.log(`[SOAP Service] Elementos parseados:`, {
        type,
        message,
        code,
      });

      return {
        success: type === "S",
        codigo: parseInt(code || "0"),
        mensaje: message || "Respuesta del servicio SAP",
        nombre: "Usuario SAP",
      };
    }

    // TERCERO: Intentar parsing para estructura RFC
    const rfcElement = findElementByKey(xmlDoc, "ZGLFU_WS_SRVUSRSAP");
    if (rfcElement) {
      console.log(`[SOAP Service] Usando parsing para estructura RFC`);
      const returnCode = rfcElement.RETURN_CODE?.[0];
      const returnMessage = rfcElement.RETURN_MESSAGE?.[0];
      const userName = rfcElement.USER_NAME?.[0];

      console.log(`[SOAP Service] Elementos RFC parseados:`, {
        returnCode,
        returnMessage,
        userName,
      });

      return {
        success: returnCode === "0" || returnCode === "S",
        codigo: parseInt(returnCode || "0"),
        mensaje: returnMessage || "Respuesta del servicio SAP RFC",
        nombre: userName || "Usuario SAP",
      };
    }

    // CUARTO: Intentar parsing genérico para estructura SOAP estándar
    const soapResponseBody = findElementByKey(xmlDoc, "Body");
    if (soapResponseBody) {
      // Buscar cualquier elemento que contenga información de retorno
      const bodyKeys = Object.keys(soapResponseBody);
      console.log(`[SOAP Service] Elementos del body SOAP:`, bodyKeys);

      for (const key of bodyKeys) {
        const element = soapResponseBody[key];
        if (element && typeof element === "object") {
          // Buscar campos de retorno comunes
          const returnCode =
            element.RETURN_CODE?.[0] || element.Code?.[0] || element.CODE?.[0];
          const returnMessage =
            element.RETURN_MESSAGE?.[0] ||
            element.Message?.[0] ||
            element.MESSAGE?.[0];

          if (returnCode !== undefined) {
            console.log(`[SOAP Service] Elemento ${key} parseado:`, {
              returnCode,
              returnMessage,
            });

            return {
              success:
                returnCode === "0" ||
                returnCode === "S" ||
                returnCode === "SUCCESS",
              codigo: parseInt(returnCode || "0"),
              mensaje:
                returnMessage || `Respuesta del servicio SAP desde ${key}`,
              nombre: "Usuario SAP",
            };
          }
        }
      }
    }

    console.log(
      `[SOAP Service] No se pudo procesar la respuesta del servicio SAP`,
    );
    console.log(`[SOAP Service] Estructura XML completa:`, responseText);
    console.log(
      `[SOAP Service] Tipos de parsing intentados: SAP Response, Return, RFC, SOAP genérico`,
    );
    console.log(
      `[SOAP Service] Ningún parsing fue exitoso - usando respuesta por defecto`,
    );

    return {
      success: false,
      codigo: -1,
      mensaje: "No se pudo procesar la respuesta del servicio SAP",
      nombre: "Usuario SAP",
    };
  } catch (error) {
    console.error(`[SOAP Service] Error en callSOAPService:`, error);

    // Log detallado del error
    if (error instanceof Error) {
      console.error(`[SOAP Service] Tipo de error: ${error.constructor.name}`);
      console.error(`[SOAP Service] Mensaje: ${error.message}`);
      console.error(`[SOAP Service] Stack: ${error.stack}`);

      // Si es un error de fetch, agregar información adicional
      if (
        error.message.includes("fetch failed") ||
        error.message.includes("network") ||
        error.message.includes("ECONNREFUSED")
      ) {
        console.error(
          `[SOAP Service] Error de conexión detectado - URL: ${SAP_WEB_SERVICE_CONFIG.url}`,
        );
        console.error(
          `[SOAP Service] Posibles causas: servicio no disponible, timeout, firewall, etc.`,
        );
      }
    } else {
      console.error(`[SOAP Service] Error desconocido:`, error);
    }

    throw error;
  }
}

export const handler: Handler = async (event) => {
  const processLogs: ProcessLog[] = [];
  const MAX_RETRIES = 15;
  const BASE_DELAY = 1000; // 1 segundo base

  try {
    addLog(
      "info",
      "===== INICIO FUNCIÓN LAMBDA OPERACIONES SAP =====",
      processLogs,
    );

    // Extraer argumentos del evento
    const { sapUser, email, accion = "R" } = event.arguments || {};

    // Validar campos requeridos
    if (!sapUser || !email) {
      addLog("error", "Campos requeridos faltantes", processLogs);
      addLog("error", `Usuario SAP: ${sapUser ? "OK" : "FALTA"}`, processLogs);
      addLog("error", `Email: ${email ? "OK" : "FALTA"}`, processLogs);

      return {
        success: false,
        error: {
          codigo: 400,
          mensaje: "Usuario SAP y email son requeridos",
        },
        logs: processLogs,
        attempts: 0,
      };
    }

    // Validar acción
    if (accion && accion !== "R" && accion !== "D") {
      addLog(
        "error",
        `Acción no válida: ${accion}. Solo se permiten 'R' (reset) o 'D' (desbloquear)`,
        processLogs,
      );
      return {
        success: false,
        error: {
          codigo: 400,
          mensaje:
            "Acción no válida. Solo se permiten 'R' (reset) o 'D' (desbloquear)",
        },
        logs: processLogs,
        attempts: 0,
      };
    }

    addLog("info", "Validación de campos exitosa", processLogs);
    addLog("info", `Usuario SAP: ${sapUser}`, processLogs);
    addLog("info", `Email: ${email}`, processLogs);
    addLog(
      "info",
      `Acción: ${accion} (${accion === "R" ? "Reset Password" : "Unlock User"})`,
      processLogs,
    );

    // Generar el body SOAP para la operación SAP
    const operationType =
      accion === "R" ? "reinicio de contraseña" : "desbloqueo de usuario";
    addLog("info", `Generando body SOAP para ${operationType}...`, processLogs);
    const soapBody = generateSapOperationSOAPBody(sapUser, email, accion);
    addLog(
      "info",
      `Body SOAP generado (primeros 200 chars): ${soapBody.substring(0, 200)}...`,
      processLogs,
    );

    // Sistema de reintentos
    let lastError: any = null;
    let attempts = 0;

    for (attempts = 1; attempts <= MAX_RETRIES; attempts++) {
      try {
        addLog("info", `Intento ${attempts}/${MAX_RETRIES}`, processLogs);

        // Llamar al web service SAP
        const sapResponse = await callSOAPService(soapBody);

        addLog("info", "Respuesta del web service SAP recibida", processLogs);
        addLog("info", `Código: ${sapResponse.codigo}`, processLogs);
        addLog("info", `Mensaje: ${sapResponse.mensaje}`, processLogs);
        addLog("info", `Éxito: ${sapResponse.success}`, processLogs);
        addLog("info", `Nombre: ${sapResponse.nombre}`, processLogs);

        // Log adicional para depuración
        if (sapResponse.additionalData) {
          addLog(
            "info",
            `Datos adicionales: ${JSON.stringify(sapResponse.additionalData)}`,
            processLogs,
          );
        }

        // Validación mejorada del éxito - considerar tanto el flag success como el código
        const isSuccessful =
          sapResponse.success &&
          (sapResponse.codigo === 0 || sapResponse.codigo === "0");

        if (isSuccessful) {
          const successMessage =
            accion === "R" ? "REINICIO EXITOSO" : "DESBLOQUEO EXITOSO";
          addLog("info", `===== ${successMessage} =====`, processLogs);
          addLog(
            "info",
            `Código de respuesta: ${sapResponse.codigo}`,
            processLogs,
          );
          addLog(
            "info",
            `Mensaje del servicio: ${sapResponse.mensaje}`,
            processLogs,
          );

          const defaultMessage =
            accion === "R"
              ? "Contraseña reiniciada exitosamente. Se ha enviado un email con la nueva contraseña."
              : "Usuario desbloqueado exitosamente. Se ha enviado un email de confirmación.";

          return JSON.stringify({
            success: true,
            data: {
              mensaje: sapResponse.mensaje || defaultMessage,
              nombre: sapResponse.nombre || "Usuario SAP",
              usuario: sapUser,
              emailEnviado: email,
              accion: accion,
              tipoOperacion: accion === "R" ? "Reset Password" : "Unlock User",
            },
            logs: processLogs,
            attempts: attempts,
            exhausted: false,
          });
        } else {
          // Error del servicio SAP
          addLog(
            "error",
            `Error del servicio SAP - Código: ${sapResponse.codigo}`,
            processLogs,
          );
          addLog(
            "error",
            `Mensaje de error: ${sapResponse.mensaje}`,
            processLogs,
          );
          addLog("error", `Flag success: ${sapResponse.success}`, processLogs);

          return {
            success: false,
            error: {
              codigo: sapResponse.codigo,
              mensaje: sapResponse.mensaje || "Error en el servicio SAP",
            },
            logs: processLogs,
            attempts: attempts,
            exhausted: false,
          };
        }
      } catch (error) {
        lastError = error;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Log detallado del error
        addLog(
          "error",
          `Error en intento ${attempts}: ${errorMessage}`,
          processLogs,
        );

        // Log adicional para errores de conexión
        if (error instanceof Error) {
          console.error(
            `[Lambda Handler] Intento ${attempts} - Tipo de error: ${error.constructor.name}`,
          );
          console.error(
            `[Lambda Handler] Intento ${attempts} - Mensaje completo: ${error.message}`,
          );

          if (
            error.message.includes("fetch failed") ||
            error.message.includes("network") ||
            error.message.includes("ECONNREFUSED")
          ) {
            console.error(
              `[Lambda Handler] Intento ${attempts} - Error de conexión detectado`,
            );
            console.error(
              `[Lambda Handler] Intento ${attempts} - URL objetivo: ${SAP_WEB_SERVICE_CONFIG.url}`,
            );
            console.error(
              `[Lambda Handler] Intento ${attempts} - Posibles causas: servicio SAP no disponible, timeout, firewall, problemas de red`,
            );

            addLog(
              "error",
              `Error de conexión - URL: ${SAP_WEB_SERVICE_CONFIG.url}`,
              processLogs,
            );
          }

          if (error.stack) {
            console.error(
              `[Lambda Handler] Intento ${attempts} - Stack trace:`,
              error.stack,
            );
          }
        }

        if (attempts < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, attempts - 1);
          addLog(
            "info",
            `Esperando ${delay}ms antes del siguiente intento...`,
            processLogs,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Si llegamos aquí, se agotaron todos los reintentos
    addLog(
      "error",
      "===== SE AGOTARON TODOS LOS REINTENTOS =====",
      processLogs,
    );
    addLog("error", `Total de intentos: ${attempts - 1}`, processLogs);
    const lastErrorMessage =
      lastError instanceof Error
        ? lastError.message
        : String(lastError || "Desconocido");
    addLog("error", `Último error: ${lastErrorMessage}`, processLogs);

    return {
      success: false,
      error: {
        codigo: -1,
        mensaje:
          "Error de conexión con el servicio SAP después de múltiples intentos",
      },
      logs: processLogs,
      attempts: attempts - 1,
      exhausted: true,
    };
  } catch (error) {
    addLog("error", "===== ERROR CRÍTICO EN LA FUNCIÓN =====", processLogs);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType =
      error instanceof Error ? error.constructor.name : typeof error;
    const errorStack =
      error instanceof Error ? error.stack || "No disponible" : "No disponible";

    addLog("error", `Tipo: ${errorType}`, processLogs);
    addLog("error", `Mensaje: ${errorMessage}`, processLogs);
    addLog("error", `Stack: ${errorStack}`, processLogs);

    return {
      success: false,
      error: {
        codigo: -1,
        mensaje: `Error crítico: ${errorMessage}`,
      },
      logs: processLogs,
      attempts: 0,
      exhausted: false,
    };
  }
};
