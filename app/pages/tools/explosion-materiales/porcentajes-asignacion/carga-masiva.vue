<template>
  <div class="">
    <!-- Header de la página -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25"
            >
              <UIcon
                name="i-heroicons-arrow-up-tray"
                class="w-7 h-7 text-white"
              />
            </div>
            Carga Masiva de Aprovisionamiento
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Carga múltiples registros de aprovisionamiento desde un archivo Excel
          </p>
        </div>

        <!-- Botón para volver -->
        <NuxtLink to="/tools/explosion-materiales/porcentajes-asignacion">
          <UButton
            icon="i-heroicons-arrow-left"
            color="gray"
            variant="outline"
            size="lg"
          >
            Volver al Listado
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Card principal -->
      <div
        class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-xl border border-blue-200/50 dark:border-blue-700/50 overflow-hidden"
      >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div class="flex items-center">
            <UIcon
              name="i-heroicons-document-arrow-up"
              class="w-6 h-6 text-white mr-3"
            />
            <h2 class="text-xl font-semibold text-white">
              Cargar Archivo Excel
            </h2>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-6">
          <!-- Instrucciones -->
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-md border border-blue-200 dark:border-blue-700/50"
          >
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-information-circle"
                class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"
              />
              <div class="flex-1">
                <h4
                  class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2"
                >
                  Instrucciones de Carga
                </h4>
                <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    • El archivo Excel debe tener las siguientes columnas:
                  </li>
                  <li class="ml-4 font-mono text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded inline-block">
                    centro_id_origen, material_id, centro_id_aprov, porcentaje
                  </li>
                  <li>• El porcentaje debe estar entre 0.00 y 100.00</li>
                  <li>• No incluyas espacios adicionales en los valores</li>
                  <li>• Los registros duplicados serán ignorados automáticamente</li>
                  <li>• Tamaño máximo de archivo: 10MB</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Botón de descarga de plantilla -->
          <div class="text-center">
            <UButton
              icon="i-heroicons-arrow-down-tray"
              size="lg"
              color="blue"
              variant="outline"
              @click="downloadTemplate"
              class="hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Descargar Plantilla Excel
            </UButton>
          </div>

          <!-- Área de carga de archivo -->
          <div>
            <label
              for="file-upload-aprovisionamiento"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Seleccionar archivo Excel
            </label>
            <div
              class="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 cursor-pointer"
              :class="{
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10': fileName,
                'border-red-500 bg-red-50 dark:bg-red-900/10':
                  hasValidationError,
              }"
              @click="$refs.fileInput.click()"
            >
              <div class="space-y-2 text-center">
                <UIcon
                  :name="
                    fileName
                      ? 'i-heroicons-document-check'
                      : 'i-heroicons-cloud-arrow-up'
                  "
                  class="mx-auto h-16 w-16"
                  :class="
                    fileName
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400'
                  "
                />
                <div class="flex text-sm text-gray-600 dark:text-gray-400">
                  <p class="w-full text-center font-medium">
                    {{
                      fileName
                        ? fileName
                        : 'Haz clic aquí para seleccionar un archivo Excel'
                    }}
                  </p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  XLSX, XLS o CSV hasta 10MB
                </p>
              </div>
            </div>
            <input
              ref="fileInput"
              id="file-upload-aprovisionamiento"
              type="file"
              class="sr-only"
              accept=".xlsx,.xls,.csv"
              @change="handleFileChange"
            />
          </div>

          <!-- Mensaje de error de validación -->
          <div
            v-if="hasValidationError"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-md p-4"
          >
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-exclamation-circle"
                class="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0"
              />
              <div class="flex-1">
                <h4
                  class="text-sm font-semibold text-red-800 dark:text-red-200 mb-1"
                >
                  Error de Validación
                </h4>
                <p class="text-sm text-red-700 dark:text-red-300">
                  {{ validationError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Progreso de procesamiento -->
          <div v-if="isProcessing" class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-300 font-medium">
                Procesando y guardando datos...
              </span>
              <div
                class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
            <div
              class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
            >
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                style="width: 100%"
              ></div>
            </div>
          </div>

          <!-- Resumen de datos cargados -->
          <div
            v-if="fileMetadata && !isProcessing"
            class="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-md border border-green-200 dark:border-green-700/50"
          >
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-check-circle"
                class="w-6 h-6 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0"
              />
              <div class="flex-1">
                <h4
                  class="text-sm font-semibold text-green-800 dark:text-green-200 mb-2"
                >
                  ✅ Archivo Validado Correctamente
                </h4>
                <div
                  class="text-sm text-green-700 dark:text-green-300 space-y-1"
                >
                  <p><strong>Archivo:</strong> {{ fileMetadata.fileName }}</p>
                  <p><strong>Tamaño:</strong> {{ fileMetadata.fileSize }}</p>
                  <p>
                    <strong>Registros a cargar:</strong>
                    {{ fileMetadata.totalRows }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-4">
            <NuxtLink to="/tools/explosion-materiales/porcentajes-asignacion">
              <UButton color="gray" variant="ghost" :disabled="isProcessing">
                Cancelar
              </UButton>
            </NuxtLink>
            <UButton
              icon="i-heroicons-arrow-up-tray"
              color="blue"
              size="lg"
              :loading="isProcessing"
              :disabled="!fileMetadata || hasValidationError"
              @click="processAndSave"
              class="text-white  bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {{ isProcessing ? 'Guardando...' : 'Guardar Datos' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import readXlsxFile from 'read-excel-file';
import { generateClient } from 'aws-amplify/data';

definePageMeta({
  middleware: ['require-role'],
  requiredRole: 'EXPLOSION',
});

// Meta tags para SEO
useSeoMeta({
  title: 'Carga Masiva de Aprovisionamiento - Portal Diveco',
  description: 'Carga múltiples registros de aprovisionamiento desde un archivo Excel',
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: 'Inicio', href: '/' },
  { title: 'Herramientas', href: '/herramientas' },
  { title: 'Explosión de Materiales', href: '/tools/explosion-materiales' },
  {
    title: 'Aprovisionamiento',
    href: '/tools/explosion-materiales/porcentajes-asignacion',
  },
  { title: 'Carga Masiva' },
]);

// Cliente de Amplify
const client = generateClient();

// Headers específicos de aprovisionamiento
const headers = ref([
  'centro_id_origen',
  'material_id',
  'centro_id_aprov',
  'porcentaje',
]);

// Estado local del componente
const isLoading = ref(false);
const isProcessing = ref(false);
const fileName = ref('');
const validationError = ref('');
const hasValidationError = computed(() => validationError.value.length > 0);
const fileMetadata = ref(null);
const parsedData = ref([]);
const fileInput = ref(null);
const router = useRouter();

// Función para formatear tamaño de archivo
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función para validar encabezados
const validateHeaders = (fileHeaders) => {
  const cleanFileHeaders = fileHeaders.map((header) =>
    header ? header.toString().trim() : ''
  );

  if (cleanFileHeaders.length !== headers.value.length) {
    return {
      isValid: false,
      error: `El archivo debe tener exactamente ${headers.value.length} columnas: ${headers.value.join(', ')}`,
    };
  }

  let hasInvalidHeaders = false;
  const invalidHeaders = [];

  headers.value.forEach((expectedHeader, index) => {
    if (cleanFileHeaders[index] !== expectedHeader) {
      hasInvalidHeaders = true;
      invalidHeaders.push(
        `Columna ${index + 1}: esperado "${expectedHeader}", recibido "${cleanFileHeaders[index]}"`
      );
    }
  });

  if (hasInvalidHeaders) {
    return {
      isValid: false,
      error: `Encabezados incorrectos. ${invalidHeaders.join('; ')}`,
    };
  }

  return { isValid: true, error: '' };
};

// Función para validar una fila de datos
const validateRow = (row, rowNumber) => {
  const errors = [];

  // Validar centro_id_origen
  const centroIdOrigen = parseInt(row[0]);
  if (!centroIdOrigen || isNaN(centroIdOrigen)) {
    errors.push(
      `Fila ${rowNumber}: centro_id_origen debe ser un número entero`
    );
  }

  // Validar material_id
  const materialId = parseInt(row[1]);
  if (!materialId || isNaN(materialId)) {
    errors.push(`Fila ${rowNumber}: material_id debe ser un número entero`);
  }

  // Validar centro_id_aprov
  const centroIdAprov = parseInt(row[2]);
  if (!centroIdAprov || isNaN(centroIdAprov)) {
    errors.push(
      `Fila ${rowNumber}: centro_id_aprov debe ser un número entero`
    );
  }

  // Validar porcentaje
  const porcentaje = parseFloat(row[3]);
  if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
    errors.push(
      `Fila ${rowNumber}: porcentaje debe estar entre 0.00 y 100.00`
    );
  }

  return errors;
};

// Manejo del cambio de archivo
const handleFileChange = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  fileName.value = file.name;
  validationError.value = '';
  isLoading.value = true;
  fileMetadata.value = null;
  parsedData.value = [];

  try {
    console.log('📂 Procesando archivo:', file.name);

    // Procesar el archivo Excel
    const data = await readXlsxFile(file);

    if (data.length === 0) {
      validationError.value =
        'El archivo está vacío o no contiene datos válidos.';
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
      validationError.value =
        'El archivo no contiene datos después de los encabezados.';
      return;
    }

    console.log('📊 Validando', filteredData.length, 'registros...');

    // Validar todas las filas
    const allErrors = [];
    filteredData.forEach((row, index) => {
      const rowErrors = validateRow(row, index + 2); // +2 porque la fila 1 son los headers
      allErrors.push(...rowErrors);
    });

    if (allErrors.length > 0) {
      validationError.value =
        allErrors.slice(0, 5).join('; ') +
        (allErrors.length > 5
          ? `... y ${allErrors.length - 5} errores más`
          : '');
      return;
    }

    // Convertir los datos al formato esperado
    const processedData = filteredData.map((row) => ({
      centroIdOrigen: parseInt(row[0]),
      materialId: parseInt(row[1]),
      centroIdAprov: parseInt(row[2]),
      porcentaje: parseFloat(row[3]),
    }));

    parsedData.value = processedData;

    // Guardar metadata del archivo
    fileMetadata.value = {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      totalRows: processedData.length,
    };

    console.log('✅ Archivo validado:', processedData.length, 'registros');

    useToast().add({
      title: 'Archivo validado',
      description: `Se validaron ${processedData.length} registros correctamente`,
      color: 'green',
      timeout: 3000,
    });
  } catch (error) {
    console.error('❌ Error procesando archivo:', error);
    validationError.value = `Error al procesar el archivo: ${error.message || 'Error desconocido'}`;
  } finally {
    isLoading.value = false;
  }
};

