<script setup>
import CoberturaUploadModal from "./CoberturaUploadModal.vue";
import FileMetadataDisplay from "../FileMetadataDisplay.vue";

// Props para comunicación con el componente padre
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  boomVersion: {
    type: String,
    default: null,
  },
  documentId: {
    type: String,
    default: null,
  },
});

// Emits para actualizar el valor en el componente padre
const emit = defineEmits(["update:modelValue", "version-validation-changed", "file-metadata-updated"]);

// Estado local del componente
const cobertura = ref(props.modelValue);
const fileName = ref("");
const fileMetadata = ref(null);

// Headers específicos de días de cobertura
const headers = ref([
  "version",
  "centro",
  "periodo",
  "mes",
  "dias_habiles_mes_planta",
  "dias_coberturas_mes",
  "dias_habiles_venta",
]);

// Estado del modal
const isModalOpen = ref(false);

// Manejar datos cargados desde el modal
const handleDataLoaded = (payload) => {
  console.log(`🔍 DEBUG CoberturaStep handleDataLoaded - Payload completo:`, payload);
  
  const { data, fileName: loadedFileName, fileMetadata: metadata, error } = payload;

  if (error) {
    console.error("Error al procesar el archivo:", error);
    // Aquí podrías agregar un toast de error
    return;
  }

  console.log(`🔍 DEBUG CoberturaStep - Datos recibidos:`);
  console.log(`  - data.length: ${data?.length || 0}`);
  console.log(`  - fileName: ${loadedFileName}`);
  console.log(`  - fileMetadata:`, metadata);
  console.log(`  - fileMetadata.s3Path: ${metadata?.s3Path || 'undefined'}`);

  cobertura.value = data;
  fileName.value = loadedFileName;
  fileMetadata.value = metadata;

  // Emitir el cambio al componente padre
  emit("update:modelValue", data);
  
  // Emitir también los metadatos del archivo
  if (metadata) {
    console.log("📁 Emitiendo metadatos de archivo al componente padre");
    emit("file-metadata-updated", { tipo: 'cobertura', metadata });
  }
  
  // Si hay metadatos de archivo, también los pasamos
  if (metadata) {
    console.log("📁 Metadatos de archivo recibidos:", metadata);
    console.log(`📁 S3 Path disponible: ${metadata.s3Path}`);
  } else {
    console.log("⚠️ No hay metadatos de archivo disponibles");
  }
};

// Manejar limpieza de datos desde el modal
const handleFileCleared = () => {
  cobertura.value = [];
  fileName.value = "";
  fileMetadata.value = null;
  emit("update:modelValue", []);
};

// Limpiar datos (método directo desde el botón de eliminar)
const clearData = () => {
  cobertura.value = [];
  fileName.value = "";
  fileMetadata.value = null;
  emit("update:modelValue", []);
};

// Computed para validar si hay datos
const hasData = computed(() => cobertura.value.length > 0);
const totalRecords = computed(() => cobertura.value.length);

