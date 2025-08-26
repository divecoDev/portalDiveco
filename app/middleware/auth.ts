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

    console.log("Usuario autenticado correctamente");
    return;
  } catch (error) {
    console.error("Error en middleware auth:", error);

    // Si hay un error de autenticación, redirigir al login
    if (
      error?.name === "NotAuthenticatedException" ||
      error?.name === "NoCurrentUserException"
    ) {
      console.log("Error de autenticación, redirigiendo al login...");
      return navigateTo("/");
    }

    // Para otros errores, mostrar página de error
    throw createError({
      statusCode: 500,
      statusMessage: "Error interno del servidor",
      fatal: true,
    });
  }
});

