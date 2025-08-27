export default defineNuxtRouteMiddleware(async (to) => {
  // Solo ejecutar en el cliente
  if (process.server) {
    return;
  }

  try {
    // Verificar si el usuario está autenticado
    const { getCurrentUser } = await import("aws-amplify/auth");
    const user = await getCurrentUser();

    if (!user) {
      // Usuario no autenticado, redirigir al login
      console.log("Usuario no autenticado, redirigiendo...");
      return navigateTo("/");
    }

    // Verificar si el usuario tiene el rol ADMIN
    const { useUserGroups } = await import("~/composables/useUserGroups");
    const { hasGroup, fetchUserGroups } = useUserGroups();

    // Asegurar que los grupos estén cargados
    await fetchUserGroups();

    if (!hasGroup("ADMIN")) {
      console.log("Usuario no tiene permisos de ADMIN, acceso denegado");
      // Usuario no es admin, mostrar error 403
      throw createError({
        statusCode: 403,
        statusMessage: "Acceso Denegado - Se requiere rol de Administrador",
        fatal: true,
      });
    }

    console.log("Usuario autenticado y es ADMIN, acceso permitido");
    // Usuario autenticado y es admin, permitir acceso
    return;
  } catch (error) {
    console.error("Error en middleware auth-admin:", error);

    // Si hay un error de autenticación, redirigir al login
    if (
      error?.name === "NotAuthenticatedException" ||
      error?.name === "NoCurrentUserException"
    ) {
      console.log("Error de autenticación, redirigiendo al login...");
      return navigateTo("/");
    }

    // Si es un error 403, no redirigir, dejar que se muestre la página de error
    if (error?.statusCode === 403) {
      throw error;
    }

    // Para otros errores, mostrar página de error
    throw createError({
      statusCode: 500,
      statusMessage: "Error interno del servidor",
      fatal: true,
    });
  }
});
