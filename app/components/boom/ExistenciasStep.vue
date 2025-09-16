<script setup>
import ExistenciasUploadModal from "./ExistenciasUploadModal.vue";

// Props para comunicación con el componente padre
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

// Emits para actualizar el valor en el componente padre
const emit = defineEmits(["update:modelValue"]);

// Estado local del componente
const existencias = ref(props.modelValue);
const fileName = ref("");

// Headers específicos de existencias
const headers = ref([
  "version",
  "centro",
  "almacen",
  "material",
  "periodo",
  "mes",
  "libre_u",
  "no_liberado",
  "bloqueado",
  "devolucion",
  "traslados",
  "calidad",
  "bloqueado_eM",
]);

// Estado del modal
const isModalOpen = ref(false);

// Manejar datos cargados desde el modal
const handleDataLoaded = (payload) => {
  const { data, fileName: loadedFileName, error } = payload;

  if (error) {
    console.error("Error al procesar el archivo:", error);
    // Aquí podrías agregar un toast de error
    return;
  }

  existencias.value = data;
  fileName.value = loadedFileName;

  // Emitir el cambio al componente padre
  emit("update:modelValue", data);
};

// Manejar limpieza de datos desde el modal
const handleFileCleared = () => {
  existencias.value = [];
  fileName.value = "";
  emit("update:modelValue", []);
};

// Limpiar datos (método directo desde el botón de eliminar)
const clearData = () => {
  existencias.value = [];
  fileName.value = "";
  emit("update:modelValue", []);
};

// Computed para validar si hay datos
const hasData = computed(() => existencias.value.length > 0);
const totalRecords = computed(() => existencias.value.length);

// Watch para sincronizar con props
watch(
  () => props.modelValue,
  (newValue) => {
    existencias.value = newValue;
  },
  { deep: true },
);
</script>

<template>
  <div class="space-y-6">
    <!-- Header del paso -->
    <div
      class="bg-gradient-to-r from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-shopping-cart"
            class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-3"
          />
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Existencias
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Carga el archivo Excel con los datos de existencias
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span v-if="hasData" class="text-sm text-gray-600 dark:text-gray-300"
            >{{ totalRecords }} registros</span
          >
          <UButton
            v-if="!hasData"
            icon="i-heroicons-arrow-up-tray"
            label="Cargar archivo"
            variant="ghost"
            @click="isModalOpen = true"
          />
          <UButton
            v-if="hasData"
            icon="i-heroicons-trash"
            variant="ghost"
            class="hover:text-red-500 cursor-pointer text-gray-500"
            @click="clearData"
          />
        </div>
      </div>
    </div>

    <!-- Tabla de datos de existencias -->
    <div class="space-y-6">
      <div
        v-if="hasData"
        class="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3">
          <h4 class="text-white font-semibold">Datos de Existencias</h4>
        </div>

        <div class="h-[400px] overflow-auto">
          <table class="w-full table-auto bg-gray-50">
            <thead class="sticky top-0 bg-cyan-500 text-white">
              <tr>
                <th
                  v-for="header in headers"
                  :key="header"
                  class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider border-r border-cyan-400 last:border-r-0"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="(row, index) in existencias"
                :key="index"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <td
                  v-for="(cell, cellIndex) in row"
                  :key="cellIndex"
                  class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="!hasData" class="text-center py-12">
      <div
        class="w-24 h-24 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <UIcon
          name="i-heroicons-shopping-cart"
          class="w-12 h-12 text-cyan-600 dark:text-cyan-400"
        />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Sin datos cargados
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Utiliza el botón "Cargar archivo" en el header para seleccionar un
        archivo Excel con los datos de existencias
      </p>
    </div>

    <!-- Modal de carga de archivo -->
    <ExistenciasUploadModal
      v-model:is-open="isModalOpen"
      @data-loaded="handleDataLoaded"
      @file-cleared="handleFileCleared"
    />
  </div>
</template>
