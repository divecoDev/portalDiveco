/**
 * Servicio de aplicación para auditoría
 * Application Layer - Orquestación de casos de uso
 */

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import type {
  CreateAuditLogRequest,
  GetAuditLogsRequest,
  GetAuditLogsResponse,
  GetAuditLogDetailRequest,
  GetAuditLogDetailResponse,
  AuditContext,
  AuditAction,
  AuditModule,
} from "~/domain/audit/types";
import { detectChanges } from "~/domain/audit/audit-domain.service";
import { generateDeviceFingerprint, getDeviceInfo } from "~/utils/device-fingerprint";
import { normalizeAuthIdentifier } from "~/utils/audit-helpers";

/**
 * Servicio de auditoría
 */
export class AuditService {
  private _client: any = null;

  /**
   * Obtiene el cliente de Amplify (lazy loading)
   * Verifica que Amplify esté configurado antes de generar el cliente
   */
  private getClient() {
    if (!this._client) {
      // Verificar que estamos en el cliente
      if (!process.client) {
        throw new Error("El cliente de Amplify solo puede generarse en el cliente");
      }

      try {
        // Verificar que Amplify esté configurado
        const config = Amplify.getConfig();
        console.log("🔍 Verificando configuración de Amplify:", {
          hasConfig: !!config,
          hasAPI: !!config?.API,
          hasGraphQL: !!config?.API?.GraphQL,
          hasAuth: !!config?.Auth,
        });

        // En Amplify Gen 2, la configuración puede estar en formato diferente
        if (!config) {
          console.warn("⚠️ Amplify no está configurado");
          throw new Error("Amplify no está configurado. Asegúrate de que el plugin amplify.client.ts se ejecute primero.");
        }

        console.log("🔧 Generando cliente de Amplify para auditoría...");
        
        // En Amplify Gen 2, generateClient puede detectar automáticamente el Schema
        // Intentar sin tipo primero (como en rpa-service.ts)
        try {
          this._client = generateClient<Schema>();
          console.log("✅ Cliente de Amplify generado para auditoría (con Schema)");
        } catch (schemaError: any) {
          // Si falla con Schema, intentar sin tipo (como rpa-service.ts)
          console.warn("⚠️ Error al generar cliente con Schema, intentando sin tipo:", schemaError?.message);
          try {
            this._client = generateClient();
            console.log("✅ Cliente de Amplify generado para auditoría (sin Schema)");
          } catch (clientError: any) {
            console.error("❌ Error al generar cliente sin Schema:", clientError);
            throw clientError;
          }
        }
      } catch (error: any) {
        console.error("❌ Error generando cliente de Amplify:", error);
        console.error("  - Mensaje:", error?.message);
        console.error("  - Stack:", error?.stack);
        throw new Error(`No se pudo generar el cliente de Amplify: ${error.message || "Error desconocido"}`);
      }
    }
    return this._client;
  }

  /**
   * Extrae el contexto de auditoría desde el usuario actual y el navegador
   */
  private async extractContext(): Promise<AuditContext> {
    try {
      const user = await getCurrentUser();
      const deviceInfo = getDeviceInfo();

      const rawEmail = user.signInDetails?.loginId || user.username || "unknown@example.com";
      const rawUserName = user.username || "Unknown User";
      
      return {
        userId: user.userId,
        userEmail: normalizeAuthIdentifier(rawEmail),
        userName: normalizeAuthIdentifier(rawUserName),
        ipAddress: "unknown", // IP no disponible desde el navegador (se capturaría en el servidor)
        userAgent: deviceInfo.userAgent,
        deviceFingerprint: generateDeviceFingerprint(),
      };
    } catch (error) {
      console.warn("⚠️ No se pudo extraer contexto de auditoría:", error);
      const deviceInfo = getDeviceInfo();

      return {
        userId: "unknown",
        userEmail: "unknown@example.com",
        userName: "Unknown User",
        ipAddress: "unknown",
        userAgent: deviceInfo.userAgent,
        deviceFingerprint: generateDeviceFingerprint(),
      };
    }
  }

