import type { Handler } from "aws-lambda";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Obtener región de AWS (disponible automáticamente en Lambda)
const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const sesClient = new SESClient({ region: AWS_REGION });
const FROM_EMAIL = "portal_diveco@camasolympia.com";

interface EmailPayload {
  to: string;
  suicId: string;
  status: "completed" | "error";
  rpaType: string;
  descripcion?: string;
  rpaLastUpdate: string;
  createdBy?: string;
  rpaExecutedBy?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Genera la plantilla HTML del email
 */
function generateEmailTemplate(payload: EmailPayload): string {
  const { suicId, status, descripcion, rpaLastUpdate, createdBy, rpaExecutedBy } = payload;
  
  const isCompleted = status === "completed";
  const statusText = isCompleted ? "Completado" : "Error";
  const statusColor = isCompleted ? "#10b981" : "#ef4444";
  const statusBgColor = isCompleted ? "#d1fae5" : "#fee2e2";
  const statusIcon = isCompleted ? "✅" : "❌";
  const mainMessage = isCompleted
    ? "La SUIC ha sido procesada exitosamente."
    : "La SUIC ha finalizado con errores.";

  const formattedDate = new Date(rpaLastUpdate).toLocaleString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Guatemala",
  });

  const viewUrl = `https://portal.grupodiveco.com/tools/suic/view/${suicId}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación de Procesamiento SUIC</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Portal Diveco</h1>
              <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px; font-weight: 400;">Notificación de Procesamiento</p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Status Badge -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: ${statusBgColor}; color: ${statusColor}; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  ${statusIcon} ${statusText}
                </div>
              </div>

              <!-- Mensaje principal -->
              <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 24px; border-radius: 8px; margin-bottom: 30px; border-left: 5px solid ${statusColor};">
                <p style="margin: 0; font-size: 18px; color: #111827; font-weight: 500; line-height: 1.6;">
                  ${mainMessage}
                </p>
              </div>

              <!-- Detalles -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                  Detalles de la SUIC
                </h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${descripcion ? `
                  <tr>
                    <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 35%; vertical-align: top;">Descripción:</td>
                    <td style="padding: 12px 0; color: #111827; font-size: 15px; line-height: 1.5;">${descripcion}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 35%; vertical-align: top;">Estado:</td>
                    <td style="padding: 12px 0;">
                      <span style="display: inline-block; background-color: ${statusBgColor}; color: ${statusColor}; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 14px;">${statusText}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 35%; vertical-align: top;">Fecha y Hora:</td>
                    <td style="padding: 12px 0; color: #111827; font-size: 15px;">${formattedDate}</td>
                  </tr>
                  ${createdBy ? `
                  <tr>
                    <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 35%; vertical-align: top;">Creado por:</td>
                    <td style="padding: 12px 0; color: #111827; font-size: 15px;">${createdBy}</td>
                  </tr>
                  ` : ""}
                  ${rpaExecutedBy ? `
                  <tr>
                    <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 35%; vertical-align: top;">Ejecutado por:</td>
                    <td style="padding: 12px 0; color: #111827; font-size: 15px;">${rpaExecutedBy}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>

              <!-- Botón CTA -->
              <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 8px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                          <a href="${viewUrl}" style="display: inline-block; color: #ffffff; text-decoration: none; padding: 16px 40px; font-weight: 600; font-size: 16px; border-radius: 8px;">
                            Ver SUIC en el Portal
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Información adicional -->
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0; color: #0369a1; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Nota:</strong> Puedes acceder a esta SUIC en cualquier momento desde el Portal Diveco para revisar los detalles completos y descargar los archivos generados.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                Este es un mensaje automático del Portal Diveco.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Por favor, no responda a este correo. Si tiene alguna pregunta, contacte al equipo de soporte.
              </p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  © ${new Date().getFullYear()} Portal Diveco - Grupo Diveco
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Handler principal de la Lambda
 * Cuando se invoca desde GraphQL, los argumentos vienen en event.arguments
 * Retorna EmailResponse directamente (Amplify serializa automáticamente)
 */
export const handler = async (event: any): Promise<EmailResponse> => {
  console.log("📧 Iniciando envío de email de notificación RPA");
  console.log("📝 Evento recibido:", JSON.stringify(event, null, 2));

  try {
    // Extraer payload - puede venir de GraphQL (event.arguments) o invocación directa
    let payload: EmailPayload;
    if (event.arguments) {
      // Invocación desde GraphQL
      payload = event.arguments as EmailPayload;
    } else if (typeof event === 'string') {
      // Payload como string JSON
      payload = JSON.parse(event);
    } else {
      // Payload directo
      payload = event as EmailPayload;
    }

    console.log("📋 Payload extraído:", JSON.stringify(payload, null, 2));

    // Validar payload
    if (!payload.to || !payload.suicId || !payload.status) {
      throw new Error("Campos requeridos faltantes: to, suicId, status");
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.to)) {
      throw new Error(`Email inválido: ${payload.to}`);
    }

    // Generar plantilla HTML
    const htmlBody = generateEmailTemplate(payload);
    const statusText = payload.status === "completed" ? "Completado" : "Error";
    // Usar descripción en el asunto en lugar del ID
    const subjectDesc = payload.descripcion || `SUIC ${payload.suicId}`;
    const subject = `Portal Diveco - ${subjectDesc} - ${statusText}`;

    // Preparar comando de envío
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [payload.to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8",
          },
          Text: {
            Data: `Portal Diveco - Notificación de Procesamiento SUIC\n\n${payload.descripcion ? `Descripción: ${payload.descripcion}\n` : ""}Estado: ${statusText}\nFecha: ${new Date(payload.rpaLastUpdate).toLocaleString("es-GT")}\n${payload.createdBy ? `Creado por: ${payload.createdBy}\n` : ""}${payload.rpaExecutedBy ? `Ejecutado por: ${payload.rpaExecutedBy}\n` : ""}\n${payload.status === "completed" ? "La SUIC ha sido procesada exitosamente." : "La SUIC ha finalizado con errores."}\n\nVer SUIC: https://portal.grupodiveco.com/tools/suic/view/${payload.suicId}`,
            Charset: "UTF-8",
          },
        },
      },
    });

    // Enviar email
    console.log(`📤 Enviando email a: ${payload.to}`);
    const response = await sesClient.send(command);
    console.log("✅ Email enviado exitosamente");
    console.log("📧 Message ID:", response.MessageId);

    // Retornar respuesta directamente (Amplify serializa automáticamente para a.json())
    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error: any) {
    console.error("❌ Error enviando email:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Retornar respuesta directamente (Amplify serializa automáticamente para a.json())
    return {
      success: false,
      error: errorMessage || "Error desconocido al enviar email",
    };
  }
};

