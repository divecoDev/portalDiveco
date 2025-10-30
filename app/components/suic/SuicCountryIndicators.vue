<template>
  <div>
    <!-- Header con título y botón de limpiar todo -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        Datos Cargados por País
      </h3>
      <button
        v-if="hasData"
        @click="$emit('clear-all')"
        class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
      >
        <UIcon name="i-heroicons-trash" class="w-4 h-4" />
        Limpiar Todo
      </button>
    </div>

    <!-- Alerta de inconsistencia de meses -->
    <div 
      v-if="!monthsConsistencyValidation.isConsistent" 
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400 rounded-lg"
    >
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <h4 class="text-sm font-bold text-red-800 dark:text-red-200 mb-2">
            Inconsistencia en Meses de Datos
          </h4>
          <p class="text-sm text-red-700 dark:text-red-300 mb-3">
            {{ monthsConsistencyValidation.message }}. Los países deben tener exactamente los mismos meses para mantener consistencia en los datos.
          </p>
          
          <!-- Detalle de meses esperados -->
          <div class="bg-white dark:bg-gray-800 rounded p-3 mb-3">
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Meses esperados (referencia: {{ monthsConsistencyValidation.referencePais }}):
            </p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="monthNum in monthsConsistencyValidation.referenceMonths"
                :key="monthNum"
                class="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700"
              >
                {{ ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][monthNum - 1] }}
              </span>
            </div>
          </div>
          
          <!-- Lista de países inconsistentes -->
          <div class="bg-white dark:bg-gray-800 rounded p-3">
            <p class="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">
              Países con meses incorrectos:
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="paisCode in monthsConsistencyValidation.inconsistentCountries"
                :key="paisCode"
                class="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-700 font-medium"
              >
                <UIcon name="i-heroicons-x-circle" class="w-3 h-3 mr-1" />
                {{ paisCode }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de países en formato data items -->
    <div class="space-y-3">
      <div
        v-for="pais in paises"
        :key="pais.code"
        :class="[
          'w-full rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden',
          getCardClasses(pais.code)
        ]"
      >
        <!-- Header del país: ocupa todo el ancho -->
        <div class="w-full px-5 py-3" :class="getHeaderClasses(pais.code)">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-200/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-full border-2 border-gray-300/50 dark:border-gray-600/50 flex items-center justify-center font-bold text-2xl shadow-sm">
                <span class="flex items-center justify-center w-full h-full">
                  {{ pais.flag }}
                </span>
              </div>
              <div>
                <h4 class="text-lg font-bold text-gray-800 dark:text-gray-200">{{ pais.name }}</h4>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ pais.code }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Total de registros -->
              <div class="flex items-center space-x-2">
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {{ getTotalRecordsForCountry(pais.code).toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">registros</p>
                </div>
                <UIcon 
                  :name="mysqlCounts[pais.code] ? 'i-heroicons-database' : 'i-heroicons-table-cells'" 
                  class="w-6 h-6 text-gray-700 dark:text-gray-300 opacity-90" 
                />
              </div>
              
              <!-- Estado del país -->
              <div class="flex items-center space-x-2">
                <!-- Estado MySQL (guardado) -->
                <div v-if="mysqlCounts[pais.code]" class="flex items-center space-x-1.5 bg-emerald-200/80 backdrop-blur-sm px-3 py-1.5 rounded border border-emerald-300/50">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-700" />
                  <span class="text-xs font-semibold text-emerald-800">Guardado</span>
                </div>
                
                <!-- Estado Guardando -->
                <div v-else-if="saveStates[pais.code]?.status === 'saving'" class="flex items-center space-x-1.5 bg-cyan-200/80 backdrop-blur-sm px-3 py-1.5 rounded border border-cyan-300/50">
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-cyan-700 animate-spin" />
                  <span class="text-xs font-semibold text-cyan-800">Guardando...</span>
                </div>
                
                <!-- Estado Error -->
                <div v-else-if="saveStates[pais.code]?.status === 'error'" class="flex items-center space-x-1.5 bg-cyan-200/80 backdrop-blur-sm px-3 py-1.5 rounded border border-cyan-300/50">
                  <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-cyan-700" />
                  <span class="text-xs font-semibold text-cyan-800">Error</span>
                </div>
                
                <!-- Estado Pendiente -->
                <div v-else-if="loadedCounts[pais.code]" class="flex items-center space-x-1.5 bg-amber-200/80 backdrop-blur-sm px-3 py-1.5 rounded border border-amber-300/50">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4 text-amber-700" />
                  <span class="text-xs font-semibold text-amber-800">Pendiente</span>
                </div>
              </div>
              
              <!-- Indicador de inconsistencia de meses en el header -->
              <div v-if="isCountryInconsistent(pais.code)" class="flex-shrink-0">
                <div class="flex items-center space-x-1 bg-cyan-200/80 backdrop-blur-sm px-3 py-1.5 rounded border border-cyan-300/50">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-cyan-700" />
                  <span class="text-xs font-semibold text-cyan-800">Meses incorrectos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido del card -->
        <div class="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
          <!-- Sección Central: Información de datos -->
          <div class="flex-1 min-w-0">
            <div class="space-y-3">
              <!-- Tags de meses disponibles (para datos locales O MySQL) -->
              <div v-if="(loadedCounts[pais.code] && !mysqlCounts[pais.code] && getCountryMetadata(pais.code)) || mysqlCounts[pais.code]" class="space-y-2">
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Meses con datos:</span>
                </div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="monthMeta in mysqlCounts[pais.code] ? getMySQLAvailableMonths(pais.code) : getAvailableMonthsMetadata(pais.code)"
                    :key="monthMeta.monthNumber"
                    :class="getMonthTagClasses(monthMeta)"
                    :title="getMonthTooltip(monthMeta)"
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200"
                  >
                    <UIcon 
                      :name="monthMeta.isComplete ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'" 
                      class="w-3 h-3 mr-1" 
                    />
                    {{ monthMeta.monthName }}
                  </span>
                </div>
                
                <!-- Mensaje si no hay meses -->
                <div v-if="(mysqlCounts[pais.code] ? getMySQLAvailableMonths(pais.code) : getAvailableMonthsMetadata(pais.code)).length === 0" class="text-xs text-gray-500 dark:text-gray-400">
                  No se detectaron meses con datos
                </div>
              </div>

              <!-- Debug: Validando datos locales -->
              <div v-if="loadedCounts[pais.code] && !mysqlCounts[pais.code] && !getCountryMetadata(pais.code)" class="text-xs text-blue-500 mt-2">
                Validando datos...
              </div>

              <!-- Estado de validación (solo para datos locales) -->
              <div v-if="isValidating && validationProgress?.paisCode === pais.code && !mysqlCounts[pais.code]" class="space-y-1 mt-3">
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-blue-600 animate-spin" />
                  <span class="text-xs font-medium text-blue-600">Validando datos...</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    class="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: `${(validationProgress.processedRecords / validationProgress.totalRecords) * 100}%` }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500">
                  {{ validationProgress.processedRecords }} / {{ validationProgress.totalRecords }} registros
                </p>
              </div>
            </div>
          </div>

          <!-- Sección de Acciones: Botones (solo para datos locales) -->
          <div class="flex-shrink-0">
            <div v-if="!mysqlCounts[pais.code] && loadedCounts[pais.code]" class="flex space-x-2">
              <!-- Botón limpiar -->
              <button
                v-if="!saveStates[pais.code] || saveStates[pais.code].status !== 'saving'"
                @click="$emit('clear-country', pais.code)"
                class="rounded-md inline-flex items-center px-3 py-2 text-sm gap-1 shadow-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                Limpiar
              </button>

              <!-- Botón reintentar (solo si hay error) -->
              <button
                v-if="saveStates[pais.code]?.status === 'error'"
                @click="$emit('retry-country', pais.code)"
                class="rounded-md inline-flex items-center px-3 py-2 text-sm gap-1 shadow-md bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen mejorado -->
    <div v-if="hasData" class="mt-6 p-6 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg border border-cyan-200 dark:border-cyan-700/50 shadow-lg">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
          <UIcon name="i-heroicons-table-cells" class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 dark:text-white">
            Total: {{ totalRecords.toLocaleString() }} registros
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            de {{ paisesCount }} {{ paisesCount === 1 ? 'país' : 'países' }}
          </p>
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
  },
  saveStates: {
    type: Object,
    default: () => ({})
  },
  monthsMetadata: {
    type: Object,
    default: () => ({})
  },
  isValidating: {
    type: Boolean,
    default: false
  },
  validationProgress: {
    type: Object,
    default: null
  },
  mysqlCounts: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['clear-country', 'clear-all', 'retry-country']);

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