  /**
   * Registra una acción de auditoría
   */
  async logAction(
    action: AuditAction,
    module: AuditModule,
    entityType: string,
    entityId?: string,
    changes?: { before?: any; after?: any },
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    try {
      // Detectar cambios si se proporcionan before/after
      let auditChanges = null;
      if (changes?.before !== undefined || changes?.after !== undefined) {
        auditChanges = detectChanges(changes.before, changes.after);
      }

      // Extraer contexto de auditoría (usuario, IP, User-Agent, etc.)
      const context = await this.extractContext();

      // Crear el log de auditoría directamente usando el modelo
      const client = this.getClient();
      
      if (!client || !client.models || !client.models.AuditLog) {
        throw new Error("El cliente de Amplify no tiene el modelo AuditLog disponible");
      }

          // Preparar metadata: Amplify Gen 2 requiere que los campos a.json() se envíen como strings JSON
          // Según el patrón usado en otros módulos (useSuicFileUpload.ts), los campos JSON deben ser strings
          let preparedMetadata: string | undefined = undefined;
          if (metadata && typeof metadata === "object") {
            try {
              console.log("🔍 Preparando metadata:", metadata);
              
              // Crear una copia limpia del objeto, eliminando valores undefined
              const cleanMetadata: Record<string, any> = {};
              for (const [key, value] of Object.entries(metadata)) {
                if (value !== undefined) {
                  try {
                    // Normalizar userEmail y userName si existen en el metadata
                    let processedValue = value;
                    if ((key === "userEmail" || key === "userName") && typeof value === "string") {
                      processedValue = normalizeAuthIdentifier(value);
                    }
                    
                    // Serializar y deserializar para asegurar que sea JSON válido
                    const serialized = JSON.stringify(processedValue);
                    cleanMetadata[key] = JSON.parse(serialized);
                  } catch (serializeError) {
                    console.warn(`⚠️ Error al serializar propiedad ${key}:`, serializeError);
                    // Omitir esta propiedad si no se puede serializar
                  }
                }
              }
              
              // Solo asignar si tiene propiedades válidas
              if (Object.keys(cleanMetadata).length > 0) {
                // Serializar a string JSON como requiere Amplify Gen 2
                preparedMetadata = JSON.stringify(cleanMetadata);
                console.log("✅ Metadata preparado como string JSON:", preparedMetadata);
              } else {
                console.log("ℹ️ Metadata vacío después de limpiar, omitiendo campo");
                preparedMetadata = undefined;
              }
            } catch (metadataError) {
              console.warn("⚠️ Error al preparar metadata:", metadataError);
              console.warn("  - Metadata original:", metadata);
              preparedMetadata = undefined;
            }
          } else {
            console.log("ℹ️ Metadata no proporcionado o no es objeto, omitiendo campo");
          }

      // Construir el objeto de datos, usando undefined para campos opcionales que no tienen valor
      // Amplify Gen 2 requiere que los campos opcionales sean undefined, no null, para omitirlos
      // Para campos a.json(), Amplify Gen 2 espera strings JSON (según patrón de otros módulos)
      const auditLogData: any = {
        userId: context.userId,
        userEmail: context.userEmail,
        userName: context.userName || undefined,
        action,
        module,
        entityType,
        entityId: entityId || undefined,
        changes: auditChanges ? JSON.stringify(auditChanges) : undefined,
        ipAddress: context.ipAddress || undefined,
        userAgent: context.userAgent || undefined,
        deviceFingerprint: context.deviceFingerprint || undefined,
        timestamp: new Date().toISOString(),
        // metadata solo se incluye si tiene un valor válido (como string JSON)
        ...(preparedMetadata ? { metadata: preparedMetadata } : {}),
      };

      console.log("📋 Datos a enviar a AuditLog.create:", {
        ...auditLogData,
        changes: auditLogData.changes ? "[Object]" : null,
        metadata: auditLogData.metadata ? JSON.stringify(auditLogData.metadata) : (auditLogData.metadata === undefined ? "undefined (omitido)" : "null"),
      });

      console.log("💾 Creando log de auditoría directamente en el modelo:", {
        action,
        module,
        entityType,
        entityId,
      });

      const response = await client.models.AuditLog.create(auditLogData);

      console.log("📦 Respuesta del modelo AuditLog.create:", {
        hasData: !!response.data,
        hasErrors: !!response.errors,
        errors: response.errors,
      });

      // Manejar errores de la respuesta
      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors.map((e: any) => e.message || e).join(", ");
        console.error("❌ Errores en la respuesta:", response.errors);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Procesar los datos
      if (!response.data) {
        console.warn("⚠️ La respuesta no contiene data");
        return {
          success: false,
          error: "No se pudo crear el log de auditoría",
        };
      }

      return {
        success: true,
        logId: response.data.id,
      };
    } catch (error: any) {
      console.error("❌ Error al registrar acción de auditoría:", error);
      return {
        success: false,
        error: error.message || "Error desconocido al registrar acción de auditoría",
      };
    }
  }

