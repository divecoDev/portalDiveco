<template>
  <div>
    <!-- Header con título y botón de limpiar todo -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        Datos Cargados por País
      </h3>
      <button
        v-if="hasData && !disableActions"
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
        v-for="pais in paisesWithData"
        :key="pais.code"
        :class="[
          'w-full rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden',
          getCardClasses(pais.code)
        ]"
      >
        <!-- Header del país: ocupa todo el ancho -->
        <div class="w-full px-5 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              
              <div>
                <h4 class="text-lg font-bold text-gray-800 dark:text-gray-200">{{ pais.name }}</h4>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- Total de registros -->
              <div class="flex items-center space-x-2">
                <UIcon 
                  :name="mysqlCounts[pais.code] ? 'i-heroicons-database' : 'i-heroicons-table-cells'" 
                  class="w-6 h-6 text-gray-700 dark:text-gray-300 opacity-90" 
                />
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {{ getTotalRecordsForCountry(pais.code).toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">registros</p>
          </div>
        </div>

              <!-- Total de Unidades -->
              <div v-if="getCountryTotalUnits(pais.code) > 0" class="flex items-center space-x-2">
                <UIcon name="i-heroicons-cube" class="w-5 h-5 text-gray-700 dark:text-gray-300 opacity-90" />
                <div class="text-right">
                  <p class="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {{ getCountryTotalUnits(pais.code).toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">unidades</p>
                </div>
              </div>
              
              <!-- Total de Ventas -->
              <div v-if="getCountryTotalSales(pais.code) > 0" class="flex items-center space-x-2">
                <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 text-green-700 dark:text-green-400 opacity-90" />
                <div class="text-right">
                  <p class="text-xl font-bold text-green-700 dark:text-green-400">
                    ${{ getCountryTotalSales(pais.code).toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">ventas</p>
                </div>
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
                
                <!-- Estado Completado (guardado exitosamente pero aún no en MySQL) -->
                <div v-else-if="saveStates[pais.code]?.status === 'saved'" class="flex items-center space-x-1.5 bg-emerald-200/80 backdrop-blur-sm px-3 py-1.5 rounded border border-emerald-300/50">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-700" />
                  <span class="text-xs font-semibold text-emerald-800">Completado</span>
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
        <div class="flex flex-col lg:flex-row lg:items-center">
          <!-- Sección Central: Información de datos -->
          <div class="flex-1 min-w-0">
            <div class="space-y-3">
              <!-- Tabla de meses disponibles (para datos locales O MySQL) -->
              <div v-if="(loadedCounts[pais.code] && !mysqlCounts[pais.code] && getCountryMetadata(pais.code)) || mysqlCounts[pais.code]" class="space-y-2">
                <!-- Tabla de datos por mes (MySQL o Local con datos) -->
                <div v-if="getAvailableMonthsForTable(pais.code).length > 0" class="overflow-x-auto">
                  <table class="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <thead>
                      <tr class="bg-gray-50 dark:bg-gray-700">
                        <th class="px-2 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600"></th>
                        <th 
                          v-for="monthMeta in getAvailableMonthsForTable(pais.code)"
                          :key="monthMeta.monthNumber"
                          class="px-2 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 last:border-r-0 min-w-[60px]"
                        >
                          {{ monthMeta.monthName }}
                        </th>
                        <th class="px-2 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-600 min-w-[70px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Fila de Unidades -->
                      <tr class="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td class="px-2 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600 whitespace-nowrap">
                          📦 Unidades
                        </td>
                        <td 
                          v-for="monthMeta in getAvailableMonthsForTable(pais.code)"
                          :key="`units-${monthMeta.monthNumber}`"
                          class="px-2 py-2 text-xs text-center text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
                        >
                          <span v-if="getMonthUnitsTotal(pais.code, monthMeta.monthNumber) > 0">
                            {{ getMonthUnitsTotal(pais.code, monthMeta.monthNumber).toLocaleString('en-US') }}
                          </span>
                          <span v-else class="text-gray-400 dark:text-gray-600">-</span>
                        </td>
                        <td class="px-2 py-2 text-xs text-center text-gray-800 dark:text-gray-200 border-l border-gray-300 dark:border-gray-600">
                          <span v-if="getCountryTotalUnits(pais.code) > 0">
                            {{ getCountryTotalUnits(pais.code).toLocaleString('en-US') }}
                          </span>
                          <span v-else class="text-gray-400 dark:text-gray-600">-</span>
                        </td>
                      </tr>
                      <!-- Fila de Ventas -->
                      <tr class="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td class="px-2 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600 whitespace-nowrap">
                          💰 Ventas
                        </td>
                        <td 
                          v-for="monthMeta in getAvailableMonthsForTable(pais.code)"
                          :key="`sales-${monthMeta.monthNumber}`"
                          class="px-2 py-2 text-xs text-center text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
                        >
                          <span v-if="getMonthSalesTotal(pais.code, monthMeta.monthNumber) > 0">
                            ${{ getMonthSalesTotal(pais.code, monthMeta.monthNumber).toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
                          </span>
                          <span v-else class="text-gray-400 dark:text-gray-600">-</span>
                        </td>
                        <td class="px-2 py-2 text-xs text-center text-gray-800 dark:text-gray-200 border-l border-gray-300 dark:border-gray-600">
                          <span v-if="getCountryTotalSales(pais.code) > 0">
                            ${{ getCountryTotalSales(pais.code).toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
                          </span>
                          <span v-else class="text-gray-400 dark:text-gray-600">-</span>
                        </td>
                      </tr>
                      <!-- Fila de PPU -->
                      <tr class="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-cyan-50/30 dark:bg-cyan-900/10">
                        <td class="px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 whitespace-nowrap">
                          📊 PPU
                        </td>
                        <td 
                          v-for="monthMeta in getAvailableMonthsForTable(pais.code)"
                          :key="`ppu-${monthMeta.monthNumber}`"
                          class="px-2 py-2 text-xs text-center text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
                          :title="'PPU = Ventas Netas / Unidades'"
                        >
                          <span v-if="getMonthUnitsTotal(pais.code, monthMeta.monthNumber) > 0 && getMonthSalesTotal(pais.code, monthMeta.monthNumber) > 0">
                            {{ formatNumberSafe(getMonthSalesTotal(pais.code, monthMeta.monthNumber) / getMonthUnitsTotal(pais.code, monthMeta.monthNumber), 2) }}
                          </span>
                          <span v-else class="text-gray-400 dark:text-gray-600">-</span>
                        </td>
                        <td class="px-2 py-2 text-xs text-center text-gray-800 dark:text-gray-200 border-l border-gray-300 dark:border-gray-600 font-semibold">
                          <span v-if="getCountryTotalUnits(pais.code) > 0 && getCountryTotalSales(pais.code) > 0">
                            {{ formatNumberSafe(getCountryTotalSales(pais.code) / getCountryTotalUnits(pais.code), 2) }}
                          </span>
                          <span v-else class="text-gray-400 dark:text-gray-600">-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Tags simples como fallback -->
                <div v-else class="flex flex-wrap gap-1">
                <span
                    v-for="monthMeta in getAvailableMonthsMetadata(pais.code)"
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
            </div>

            <!-- Debug: Validando datos locales -->
            <div v-if="loadedCounts[pais.code] && !mysqlCounts[pais.code] && !getCountryMetadata(pais.code)" class="text-xs text-blue-500 mt-2 mx-4">
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
          <div v-if="!mysqlCounts[pais.code] && loadedCounts[pais.code] && !disableActions" class="flex space-x-2 p-4">
            <!-- Botón limpiar -->
            <button
              v-if="!saveStates[pais.code] || saveStates[pais.code].status !== 'saving'"
              @click="$emit('clear-country', pais.code)"
              class="rounded-md  inline-flex items-center px-3 py-2 text-sm gap-1 shadow-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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
      <div class="space-y-4">
        <!-- Header del resumen -->
        <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-chart-pie" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white">Resumen General</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ paisesCount }} {{ paisesCount === 1 ? 'país' : 'países' }}
            </p>
          </div>
        </div>

        <!-- Grid de totales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <!-- Total Registros -->
          <div class="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-table-cells" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ totalRecords.toLocaleString() }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">registros</p>
            </div>
          </div>

          <!-- Total Unidades -->
          <div v-if="totalUnitsAllCountries > 0" class="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-cube" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ totalUnitsAllCountries.toLocaleString() }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">unidades</p>
            </div>
          </div>

          <!-- Total Ventas -->
          <div v-if="totalSalesAllCountries > 0" class="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p class="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                ${{ totalSalesAllCountries.toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">ventas</p>
            </div>
          </div>

          <!-- Total PPU -->
          <div v-if="totalPPUAllCountries > 0" class="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-xl font-bold text-purple-700 dark:text-purple-400">
                {{ formatNumberSafe(totalPPUAllCountries, 2) }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">PPU</p>
            </div>
          </div>
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
  },
  disableActions: {
    type: Boolean,
    default: false
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

const hasData = computed(() => Object.keys(props.loadedCounts).length > 0 || Object.keys(props.mysqlCounts).length > 0);
const totalRecords = computed(() => {
  const loadedTotal = Object.values(props.loadedCounts).reduce((sum, c) => sum + c, 0);
  const mysqlTotal = Object.values(props.mysqlCounts).reduce((sum, c) => {
    if (typeof c === 'object' && c.count) return sum + c.count;
    if (typeof c === 'number') return sum + c;
    return sum;
  }, 0);
  return loadedTotal + mysqlTotal;
});
const paisesCount = computed(() => {
  const loadedKeys = Object.keys(props.loadedCounts).length;
  const mysqlKeys = Object.keys(props.mysqlCounts).length;
  const allKeys = new Set([...Object.keys(props.loadedCounts), ...Object.keys(props.mysqlCounts)]);
  return allKeys.size;
});

// Filtrar países que tienen datos (MySQL o locales)
const paisesWithData = computed(() => {
  return paises.filter(pais => {
    const hasMySQLData = props.mysqlCounts[pais.code] !== undefined;
    const hasLocalData = props.loadedCounts[pais.code] !== undefined;
    return hasMySQLData || hasLocalData;
  });
});

// Totales generales de Unidades y Ventas
const totalUnitsAllCountries = computed(() => {
  let total = 0;
  
  // Sumar totales de MySQL
  Object.keys(props.mysqlCounts).forEach(paisCode => {
    const mysqlData = props.mysqlCounts[paisCode];
    if (mysqlData?.unidadesByMonth && mysqlData.unidadesByMonth.length > 0) {
      const countryTotal = mysqlData.unidadesByMonth.reduce((sum, units) => sum + (units || 0), 0);
      total += countryTotal;
    }
  });
  
  // Sumar totales de datos locales
  Object.keys(props.monthsMetadata).forEach(paisCode => {
    // Solo si NO está en MySQL (evitar duplicados)
    if (!props.mysqlCounts[paisCode]) {
      const localData = props.monthsMetadata[paisCode];
      if (localData?.unidadesByMonth && localData.unidadesByMonth.length > 0) {
        const countryTotal = localData.unidadesByMonth.reduce((sum, units) => sum + (units || 0), 0);
        total += countryTotal;
      }
    }
  });
  
  return total;
});

const totalSalesAllCountries = computed(() => {
  let total = 0;
  
  // Sumar totales de MySQL
  Object.keys(props.mysqlCounts).forEach(paisCode => {
    const mysqlData = props.mysqlCounts[paisCode];
    if (mysqlData?.ventasByMonth && mysqlData.ventasByMonth.length > 0) {
      const countryTotal = mysqlData.ventasByMonth.reduce((sum, sales) => sum + (sales || 0), 0);
      total += countryTotal;
    }
  });
  
  // Sumar totales de datos locales
  Object.keys(props.monthsMetadata).forEach(paisCode => {
    // Solo si NO está en MySQL (evitar duplicados)
    if (!props.mysqlCounts[paisCode]) {
      const localData = props.monthsMetadata[paisCode];
      if (localData?.ventasByMonth && localData.ventasByMonth.length > 0) {
        const countryTotal = localData.ventasByMonth.reduce((sum, sales) => sum + (sales || 0), 0);
        total += countryTotal;
      }
    }
  });
  
  return total;
});

// Total PPU (Precio Por Unidad) de todos los países
const totalPPUAllCountries = computed(() => {
  const totalSales = totalSalesAllCountries.value;
  const totalUnits = totalUnitsAllCountries.value;
  
  if (totalUnits === 0 || totalSales === 0) return 0;
  
  return totalSales / totalUnits;
});

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

// Función para obtener meses disponibles (MySQL o Local con datos)
const getAvailableMonthsForTable = (paisCode) => {
  // Prioridad 1: MySQL
  const mysqlData = props.mysqlCounts[paisCode];
  if (mysqlData && mysqlData.availableMonths) {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return mysqlData.availableMonths.map(monthNum => ({
      monthNumber: monthNum,
      monthName: monthNames[monthNum - 1]
    }));
  }
  
  // Prioridad 2: Local
  const localMetadata = props.monthsMetadata[paisCode];
  if (localMetadata && localMetadata.availableMonths && localMetadata.availableMonths.length > 0) {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return localMetadata.availableMonths.map(monthNum => ({
      monthNumber: monthNum,
      monthName: monthNames[monthNum - 1]
    }));
  }
  
  return [];
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

// Función para obtener el total de unidades de un país (suma de todos los meses)
const getCountryTotalUnits = (paisCode) => {
  // Prioridad 1: MySQL
  const mysqlData = props.mysqlCounts[paisCode];
  if (mysqlData?.unidadesByMonth && mysqlData.unidadesByMonth.length > 0) {
    return mysqlData.unidadesByMonth.reduce((sum, units) => sum + (units || 0), 0);
  }
  
  // Prioridad 2: Local
  const localMetadata = props.monthsMetadata[paisCode];
  if (localMetadata?.unidadesByMonth && localMetadata.unidadesByMonth.length > 0) {
    return localMetadata.unidadesByMonth.reduce((sum, units) => sum + (units || 0), 0);
  }
  
  return 0;
};

// Función para obtener el total de ventas de un país (suma de todos los meses)
const getCountryTotalSales = (paisCode) => {
  // Prioridad 1: MySQL
  const mysqlData = props.mysqlCounts[paisCode];
  if (mysqlData?.ventasByMonth && mysqlData.ventasByMonth.length > 0) {
    return mysqlData.ventasByMonth.reduce((sum, sales) => sum + (sales || 0), 0);
  }
  
  // Prioridad 2: Local
  const localMetadata = props.monthsMetadata[paisCode];
  if (localMetadata?.ventasByMonth && localMetadata.ventasByMonth.length > 0) {
    return localMetadata.ventasByMonth.reduce((sum, sales) => sum + (sales || 0), 0);
  }
  
  return 0;
};

// Función para obtener la suma de ventas de un mes específico
const getMonthSalesTotal = (paisCode, monthNumber) => {
  // Prioridad 1: MySQL
  const mysqlData = props.mysqlCounts[paisCode];
  if (mysqlData?.ventasByMonth && mysqlData.ventasByMonth.length >= monthNumber) {
    return mysqlData.ventasByMonth[monthNumber - 1];
  }
  
  // Prioridad 2: Local
  const localMetadata = props.monthsMetadata[paisCode];
  if (localMetadata?.ventasByMonth && localMetadata.ventasByMonth.length >= monthNumber) {
    return localMetadata.ventasByMonth[monthNumber - 1];
  }
  
  return 0;
};

// Función para formatear ventas
const formatSales = (value) => {
  if (!value || value === 0) return '';
  return `Ventas: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

// Función para obtener la suma de unidades de un mes específico
const getMonthUnitsTotal = (paisCode, monthNumber) => {
  // Prioridad 1: MySQL
  const mysqlData = props.mysqlCounts[paisCode];
  if (mysqlData?.unidadesByMonth && mysqlData.unidadesByMonth.length >= monthNumber) {
    return mysqlData.unidadesByMonth[monthNumber - 1];
  }
  
  // Prioridad 2: Local
  const localMetadata = props.monthsMetadata[paisCode];
  if (localMetadata?.unidadesByMonth && localMetadata.unidadesByMonth.length >= monthNumber) {
    return localMetadata.unidadesByMonth[monthNumber - 1];
  }
  
  return 0;
};

// Función para formatear unidades
const formatUnits = (value) => {
  if (!value || value === 0) return '';
  return `Unidades: ${value.toLocaleString('en-US')}`;
};

// Función para obtener las clases CSS según el estado del país
const getCardClasses = (paisCode) => {
  // PRIORIDAD 1: Validar consistencia de meses
  if (isCountryInconsistent(paisCode)) {
    return 'border-red-500 bg-white dark:bg-gray-800 dark:border-red-400';
  }
  
  // PRIORIDAD 2: Estado de MySQL
  if (props.mysqlCounts[paisCode]) {
    return 'border-green-500 bg-white dark:bg-gray-800 dark:border-green-400';
  }

  // PRIORIDAD 3: Sin datos
  if (!props.loadedCounts[paisCode]) {
    return 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600';
  }

  // PRIORIDAD 4: Estados de guardado local
  const saveState = props.saveStates[paisCode];
  if (!saveState) {
    return 'border-blue-300 bg-white dark:bg-gray-800 dark:border-blue-600';
  }

  switch (saveState.status) {
    case 'saving':
      return 'border-blue-500 bg-white dark:bg-gray-800 dark:border-blue-400';
    case 'saved':
      return 'border-green-500 bg-white dark:bg-gray-800 dark:border-green-400';
    case 'error':
      return 'border-red-500 bg-white dark:bg-gray-800 dark:border-red-400';
    default:
      return 'border-blue-300 bg-white dark:bg-gray-800 dark:border-blue-600';
  }
};

// Formateo seguro para PPU
const formatNumberSafe = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) return '-';
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
</script>
