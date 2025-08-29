export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userName } = body;

    if (!userName) {
      throw createError({
        statusCode: 400,
        statusMessage: "userName es requerido",
      });
    }

    const { msTenantId, msClientId, msClientSecret } = useRuntimeConfig(event);

    // Primero obtenemos el token
    const accessTokenUrl = `https://login.microsoftonline.com/${msTenantId}/oauth2/v2.0/token`;
    const scope = "https://graph.microsoft.com/.default";

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", msClientId);
    params.append("client_secret", msClientSecret);
    params.append("scope", scope);

    const tokenResponse = await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw createError({
        statusCode: tokenResponse.status,
        statusMessage: `Error al obtener el token: ${JSON.stringify(errorData)}`,
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Ahora consultamos los directReports
    const directReportsUrl = `https://graph.microsoft.com/v1.0/users/${userName}/directReports`;

    const directReportsResponse = await fetch(directReportsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!directReportsResponse.ok) {
      const errorData = await directReportsResponse.json();
      throw createError({
        statusCode: directReportsResponse.status,
        statusMessage: `Error al consultar directReports: ${JSON.stringify(errorData)}`,
      });
    }

    const directReportsData = await directReportsResponse.json();

    return {
      success: true,
      userName,
      directReports: directReportsData,
    };
  } catch (error) {
    console.error("Error consultando directReports de Microsoft Graph:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Error interno del servidor: ${error.message}`,
    });
  }
});
