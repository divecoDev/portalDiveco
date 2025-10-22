<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Datos Cargados por País
      </h3>
      <button
        v-if="hasData"
        @click="$emit('clear-all')"
        class="text-sm text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <UIcon name="i-heroicons-trash" class="w-4 h-4" />
        Limpiar Todo
      </button>
    </div>

    <div class="grid grid-cols-6 gap-2">
      <div
        v-for="pais in paises"
        :key="pais.code"
        :class="[
          'p-3 rounded-lg border-2 transition-all text-center',
          loadedCounts[pais.code]
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
        ]"
      >
        <!-- Bandera y nombre del país -->
        <div class="mb-2">
          <span class="text-2xl">{{ pais.flag }}</span>
          <p class="text-xs font-semibold text-gray-900 dark:text-white mt-1">{{ pais.name }}</p>
        </div>

        <!-- Con datos -->
        <div v-if="loadedCounts[pais.code]" class="mt-2">
          <div class="flex items-center justify-center mb-2">
            <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-green-600 mr-1" />
            <p class="text-lg font-bold text-green-600">
              {{ loadedCounts[pais.code].toLocaleString() }}
            </p>
          </div>
          <button
            @click="$emit('clear-country', pais.code)"
            class="w-full flex items-center justify-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 px-2 py-1.5 rounded transition-colors"
          >
            <UIcon name="i-heroicons-trash" class="w-3 h-3" />
            Limpiar
          </button>
        </div>

        <!-- Sin datos -->
        <div v-else class="mt-2">
          <div class="flex items-center justify-center mb-2">
            <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-gray-400 mr-1" />
            <p class="text-xs text-gray-400">Sin datos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div v-if="hasData" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div class="flex items-center space-x-3">
        <UIcon name="i-heroicons-table-cells" class="w-5 h-5 text-blue-600" />
        <div class="text-sm">
          <p class="font-semibold">Total: {{ totalRecords.toLocaleString() }} registros</p>
          <p class="text-xs text-gray-600">de {{ paisesCount }} {{ paisesCount === 1 ? 'país' : 'países' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  loadedCounts: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['clear-country', 'clear-all']);

const paises = [
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' }
];

const hasData = computed(() => Object.keys(props.loadedCounts).length > 0);
const totalRecords = computed(() => Object.values(props.loadedCounts).reduce((sum, c) => sum + c, 0));
const paisesCount = computed(() => Object.keys(props.loadedCounts).length);
</script>
