/**
 * Configuración centralizada de roles y permisos
 * Este archivo define los roles disponibles y sus permisos asociados
 */

export interface RoleConfig {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
}

export interface PermissionConfig {
  name: string;
  displayName: string;
  description: string;
  routes: string[];
}

// Definición de roles disponibles
export const ROLES: Record<string, RoleConfig> = {
  ADMIN: {
    name: "ADMIN",
    displayName: "Administrador",
    description: "Acceso completo a todas las funcionalidades del sistema",
    permissions: ["*"], // Todos los permisos
    color: "red",
    icon: "i-heroicons-shield-check",
  },
  MANAGER: {
    name: "MANAGER",
    displayName: "Gerente",
    description: "Acceso a funcionalidades de gestión y reportes",
    permissions: ["view_reports", "manage_users", "view_analytics"],
    color: "blue",
    icon: "i-heroicons-user-group",
  },
  USER: {
    name: "USER",
    displayName: "Usuario",
    description: "Acceso básico a funcionalidades del sistema",
    permissions: ["view_dashboard", "edit_profile"],
    color: "green",
    icon: "i-heroicons-user",
  },
  EXPLOSION: {
    name: "EXPLOSION",
    displayName: "Explosión de Materiales",
    description: "Acceso a la herramienta de explosión de materiales",
    permissions: ["view_explosion"],
    color: "cyan",
    icon: "i-heroicons-sparkles",
  },
  REVISAR_EXPLOSION: {
    name: "REVISAR-EXPLOSION",
    displayName: "Revisor de Explosión",
    description: "Acceso de solo lectura a documentos de explosión habilitados",
    permissions: ["view_explosion_documents"],
    color: "purple",
    icon: "i-heroicons-document-magnifying-glass",
  },
  ADMINISTRAR_SUIC: {
    name: "ADMINISTRAR-SUIC",
    displayName: "Administrador SUIC",
    description: "Acceso completo a la herramienta SUIC para gestión de cargas",
    permissions: ["administrar_suic"],
    color: "emerald",
    icon: "i-heroicons-chart-bar",
  },
  ADMINISTRAR_RPA_HORARIOS: {
    name: "ADMINISTRAR-RPA-HORARIOS",
    displayName: "Administrador Horarios RPA",
    description: "Acceso completo a la gestión de ventanas de ejecución de RPA",
    permissions: ["administrar_rpa_horarios"],
    color: "cyan",
    icon: "i-heroicons-clock",
  },
};

// Definición de permisos disponibles
export const PERMISSIONS: Record<string, PermissionConfig> = {
  // Permisos de administración
  manage_sap_passwords: {
    name: "manage_sap_passwords",
    displayName: "Gestionar Contraseñas SAP",
    description: "Permite reiniciar contraseñas y desbloquear usuarios SAP",
    routes: ["/tools/contrasenias-sap"],
  },

  // Permisos de usuarios
  manage_users: {
    name: "manage_users",
    displayName: "Gestionar Usuarios",
    description: "Permite crear, editar y eliminar usuarios del sistema",
    routes: ["/admin/users", "/admin/users/create", "/admin/users/:id"],
  },

  // Permisos de reportes
  view_reports: {
    name: "view_reports",
    displayName: "Ver Reportes",
    description: "Permite acceder a reportes y estadísticas del sistema",
    routes: ["/reports", "/analytics"],
  },

  // Permisos básicos
  view_dashboard: {
    name: "view_dashboard",
    displayName: "Ver Dashboard",
    description: "Permite acceder al dashboard principal",
    routes: ["/"],
  },

  edit_profile: {
    name: "edit_profile",
    displayName: "Editar Perfil",
    description: "Permite editar el perfil propio del usuario",
    routes: ["/perfil", "/configuracion"],
  },
  view_explosion: {
    name: "view_explosion",
    displayName: "Explosión de Materiales",
    description: "Permite acceder a la herramienta de explosión de materiales",
    routes: [
      "/tools/explosion-materiales",
      "/tools/explosion-materiales/new",
      "/tools/explosion-materiales/edit/:id",
      "/tools/explosion-materiales/view/:id",
    ],
  },
  view_explosion_documents: {
    name: "view_explosion_documents",
    displayName: "Ver Documentos de Explosión",
    description: "Permite acceder solo a documentos habilitados de explosión",
    routes: [
      "/tools/explosion-materiales",
      "/tools/explosion-materiales/documents/:id"
    ],
  },
  administrar_suic: {
    name: "administrar_suic",
    displayName: "Administrar SUIC",
    description: "Permite acceder a la herramienta SUIC para gestión de cargas",
    routes: [
      "/tools/suic",
      "/tools/suic/new",
      "/tools/suic/view/:id",
      "/tools/suic/edit/:id"
    ],
  },
  administrar_rpa_horarios: {
    name: "administrar_rpa_horarios",
    displayName: "Administrar Horarios RPA",
    description: "Permite gestionar ventanas de ejecución de RPA y horarios de bloqueo",
    routes: [
      "/tools/rpa-horarios",
      "/tools/rpa-horarios/new",
      "/tools/rpa-horarios/edit/:id",
    ],
  },
  view_audit: {
    name: "view_audit",
    displayName: "Ver Auditoría",
    description: "Permite acceder al módulo de auditoría y logs del sistema",
    routes: [
      "/tools/auditoria",
      "/tools/auditoria/:id"
    ],
  },
};

// Función para verificar si un rol tiene un permiso específico
export function hasPermission(
  roleName: string,
  permissionName: string,
): boolean {
  const role = ROLES[roleName];
  if (!role) return false;

  // Si el rol tiene todos los permisos (*), retornar true
  if (role.permissions.includes("*")) return true;

  return role.permissions.includes(permissionName);
}

// Función para verificar si un rol puede acceder a una ruta específica
export function canAccessRoute(roleName: string, route: string): boolean {
  const role = ROLES[roleName];
  if (!role) return false;

  // Si el rol tiene todos los permisos (*), retornar true
  if (role.permissions.includes("*")) return true;

  // Verificar si alguno de los permisos del rol incluye la ruta
  return role.permissions.some((permissionName) => {
    const permission = PERMISSIONS[permissionName];
    return (
      permission &&
      permission.routes.some((permissionRoute) => {
        // Convertir rutas con parámetros a regex para comparación
        const routeRegex = new RegExp(
          "^" + permissionRoute.replace(/:[^/]+/g, "[^/]+") + "$",
        );
        return routeRegex.test(route);
      })
    );
  });
}

// Función para obtener el rol más alto de un usuario
export function getHighestRole(userRoles: string[]): string | null {
  const roleHierarchy = ["ADMIN", "MANAGER", "USER"];

  for (const role of roleHierarchy) {
    if (userRoles.includes(role)) {
      return role;
    }
  }

  return null;
}

// Función para obtener el nombre de visualización de un rol
export function getRoleDisplayName(roleName: string): string {
  return ROLES[roleName]?.displayName || roleName;
}

// Función para obtener el color de un rol
export function getRoleColor(roleName: string): string {
  return ROLES[roleName]?.color || "gray";
}

// Función para obtener el icono de un rol
export function getRoleIcon(roleName: string): string {
  return ROLES[roleName]?.icon || "i-heroicons-user";
}