// Función para procesar y guardar datos
const processAndSave = async () => {
  if (!parsedData.value || parsedData.value.length === 0) {
    validationError.value = 'No hay datos para procesar';
    return;
  }

  isProcessing.value = true;

  try {
    console.log(
      '📤 Enviando datos para carga masiva...',
      parsedData.value.length,
      'registros'
    );

    // Llamar a la función de Amplify con operación bulkCreate
    const { data } = await client.queries.aprovisionamiento({
      operation: 'bulkCreate',
      data: JSON.stringify(parsedData.value),
    });

    // Parsear la respuesta JSON que viene como string
    let responseData;
    try {
      responseData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Error al procesar la respuesta del servidor');
    }

    console.log('📥 Respuesta del servidor:', responseData);

    if (responseData?.success) {
      useToast().add({
        title: '✅ Carga masiva exitosa',
        description:
          `Se cargaron ${responseData.data.inserted} registros correctamente` +
          (responseData.data.duplicates > 0
            ? ` (${responseData.data.duplicates} duplicados ignorados)`
            : ''),
        color: 'green',
        timeout: 5000,
      });

      // Esperar un momento para que el usuario vea el mensaje
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirigir al listado
      router.push('/tools/explosion-materiales/porcentajes-asignacion');
    } else {
      throw new Error(
        responseData?.message || 'Error desconocido al guardar los datos'
      );
    }
  } catch (error) {
    console.error('❌ Error en carga masiva:', error);

    useToast().add({
      title: 'Error en carga masiva',
      description: error.message || 'No se pudieron guardar los datos',
      color: 'red',
      timeout: 5000,
    });
  } finally {
    isProcessing.value = false;
  }
};

// Función para descargar plantilla
const downloadTemplate = () => {
  // Crear datos de ejemplo para la plantilla
  const template = [
    ['centro_id_origen', 'material_id', 'centro_id_aprov', 'porcentaje'],
    [1001, 12345, 2001, 100.0],
    [1001, 12346, 2001, 75.0],
    [1001, 12346, 2002, 25.0],
    [1002, 12345, 2001, 50.0],
    [1002, 12345, 2002, 50.0],
  ];

  // Convertir a CSV
  const csvContent = template.map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'plantilla_aprovisionamiento.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  useToast().add({
    title: 'Plantilla descargada',
    description: 'La plantilla CSV ha sido descargada',
    color: 'blue',
    timeout: 3000,
  });
};
</script>

