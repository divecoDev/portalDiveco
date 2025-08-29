export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();

  try {
    const { msTenantId, msClientId, msClientSecret } = useRuntimeConfig(event);

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
      throw createError({
        statusCode: response.status,
        statusMessage: `Error al obtener el token: ${JSON.stringify(errorData)}`,
      });
    }

    const data = await response.json();

    return {
      success: true,
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    };
  } catch (error: any) {
    console.error("Error obteniendo token de Microsoft Graph:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Error interno del servidor: ${error?.message || "Error desconocido"}`,
    });
  }
});
