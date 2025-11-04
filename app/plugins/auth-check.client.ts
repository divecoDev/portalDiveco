/**
 * Plugin para verificar autenticación y registrar auditoría de login al cargar la aplicación
 * Se ejecuta cuando la aplicación se monta en el cliente
 */

export default defineNuxtPlugin({
  name: "auth-check",
  enforce: "post", // Ejecutar después de otros plugins
  async setup() {
    // Solo ejecutar en el cliente
    if (process.server) {
      return;
    }

    console.log("🔍 Plugin auth-check iniciado...");

    try {
      // Verificar si hay un usuario autenticado
      const { getCurrentUser } = await import("aws-amplify/auth");
      
      try {
        const user = await getCurrentUser();
        
        if (user) {
          console.log("✅ Usuario autenticado detectado en plugin, ejecutando checkAuth()...");
          
          // Llamar a checkAuth() para registrar el login si es necesario
          const { useAuth } = await import("~/composables/useAuth");
          const { checkAuth } = useAuth();
          
          // Ejecutar checkAuth en background (no bloquear)
          checkAuth().catch((error) => {
            console.warn("⚠️ Error al ejecutar checkAuth en plugin:", error);
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
        }
      }
    } catch (error) {
      console.warn("⚠️ Error en plugin auth-check:", error);
    }
  },
});

