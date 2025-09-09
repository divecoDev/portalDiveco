import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";
import { generateClient } from "aws-amplify/api";

Amplify.configure(outputs);

const amplifyClient = generateClient();
export default defineEventHandler(async (event) => {
  let body: any;
  try {
    body = await readBody(event);
    const { userName } = body;

    if (!userName) {
      throw createError({
        statusCode: 400,
        statusMessage: "userName es requerido",
      });
    }

    // Obtener token de acceso
    const request = await amplifyClient.queries.MicrosoftGraphToken();
    const response = JSON.parse(request.data);
    const accessToken = response.access_token;
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
  } catch (error: any) {
    console.error("Error consultando directReports de Microsoft Graph:", error);

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
