import {
  SAP_WEB_SERVICE_CONFIG,
  type SAPWebServiceResponse,
} from "~/config/sap-web-service";

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

      return this.parseSOAPResponse(responseText);
    } catch (error) {
      console.error("💥 Error en llamada al web service SAP:", error);
      throw error;
    }
  }

  /**
   * Parsea la respuesta SOAP del web service
   */
  private parseSOAPResponse(xmlString: string): SAPWebServiceResponse {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Extraer información de la respuesta
      const mensaje = xmlDoc.querySelector("PC_MENSAJE")?.textContent || "";
      const nombre = xmlDoc.querySelector("PC_NOMBRE")?.textContent || "";
      const codigo = xmlDoc.querySelector("PN_CODIGO")?.textContent || "";

      return {
        mensaje,
        nombre,
        codigo: parseInt(codigo),
        success: parseInt(codigo) === 0,
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
