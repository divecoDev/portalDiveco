/**
 * Decoradores TypeScript para Auditoría Automática
 * Facilita la integración de auditoría en métodos y clases
 */

import { auditService } from "~/services/audit.service";
import type { AuditAction, AuditModule } from "~/domain/audit/types";
import { detectChanges } from "~/domain/audit/audit-domain.service";

/**
 * Opciones para el decorador @AuditAction
 */
export interface AuditActionOptions {
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  extractEntityId?: (args: any[], result?: any) => string | undefined;
  extractData?: (args: any[], result?: any) => { before?: any; after?: any };
  metadata?: (args: any[], result?: any) => Record<string, any>;
  skipOnError?: boolean;
}

/**
 * Decorador para auditar automáticamente acciones de métodos
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @AuditAction({
 *     action: "CREATE",
 *     module: "admin-users",
 *     entityType: "User",
 *     extractEntityId: (args, result) => result?.id,
 *     extractData: (args, result) => ({ after: result }),
 *   })
 *   async createUser(data: any) {
 *     // ... lógica de creación
 *   }
 * }
 * ```
 */
export function AuditAction(options: AuditActionOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let result: any;
      let error: any = null;

      try {
        // Ejecutar método original
        result = await originalMethod.apply(this, args);

        // Extraer información para auditoría
        const entityId = options.extractEntityId
          ? options.extractEntityId(args, result)
          : undefined;

        const data = options.extractData
          ? options.extractData(args, result)
          : undefined;

        const metadata = options.metadata
          ? options.metadata(args, result)
          : undefined;

        // Registrar auditoría (en background, no bloquear)
        auditService
          .logAction(
            options.action,
            options.module,
            options.entityType,
            entityId,
            data,
            {
              ...metadata,
              method: propertyKey,
              className: target.constructor?.name || "Unknown",
            }
          )
          .catch((auditError) => {
            console.warn(
              `⚠️ Error al registrar auditoría para ${propertyKey}:`,
              auditError
            );
          });

        return result;
      } catch (err) {
        error = err;

        // Registrar auditoría incluso si hay error (si no se especifica skipOnError)
        if (!options.skipOnError) {
          const metadata = options.metadata
            ? options.metadata(args, undefined)
            : undefined;

          auditService
            .logAction(
              options.action,
              options.module,
              options.entityType,
              options.extractEntityId?.(args, undefined),
              undefined,
              {
                ...metadata,
                method: propertyKey,
                className: target.constructor?.name || "Unknown",
                error: err instanceof Error ? err.message : String(err),
              }
            )
            .catch((auditError) => {
              console.warn(
                `⚠️ Error al registrar auditoría para ${propertyKey}:`,
                auditError
              );
            });
        }

        throw err;
      }
    };

    return descriptor;
  };
}

/**
 * Opciones para el decorador @AuditModel
 */
export interface AuditModelOptions {
  module: AuditModule;
  entityType: string;
  autoAudit?: {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    read?: boolean;
  };
}

/**
 * Decorador para auditar automáticamente operaciones CRUD en modelos/clases
 * 
 * @example
 * ```typescript
 * @AuditModel({
 *   module: "boom",
 *   entityType: "Boom",
 *   autoAudit: {
 *     create: true,
 *     update: true,
 *     delete: true,
 *   },
 * })
 * class BoomModel {
 *   // ... métodos CRUD
 * }
 * ```
 */
export function AuditModel(options: AuditModelOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        // Interceptar métodos si están habilitados
        if (options.autoAudit?.create) {
          const originalCreate = (this as any).create;
          if (originalCreate && typeof originalCreate === "function") {
            (this as any).create = async function (...args: any[]) {
              const result = await originalCreate.apply(this, args);
              await auditService.logAction(
                "CREATE",
                options.module,
                options.entityType,
                result?.id,
                { after: result }
              );
              return result;
            };
          }
        }

        if (options.autoAudit?.update) {
          const originalUpdate = (this as any).update;
          if (originalUpdate && typeof originalUpdate === "function") {
            (this as any).update = async function (...args: any[]) {
              const [id, oldData] = args;
              const result = await originalUpdate.apply(this, args);
              await auditService.logAction(
                "UPDATE",
                options.module,
                options.entityType,
                id,
                { before: oldData, after: result }
              );
              return result;
            };
          }
        }

        if (options.autoAudit?.delete) {
          const originalDelete = (this as any).delete;
          if (originalDelete && typeof originalDelete === "function") {
            (this as any).delete = async function (...args: any[]) {
              const [id] = args;
              const oldData = await (this as any).getById?.(id);
              const result = await originalDelete.apply(this, args);
              await auditService.logAction(
                "DELETE",
                options.module,
                options.entityType,
                id,
                { before: oldData }
              );
              return result;
            };
          }
        }

        if (options.autoAudit?.read) {
          const originalRead = (this as any).read;
          if (originalRead && typeof originalRead === "function") {
            (this as any).read = async function (...args: any[]) {
              const result = await originalRead.apply(this, args);
              await auditService.logAction(
                "READ",
                options.module,
                options.entityType,
                args[0]?.id,
                undefined,
                { accessed: true }
              );
              return result;
            };
          }
        }
      }
    };
  };
}

/**
 * Helper para extraer entityId común desde resultados de Amplify
 */
export function extractIdFromResult(
  args: any[],
  result?: any
): string | undefined {
  if (result?.id) return result.id;
  if (result?.data?.id) return result.data.id;
  if (args[0]?.id) return args[0].id;
  if (typeof args[0] === "string") return args[0];
  return undefined;
}

/**
 * Helper para extraer datos antes/después común
 */
export function extractDataFromResult(
  args: any[],
  result?: any
): { before?: any; after?: any } {
  return {
    after: result?.data || result,
    before: args[0],
  };
}

