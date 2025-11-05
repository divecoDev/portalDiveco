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
    console.log("  - userId:", user.userId);
    console.log("  - username:", user.username);
    
    // Llamar a checkAuth() para registrar auditoría de login si es necesario
    try {
      const { useAuth } = await import("~/composables/useAuth");
      const { checkAuth } = useAuth();
      
      console.log("🔍 Ejecutando checkAuth() en middleware...");
      await checkAuth().then(() => {
        console.log("✅ checkAuth() completado en middleware");
      }).catch((authError) => {
        // No bloquear la navegación si falla checkAuth
        console.error("❌ Error al ejecutar checkAuth en middleware:", authError);
        console.error("  - Error completo:", JSON.stringify(authError, null, 2));
      });
    } catch (authError) {
      // No bloquear la navegación si falla checkAuth
      console.error("❌ Error al importar/ejecutar checkAuth en middleware:", authError);
      console.error("  - Error completo:", JSON.stringify(authError, null, 2));
    }
    
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
