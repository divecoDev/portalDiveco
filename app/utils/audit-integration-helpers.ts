/**
 * Helpers de Integración para Auditoría
 * Funciones utilitarias para facilitar la integración de auditoría
 */

import { auditService } from "~/services/audit.service";
import type { AuditAction, AuditModule } from "~/domain/audit/types";
import { detectChanges } from "~/domain/audit/audit-domain.service";

/**
 * Opciones para wrapWithAudit
 */
export interface WrapWithAuditOptions {
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  extractEntityId?: (args: any[], result?: any) => string | undefined;
  extractData?: (args: any[], result?: any) => { before?: any; after?: any };
  metadata?: (args: any[], result?: any) => Record<string, any>;
  skipOnError?: boolean;
}

/**
 * Envuelve una función existente con auditoría automática
 * 
 * @example
 * ```typescript
 * const createUser = wrapWithAudit(
 *   async (userData: any) => {
 *     // ... lógica de creación
 *     return newUser;
 *   },
 *   {
 *     action: "CREATE",
 *     module: "admin-users",
 *     entityType: "User",
 *     extractEntityId: (args, result) => result?.id,
 *     extractData: (args, result) => ({ after: result }),
 *   }
 * );
 * ```
 */
export function wrapWithAudit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: WrapWithAuditOptions
): T {
  return (async (...args: any[]) => {
    let result: any;
    let error: any = null;

    try {
      result = await fn(...args);

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

      // Registrar auditoría (en background)
      auditService
        .logAction(
          options.action,
          options.module,
          options.entityType,
          entityId,
          data,
          metadata
        )
        .catch((auditError) => {
          console.warn("⚠️ Error al registrar auditoría:", auditError);
        });

      return result;
    } catch (err) {
      error = err;

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
              error: err instanceof Error ? err.message : String(err),
            }
          )
          .catch((auditError) => {
            console.warn("⚠️ Error al registrar auditoría:", auditError);
          });
      }

      throw err;
    }
  }) as T;
}

/**
 * Opciones para auditModelOperation
 */
export interface AuditModelOperationOptions {
  module: AuditModule;
  entityType: string;
  extractId?: (data: any) => string | undefined;
}

/**
 * Crea funciones de auditoría para operaciones CRUD en modelos
 * 
 * @example
 * ```typescript
 * const audit = auditModelOperation({
 *   module: "boom",
 *   entityType: "Boom",
 * });
 * 
 * // Uso en operaciones
 * async function createBoom(data: any) {
 *   const result = await model.create(data);
 *   await audit.onCreate(result);
 *   return result;
 * }
 * 
 * async function updateBoom(id: string, data: any, oldData: any) {
 *   const result = await model.update(id, data);
 *   await audit.onUpdate(oldData, result);
 *   return result;
 * }
 * ```
 */
export function auditModelOperation(options: AuditModelOperationOptions) {
  return {
    onCreate: async (data: any, metadata?: Record<string, any>) => {
      const entityId = options.extractId ? options.extractId(data) : data?.id;
      await auditService.logAction(
        "CREATE",
        options.module,
        options.entityType,
        entityId,
        { after: data },
        metadata
      );
    },

    onUpdate: async (
      oldData: any,
      newData: any,
      metadata?: Record<string, any>
    ) => {
      const entityId = options.extractId
        ? options.extractId(newData)
        : newData?.id || oldData?.id;
      await auditService.logAction(
        "UPDATE",
        options.module,
        options.entityType,
        entityId,
        { before: oldData, after: newData },
        metadata
      );
    },

    onDelete: async (data: any, metadata?: Record<string, any>) => {
      const entityId = options.extractId ? options.extractId(data) : data?.id;
      await auditService.logAction(
        "DELETE",
        options.module,
        options.entityType,
        entityId,
        { before: data },
        metadata
      );
    },

    onRead: async (data: any, metadata?: Record<string, any>) => {
      const entityId = options.extractId ? options.extractId(data) : data?.id;
      await auditService.logAction(
        "READ",
        options.module,
        options.entityType,
        entityId,
        undefined,
        metadata
      );
    },
  };
}

