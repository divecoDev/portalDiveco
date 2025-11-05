/**
 * Middleware de Auditoría para Rutas
 * Registra automáticamente accesos a rutas específicas
 */

/**
 * Configuración de auditoría para una ruta
 */
export interface AuditRouteConfig {
  module: string;
  action?: "READ" | "CREATE" | "UPDATE" | "DELETE";
  entityType?: string;
  extractEntityId?: (route: any) => string | undefined;
  skipOnError?: boolean;
  metadata?: (route: any) => Record<string, any>;
}

/**
 * Configuración global de rutas a auditar
 * Mapea rutas o patrones de rutas a configuración de auditoría
 */
const auditRouteConfig: Map<string | RegExp, AuditRouteConfig> = new Map();

/**
 * Registra una ruta para auditoría automática
 * 
 * @example
 * ```typescript
 * import { registerAuditRoute } from "~/middleware/audit-route";
 * 
 * registerAuditRoute("/admin/users", {
 *   module: "admin-users",
 *   action: "READ",
 *   entityType: "User",
 * });
 * 
 * registerAuditRoute(/^\/tools\/boom\/\d+$/, {
 *   module: "boom",
 *   action: "READ",
 *   entityType: "Boom",
 *   extractEntityId: (route) => route.params.id,
 * });
 * ```
 */
export function registerAuditRoute(
  path: string | RegExp,
  config: AuditRouteConfig
) {
  auditRouteConfig.set(path, config);
}

/**
 * Obtiene la configuración de auditoría para una ruta
 */
function getAuditConfig(path: string): AuditRouteConfig | null {
  for (const [pattern, config] of auditRouteConfig.entries()) {
    if (typeof pattern === "string") {
      if (path === pattern || path.startsWith(pattern)) {
        return config;
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(path)) {
        return config;
      }
    }
  }
  return null;
}

/**
 * Middleware de Nuxt para auditoría de rutas
 * Este middleware es opcional y debe ser aplicado manualmente en las páginas
 * Ejemplo: definePageMeta({ middleware: ['audit-route'] })
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el lado del cliente
  if (!process.client) return;

  const config = getAuditConfig(to.path);

  if (!config) {
    return; // No auditar esta ruta
  }

  try {
    // Importar dinámicamente para evitar problemas de inicialización
    const { useAudit } = await import("~/composables/useAudit");
    const { logAction } = useAudit();

    // Extraer entityId si hay extractor
    const entityId = config.extractEntityId
      ? config.extractEntityId(to)
      : undefined;

    // Extraer metadata si hay extractor
    const metadata = config.metadata
      ? config.metadata(to)
      : {
          route: to.path,
          from: from.path,
          query: to.query,
          params: to.params,
        };

    // Registrar auditoría (en background, no bloquear navegación)
    logAction(
      config.action || "READ",
      config.module as any,
      config.entityType || "Route",
      entityId,
      undefined,
      metadata
    ).catch((error) => {
      if (!config.skipOnError) {
        console.warn(
          `⚠️ Error al registrar auditoría de ruta ${to.path}:`,
          error
        );
      }
    });
  } catch (error) {
    if (!config.skipOnError) {
      console.warn(
        `⚠️ Error al procesar auditoría de ruta ${to.path}:`,
        error
      );
    }
  }
});

/**
 * Configuración inicial de rutas comunes
 * Puedes agregar más rutas aquí o usar registerAuditRoute en tus componentes
 */
if (process.client) {
  // Ejemplo: Auditar acceso a herramientas
  registerAuditRoute("/tools/explosion-materiales", {
    module: "boom",
    action: "READ",
    entityType: "BoomList",
  });

  registerAuditRoute(/^\/tools\/explosion-materiales\/\d+$/, {
    module: "boom",
    action: "READ",
    entityType: "Boom",
    extractEntityId: (route) => route.params.id as string,
  });

  registerAuditRoute("/tools/suic", {
    module: "suic",
    action: "READ",
    entityType: "SuicList",
  });

  registerAuditRoute("/admin/users", {
    module: "admin-users",
    action: "READ",
    entityType: "UserList",
  });

  registerAuditRoute("/tools/auditoria", {
    module: "audit",
    action: "READ",
    entityType: "AuditLog",
  });
}

