export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId } = body;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "userId es requerido",
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

    // Ahora obtenemos la foto del usuario
    const photoUrl = `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`;

    const photoResponse = await fetch(photoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!photoResponse.ok) {
      // Si no hay foto disponible, devolvemos null en lugar de error
      if (photoResponse.status === 404) {
        return {
          success: true,
          userId,
          hasPhoto: false,
          photoData: null,
        };
      }

      const errorData = await photoResponse.text();
      throw createError({
        statusCode: photoResponse.status,
        statusMessage: `Error al obtener la foto: ${errorData}`,
      });
    }

    // Convertir la imagen a base64
    const photoBuffer = await photoResponse.arrayBuffer();
    const photoBase64 = Buffer.from(photoBuffer).toString("base64");
    const contentType =
      photoResponse.headers.get("content-type") || "image/jpeg";

    return {
      success: true,
      userId,
      hasPhoto: true,
      photoData: `data:${contentType};base64,${photoBase64}`,
    };
  } catch (error) {
    console.error(
      "Error obteniendo foto de usuario de Microsoft Graph:",
      error
    );

    throw createError({
      statusCode: 500,
      statusMessage: `Error interno del servidor: ${error.message}`,
    });
  }
});
