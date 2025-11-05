<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { onMounted, h, defineComponent } from "vue";

import { signInWithRedirect } from "aws-amplify/auth";

import { I18n } from "aws-amplify/utils";
import { translations } from "@aws-amplify/ui-vue";
I18n.putVocabularies(translations);
I18n.setLanguage("es");

// Función para manejar el inicio de sesión con Microsoft Entra ID
const handleMicrosoftSignIn = async () => {
  try {
    await signInWithRedirect({
      provider: { custom: "MicrosoftEntraIDSAML" },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

const handleNovaFinanzasSignIn = async () => {
  try {
    await signInWithRedirect({
      provider: { custom: "NovaFinanzaz" },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

// Componente funcional para ejecutar checkAuth cuando el usuario está autenticado
const AuthenticatedContent = defineComponent({
  async setup() {
    // Registrar onMounted ANTES del primer await
    onMounted(async () => {
      console.log("🔐 AuthenticatedContent montado, ejecutando checkAuth()...");
      
      // Esperar un poco para asegurar que Amplify esté completamente configurado
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        // Verificar usuario antes de ejecutar checkAuth
        const { getCurrentUser } = await import("aws-amplify/auth");
        const user = await getCurrentUser();
        
        if (user) {
          console.log("✅ Usuario autenticado en AuthenticatedContent, ejecutando checkAuth()...");
          console.log("  - userId:", user.userId);
          console.log("  - username:", user.username);
          
          // Ejecutar checkAuth() cuando el componente se monta (usuario autenticado)
          const { useAuth } = await import("~/composables/useAuth");
          const { checkAuth } = useAuth();
          
          // Ejecutar checkAuth en background (no bloquear)
          checkAuth().then(() => {
            console.log("✅ checkAuth() completado en AuthenticatedContent");
          }).catch((error) => {
            console.error("❌ Error al ejecutar checkAuth en AuthenticatedContent:", error);
            console.error("  - Error completo:", JSON.stringify(error, null, 2));
          });
        } else {
          console.log("ℹ️ No hay usuario autenticado en AuthenticatedContent");
        }
      } catch (error: any) {
        // Si no hay usuario autenticado, no es un error
        if (
          error?.name === "NotAuthenticatedException" ||
          error?.name === "NoCurrentUserException"
        ) {
          console.log("ℹ️ No hay usuario autenticado en AuthenticatedContent (esperado)");
        } else {
          console.error("❌ Error al ejecutar checkAuth en AuthenticatedContent:", error);
          console.error("  - Error completo:", JSON.stringify(error, null, 2));
        }
      }
    });

    return () => h("div", { style: "display: none;" }); // Componente invisible que solo ejecuta lógica
  },
});
</script>

<template>
  <div class="bg-gradient-diveco h-screen">
    <authenticator :hide-sign-up="true">
      <template v-slot:header>
        <div style="text-align: center">
          <img class="w-64 mx-auto" alt="Amplify logo" src="/logo.png" />
        </div>

        <div style="bottom: -13px; position: relative">
          <img class="w-64 mx-auto" alt="Amplify logo" src="/personajes.png" />
        </div>
      </template>

      <template v-slot:footer>
        <div class="flex w-full pt-4 gap-4">
          <button
            id="diveco-button"
            data-testid="diveco-button"
            @click="handleMicrosoftSignIn"
            class="group relative w-full px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300/50 overflow-hidden cursor-pointer"
          >
            <!-- Efecto de brillo en hover -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
            ></div>

            <!-- Efecto de overlay sutil -->
            <div
              class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"
            ></div>

            <!-- Contenido del botón -->
            <div class="relative flex items-center justify-center space-x-2">
              <!-- Ícono de Microsoft mejorado -->
              <div
                class="w-5 h-5 bg-white/20 rounded-md p-0.5 backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300"
              >
                <svg
                  class="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                  />
                </svg>
              </div>

              <!-- Texto del botón -->
              <span
                class="font-semibold text-base tracking-wide group-hover:tracking-wider transition-all duration-300"
                >DIVECO</span
              >
            </div>
          </button>

          <button
            @click="handleNovaFinanzasSignIn"
            class="group relative w-full px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700 transition-all duration-300 ease-out shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300/50 overflow-hidden cursor-pointer"
          >
            <!-- Efecto de brillo en hover -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
            ></div>

            <!-- Efecto de overlay sutil -->
            <div
              class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"
            ></div>

            <!-- Contenido del botón -->
            <div class="relative flex items-center justify-center space-x-2">
              <!-- Ícono de Microsoft mejorado -->
              <div
                class="w-5 h-5 bg-white/20 rounded-md p-0.5 backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300"
              >
                <svg
                  class="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                  />
                </svg>
              </div>

              <!-- Texto del botón -->
              <span
                class="font-semibold text-base tracking-wide group-hover:tracking-wider transition-all duration-300"
                >Nova Finanzas</span
              >
            </div>
          </button>
        </div>
      </template>

      <template v-slot>
        <!-- Componente para ejecutar checkAuth cuando el usuario está autenticado -->
        <AuthenticatedContent />
        
        <div class="bg-white min-h-screen">
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </div>
      </template>
    </authenticator>
  </div>
</template>

<style>
[data-amplify-container] {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Centrar los elementos internos del contenedor de Amplify */
[data-amplify-container] > * {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Centrar los campos de entrada */
[data-amplify-container] [data-amplify-input] {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
