import { ref, computed, readonly } from "vue";
import { getCurrentUser } from "aws-amplify/auth";
import { useUserGroups } from "./useUserGroups";
import {
  ROLES,
  PERMISSIONS,
  hasPermission,
  canAccessRoute,
  getHighestRole,
  getRoleDisplayName,
} from "~/config/roles";

export const useAuth = () => {
  const {
    userGroups,
    getUserRole,
    isLoading: isLoadingGroups,
    hasGroup,
    fetchUserGroups,
  } = useUserGroups();
  const isAuthenticated = ref(false);
  const currentUser = ref(null);
  const userRole = ref("");
  const userPermissions = ref<string[]>([]);

  // Computed properties
  const isAdmin = computed(() => hasGroup("ADMIN"));
  const isManager = computed(() => hasGroup("MANAGER"));
  const isUser = computed(() => hasGroup("USER"));

  const hasAnyRole = computed(() => userGroups.value.length > 0);
  const highestRole = computed(() => {
    if (userGroups.value.length === 0) return null;
    const roleNames = userGroups.value.map((group) => group.GroupName);
    return getHighestRole(roleNames);
  });

  const roleDisplayName = computed(() => {
    if (!userRole.value) return "Ciudadano DIVECO";
    return getRoleDisplayName(userRole.value);
  });

  // Métodos
  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      currentUser.value = user;
      isAuthenticated.value = true;

      // Cargar grupos del usuario
      await fetchUserGroups();

      // Obtener el rol principal
      userRole.value = getUserRole();

      // Determinar permisos basados en el rol
      if (isAdmin.value) {
        userPermissions.value = ["*"]; // Todos los permisos
      } else {
        userPermissions.value = [];
        // Agregar permisos específicos según el rol
        if (isManager.value) {
          userPermissions.value.push(
            "view_reports",
            "manage_users",
            "view_analytics"
          );
        }
        if (isUser.value) {
          userPermissions.value.push("view_dashboard", "edit_profile");
        }
      }

      return true;
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      isAuthenticated.value = false;
      currentUser.value = null;
      userRole.value = "";
      userPermissions.value = [];
      return false;
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    if (isAdmin.value) return true; // Admin tiene todos los permisos
    return userPermissions.value.includes(permissionName);
  };

  const canAccess = (route: string): boolean => {
    if (isAdmin.value) return true; // Admin puede acceder a todo

    // Verificar si el usuario tiene algún permiso que incluya la ruta
    return userPermissions.value.some((permissionName) => {
      const permission = PERMISSIONS[permissionName];
      return (
        permission &&
        permission.routes.some((permissionRoute) => {
          // Convertir rutas con parámetros a regex para comparación
          const routeRegex = new RegExp(
            "^" + permissionRoute.replace(/:[^/]+/g, "[^/]+") + "$"
          );
          return routeRegex.test(route);
        })
      );
    });
  };

  const requireRole = (requiredRole: string): boolean => {
    return hasGroup(requiredRole);
  };

  const requireAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((role) => hasGroup(role));
  };

  const requireAllRoles = (requiredRoles: string[]): boolean => {
    return requiredRoles.every((role) => hasGroup(role));
  };

  const logout = async () => {
    try {
      const { signOut } = await import("aws-amplify/auth");
      await signOut();

      // Limpiar estado local
      isAuthenticated.value = false;
      currentUser.value = null;
      userRole.value = "";
      userPermissions.value = [];

      // Redirigir al inicio
      await navigateTo("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  // Inicializar autenticación al montar el composable
  const init = async () => {
    await checkAuth();
  };

  return {
    // Estado
    isAuthenticated: readonly(isAuthenticated),
    currentUser: readonly(currentUser),
    userRole: readonly(userRole),
    userPermissions: readonly(userPermissions),
    isLoadingGroups: readonly(isLoadingGroups),
    userGroups: readonly(userGroups),

    // Computed
    isAdmin,
    isManager,
    isUser,
    hasAnyRole,
    highestRole,
    roleDisplayName,

    // Métodos
    checkAuth,
    hasPermission,
    canAccess,
    requireRole,
    requireAnyRole,
    requireAllRoles,
    hasGroup,
    logout,
    init,
  };
};



