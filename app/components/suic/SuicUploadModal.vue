<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-t-lg"
           style="margin: -1.5rem -1.5rem -1.5rem; width: calc(100% + 3rem);">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Cargar Plantilla SUIC</h3>
            <p class="text-sm text-cyan-100">Archivo Excel regional</p>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Selector de archivo -->
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-cyan-500 dark:hover:border-cyan-400 transition-all">
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls"
            @change="handleFileChange"
            class="hidden"
          />
          <UIcon name="i-heroicons-document-arrow-up" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <button
            @click="$refs.fileInput.click()"
            class="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Seleccionar archivo Excel
          </button>
          <p class="text-xs text-gray-500 mt-2">Formatos: .xlsx, .xls</p>
        </div>

        <!-- Nombre del archivo -->
        <div v-if="fileName" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-document" class="w-5 h-5 text-gray-500" />
              <span class="text-sm font-medium">{{ fileName }}</span>
            </div>
            <button
              v-if="!processing"
              @click="clearFile"
              class="text-red-500 hover:text-red-700"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Procesando -->
        <div v-if="processing" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Procesando archivo...</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ totalRows }} filas</p>
            </div>
          </div>
        </div>

        <!-- Error de datos -->
        <div v-if="dataError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div class="flex items-start space-x-3">
            <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error de Almacenamiento</p>
              <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ dataError }}</p>
            </div>
          </div>
        </div>

        <!-- Loading de datos -->
        <div v-if="isDataLoading" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Guardando datos...</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Esto puede tomar unos momentos</p>
            </div>
          </div>
        </div>

        <!-- Tabla de debug -->
        <div v-if="debugData.length > 0" class="mt-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug - Primeras 5 filas procesadas:</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs border border-gray-200 dark:border-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left">Fila</th>
                  <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left">País</th>
                  <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left">Centro</th>
                  <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left">Estado</th>
                  <th class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900">
                <tr v-for="(row, index) in debugData" :key="index" class="border-b border-gray-100 dark:border-gray-800">
                  <td class="px-2 py-1">{{ row.rowIndex }}</td>
                  <td class="px-2 py-1 font-mono">{{ row.pais }}</td>
                  <td class="px-2 py-1 font-mono">{{ row.centro }}</td>
                  <td class="px-2 py-1">
                    <span :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      row.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      row.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    ]">
                      {{ row.status }}
                    </span>
                  </td>
                  <td class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">{{ row.details }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Advertencia de validación de meses -->
        <div v-if="monthsValidationWarning" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div class="flex items-start space-x-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Advertencia de Validación</p>
              <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">{{ monthsValidationWarning }}</p>
              <div v-if="incompleteMonthsDetected.length > 0" class="mt-2">
                <p class="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Meses afectados:</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="monthNum in incompleteMonthsDetected" 
                    :key="monthNum"
                    class="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                  >
                    {{ ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][monthNum - 1] }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de confirmación de reemplazo (inline) -->
        <div v-if="showConflictWarning" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div class="flex items-start space-x-3 mb-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Datos Existentes</p>
              <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Se reemplazarán datos de: <strong>{{ conflictingPaises.join(', ') }}</strong>
              </p>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-3">
            <button
              @click="cancelUpload"
              class="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmUpload"
              class="px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
            >
              Confirmar y Reemplazar
            </button>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors"
        >
          Cerrar
        </button>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import readXlsxFile from 'read-excel-file';
import { useSuicData } from '~/composables/useSuicData';
import { detectAvailableMonths, validateMonthCompleteness } from '~/services/suicValidators';

const props = defineProps({
  open: Boolean,
  suicId: String
});

const emit = defineEmits(['update:open', 'data-loaded']);

const { saveData, loadDataFromStorage, isLoading: isDataLoading, error: dataError } = useSuicData(props.suicId);

// Estado
const fileInput = ref(null);
const fileName = ref('');
const processing = ref(false);
const totalRows = ref(0);
const validationError = ref('');
const success = ref(false);
const successMessage = ref('');
const showConflictWarning = ref(false);
const conflictingPaises = ref([]);
const pendingData = ref({});
const monthsValidationWarning = ref('');
const incompleteMonthsDetected = ref([]);

// Debug data
const debugData = ref([]);
const processingSummary = ref({
  total: 0,
  success: 0,
  errors: 0,
  skipped: 0
});

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

