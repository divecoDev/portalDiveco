import { defineEventHandler } from "h3";

/**
 * Endpoint GET para verificar que el webhook está funcionando
 * El webhook real está en webhook.post.ts y solo acepta POST
 */
export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: "Webhook endpoint está funcionando correctamente",
    info: {
      method: "Este endpoint es solo informativo (GET)",
      webhookMethod: "El webhook real debe llamarse con POST",
      webhookUrl: "/api/rpa/webhook",
      expectedPayload: {
        executionId: "string (requerido)",
        status: "'completed' o 'error' (requerido)"
      },
      example: {
        method: "POST",
        url: "/api/rpa/webhook",
        body: {
          executionId: "1234567890-abc123",
          status: "completed"
        }
      }
    }
  };
});

