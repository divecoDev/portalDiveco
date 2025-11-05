/**
 * Plugin para verificar autenticación y registrar auditoría de login al cargar la aplicación
 * Se ejecuta cuando la aplicación se monta en el cliente
 */

export default defineNuxtPlugin({
  name: "auth-check",
  enforce: "pre", // Ejecutar antes de otros plugins para asegurar que Amplify esté configurado
  async setup() {
    // Solo ejecutar en el cliente
    if (process.server) {
      return;
    }

    console.log("🔍 Plugin auth-check iniciado...");

    // Esperar un poco para asegurar que Amplify esté completamente configurado
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Verificar si hay un usuario autenticado
      const { getCurrentUser } = await import("aws-amplify/auth");
      
      try {
        const user = await getCurrentUser();
        
        if (user) {
          console.log("✅ Usuario autenticado detectado en plugin, ejecutando checkAuth()...");
          console.log("  - userId:", user.userId);
          console.log("  - username:", user.username);
          
          // Llamar a checkAuth() para registrar el login si es necesario
          const { useAuth } = await import("~/composables/useAuth");
          const { checkAuth } = useAuth();
          
          // Ejecutar checkAuth en background (no bloquear)
          checkAuth().then(() => {
            console.log("✅ checkAuth() completado en plugin auth-check");
          }).catch((error) => {
            console.error("❌ Error al ejecutar checkAuth en plugin:", error);
            console.error("  - Error completo:", JSON.stringify(error, null, 2));
          });
        } else {
          console.log("ℹ️ No hay usuario autenticado en plugin");
        }
      } catch (authError: any) {
        // Si no hay usuario autenticado, no es un error
        if (
          authError?.name === "NotAuthenticatedException" ||
          authError?.name === "NoCurrentUserException"
        ) {
          console.log("ℹ️ No hay usuario autenticado en plugin (esperado)");
        } else {
          console.warn("⚠️ Error al verificar usuario en plugin:", authError);
          console.warn("  - Error completo:", JSON.stringify(authError, null, 2));
        }
      }
    } catch (error) {
      console.error("❌ Error en plugin auth-check:", error);
      console.error("  - Error completo:", JSON.stringify(error, null, 2));
    }
  },
});