// Columnas requeridas (119 total) - Sin tildes ni ñ
const requiredColumns = [
  'pais', 'centro', 'asignacion_vendedor', 'vendedor', 'codigo_cliente',
  'cliente_correcto', 'asignacion_canal', 'canal', 'material', 'modelo',
  'linea', 'asignacion_color', 'color', 'asignacion_marca', 'marca',
  'asignacion_presentacion', 'presentacion', 'asignacion_modelo', 'modelo_2',
  'asignacion_tamano', 'tamano',
  ...Array.from({length: 12}, (_, i) => i + 1).flatMap(n => [
    `unidades_plan_${n}`, `precio_proyectado_${n}`, `venta_bruta_plan_${n}`,
    `porcentaje__desc_merc_${n}`, `descuento_merc_${n}`,
    `porcentaje__desc_ben_${n}`, `descuento_ben_${n}`, `venta_plan_${n}`
  ])
];

// Mapeo de países válidos (ya no validamos centro)
const validPaises = ['GT', 'SV', 'HN', 'NI', 'CR', 'PA'];

// Métodos
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileName.value = file.name;
  validationError.value = '';
  success.value = false;
  showConflictWarning.value = false;

  try {
    await processFile(file);
  } catch (error) {
    validationError.value = error.message;
  }
};

const processFile = async (file) => {
  processing.value = true;

  try {
    const rows = await readXlsxFile(file);
    if (rows.length === 0) throw new Error('Archivo vacío');

    totalRows.value = rows.length - 1;

    // Validar columnas
    const headers = rows[0];
    validateColumns(headers);

    // Procesar datos
    const dataByPais = processRows(rows, headers);

    // Validar meses durante procesamiento
    await validateMonthsDuringProcessing(dataByPais);

    // Verificar conflictos
    const currentData = await loadDataFromStorage();
    const conflicts = Object.keys(dataByPais).filter(p => currentData[p]);

    if (conflicts.length > 0) {
      conflictingPaises.value = conflicts;
      pendingData.value = dataByPais;
      showConflictWarning.value = true;
    } else {
      await saveAndNotify(dataByPais);
    }

  } finally {
    processing.value = false;
  }
};

const validateColumns = (headers) => {
  const cleanHeaders = headers.map(h => h?.toString().trim().toLowerCase());
  const requiredLower = requiredColumns.map(c => c.toLowerCase());
  
  // Validar que todas las columnas requeridas estén presentes
  const missing = requiredLower.filter(col => !cleanHeaders.includes(col));
  if (missing.length > 0) {
    throw new Error(`Faltan ${missing.length} columnas. Primera: ${missing[0]}`);
  }

  // Validar posiciones críticas (primeras 5 columnas)
  const criticalColumns = ['pais', 'centro', 'asignacion_vendedor', 'vendedor', 'codigo_cliente'];
  const criticalPositions = criticalColumns.map(col => cleanHeaders.indexOf(col));
  
  console.log('🔍 Critical columns positions:', criticalPositions);
  
  // Verificar que las columnas críticas estén en las primeras posiciones
  for (let i = 0; i < criticalPositions.length; i++) {
    if (criticalPositions[i] === -1) {
      throw new Error(`Columna crítica '${criticalColumns[i]}' no encontrada`);
    }
    if (criticalPositions[i] > 10) {
      console.warn(`⚠️ Columna '${criticalColumns[i]}' está en posición ${criticalPositions[i]}, debería estar más cerca del inicio`);
    }
  }

  // Validar que 'pais' esté en posición 0 y 'centro' en posición 1
  if (cleanHeaders[0] !== 'pais') {
    throw new Error(`La primera columna debe ser 'pais', pero es '${cleanHeaders[0]}'`);
  }
  
  if (cleanHeaders[1] !== 'centro') {
    throw new Error(`La segunda columna debe ser 'centro', pero es '${cleanHeaders[1]}'`);
  }

  console.log('✅ Column validation passed');
};

