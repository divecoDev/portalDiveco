<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 flex items-center justify-center p-4"
  >
    <div class="max-w-md w-full">
      <!-- Card principal -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-cyan-400/30"
      >
        <!-- Icono de logout -->
        <div class="mb-6">
          <div
            class="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <UIcon
              name="i-heroicons-arrow-right-on-rectangle"
              class="w-10 h-10 text-white"
            />
          </div>
        </div>

        <!-- Título -->
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sesión Cerrada
        </h1>

        <!-- Mensaje -->
        <p
          class="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed"
        >
          Has cerrado sesión exitosamente del Portal DIVECO.
          <br />
          <span class="text-cyan-600 dark:text-cyan-400 font-medium">
            ¡Gracias por usar nuestros servicios!
          </span>
        </p>

        <!-- Botón para ir a la raíz -->
        <UButton
          @click="goToRoot"
          color="cyan"
          variant="solid"
          size="lg"
          class="w-full text-lg font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <UIcon name="i-heroicons-home" class="w-5 h-5 mr-2" />
          {{ isLoading ? "Redirigiendo..." : "Ir al Inicio" }}
        </UButton>

        <!-- Información adicional -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Si deseas volver a acceder, simplemente inicia sesión nuevamente.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-cyan-200 text-sm">Portal DIVECO - Sistema de Gestión</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { signOut } from "aws-amplify/auth";

// Estado reactivo
const isLoading = ref(false);

// Métodos
const logout = async () => {
  try {
    // Intentar cerrar sesión (puede que ya esté cerrada)
    try {
      await signOut();
    } catch (signOutError) {
      // Si ya está cerrada la sesión, no es un error crítico
      if (signOutError && typeof signOutError === "object" && "name" in signOutError) {
        const error = signOutError as { name: string };
        if (error.name !== "NotAuthenticatedException") {
          console.warn("⚠️ Error al cerrar sesión:", signOutError);
        }
      } else {
        console.warn("⚠️ Error al cerrar sesión:", signOutError);
      }
    }
  } catch (error) {
    console.error("Error al cerrar sesión desde página de logout:", error);
  }
};

const goToRoot = async () => {
  isLoading.value = true;

  try {
    // Redirigir a la raíz
    navigateTo("/");
  } catch (error) {
    console.error("Error al redirigir:", error);
    // Si falla la navegación, usar window.location
    window.location.href = "/";
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  try {
    // Solo ejecutar si estamos realmente en la página de logout
    if (window.location.pathname === '/logout') {
      // Limpiar localStorage
      localStorage.clear();
      
      // Limpiar sessionStorage para permitir que el próximo login se registre
      // (importante para que la próxima vez que inicien sesión se registre el login)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem("lastLoggedUserId");
        console.log("🧹 Limpiado lastLoggedUserId de sessionStorage");
      }
      
      // Cerrar sesión automáticamente al cargar la página
      // (la auditoría ya se registró antes de navegar aquí)
      await logout();
    }
  } catch (error) {
    console.error("Error en el proceso de logout:", error);
  }
});
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.min-h-screen {
  animation: fadeInUp 0.6s ease-out;
}

/* Efectos de hover mejorados */
.shadow-2xl {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-2xl:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Gradiente animado para el icono */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
