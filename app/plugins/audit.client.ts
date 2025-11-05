/**
 * Plugin de auditoría automática mejorado
 * Proporciona utilidades para registrar auditoría de forma sencilla
 */

import { auditService } from "~/services/audit.service";
import type { AuditModule } from "~/domain/audit/types";
import { createSimpleAuditHelper, wrapWithAudit } from "~/utils/audit-integration-helpers";

/**
 * Configuración de modelos a auditar automáticamente
 */
const AUTO_AUDIT_MODELS: Record<string, AuditModule> = {
  Boom: "boom",
  SUIC: "suic",
  Cobertura: "boom",
  AuditLog: "audit",
  SapUserActionHistory: "admin-users",
  // Agregar más modelos según sea necesario
};

/**
 * Determina el módulo de auditoría desde el nombre del modelo
 */
function getModuleFromModel(modelName: string): AuditModule | null {
  return AUTO_AUDIT_MODELS[modelName] || null;
}

export default defineNuxtPlugin(() => {
  // Solo ejecutar en el lado del cliente
  if (!process.client) return;

  console.log("✅ Plugin de auditoría cargado");

  // Exportar utilidades para usar en componentes
  return {
    provide: {
      audit: {
        /**
         * Registra auditoría automáticamente para un modelo
         * @deprecated Usar auditService directamente o los helpers de integración
         */
        async autoLog(
          modelName: string,
          action: "CREATE" | "UPDATE" | "DELETE",
          entityId: string,
          oldData?: any,
          newData?: any,
          metadata?: Record<string, any>
        ) {
          const module = getModuleFromModel(modelName);

          if (!module) {
            console.debug(
              `⚠️ Modelo ${modelName} no está configurado para auditoría automática`
            );
            return { success: false, error: "Modelo no configurado" };
          }

          try {
            const result = await auditService.logAction(
              action,
              module,
              modelName,
              entityId,
              { before: oldData, after: newData },
              metadata
            );

            if (result.success) {
              console.debug(
                `✅ Auditoría registrada: ${action} en ${modelName} (${entityId})`
              );
            } else {
              console.warn(`⚠️ Error al registrar auditoría: ${result.error}`);
            }

            return result;
          } catch (error: any) {
            console.error(`❌ Error al registrar auditoría automática:`, error);
            return {
              success: false,
              error: error.message || "Error desconocido",
            };
          }
        },

        /**
         * Crea un helper simple de auditoría para un módulo
         * @example
         * const boomAudit = $audit.helper('boom', 'Boom');
         * await boomAudit.create(newBoom);
         * await boomAudit.update(oldBoom, newBoom);
         */
        helper(module: AuditModule, entityType: string) {
          return createSimpleAuditHelper({ module, entityType });
        },

        /**
         * Envuelve una función con auditoría automática
         * @example
         * const createUser = $audit.wrap(
         *   async (data) => { return await createUserData(data); },
         *   {
         *     action: 'CREATE',
         *     module: 'admin-users',
         *     entityType: 'User',
         *   }
         * );
         */
        wrap: wrapWithAudit,

        /**
         * Servicio de auditoría completo
         */
        service: auditService,
      },
    },
  };
});

