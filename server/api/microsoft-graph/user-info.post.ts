import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";
import { generateClient } from "aws-amplify/api";

Amplify.configure(outputs);

const amplifyClient = generateClient();

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

    console.log(`Obteniendo información del usuario: ${userName}`);

    // Obtener token de acceso
    const request = await amplifyClient.queries.MicrosoftGraphToken();
    const response = JSON.parse(request.data);
    const accessToken = response.access_token;

    // Realizar consulta a Microsoft Graph API para obtener información del usuario
    const graphResponse = await $fetch(
      `https://graph.microsoft.com/v1.0/users/${userName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Respuesta de Microsoft Graph para usuario:", graphResponse);

    return {
      success: true,
      userData: graphResponse,
      message: `Información del usuario ${userName} obtenida exitosamente`,
    };
  } catch (error: any) {
    console.error("Error obteniendo información del usuario:", error);

    // Si es un error de Microsoft Graph API
    if (error.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: `Usuario ${body?.userName || "desconocido"} no encontrado`,
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
