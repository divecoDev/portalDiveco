import { defineEventHandler, readBody, createError } from "h3";
import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";

// Configurar Amplify para el servidor
Amplify.configure(outputs);

const client = generateClient<Schema>();

interface WebhookPayload {
  suicId: string;
  status: "completed" | "error";
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as WebhookPayload;

    // Validar payload
    if (!body.suicId) {
      throw createError({
        statusCode: 400,
        statusMessage: "suicId es requerido",
      });
    }

    if (!body.status || !["completed", "error"].includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: "status debe ser 'completed' o 'error'",
      });
    }

    console.log(`📥 Webhook recibido - suicId: ${body.suicId}, status: ${body.status}`);

    // Buscar el registro SUIC que tiene este executionId
    const { data: suicRecords } = await (client.models as any).SUIC.list({
      filter: {
        id: { eq: body.suicId },
      },
    });

    if (!suicRecords || suicRecords.length === 0) {
      console.warn(`⚠️ No se encontró registro SUIC con suicId: ${body.suicId}`);
      throw createError({
        statusCode: 404,
        statusMessage: `No se encontró ejecución con suicId: ${body.suicId}`,
      });
    }

    // Actualizar el estado del SUIC
    // Esta actualización disparará automáticamente las suscripciones en tiempo real
    // de los clientes que estén escuchando cambios en este registro SUIC
    const suicRecord = suicRecords[0];
    const newStatus = body.status === "completed" ? "completed" : "error";

    await (client.models as any).SUIC.update({
      id: suicRecord.id,
      rpaStatus: newStatus,
      rpaLastUpdate: new Date().toISOString(),
    });

    console.log(`✅ Estado actualizado para SUIC ${suicRecord.id}: ${newStatus}`);

    // Enviar email de notificación de forma asíncrona (no bloquea la respuesta)
    // Enviar emails a createdBy y rpaExecutedBy si son diferentes
    const recipients: string[] = [];
    
    // Agregar createdBy si existe
    if (suicRecord.createdBy) {
      recipients.push(suicRecord.createdBy);
    }
    
    // Agregar rpaExecutedBy si existe y es diferente de createdBy
    if (suicRecord.rpaExecutedBy && 
        suicRecord.rpaExecutedBy !== suicRecord.createdBy) {
      recipients.push(suicRecord.rpaExecutedBy);
    }

    // Enviar emails a cada destinatario único
    if (recipients.length > 0) {
      const emailPayloadBase = {
        suicId: suicRecord.id,
        status: newStatus,
        rpaType: suicRecord.rpaType || "unknown",
        descripcion: suicRecord.descripcion || "",
        rpaLastUpdate: new Date().toISOString(),
      };

      recipients.forEach((recipient) => {
        try {
          const emailPayload = {
            ...emailPayloadBase,
            to: recipient,
          };

          console.log(`📧 Invocando mutation de Amplify para enviar email a: ${recipient}`);

          // Invocar mutation de Amplify de forma asíncrona (no esperamos la respuesta)
          // Usar .catch() para no bloquear la respuesta del webhook
          (client.mutations as any).sendRpaStatusEmail(emailPayload).catch((error: any) => {
            // Loggear error pero no fallar el webhook
            console.error(`❌ Error invocando mutation de email para ${recipient}:`, error);
            console.error("❌ Detalles del error:", JSON.stringify(error, null, 2));
          });
        } catch (error: any) {
          // Loggear error pero no fallar el webhook
          console.error(`❌ Error preparando envío de email para ${recipient}:`, error);
          console.error("❌ Stack trace:", error.stack);
        }
      });
    } else {
      console.warn("⚠️ No se encontraron destinatarios (createdBy o rpaExecutedBy) en el registro SUIC, no se enviará email");
    }

    // Retornar confirmación
    return {
      success: true,
      message: "Estado actualizado correctamente",
      suicId: body.suicId,
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

