import {
  SAP_WEB_SERVICE_CONFIG,
  type SAPWebServiceResponse,
} from "~/config/sap-web-service";
import { parseString } from "xml2js";

/**
 * Cliente para el Web Service SAP
 */
export class SAPWebServiceClient {
  private static instance: SAPWebServiceClient;
  private credentials: string;

  private constructor() {
    // Crear credenciales para Basic Auth
    this.credentials = btoa(
      `${SAP_WEB_SERVICE_CONFIG.credentials.username}:${SAP_WEB_SERVICE_CONFIG.credentials.password}`
    );
  }

  /**
   * Obtiene la instancia singleton del cliente
   */
  public static getInstance(): SAPWebServiceClient {
    if (!SAPWebServiceClient.instance) {
      SAPWebServiceClient.instance = new SAPWebServiceClient();
    }
    return SAPWebServiceClient.instance;
  }

  /**
   * Realiza una llamada SOAP al web service
   */
  public async callSOAPService(
    soapBody: string
  ): Promise<SAPWebServiceResponse> {
    try {
      console.log("🌐 Iniciando llamada al web service SAP...");
      console.log("📍 URL:", SAP_WEB_SERVICE_CONFIG.url);
      console.log(
        "🔑 Credenciales:",
        `${SAP_WEB_SERVICE_CONFIG.credentials.username}:***`
      );
      console.log("📋 Headers:", {
        ...SAP_WEB_SERVICE_CONFIG.headers,
        Authorization: `Basic ${this.credentials.substring(0, 20)}...`,
      });
      console.log("📦 Body SOAP:", soapBody.substring(0, 200) + "...");

      const response = await fetch(SAP_WEB_SERVICE_CONFIG.url, {
        method: "POST",
        headers: {
          ...SAP_WEB_SERVICE_CONFIG.headers,
          Authorization: `Basic ${this.credentials}`,
        },
        body: soapBody,
      });

      console.log("📡 Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error HTTP:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const responseText = await response.text();
      console.log(
        "✅ Respuesta exitosa:",
        responseText.substring(0, 300) + "..."
      );

      return await this.parseSOAPResponse(responseText);
    } catch (error) {
      console.error("💥 Error en llamada al web service SAP:", error);
      throw error;
    }
  }

  /**
   * Parsea la respuesta SOAP del web service
   */
  private parseSOAPResponse(xmlString: string): Promise<SAPWebServiceResponse> {
    return new Promise((resolve) => {
      try {
        parseString(xmlString, { explicitArray: false }, (err, result) => {
          if (err) {
            console.error("Error parsing SOAP response:", err);
            resolve({
              mensaje: "Error al procesar la respuesta del servidor",
              nombre: "",
              codigo: -1,
              success: false,
              responseType: "error",
            });
            return;
          }

          try {
            // Extraer información de la respuesta usando xml2js
            const response =
              result["soap-env:Envelope"]?.["soap-env:Body"]?.[
                "n0:ZGLFU_WS_SRVUSERSAPResponse"
              ];

            if (!response) {
              console.error("Estructura SOAP inesperada:", result);
              resolve({
                mensaje: "Estructura de respuesta SOAP inesperada",
                nombre: "",
                codigo: -1,
                success: false,
                responseType: "error",
              });
              return;
            }

            const mensaje = response.PC_MENSAJE || "";
            const nombre = response.PC_NOMBRE || "";
            const codigo = response.PN_CODIGO || "";

            const codigoNumero = parseInt(codigo);

            // Determinar el tipo de respuesta basado en el código
            let responseType: "success" | "error" | "warning" = "error";
            let isSuccess = false;

            if (codigoNumero === 0) {
              responseType = "success";
              isSuccess = true;
            } else if (codigoNumero === 1) {
              // Código 1 indica usuario inexistente - es un warning de validación
              responseType = "warning";
              isSuccess = false;
            } else {
              // Otros códigos de error
              responseType = "error";
              isSuccess = false;
            }

            console.log("🔍 Parseando respuesta SOAP:", {
              codigo: codigoNumero,
              mensaje,
              nombre,
              responseType,
              isSuccess,
            });

            resolve({
              mensaje,
              nombre,
              codigo: codigoNumero,
              success: isSuccess,
              responseType,
            });
          } catch (parseError) {
            console.error("Error procesando estructura SOAP:", parseError);
            resolve({
              mensaje: "Error al procesar la estructura de la respuesta",
              nombre: "",
              codigo: -1,
              success: false,
              responseType: "error",
            });
          }
        });
      } catch (error) {
        console.error("Error general parsing SOAP response:", error);
        resolve({
          mensaje: "Error al procesar la respuesta del servidor",
          nombre: "",
          codigo: -1,
          success: false,
          responseType: "error",
        });
      }
    });
  }

  /**
   * Genera el body SOAP para desbloquear un usuario
   */
  public generateUnlockUserSOAPBody(sapUser: string, email: string): string {
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
   * Genera el body SOAP para reiniciar contraseña (para futuras implementaciones)
   */
  public generateResetPasswordSOAPBody(sapUser: string, email: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZGLFU_WS_SRVUSERSAP>
      <PC_ACCION>${SAP_WEB_SERVICE_CONFIG.actions.RESET_PASSWORD}</PC_ACCION>
      <PC_EMAIL>${email}</PC_EMAIL>
      <PC_USER>${sapUser}</PC_USER>
    </urn:ZGLFU_WS_SRVUSERSAP>
  </soapenv:Body>
</soapenv:Envelope>`;
  }
}

/**
 * Función helper para obtener la instancia del cliente
 */
export const getSAPWebServiceClient = () => SAPWebServiceClient.getInstance();
