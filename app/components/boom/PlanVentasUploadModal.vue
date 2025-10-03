<script setup>
import readXlsxFile from "read-excel-file";
import { useFileUpload } from "~/composables/useFileUpload";

// Props para comunicación con el componente padre
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  documentId: {
    type: String,
    default: null,
  },
});

// Emits para comunicación con el componente padre
const emit = defineEmits(["update:isOpen", "data-loaded", "file-cleared"]);

// Composable para manejo de archivos S3
const { uploadFile, uploadProgress, isUploading, formatFileSize } = useFileUpload();

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
const validationError = ref("");
const hasValidationError = computed(() => validationError.value.length > 0);
const fileMetadata = ref(null);
const showUploadProgress = ref(false);

// Computed para el estado del modal
const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit("update:isOpen", value),
});

// Función para validar encabezados
const validateHeaders = (fileHeaders) => {
  // Limpiar encabezados del archivo (remover espacios y convertir a string)
  const cleanFileHeaders = fileHeaders.map(header =>
    header ? header.toString().trim() : ""
  );

  // Verificar que tenga el mismo número de columnas
  if (cleanFileHeaders.length !== headers.value.length) {
    return {
      isValid: false,
      error: "El archivo no cumple con el formato esperado."
    };
  }

  // Verificar que cada encabezado coincida exactamente
  let hasInvalidHeaders = false;

  headers.value.forEach((expectedHeader, index) => {
    if (cleanFileHeaders[index] !== expectedHeader) {
      hasInvalidHeaders = true;
    }
  });

  if (hasInvalidHeaders) {
    return {
      isValid: false,
      error: "El archivo no cumple con el formato esperado."
    };
  }

  return { isValid: true, error: "" };
};

// Manejo del cambio de archivo
const handleFileChangePlanVentas = async (e) => {
  const filePlanVentas = e.target.files[0];

  if (!filePlanVentas) return;

  fileName.value = filePlanVentas.name;
  validationError.value = "";
  isLoading.value = true;
  showUploadProgress.value = false;

  try {
    // Primero procesar el archivo Excel
    const data = await readXlsxFile(filePlanVentas);

    if (data.length === 0) {
      validationError.value = "El archivo está vacío o no contiene datos válidos.";
      return;
    }

    // Validar encabezados (primera fila)
    const fileHeaders = data[0];
    const validation = validateHeaders(fileHeaders);

    if (!validation.isValid) {
      validationError.value = validation.error;
      return;
    }

    // Remover la primera fila (headers) ya validada
    data.shift();

    // Filtrar filas vacías
    const filteredData = data.filter((row) => {
      return row.some((cell) => cell !== null);
    });

    if (filteredData.length === 0) {
      validationError.value = "El archivo no contiene datos después de los encabezados.";
      return;
    }

    // Mostrar progreso de carga a S3
    showUploadProgress.value = true;

    // Cargar archivo original a S3
    const uploadResult = await uploadFile(
      filePlanVentas,
      'planVentas',
      props.documentId,
      (progress) => {
        console.log(`📤 Progreso de carga: ${progress.percentage}%`);
      }
    );

    if (!uploadResult.success) {
      validationError.value = `Error al guardar archivo: ${uploadResult.error}`;
      showUploadProgress.value = false;
      return;
    }

    // Guardar metadatos del archivo
    fileMetadata.value = uploadResult.metadata;

    // Emitir los datos cargados al componente padre
    emit("data-loaded", {
      data: filteredData,
      fileName: fileName.value,
      fileMetadata: uploadResult.metadata,
    });

    // Cerrar modal solo si todo fue exitoso
    isModalOpen.value = false;
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    validationError.value = `Error al procesar el archivo: ${error.message}`;
  } finally {
    isLoading.value = false;
    showUploadProgress.value = false;
  }
};

// Limpiar datos y cerrar modal
const clearData = () => {
  fileName.value = "";
  validationError.value = "";
  fileMetadata.value = null;
  showUploadProgress.value = false;

  // Limpiar el input file
  const fileInput = document.getElementById("file-input-plan-ventas-modal");
  if (fileInput) {
    fileInput.value = "";
  }

  // Emitir evento de limpieza
  emit("file-cleared");
  isModalOpen.value = false;
};

// Función para reintentar carga de archivo
const retryFileSelection = () => {
  fileName.value = "";
  validationError.value = "";
  fileMetadata.value = null;
  showUploadProgress.value = false;

  // Limpiar el input file
  const fileInput = document.getElementById("file-input-plan-ventas-modal");
  if (fileInput) {
    fileInput.value = "";
    fileInput.click(); // Abrir selector de archivos
  }
};

// Resetear estado cuando el modal se cierra
watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      // Resetear estado cuando se cierra el modal
      fileName.value = "";
      validationError.value = "";
      isLoading.value = false;
      fileMetadata.value = null;
      showUploadProgress.value = false;

      // Limpiar el input file
      const fileInput = document.getElementById("file-input-plan-ventas-modal");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  },
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

            <!-- Progreso de carga a S3 -->
            <div
              v-if="showUploadProgress"
              class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-md p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <UIcon
                    name="i-heroicons-cloud-arrow-up"
                    class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                  />
                  <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Guardando archivo en la nube...
                  </span>
                </div>
                <span class="text-sm text-blue-600 dark:text-blue-400">
                  {{ uploadProgress.percentage }}%
                </span>
              </div>
              <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${uploadProgress.percentage}%` }"
                ></div>
              </div>
              <div class="mt-2 text-xs text-blue-600 dark:text-blue-400">
                {{ formatFileSize(uploadProgress.transferredBytes) }} de {{ formatFileSize(uploadProgress.totalBytes) }}
              </div>
            </div>

            <!-- Información del archivo exitoso -->
            <div
              v-if="fileName && !isLoading && !hasValidationError && !showUploadProgress"
              class="flex items-center justify-center"
            >
              <div
                class="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                <span>{{ fileName }}</span>
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
              </div>
            </div>

            <!-- Error de validación -->
            <div
              v-if="hasValidationError && !isLoading"
              class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-md p-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-4 h-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0"
                  />
                  <div>
                    <p class="text-sm font-medium text-red-800 dark:text-red-200">
                      {{ validationError }}
                    </p>
                    <p class="text-xs text-red-600 dark:text-red-400 mt-0.5">
                      {{ fileName }}
                    </p>
                  </div>
                </div>
                <UButton
                  size="xs"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-arrow-path"
                  @click="retryFileSelection"
                  class="ml-3 flex-shrink-0"
                >
                  Reintentar
                </UButton>
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
