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

// Función optimizada para limpiar datos y validar en un solo pase
const validateAndCleanData = (data, headers) => {
  const result = {
    cleanedData: [],
    cellErrors: [],
    emptyColumns: [],
    hasNonEmptyData: new Array(headers.length).fill(false),
    totalErrors: 0
  };
  
  const MAX_ERROR_SAMPLES = 20; // Solo guardamos ejemplos de errores
  
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    const cleanedRow = [];
    
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      let cell = row[colIndex];
      
      // Limpiar espacios solo si es string
      if (typeof cell === 'string') {
        cell = cell.trim();
      }
      
      cleanedRow.push(cell);
      
      // Validar y marcar columnas con datos
      if (cell !== null && cell !== undefined && cell !== '') {
        result.hasNonEmptyData[colIndex] = true;
      } else {
        result.totalErrors++;
        // Solo guardar ejemplos de errores
        if (result.cellErrors.length < MAX_ERROR_SAMPLES) {
          result.cellErrors.push({
            row: rowIndex + 2, // +2 porque: 1 por header, 1 por índice base-0
            column: headers[colIndex],
            columnIndex: colIndex
          });
        }
      }
    }
    
    result.cleanedData.push(cleanedRow);
  }
  
  // Identificar columnas completamente vacías
  result.emptyColumns = headers.filter((_, index) => !result.hasNonEmptyData[index]);
  
  return result;
};

// Manejo del cambio de archivo
const handleFileChangeExistencias = async (e) => {
  const fileExistencias = e.target.files[0];

  if (!fileExistencias) return;

  fileName.value = fileExistencias.name;
  validationError.value = "";
  isLoading.value = true;
  showUploadProgress.value = false;

  try {
    // Primero procesar el archivo Excel
    const data = await readXlsxFile(fileExistencias);

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

    // Validar y limpiar datos en un solo pase optimizado
    const validationResult = validateAndCleanData(data, headers.value);

    // Validar que no haya columnas completamente vacías
    if (validationResult.emptyColumns.length > 0) {
      validationError.value = `Las siguientes columnas están completamente vacías: ${validationResult.emptyColumns.join(', ')}. Todas las columnas son obligatorias.`;
      return;
    }

    // Validar que no haya celdas vacías
    if (validationResult.totalErrors > 0) {
      const errorSample = validationResult.cellErrors.slice(0, 5);
      const errorDetails = errorSample
        .map(e => `Fila ${e.row}, Columna ${e.column}`)
        .join('; ');
      
      const errorMessage = validationResult.totalErrors > validationResult.cellErrors.length
        ? `Se encontraron más de ${validationResult.cellErrors.length} celdas vacías. Todas las columnas son obligatorias. Ejemplos: ${errorDetails}...`
        : `Se encontraron ${validationResult.totalErrors} celdas vacías. Todas las columnas son obligatorias. Ejemplos: ${errorDetails}`;
      
      validationError.value = errorMessage;
      return;
    }

    // Filtrar filas completamente vacías usando datos limpios
    const filteredData = validationResult.cleanedData.filter((row) => {
      return row.some((cell) => cell !== null && cell !== '');
    });

    if (filteredData.length === 0) {
      validationError.value = "El archivo no contiene datos válidos después de la limpieza.";
      return;
    }

    // Mostrar progreso de carga a S3
    showUploadProgress.value = true;

    // Cargar archivo original a S3
    const uploadResult = await uploadFile(
      fileExistencias,
      'existencias',
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
  const fileInput = document.getElementById("file-input-existencias-modal");
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
  const fileInput = document.getElementById("file-input-existencias-modal");
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
      const fileInput = document.getElementById("file-input-existencias-modal");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  },
);
</script>

<template>
  <UModal v-model:open="isModalOpen" title="Cargar existencias">
    <template #body>
      <div class="space-y-6">
        <!-- Sección de carga de archivo -->
        <div v-if="!isLoading">
          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Selecciona un archivo Excel (.xlsx o .xls) que contenga los datos
              de existencias.
            </p>

            <!-- Input de archivo -->
            <div class="relative">
              <input
                type="file"
                id="file-input-existencias-modal"
                accept=".xlsx,.xls"
                @change="handleFileChangeExistencias"
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
                    El archivo debe contener las columnas: version, centro, almacen,
                    material, periodo, mes, libre_u, no_liberado, bloqueado,
                    devolucion, traslados, calidad, bloqueado_eM
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
