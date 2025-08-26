<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
  >
    <div
      class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
    >
      <!-- Icono del error -->
      <div class="mb-6">
        <div
          v-if="error.statusCode === 403"
          class="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-shield-exclamation"
            class="w-12 h-12 text-red-600 dark:text-red-400"
          />
        </div>
        <div
          v-else-if="error.statusCode === 404"
          class="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-12 h-12 text-blue-600 dark:text-blue-400"
          />
        </div>
        <div
          v-else
          class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-exclamation-circle"
            class="w-12 h-12 text-gray-600 dark:text-gray-400"
          />
        </div>
      </div>

      <!-- Título del error -->
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        <span v-if="error.statusCode === 403">Acceso Denegado</span>
        <span v-else-if="error.statusCode === 404">Página No Encontrada</span>
        <span v-else>Error {{ error.statusCode }}</span>
      </h1>

      <!-- Mensaje del error -->
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
        <span v-if="error.statusCode === 403">
          No tienes permisos para acceder a esta página.
          <span class="font-semibold text-red-600 dark:text-red-400"
            >Se requiere rol de Administrador.</span
          >
        </span>
        <span v-else-if="error.statusCode === 404">
          La página que buscas no existe o ha sido movida.
        </span>
        <span v-else>
          {{ error.statusMessage || "Ha ocurrido un error inesperado." }}
        </span>
      </p>

      <!-- Botones de acción -->
      <div class="space-y-4">
        <UButton
          v-if="error.statusCode === 403"
          icon="i-heroicons-arrow-left"
          label="Volver al Inicio"
          color="blue"
          variant="solid"
          size="lg"
          block
          @click="navigateTo('/')"
          class="shadow-lg hover:shadow-xl transition-all duration-300"
        />

        <UButton
          v-else
          icon="i-heroicons-arrow-left"
          label="Volver Atrás"
          color="gray"
          variant="outline"
          size="lg"
          block
          @click="handleError"
          class="shadow-lg hover:shadow-xl transition-all duration-300"
        />

        <UButton
          v-if="error.statusCode === 403"
          icon="i-heroicons-question-mark-circle"
          label="Contactar Soporte"
          color="white"
          variant="outline"
          size="lg"
          block
          @click="navigateTo('/ayuda')"
          class="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        />
      </div>

      <!-- Información adicional para desarrolladores -->
      <div
        v-if="isDevelopment"
        class="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Información para desarrolladores:
        </p>
        <div class="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <div><strong>Status:</strong> {{ error.statusCode }}</div>
          <div><strong>Message:</strong> {{ error.statusMessage }}</div>
          <div v-if="error.url"><strong>URL:</strong> {{ error.url }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props del error
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

// Detectar si estamos en modo desarrollo
const isDevelopment = computed(() => {
  try {
    const config = useRuntimeConfig();
    return config.public.environment === "development";
  } catch (e) {
    return process.env.NODE_ENV === "development";
  }
});

// Método para manejar el error
const handleError = () => {
  clearError({ redirect: "/" });
};
</script>

<style scoped>
/* Animaciones de entrada */
.error-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.error-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Efectos hover para botones */
.shadow-lg:hover {
  transform: translateY(-2px);
}
</style>
