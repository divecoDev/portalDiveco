export default defineNuxtRouteMiddleware(async (to) => {
  // Solo ejecutar en el cliente
  if (process.server) {
    return;
  }

  // Obtener el rol requerido de los parámetros de la ruta
  const requiredRole = to.meta.requiredRole;

  if (!requiredRole) {
    console.warn("No se especificó rol requerido en require-role middleware");
    return;
  }

  try {
    // Usar el composable de autenticación mejorado
    const { useAuth } = await import("~/composables/useAuth");
    const { checkAuth, requireRole } = useAuth();

    // Verificar autenticación
    const isAuth = await checkAuth();
    if (!isAuth) {
      console.log("Usuario no autenticado, redirigiendo...");
      return navigateTo("/");
    }

    // Verificar si el usuario tiene el rol requerido
    if (!requireRole(requiredRole)) {
      console.log(
        `Usuario no tiene permisos de ${requiredRole}, acceso denegado`
      );
      throw createError({
        statusCode: 403,
        statusMessage: `Acceso Denegado - Se requiere rol de ${requiredRole}`,
        fatal: true,
      });
    }

    console.log(
      `Usuario autenticado y tiene rol ${requiredRole}, acceso permitido`
    );
    return;
  } catch (error) {
    console.error(`Error en middleware require-role (${requiredRole}):`, error);

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
