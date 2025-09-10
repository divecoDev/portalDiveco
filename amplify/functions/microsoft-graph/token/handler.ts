/**
 * Obtiene la configuración del tenant basándose en el nombre
 * @param tenantName Nombre del tenant (nova/diveco)
 * @returns Objeto con las credenciales del tenant
 */
const getTenantConfig = (tenantName: string) => {
  switch (tenantName) {
    case "nova":
      return {
        tenantId: process.env.MS_NOVA_TENANT_ID || "",
        clientId: process.env.MS_NOVA_CLIENT_ID || "",
        clientSecret: process.env.MS_NOVA_CLIENT_SECRET || "",
      };
    case "diveco":
      return {
        tenantId: process.env.MS_TENANT_ID || "",
        clientId: process.env.MS_CLIENT_ID || "",
        clientSecret: process.env.MS_CLIENT_SECRET || "",
      };
    default:
      throw new Error(`Tenant no válido: ${tenantName}`);
  }
};

export const handler = async (event: any) => {
  const { tenantName } = event.arguments;

  try {
    // Obtener configuración del tenant
    const tenantConfig = getTenantConfig(tenantName);
    const { tenantId, clientId, clientSecret } = tenantConfig;
    // Credenciales de Microsoft Graph API
    const accessTokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const scope = "https://graph.microsoft.com/.default";

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("scope", scope);

    const response = await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al obtener el token:", errorData);
      return {
        success: false,
        error: errorData,
      };
    }

    const data = await response.json();

    return JSON.stringify(data);
  } catch (error: any) {
    console.error("Error obteniendo token de Microsoft Graph:", error);
  }
};