// Métodos para manejo de metadata de meses
const getCountryMetadata = (paisCode) => {
  const metadata = props.monthsMetadata[paisCode] || null;
  console.log(`🔍 Metadata para ${paisCode}:`, metadata);
  return metadata;
};

const getAvailableMonthsMetadata = (paisCode) => {
  const metadata = getCountryMetadata(paisCode);
  if (!metadata) return [];
  
  const availableMonths = metadata.monthsMetadata.filter(month => month.hasData);
  console.log(`📅 Meses disponibles para ${paisCode}:`, availableMonths);
  return availableMonths;
};

const getMonthTagClasses = (monthMeta) => {
  if (monthMeta.isComplete) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700';
  } else {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
  }
};

const getMonthTooltip = (monthMeta) => {
  if (monthMeta.isComplete) {
    return `Mes ${monthMeta.monthName}: Datos completos`;
  } else {
    return `Mes ${monthMeta.monthName}: Datos incompletos (${monthMeta.errorCount} errores)`;
  }
};

// Validación de consistencia de meses
const monthsConsistencyValidation = computed(() => {
  // Recolectar todos los países con datos (local + MySQL)
  const countriesWithData = [];
  
  // Agregar países locales
  Object.keys(props.loadedCounts).forEach(paisCode => {
    const metadata = getCountryMetadata(paisCode);
    if (metadata && metadata.availableMonths.length > 0) {
      countriesWithData.push({
        paisCode,
        months: metadata.availableMonths.sort((a, b) => a - b),
        source: 'local'
      });
    }
  });
  
  // Agregar países MySQL
  Object.keys(props.mysqlCounts).forEach(paisCode => {
    const mysqlData = props.mysqlCounts[paisCode];
    if (mysqlData && mysqlData.availableMonths && mysqlData.availableMonths.length > 0) {
      countriesWithData.push({
        paisCode,
        months: mysqlData.availableMonths.sort((a, b) => a - b),
        source: 'mysql'
      });
    }
  });
  
  // Si no hay países con datos, no hay inconsistencia
  if (countriesWithData.length === 0) {
    return {
      isConsistent: true,
      referencePais: null,
      referenceMonths: [],
      inconsistentCountries: [],
      message: null
    };
  }
  
  // Encontrar el país con más meses (referencia)
  const referenceCountry = countriesWithData.reduce((max, country) => 
    country.months.length > max.months.length ? country : max
  );
  
  const referenceMonths = referenceCountry.months;
  
  // Validar que todos tengan los mismos meses
  const inconsistentCountries = countriesWithData.filter(country => {
    if (country.months.length !== referenceMonths.length) return true;
    return !country.months.every((month, idx) => month === referenceMonths[idx]);
  });
  
  const isConsistent = inconsistentCountries.length === 0;
  
  return {
    isConsistent,
    referencePais: referenceCountry.paisCode,
    referenceMonths,
    inconsistentCountries: inconsistentCountries.map(c => c.paisCode),
    totalCountries: countriesWithData.length,
    message: isConsistent 
      ? null 
      : `${inconsistentCountries.length} país(es) tienen meses diferentes`
  };
});