  /**
   * Registra un inicio de sesión
   */
  async logLogin(userId: string, metadata?: Record<string, any>): Promise<{
    success: boolean;
    logId?: string;
    error?: string;
  }> {
    console.log("🔐 Registrando login en auditoría...", { userId, metadata });
    try {
      const result = await this.logAction(
        "LOGIN",
        "system",
        "User",
        userId,
        undefined,
        metadata
      );
      console.log("🔐 Resultado de registro de login:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Error en logLogin:", error);
      return {
        success: false,
        error: error.message || "Error desconocido al registrar login",
      };
    }
  }

  /**
   * Registra un cierre de sesión
   */
  async logLogout(userId: string, metadata?: Record<string, any>): Promise<{
    success: boolean;
    logId?: string;
    error?: string;
  }> {
    console.log("🚪 Registrando logout en auditoría...", { userId, metadata });
    try {
      const result = await this.logAction(
        "LOGOUT",
        "system",
        "User",
        userId,
        undefined,
        metadata
      );
      console.log("🚪 Resultado de registro de logout:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Error en logLogout:", error);
      return {
        success: false,
        error: error.message || "Error desconocido al registrar logout",
      };
    }
  }

  /**
   * Registra un cambio de configuración
   */
  async logConfigChange(
    configType: string,
    oldValue: any,
    newValue: any,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    return this.logAction(
      "CONFIG_CHANGE",
      "system",
      "Config",
      configType,
      { before: oldValue, after: newValue },
      metadata
    );
  }