const processRows = (rows, headers) => {
  const dataByPais = {};
  const dataRows = rows.slice(1);
  console.log('🔄 processRows - Total rows to process:', dataRows.length);

  // Reset debug data
  debugData.value = [];
  processingSummary.value = {
    total: dataRows.length,
    success: 0,
    errors: 0,
    skipped: 0
  };

  dataRows.forEach((row, index) => {
    // Usar posiciones fijas ya validadas: pais[0], centro[1]
    const pais = row[0]?.toString().trim().toUpperCase();
    const centro = row[1];
    
    console.log(`🔍 Row ${index}: Pais=${pais}, Centro=${centro}`);
    
    let status = 'success';
    let details = 'Procesada correctamente';
    
    if (!pais) {
      console.log(`⚠️ Row ${index}: Missing pais`);
      status = 'error';
      details = 'Falta país';
      processingSummary.value.errors++;
    } else if (!validPaises.includes(pais)) {
      console.log(`⚠️ Row ${index}: Invalid pais '${pais}'`);
      status = 'error';
      details = `País inválido: ${pais}. Válidos: ${validPaises.join(', ')}`;
      processingSummary.value.errors++;
    } else {
      // Procesar fila exitosamente (centro es opcional)
      const rowData = {};
      headers.forEach((header, idx) => {
        rowData[header] = row[idx];
      });

      if (!dataByPais[pais]) dataByPais[pais] = [];
      dataByPais[pais].push(rowData);
      processingSummary.value.success++;
      
      console.log(`✅ Row ${index}: Pais ${pais}, Centro ${centro} -> Added to ${pais}`);
    }

    // Agregar a debug data (solo primeras 5 filas)
    if (index < 5) {
      debugData.value.push({
        rowIndex: index + 1, // +1 porque empezamos desde 0
        pais: pais || 'N/A',
        centro: centro || 'N/A',
        status: status,
        details: details
      });
    }
  });

  console.log('📊 processRows - Final dataByPais:', dataByPais);
  console.log('📈 Processing summary:', processingSummary.value);
  return dataByPais;
};

// Validar meses durante procesamiento
const validateMonthsDuringProcessing = async (dataByPais) => {
  console.log('🔍 Validando meses durante procesamiento...');
  
  const incompleteMonths = new Set();
  let totalIncompleteRecords = 0;
  
  // Procesar cada país
  for (const [paisCode, records] of Object.entries(dataByPais)) {
    console.log(`📊 Validando ${records.length} registros para ${paisCode}`);
    
    // Muestrear solo los primeros 100 registros para validación rápida
    const sampleSize = Math.min(100, records.length);
    const sampleRecords = records.slice(0, sampleSize);
    
    for (const record of sampleRecords) {
      // Detectar meses disponibles
      const availableMonths = detectAvailableMonths(record);
      
      // Validar completitud de cada mes
      for (const monthNumber of availableMonths) {
        const validation = validateMonthCompleteness(record, monthNumber);
        
        if (!validation.isComplete) {
          incompleteMonths.add(monthNumber);
          totalIncompleteRecords++;
        }
      }
    }
  }
  
  // Mostrar advertencia si hay meses incompletos
  if (incompleteMonths.size > 0) {
    const monthNames = Array.from(incompleteMonths).map(num => {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthNames[num - 1];
    });
    
    monthsValidationWarning.value = `Se detectaron meses con datos incompletos: ${monthNames.join(', ')}. Algunos registros pueden tener columnas faltantes.`;
    incompleteMonthsDetected.value = Array.from(incompleteMonths);
    
    console.log('⚠️ Advertencia de validación:', monthsValidationWarning.value);
  } else {
    monthsValidationWarning.value = '';
    incompleteMonthsDetected.value = [];
    console.log('✅ Todos los meses detectados tienen datos completos');
  }
};

const confirmUpload = async () => {
  await saveAndNotify(pendingData.value);
  showConflictWarning.value = false;
  pendingData.value = {};
};

const saveAndNotify = async (data) => {
  console.log('💾 saveAndNotify - Data to save:', data);
  await saveData(data);
  const totalRecords = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
  console.log('📊 Total records calculated:', totalRecords);
  successMessage.value = `${totalRecords.toLocaleString()} registros de ${Object.keys(data).join(', ')}`;
  success.value = true;
  emit('data-loaded');
};

const cancelUpload = () => {
  showConflictWarning.value = false;
  pendingData.value = {};
  clearFile();
};

const clearFile = () => {
  fileName.value = '';
  fileInput.value.value = '';
  validationError.value = '';
  success.value = false;
  debugData.value = [];
  monthsValidationWarning.value = '';
  incompleteMonthsDetected.value = [];
  processingSummary.value = {
    total: 0,
    success: 0,
    errors: 0,
    skipped: 0
  };
};

const closeModal = () => {
  isOpen.value = false;
  clearFile();
};
</script>