/**
 * Opciones para createAuditWrapper
 */
export interface CreateAuditWrapperOptions {
  module: AuditModule;
  entityType: string;
  defaultAction?: AuditAction;
  extractEntityId?: (args: any[], result?: any) => string | undefined;
  extractData?: (args: any[], result?: any) => { before?: any; after?: any };
  metadata?: (args: any[], result?: any) => Record<string, any>;
}

/**
 * Crea un wrapper personalizado de auditoría
 * Útil cuando tienes múltiples funciones similares que necesitan auditoría
 * 
 * @example
 * ```typescript
 * const boomAuditWrapper = createAuditWrapper({
 *   module: "boom",
 *   entityType: "Boom",
 *   extractEntityId: (args, result) => result?.id || args[0]?.id,
 * });
 * 
 * const createBoom = boomAuditWrapper("CREATE", async (data) => {
 *   // ... lógica
 * });
 * 
 * const updateBoom = boomAuditWrapper("UPDATE", async (id, data, oldData) => {
 *   // ... lógica
 * });
 * ```
 */
export function createAuditWrapper(options: CreateAuditWrapperOptions) {
  return function <T extends (...args: any[]) => Promise<any>>(
    action: AuditAction,
    fn: T
  ): T {
    return wrapWithAudit(fn, {
      action,
      module: options.module,
      entityType: options.entityType,
      extractEntityId: options.extractEntityId,
      extractData: options.extractData,
      metadata: options.metadata,
    });
  };
}

/**
 * Helper para crear una función de auditoría simple
 * Útil para casos donde solo necesitas registrar una acción sin envolver una función
 * 
 * @example
 * ```typescript
 * const auditBoom = createSimpleAuditHelper({
 *   module: "boom",
 *   entityType: "Boom",
 * });
 * 
 * // Uso
 * await auditBoom.create(newBoom, { version: "1.0" });
 * await auditBoom.update(oldBoom, newBoom);
 * await auditBoom.delete(deletedBoom);
 * ```
 */
export function createSimpleAuditHelper(options: {
  module: AuditModule;
  entityType: string;
  extractId?: (data: any) => string | undefined;
}) {
  return {
    create: async (data: any, metadata?: Record<string, any>) => {
      const entityId = options.extractId ? options.extractId(data) : data?.id;
      await auditService.logAction(
        "CREATE",
        options.module,
        options.entityType,
        entityId,
        { after: data },
        metadata
      );
    },

    update: async (
      oldData: any,
      newData: any,
      metadata?: Record<string, any>
    ) => {
      const entityId = options.extractId
        ? options.extractId(newData)
        : newData?.id || oldData?.id;
      await auditService.logAction(
        "UPDATE",
        options.module,
        options.entityType,
        entityId,
        { before: oldData, after: newData },
        metadata
      );
    },

    delete: async (data: any, metadata?: Record<string, any>) => {
      const entityId = options.extractId ? options.extractId(data) : data?.id;
      await auditService.logAction(
        "DELETE",
        options.module,
        options.entityType,
        entityId,
        { before: data },
        metadata
      );
    },

    read: async (data: any, metadata?: Record<string, any>) => {
      const entityId = options.extractId ? options.extractId(data) : data?.id;
      await auditService.logAction(
        "READ",
        options.module,
        options.entityType,
        entityId,
        undefined,
        metadata
      );
    },
  };
}

/**
 * Helper para extraer entityId desde diferentes estructuras comunes
 */
export function extractEntityId(
  data: any,
  fallback?: string
): string | undefined {
  if (data?.id) return data.id;
  if (data?.data?.id) return data.data.id;
  if (typeof data === "string") return data;
  if (typeof fallback === "string") return fallback;
  return undefined;
}

/**
 * Helper para detectar automáticamente cambios entre dos objetos
 */
export function getChanges(before: any, after: any) {
  return detectChanges(before, after);
}

