import { defineEventHandler, readBody, createError } from "h3";
import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";
import { generateClient } from "aws-amplify/data";

// Configurar Amplify para el servidor
Amplify.configure(outputs);

const client = generateClient();

interface WebhookPayload {
  executionId: string;
  status: "completed" | "error";
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as WebhookPayload;

    // Validar payload
    if (!body.executionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "executionId es requerido",
      });
    }

    if (!body.status || !["completed", "error"].includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: "status debe ser 'completed' o 'error'",
      });
    }

    console.log(`📥 Webhook recibido - executionId: ${body.executionId}, status: ${body.status}`);

    // Buscar el registro SUIC que tiene este executionId
    const { data: suicRecords } = await (client.models as any).SUIC.list({
      filter: {
        rpaExecutionId: { eq: body.executionId },
      },
    });

    if (!suicRecords || suicRecords.length === 0) {
      console.warn(`⚠️ No se encontró registro SUIC con executionId: ${body.executionId}`);
      throw createError({
        statusCode: 404,
        statusMessage: `No se encontró ejecución con executionId: ${body.executionId}`,
      });
    }

    // Actualizar el estado del SUIC
    const suicRecord = suicRecords[0];
    const newStatus = body.status === "completed" ? "completed" : "error";

    await (client.models as any).SUIC.update({
      id: suicRecord.id,
      rpaStatus: newStatus,
      rpaLastUpdate: new Date().toISOString(),
    });

    console.log(`✅ Estado actualizado para SUIC ${suicRecord.id}: ${newStatus}`);

    // Retornar confirmación
    return {
      success: true,
      message: "Estado actualizado correctamente",
      executionId: body.executionId,
      status: newStatus,
    };
  } catch (error: any) {
    console.error("❌ Error procesando webhook:", error);

    // Si es un error de validación, retornarlo
    if (error.statusCode) {
      throw error;
    }

    // Error genérico
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error procesando webhook",
    });
  }
});

