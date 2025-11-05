import { ref, computed, readonly } from "vue";
import { getCurrentUser } from "aws-amplify/auth";
import { useUserGroups } from "./useUserGroups";
import {
  PERMISSIONS,
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

  // Estado para rastrear si ya se registró el login en esta sesión
  // Usar sessionStorage para persistir entre recargas de página
  const getLastLoggedUserId = (): string | null => {
    if (process.client) {
      return sessionStorage.getItem("lastLoggedUserId");
    }
    return null;
  };

  const setLastLoggedUserId = (userId: string | null): void => {
    if (process.client) {
      if (userId) {
        sessionStorage.setItem("lastLoggedUserId", userId);
      } else {
        sessionStorage.removeItem("lastLoggedUserId");
      }
    }
  };

  const lastLoggedUserId = ref<string | null>(getLastLoggedUserId());

  // Bandera para evitar ejecuciones concurrentes de checkAuth
  let isCheckingAuth = false;

  // Métodos
  const checkAuth = async () => {
    // Evitar ejecuciones concurrentes
    if (isCheckingAuth) {
      console.log("⏸️ checkAuth() ya está en ejecución, omitiendo...");
      return;
    }

    isCheckingAuth = true;
    console.log("🔍 checkAuth() ejecutándose...");

    try {
      const user = await getCurrentUser();
      const previousUserId = currentUser.value?.userId;
      const isNewLogin = previousUserId !== user.userId || !currentUser.value;

      console.log("🔍 checkAuth() - Información del usuario:", {
        userId: user.userId,
        previousUserId,
        isNewLogin,
        hasCurrentUser: !!currentUser.value,
      });

      // Actualizar el usuario actual ANTES de verificar login para auditoría
      // Esto asegura que tengamos el usuario disponible para la auditoría

      currentUser.value = user;
      isAuthenticated.value = true;

      // Intentar cargar grupos del usuario (puede fallar para usuarios con contraseña)
      try {
        await fetchUserGroups();
      } catch (groupError) {
        console.warn("🔐 Usuario autenticado sin grupos de Cognito:", groupError?.message);
        // Continuar sin grupos - usuario básico autenticado
      }

      // Obtener el rol principal
      userRole.value = getUserRole();

      // Determinar permisos basados en el rol
      if (isAdmin.value) {
        userPermissions.value = ["*"]; // Todos los permisos
      } else if (userGroups.value.length === 0) {
        // Usuario sin grupos - permisos básicos
        console.info("🔐 Usuario autenticado sin grupos - asignando permisos básicos");
        userPermissions.value = ["view_dashboard", "edit_profile"];
      } else {
        userPermissions.value = [];
        // Agregar permisos específicos según el rol
        if (isManager.value) {
          userPermissions.value.push(
            "view_reports",
            "manage_users",
            "view_analytics",
          );
        }
        if (isUser.value) {
          userPermissions.value.push("view_dashboard", "edit_profile");
        }
      }

            // Registrar auditoría de login si no se ha registrado para este userId en esta sesión
      // Usar sessionStorage para evitar duplicados en recargas de página o navegación
      const storedLastLoggedUserId = getLastLoggedUserId();

      // Verificar si es un login genuino:
      // 1. Es el primer acceso (no hay userId almacenado en sessionStorage) - primera vez en esta sesión del navegador
      // 2. Es un usuario diferente al almacenado - cambio de usuario
      // NO registramos si:
      // - Ya hay un userId almacenado que coincide con el actual (ya se registró el login en esta sesión)
      const isFirstAccess = !storedLastLoggedUserId;
      const isDifferentUser = storedLastLoggedUserId && storedLastLoggedUserId !== user.userId;

      // Solo registrar login si es primer acceso O cambio de usuario
      // Esto evita registrar múltiples veces en refrescos o navegación
      const shouldLogLogin = isFirstAccess || isDifferentUser;

      console.log("🔍 checkAuth() - Verificación de login para auditoría:");
      console.log("  - userId:", user.userId);
      console.log("  - storedLastLoggedUserId:", storedLastLoggedUserId);
      console.log("  - isFirstAccess:", isFirstAccess);
      console.log("  - isDifferentUser:", isDifferentUser);
      console.log("  - shouldLogLogin:", shouldLogLogin);
      
      // Registrar auditoría de login si es necesario
      if (shouldLogLogin) {
        console.log("🔐 Login detectado, registrando auditoría...");
        console.log("  - userId:", user.userId);
        console.log("  - userEmail:", user.signInDetails?.loginId || user.username || "unknown");
        console.log("  - userRole:", userRole.value);
        console.log("  - userGroups:", userGroups.value.map((g) => g.GroupName));
        
        // Actualizar el userId almacenado ANTES de registrar (para evitar duplicados)
        setLastLoggedUserId(user.userId);
        lastLoggedUserId.value = user.userId;
        
        try {
          const { useAudit } = await import("~/composables/useAudit");
          const { logLogin } = useAudit();
          
          console.log("📞 Llamando a logLogin...");
          const rawEmail = user.signInDetails?.loginId || user.username || "unknown";
          const { normalizeAuthIdentifier } = await import("~/utils/audit-helpers");
          
          // Preparar metadata de login, manejando el caso donde los grupos aún no están cargados
          const loginMetadata: Record<string, any> = {
            userEmail: normalizeAuthIdentifier(rawEmail),
            loginMethod: "Microsoft Entra ID SAML",
          };
          
          // Agregar userRole solo si está disponible
          if (userRole.value) {
            loginMetadata.userRole = userRole.value;
          }
          
          // Agregar userGroups solo si están disponibles
          if (userGroups.value && userGroups.value.length > 0) {
            loginMetadata.userGroups = userGroups.value.map((g) => g.GroupName);
          } else {
            console.warn("⚠️ Grupos de usuario no disponibles aún, registrando login sin grupos");
            loginMetadata.userGroups = [];
          }

          const loginResult = await logLogin(user.userId, loginMetadata);
          
          console.log("📥 Resultado de logLogin:", loginResult);
          
          if (loginResult.success) {
            console.log("✅ Auditoría de login registrada exitosamente:", loginResult.logId);
          } else {
            console.error("❌ Error al registrar auditoría de login:", loginResult.error);
            // Si falla, limpiar el userId almacenado para intentar de nuevo en la próxima vez
            setLastLoggedUserId(null);
            lastLoggedUserId.value = null;
          }
        } catch (auditError: any) {
          // No bloquear autenticación si falla la auditoría
          console.error("❌ Error al registrar auditoría de login:", auditError);
          console.error("  - Error completo:", JSON.stringify(auditError, null, 2));
          console.error("  - Stack:", auditError?.stack);
          // Si falla, limpiar el userId almacenado para intentar de nuevo en la próxima vez
          setLastLoggedUserId(null);
          lastLoggedUserId.value = null;
        }
      } else {
        console.debug("🔐 Login ya registrado en esta sesión, omitiendo auditoría", {
          userId: user.userId,
          storedLastLoggedUserId,
        });
      }

      return true;
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      isAuthenticated.value = false;
      currentUser.value = null;
      userRole.value = "";
      userPermissions.value = [];
      setLastLoggedUserId(null);
      lastLoggedUserId.value = null;
      return false;
    } finally {
      // Resetear la bandera siempre, incluso si hay error
      isCheckingAuth = false;
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
            "^" + permissionRoute.replace(/:[^/]+/g, "[^/]+") + "$",
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
      // Obtener información del usuario antes de cerrar sesión
      const userId = currentUser.value?.userId || "unknown";
      const rawEmail = currentUser.value?.signInDetails?.loginId || 
                       currentUser.value?.username || 
                       "unknown";
      const { normalizeAuthIdentifier } = await import("~/utils/audit-helpers");
      const userEmail = normalizeAuthIdentifier(rawEmail);

      // Registrar auditoría de logout (en background, no bloquear)
      console.log("🚪 Cerrando sesión, registrando auditoría...", { userId, userEmail });
      
      try {
        const { useAudit } = await import("~/composables/useAudit");
        const { logLogout } = useAudit();
        
        const logoutResult = await logLogout(userId, {
          userRole: userRole.value,
          userEmail,
          userGroups: userGroups.value.map((g) => g.GroupName),
          logoutMethod: "Manual",
        });
        
        if (logoutResult.success) {
          console.log("✅ Auditoría de logout registrada exitosamente:", logoutResult.logId);
        } else {
          console.warn("⚠️ Error al registrar auditoría de logout:", logoutResult.error);
        }
      } catch (auditError) {
        // No bloquear logout si falla la auditoría
        console.error("❌ Error al registrar auditoría de logout:", auditError);
      }

      // Limpiar estado de login registrado ANTES de cerrar sesión
      // Esto permite que el próximo login se registre correctamente
      setLastLoggedUserId(null);
      lastLoggedUserId.value = null;
      
      console.log("🧹 Limpiado lastLoggedUserId antes de cerrar sesión");

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
