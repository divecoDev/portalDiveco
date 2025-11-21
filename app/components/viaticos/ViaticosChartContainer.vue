<template>
  <div
    class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div class="flex items-center justify-between mb-4">
      <h2
        class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
      >
        <UIcon
          v-if="icon"
          :name="icon"
          class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2"
        />
        {{ title }}
      </h2>
      <div
        v-if="loading"
        class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div
          class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos...</p>
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-else-if="empty"
      class="flex justify-center items-center py-12"
    >
      <div class="text-center">
        <UIcon
          name="i-heroicons-chart-bar"
          class="w-12 h-12 text-gray-400 mx-auto mb-2"
        />
        <p class="text-gray-500 dark:text-gray-400">{{ emptyMessage }}</p>
      </div>
    </div>

    <!-- Contenido de la gráfica -->
    <div v-else class="h-64">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  icon?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  empty: false,
  emptyMessage: "No hay datos para mostrar",
});
</script>