// Función para detectar país inconsistente
const isCountryInconsistent = (paisCode) => {
  return monthsConsistencyValidation.value.inconsistentCountries.includes(paisCode);
};

// Función para obtener meses de MySQL
const getMySQLAvailableMonths = (paisCode) => {
  const mysqlData = props.mysqlCounts[paisCode];
  if (!mysqlData || !mysqlData.availableMonths) return [];
  
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  return mysqlData.availableMonths.map(monthNum => ({
    monthNumber: monthNum,
    monthName: monthNames[monthNum - 1],
    isComplete: true, // Asumimos que están completos si están en MySQL
    hasData: true,
    errorCount: 0
  }));
};

// Función para obtener el total de registros de un país
const getTotalRecordsForCountry = (paisCode) => {
  // Prioridad 1: MySQL
  if (props.mysqlCounts[paisCode]) {
    return typeof props.mysqlCounts[paisCode] === 'object' 
      ? props.mysqlCounts[paisCode].count 
      : props.mysqlCounts[paisCode];
  }
  
  // Prioridad 2: Local
  if (props.loadedCounts[paisCode]) {
    return props.loadedCounts[paisCode];
  }
  
  // Sin datos
  return 0;
};

// Función para obtener las clases CSS del header según el estado del país
const getHeaderClasses = (paisCode) => {
  // PRIORIDAD 1: Validar consistencia de meses (cyan claro)
  if (isCountryInconsistent(paisCode)) {
    return 'bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-800 dark:to-cyan-900';
  }
  
  // PRIORIDAD 2: Estado de MySQL (emerald claro)
  if (props.mysqlCounts[paisCode]) {
    return 'bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900';
  }
  
  // PRIORIDAD 3: Sin datos (gris claro)
  if (!props.loadedCounts[paisCode]) {
    return 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800';
  }
  
  // PRIORIDAD 4: Estados de guardado local
  const saveState = props.saveStates[paisCode];
  if (!saveState) {
    // Pendiente (amber claro)
    return 'bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900';
  }
  
  switch (saveState.status) {
    case 'saving':
      // Guardando (cyan claro)
      return 'bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-800 dark:to-cyan-900 animate-pulse';
    case 'saved':
      // Guardado exitoso (emerald claro)
      return 'bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900';
    case 'error':
      // Error (cyan claro)
      return 'bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-800 dark:to-cyan-900';
    default:
      // Pendiente (amber claro)
      return 'bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900';
  }
};

// Función para obtener las clases CSS según el estado del país
const getCardClasses = (paisCode) => {
  // PRIORIDAD 1: Validar consistencia de meses
  if (isCountryInconsistent(paisCode)) {
    return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400';
  }
  
  // PRIORIDAD 2: Estado de MySQL
  if (props.mysqlCounts[paisCode]) {
    return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400';
  }

  // PRIORIDAD 3: Sin datos
  if (!props.loadedCounts[paisCode]) {
    return 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600';
  }

  // PRIORIDAD 4: Estados de guardado local
  const saveState = props.saveStates[paisCode];
  if (!saveState) {
    return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600';
  }

  switch (saveState.status) {
    case 'saving':
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 animate-pulse';
    case 'saved':
      return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400';
    case 'error':
      return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400';
    default:
      return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600';
  }
};
</script>
