<template>
  <div>
    <!-- Si está restringido, mostrar mensaje de bloqueo -->
    <div
      v-if="isRestricted"
      class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-red-200/50 dark:border-red-700/50 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
        <div class="flex items-center">
          <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 text-white mr-3" />
          <h2 class="text-xl font-semibold text-white">Acceso Restringido</h2>
        </div>
      </div>

      <div class="p-6">
        <div class="text-center py-8">
          <div
            class="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <UIcon
              name="i-heroicons-lock-closed"
              class="w-12 h-12 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Herramienta Deshabilitada Temporalmente
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
            {{ restrictionMessage }}
          </p>
          <div
            v-if="activeWindow"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4 max-w-md mx-auto"
          >
            <div class="flex items-center justify-center space-x-2 text-sm text-red-800 dark:text-red-200">
              <UIcon name="i-heroicons-clock" class="w-4 h-4" />
              <span>
                <strong>{{ activeWindow.name }}</strong>
                <span v-if="activeWindow.description"> - {{ activeWindow.description }}</span>
              </span>
            </div>
            <div class="mt-2 text-xs text-red-700 dark:text-red-300 text-center">
              Horario: {{ activeWindow.startTime }} - {{ activeWindow.endTime }} ({{ activeWindow.timezone }})
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Si no está restringido, mostrar contenido normal -->
    <div v-else-if="!loading">
      <slot />
    </div>

    <!-- Estado de carga -->
    <div v-else class="flex justify-center items-center py-12">
      <div class="text-center">
        <div
          class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-300">
          Verificando restricciones...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRpaRestriction } from "~/composables/useRpaRestriction";

// Props
const props = defineProps({
  /**
   * Si debe verificar automáticamente al montar
   */
  autoCheck: {
    type: Boolean,
    default: true,
  },
});

// Composable de restricción
const {
  loading,
  isRestricted,
  getActiveWindow,
  getRestrictionMessage,
  checkRestrictionStatus,
} = useRpaRestriction();

// Computed
const activeWindow = computed(() => getActiveWindow.value);
const restrictionMessage = computed(() => {
  return getRestrictionMessage.value || "Esta herramienta está deshabilitada temporalmente debido a la ejecución de procesos críticos (RPA). Intente de nuevo más tarde.";
});

// Lifecycle
onMounted(async () => {
  if (props.autoCheck) {
    await checkRestrictionStatus();
  }
});
</script>

