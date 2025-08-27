<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
  >
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-8"
      ></div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Redirigiendo a la página de pruebas...
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Si no eres redirigido automáticamente, haz clic en el botón de abajo.
      </p>
      <UButton @click="goToTestPage" color="purple" size="lg" class="shadow-lg">
        <UIcon name="i-heroicons-beaker" class="w-5 h-5 mr-2" />
        Ir a Página de Pruebas
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

const router = useRouter();

const goToTestPage = () => {
  router.push("/test-reset-password");
};

onMounted(() => {
  // Redirigir automáticamente después de 2 segundos
  setTimeout(() => {
    goToTestPage();
  }, 2000);
});
</script>
