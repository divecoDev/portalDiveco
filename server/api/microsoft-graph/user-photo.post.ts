export default defineEventHandler(async (event) => {
  let body: any;
  try {
    body = await readBody(event);
    const { userId } = body;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "userId es requerido",
      });
    }

    // Obtener token de acceso usando nuestro endpoint
    const tokenResponse = (await $fetch("/api/microsoft-graph/token", {
      method: "POST",
    })) as any;

    if (!tokenResponse.success) {
      throw createError({
        statusCode: 500,
        statusMessage: "Error obteniendo token de acceso",
      });
    }

    const accessToken = tokenResponse.access_token;

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
  } catch (error: any) {
    console.error(
      "Error obteniendo foto de usuario de Microsoft Graph:",
      error
    );

    // Si es un error de Microsoft Graph API
    if (error.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: `Usuario ${body?.userId || "desconocido"} no encontrado`,
      });
    }

    if (error.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: "Token de acceso inválido o expirado",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error interno del servidor",
    });
  }
});