  /**
   * Consulta logs de auditoría con filtros
   */
  async getAuditLogs(
    request: GetAuditLogsRequest
  ): Promise<GetAuditLogsResponse> {
    try {
      console.log("📋 Consultando logs de auditoría...", request);
      
      // Usar el modelo AuditLog directamente desde el cliente
      const client = this.getClient();
      console.log("🔍 Cliente obtenido:", {
        hasClient: !!client,
        hasModels: !!client?.models,
        hasAuditLog: !!client?.models?.AuditLog,
      });
      
      if (!client || !client.models || !client.models.AuditLog) {
        throw new Error("El cliente de Amplify no tiene el modelo AuditLog disponible");
      }
      
      // Construir filtros para la consulta
      const filters: any = {};
      
      if (request.userId) {
        filters.userId = { eq: request.userId };
      }
      
      if (request.module) {
        filters.module = { eq: request.module };
      }
      
      if (request.action) {
        filters.action = { eq: request.action };
      }
      
      if (request.entityType) {
        filters.entityType = { eq: request.entityType };
      }
      
      if (request.startDate || request.endDate) {
        filters.timestamp = {};
        if (request.startDate) {
          filters.timestamp.ge = request.startDate;
        }
        if (request.endDate) {
          filters.timestamp.le = request.endDate;
        }
      }
      
      // Valores por defecto para paginación
      const page = Math.max(1, request.page || 1);
      const limit = Math.min(100, Math.max(1, request.limit || 50));
      
      console.log("🔍 Filtros aplicados:", filters);
      console.log("📋 Paginación:", { page, limit });
      
      // Consultar logs usando el modelo directamente
      const response = await client.models.AuditLog.list({
        filter: Object.keys(filters).length > 0 ? filters : undefined,
        limit,
      });

      console.log("📦 Respuesta del modelo AuditLog:", {
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        hasErrors: !!response.errors,
        errors: response.errors,
      });

      // Manejar errores de la respuesta
      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors.map((e: any) => e.message || e).join(", ");
        console.error("❌ Errores en la respuesta:", response.errors);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Procesar los datos
      if (!response.data) {
        console.warn("⚠️ La respuesta no contiene data");
        return {
          success: true,
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      // Convertir los datos a formato AuditLog
      let logs = response.data.map((log: any): any => ({
        id: log.id,
        userId: log.userId,
        userEmail: log.userEmail,
        userName: log.userName || undefined,
        action: log.action,
        module: log.module,
        entityType: log.entityType,
        entityId: log.entityId || undefined,
        changes: log.changes || undefined,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        deviceFingerprint: log.deviceFingerprint || undefined,
        timestamp: log.timestamp,
        metadata: log.metadata || undefined,
      }));

      // Aplicar búsqueda de texto si se proporciona
      if (request.search) {
        const searchLower = request.search.toLowerCase();
        logs = logs.filter(
          (log: any) =>
            log.userEmail?.toLowerCase().includes(searchLower) ||
            log.userName?.toLowerCase().includes(searchLower) ||
            log.module?.toLowerCase().includes(searchLower) ||
            log.entityType?.toLowerCase().includes(searchLower) ||
            log.entityId?.toLowerCase().includes(searchLower)
        );
      }

      // Ordenar por timestamp descendente (más recientes primero)
      logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Aplicar paginación local
      const total = logs.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedLogs = logs.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedLogs,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error: any) {
      console.error("❌ Error al consultar logs de auditoría:", error);
      return {
        success: false,
        error: error.message || "Error desconocido al consultar logs de auditoría",
      };
    }
  }

  /**
   * Obtiene el detalle completo de un log
   */
  async getAuditLogDetail(
    logId: string
  ): Promise<GetAuditLogDetailResponse> {
    try {
      // Usar el modelo AuditLog directamente desde el cliente
      const client = this.getClient();
      
      if (!client || !client.models || !client.models.AuditLog) {
        throw new Error("El cliente de Amplify no tiene el modelo AuditLog disponible");
      }

      // Obtener el log por ID usando el modelo directamente
      const response = await client.models.AuditLog.get({ id: logId });

      console.log("📦 Respuesta del modelo AuditLog.get:", {
        hasData: !!response.data,
        hasErrors: !!response.errors,
        errors: response.errors,
      });

      // Manejar errores de la respuesta
      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors.map((e: any) => e.message || e).join(", ");
        console.error("❌ Errores en la respuesta:", response.errors);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Procesar los datos
      if (!response.data) {
        console.warn("⚠️ La respuesta no contiene data");
        return {
          success: false,
          error: "No se encontró el log de auditoría con el ID proporcionado",
        };
      }

      // Convertir los datos a formato AuditLog
      const log = {
        id: response.data.id,
        userId: response.data.userId,
        userEmail: response.data.userEmail,
        userName: response.data.userName || undefined,
        action: response.data.action,
        module: response.data.module,
        entityType: response.data.entityType,
        entityId: response.data.entityId || undefined,
        changes: response.data.changes || undefined,
        ipAddress: response.data.ipAddress || undefined,
        userAgent: response.data.userAgent || undefined,
        deviceFingerprint: response.data.deviceFingerprint || undefined,
        timestamp: response.data.timestamp,
        metadata: response.data.metadata || undefined,
      };

      return {
        success: true,
        data: log,
      };
    } catch (error: any) {
      console.error("❌ Error al obtener detalle de log:", error);
      return {
        success: false,
        error: error.message || "Error desconocido al obtener detalle de log",
      };
    }
  }
}

// Exportar instancia singleton
export const auditService = new AuditService();

