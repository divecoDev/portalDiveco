export const handler = async (event: any) => {
  console.log("Iniciando handler de Microsoft Graph Token");
  try {
    const msTenantId: string = process.env.MS_TENANT_ID || "";
    const msClientId: string = process.env.MS_CLIENT_ID || "";
    const msClientSecret: string = process.env.MS_CLIENT_SECRET || "";

    console.log("Iniciando obtención de token de Microsoft Graph...");

    console.log("msTenantId", msTenantId);
    console.log("msClientId", msClientId);
    console.log("msClientSecret", msClientSecret);
    // Credenciales de Microsoft Graph API
    const accessTokenUrl = `https://login.microsoftonline.com/${msTenantId}/oauth2/v2.0/token`;
    const scope = "https://graph.microsoft.com/.default";

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", msClientId);
    params.append("client_secret", msClientSecret);
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
