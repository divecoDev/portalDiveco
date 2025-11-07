/**
 * Configuración de herramientas restringidas durante ventanas de ejecución RPA
 * 
 * Este archivo define qué rutas/herramientas deben ser bloqueadas durante
 * las ventanas de ejecución de RPA activas.
 * 
 * En el futuro, esta configuración puede migrarse a un catálogo de herramientas
 * dinámico en la base de datos.
 */

export interface RestrictedTool {
  /**
   * Rutas que deben ser bloqueadas (pueden ser rutas exactas o patrones)
   */
  routes: string[];
  
  /**
   * Nombre de la herramienta (para mensajes)
   */
  name: string;
  
  /**
   * Mensaje personalizado de bloqueo (opcional)
   * Si no se proporciona, se usa el mensaje genérico
   */
  customMessage?: string;
}

/**
 * Lista de herramientas restringidas
 * 
 * Las rutas pueden ser:
 * - Rutas exactas: "/tools/suic"
 * - Rutas con parámetros: "/tools/suic/view/:id"
 * - Patrones: "/tools/suic/*" (usar con cuidado)
 */
export const RESTRICTED_TOOLS: RestrictedTool[] = [
  // Ejemplo: SUIC (comentado hasta que se defina qué herramientas restringir)
  // {
  //   name: "SUIC",
  //   routes: [
  //     "/tools/suic",
  //     "/tools/suic/new",
  //     "/tools/suic/edit",
  //     "/tools/suic/view",
  //   ],
  //   customMessage: "La herramienta SUIC está deshabilitada temporalmente debido a la ejecución de procesos críticos de RPA.",
  // },
  
  // Ejemplo: Explosión de Materiales
  // {
  //   name: "Explosión de Materiales",
  //   routes: [
  //     "/tools/explosion-materiales",
  //     "/tools/explosion-materiales/new",
  //     "/tools/explosion-materiales/edit",
  //   ],
  // },
];

/**
 * Verifica si una ruta está en la lista de herramientas restringidas
 */
export function isRouteRestricted(route: string): RestrictedTool | null {
  for (const tool of RESTRICTED_TOOLS) {
    for (const restrictedRoute of tool.routes) {
      // Comparación exacta
      if (route === restrictedRoute) {
        return tool;
      }
      
      // Comparación con parámetros dinámicos (ej: /tools/suic/view/:id)
      const routePattern = restrictedRoute.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${routePattern}$`);
      if (regex.test(route)) {
        return tool;
      }
      
      // Comparación con wildcard (ej: /tools/suic/*)
      if (restrictedRoute.endsWith("/*")) {
        const baseRoute = restrictedRoute.slice(0, -2);
        if (route.startsWith(baseRoute)) {
          return tool;
        }
      }
    }
  }
  
  return null;
}

/**
 * Obtiene el mensaje de bloqueo para una herramienta
 */
export function getRestrictionMessage(tool: RestrictedTool | null, defaultMessage: string): string {
  if (!tool) return defaultMessage;
  return tool.customMessage || defaultMessage;
}