// Validación de versión
const versionValidation = computed(() => {
  if (!hasData.value || !props.boomVersion) {
    return { isValid: true, message: "" };
  }

  // LOG: Mostrar estructura del primer elemento para debugging
  if (cobertura.value.length > 0) {
    console.log("🔍 DEBUG - Primer elemento de cobertura:");
    console.log("Headers:", headers.value);
    console.log("Primer registro:", cobertura.value[0]);
    console.log("Versión del boom:", props.boomVersion);
    console.log("Índices de columnas:");
    headers.value.forEach((header, index) => {
      console.log(`  ${header}: índice ${index}, valor: ${cobertura.value[0][index]}`);
    });
  }

  // Encontrar el índice de la columna version
  const versionIndex = headers.value.indexOf("version");
  
  if (versionIndex === -1) {
    return { isValid: false, message: "No se encontró la columna version en los datos" };
  }

  // Verificar que todos los registros tengan la versión correcta
  const invalidRecords = [];
  const uniqueVersions = new Set();
  let totalRecordsCount = 0;
  let validRecords = 0;
  
  cobertura.value.forEach((row, index) => {
    const rowVersion = row[versionIndex];
    uniqueVersions.add(rowVersion);
    totalRecordsCount++;
    
    // Convertir ambos valores a string para comparación robusta
    const boomVersionStr = String(props.boomVersion);
    const rowVersionStr = String(rowVersion);
    
    if (rowVersionStr === boomVersionStr) {
      validRecords++;
    } else {
      invalidRecords.push({ row: index + 1, version: rowVersionStr });
    }
  });
  
  // Log resumen solo si hay errores
  if (invalidRecords.length > 0) {
    console.log(`📊 RESUMEN VALIDACIÓN VERSION (CON ERRORES):`);
    console.log(`   Total registros: ${totalRecordsCount}`);
    console.log(`   Registros válidos: ${validRecords}`);
    console.log(`   Registros con error: ${invalidRecords.length}`);
    console.log(`   Versiones únicas encontradas: ${Array.from(uniqueVersions).join(", ")}`);
    console.log(`   Versión del boom: ${props.boomVersion}`);
  }

  if (invalidRecords.length > 0) {
    const message = `Las versiones en la columna 'version' no coinciden con la versión del boom (${props.boomVersion}). ${invalidRecords.length} de ${totalRecordsCount} registros tienen versiones incorrectas.`;
    return { isValid: false, message };
  }

  return { isValid: true, message: "" };
});

// Watch para emitir cambios en la validación de versión
watch(versionValidation, (newValidation) => {
  emit("version-validation-changed", newValidation.isValid);
}, { immediate: true });

// Watch para sincronizar con props
watch(
  () => props.modelValue,
  (newValue) => {
    cobertura.value = newValue;
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
            name="i-heroicons-shield-check"
            class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-3"
          />
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Días de Cobertura
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Carga el archivo Excel con los datos de días de cobertura
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span v-if="hasData" class="text-sm text-gray-600 dark:text-gray-300"
            >{{ totalRecords }} registros</span
          >
          <a
            href="https://d1p0twkya81b3k.cloudfront.net/templates/Coberturas.xlsx"
            target="_blank"
            download
          >
            <UButton
              icon="i-heroicons-arrow-down-tray"
              label="Descargar plantilla"
              size="sm"
              class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            />
          </a>
          <UButton
            v-if="!hasData"
            icon="i-heroicons-arrow-up-tray"
            label="Cargar archivo"
            class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            @click="isModalOpen = true"
          />
          <UButton
            v-if="hasData"
            icon="i-heroicons-arrow-path"
            label="Recargar"
            size="sm"
            variant="outline"
            class="text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700"
            @click="isModalOpen = true"
          />
          <UButton
            v-if="hasData"
            icon="i-heroicons-trash"
            size="sm"
            variant="ghost"
            class="hover:text-red-500 cursor-pointer text-gray-500"
            @click="clearData"
          />
        </div>
      </div>
    </div>

    <!-- Mensaje de error de validación de versión -->
    <div
      v-if="!versionValidation.isValid"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
    >
      <div class="flex items-start">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0"
        />
        <div>
          <h4 class="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            Error de Validación de Versión
          </h4>
          <p class="text-sm text-red-700 dark:text-red-300">
            {{ versionValidation.message }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tabla de datos de cobertura -->
    <div class="space-y-6">
      <div
        v-if="hasData && versionValidation.isValid"
        class="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3">
          <h4 class="text-white font-semibold">Datos de Días de Cobertura</h4>
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
                v-for="(row, index) in cobertura"
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

      <!-- Información del archivo original -->
      <FileMetadataDisplay 
        v-if="fileMetadata" 
        :file-metadata="fileMetadata" 
      />
    </div>

    <!-- Estado vacío -->
    <div v-if="!hasData" class="text-center py-12">
      <div
        class="w-24 h-24 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <UIcon
          name="i-heroicons-shield-check"
          class="w-12 h-12 text-cyan-600 dark:text-cyan-400"
        />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Sin datos cargados
      </h3>
    </div>

    <!-- Modal de carga de archivo -->
    <CoberturaUploadModal
      v-model:is-open="isModalOpen"
      :document-id="documentId"
      @data-loaded="handleDataLoaded"
      @file-cleared="handleFileCleared"
    />
  </div>
</template>
