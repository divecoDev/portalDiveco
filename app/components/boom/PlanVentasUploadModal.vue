<script setup>
import readXlsxFile from "read-excel-file";

// Props para comunicación con el componente padre
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

// Emits para comunicación con el componente padre
const emit = defineEmits(["update:isOpen", "data-loaded", "file-cleared"]);

// Headers específicos del plan de ventas
const headers = ref([
  "SSOUR",
  "VRSIO",
  "SPMON",
  "SPTAG",
  "SPWOC",
  "SPBUP",
  "PMNUX",
  "WENUX",
  "VSNDA",
  "PERIV",
  "VWDAT",
  "BASME",
  "ABSAT",
  "PRODU",
  "LAGRI",
  "LAGRZ",
  "REICH",
  "REICZ",
]);

// Estado local del componente
const isLoading = ref(false);
const fileName = ref("");

// Computed para el estado del modal
const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit("update:isOpen", value),
});

// Manejo del cambio de archivo
const handleFileChangePlanVentas = async (e) => {
  const filePlanVentas = e.target.files[0];

  if (!filePlanVentas) return;

  fileName.value = filePlanVentas.name;
  isLoading.value = true;

  try {
    const data = await readXlsxFile(filePlanVentas);

    // Remover la primera fila (headers)
    data.shift();

    // Filtrar filas vacías
    const filteredData = data.filter((row) => {
      return row.some((cell) => cell !== null);
    });

    // Emitir los datos cargados al componente padre
    emit("data-loaded", {
      data: filteredData,
      fileName: fileName.value,
    });
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    // Aquí podrías agregar un toast de error
    emit("data-loaded", {
      data: [],
      fileName: "",
      error: error.message,
    });
  } finally {
    isLoading.value = false;
    isModalOpen.value = false;
  }
};

// Limpiar datos y cerrar modal
const clearData = () => {
  fileName.value = "";

  // Limpiar el input file
  const fileInput = document.getElementById("file-input-plan-ventas-modal");
  if (fileInput) {
    fileInput.value = "";
  }

  // Emitir evento de limpieza
  emit("file-cleared");
  isModalOpen.value = false;
};

// Resetear estado cuando el modal se cierra
watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      // Resetear estado cuando se cierra el modal
      fileName.value = "";
      isLoading.value = false;

      // Limpiar el input file
      const fileInput = document.getElementById("file-input-plan-ventas-modal");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }
);
</script>

<template>
  <UModal v-model:open="isModalOpen" title="Cargar plan de ventas">
    <template #body>
      <div class="space-y-6">
        <!-- Sección de carga de archivo -->
        <div v-if="!isLoading">
          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Selecciona un archivo Excel (.xlsx o .xls) que contenga los datos
              del plan de ventas.
            </p>

            <!-- Input de archivo -->
            <div class="relative">
              <input
                type="file"
                id="file-input-plan-ventas-modal"
                accept=".xlsx,.xls"
                @change="handleFileChangePlanVentas"
                :disabled="isLoading"
                class="w-full p-6 text-center rounded-md font-semibold border-2 border-dashed border-cyan-300 bg-cyan-50 dark:bg-cyan-900/20 dark:border-cyan-700 hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <!-- Loading overlay -->
              <div
                v-if="isLoading"
                class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-md"
              >
                <div class="flex items-center space-x-2">
                  <div
                    class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span class="text-sm text-gray-600 dark:text-gray-300"
                    >Procesando archivo...</span
                  >
                </div>
              </div>
            </div>

            <!-- Información del archivo -->
            <div
              v-if="fileName && !isLoading"
              class="flex items-center justify-center"
            >
              <div
                class="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                <span>{{ fileName }}</span>
              </div>
            </div>

            <!-- Información adicional -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <div class="flex">
                <UIcon
                  name="i-heroicons-information-circle"
                  class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
                />
                <div class="text-sm text-blue-800 dark:text-blue-200">
                  <p class="font-semibold mb-1">Formato esperado:</p>
                  <p>
                    El archivo debe contener las columnas: SSOUR, VRSIO, SPMON,
                    SPTAG, SPWOC, SPBUP, PMNUX, WENUX, VSNDA, PERIV, VWDAT,
                    BASME, ABSAT, PRODU, LAGRI, LAGRZ, REICH, REICZ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-else class="text-center py-8">
          <div class="flex items-center justify-center space-x-2">
            <div
              class="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-300"
              >Procesando archivo...</span
            >
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
