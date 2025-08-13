// Archivo de prueba para verificar conectividad con SAP
// Este archivo se puede ejecutar en la consola del navegador

export async function testSAPConnection() {
  const url =
    "http://QASAP.diveco.intranet:8000/sap/bc/srt/rfc/sap/zsdsrv_webservice_srvusrsap/410/zws_srvusrsap/zbn_srvusrsap";
  const username = "JOB_USER";
  const password = "Sapdiv+2024";
  const credentials = btoa(`${username}:${password}`);

  const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ZGLFU_WS_SRVUSERSAP>
      <PC_ACCION>D</PC_ACCION>
      <PC_EMAIL>test@diveco.com</PC_EMAIL>
      <PC_USER>TEST_USER</PC_USER>
    </urn:ZGLFU_WS_SRVUSERSAP>
  </soapenv:Body>
</soapenv:Envelope>`;

  console.log("🧪 Probando conexión con SAP...");
  console.log("📍 URL:", url);
  console.log("🔑 Usuario:", username);
  console.log("📦 Body SOAP:", soapBody.substring(0, 200) + "...");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        Authorization: `Basic ${credentials}`,
      },
      body: soapBody,
    });

    console.log("📡 Respuesta:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (response.ok) {
      const responseText = await response.text();
      console.log(
        "✅ Respuesta exitosa:",
        responseText.substring(0, 500) + "..."
      );
      return { success: true, data: responseText };
    } else {
      const errorText = await response.text();
      console.error("❌ Error HTTP:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error("💥 Error de conexión:", error);
    return { success: false, error: error.message };
  }
}

// Función para probar desde la consola del navegador
window.testSAPConnection = testSAPConnection;
