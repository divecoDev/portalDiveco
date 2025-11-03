<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos de meta diaria...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error cargando datos</p>
          <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!data || data.length === 0" class="text-center py-12">
      <div class="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/30 dark:to-gray-700/30 rounded-md flex items-center justify-center mx-auto mb-6 shadow-lg">
        <UIcon name="i-heroicons-information-circle" class="w-16 h-16 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay datos disponibles</h3>
      <p class="text-gray-600 dark:text-gray-400">No se encontraron registros de meta diaria para esta SUIC.</p>
    </div>

    <!-- Data Display -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-md">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-white flex items-center">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 mr-3" />
            Validación de Datos Meta Diaria
          </h3>
          <div class="flex items-center space-x-4 text-white/90 text-sm">
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-building-office-2" class="w-4 h-4" />
              <span>{{ summary.sociedades.length }} Sociedades</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              <span>{{ summary.mesesDisponibles.length }} Meses</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen Ejecutivo -->
      <div class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-5 rounded-lg border border-cyan-200 dark:border-cyan-700 shadow-lg">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-clipboard-document-check" class="w-6 h-6 text-white" />
          </div>
          <h4 class="text-lg font-bold text-gray-900 dark:text-white">Resumen General</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Total Sociedades -->
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-cyan-100 dark:border-cyan-800">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <p class="text-xs text-gray-600 dark:text-gray-400">Sociedades</p>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ summary.sociedades.length }}</p>
          </div>
          
          <!-- Total Meses -->
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-cyan-100 dark:border-cyan-800">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <p class="text-xs text-gray-600 dark:text-gray-400">Meses</p>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ summary.mesesDisponibles.length }}</p>
          </div>

          <!-- Total Cantidad -->
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-cyan-100 dark:border-cyan-800">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon name="i-heroicons-cube" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p class="text-xs text-gray-600 dark:text-gray-400">Total Cantidad</p>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(totalCantidad) }}</p>
          </div>

          <!-- Total Venta Neta -->
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-cyan-100 dark:border-cyan-800">
            <div class="flex items-center space-x-2 mb-2">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-green-600 dark:text-green-400" />
              <p class="text-xs text-gray-600 dark:text-gray-400">Total Venta</p>
            </div>
            <p class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">${{ formatCurrency(totalVenta) }}</p>
          </div>
        </div>
      </div>

      <!-- Cards por Sociedad -->
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="sociedad in sortedSociedades"
          :key="sociedad"
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 hover:shadow-xl transition-all duration-300"
        >
          <!-- Header de Sociedad -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-5 py-3 border-b border-gray-200 dark:border-gray-600 rounded-t-md">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-building-office-2" class="w-6 h-6 text-white" />
                </div>
                <h4 class="text-lg font-bold text-gray-900 dark:text-white">
                  Sociedad {{ sociedad }}
                </h4>
              </div>
              <!-- Totales de la Sociedad -->
              <div class="flex items-center space-x-6">
                <div class="text-right">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Cantidad Total</p>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">
                    {{ formatNumber(getSociedadTotalCantidad(sociedad)) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Venta Neta Total</p>
                  <p class="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    ${{ formatCurrency(getSociedadTotalVenta(sociedad)) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabla de Meses (meses en columnas) -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700/50 z-10">
                    Tipo de Dato
                  </th>
                  <th 
                    v-for="(mes, index) in getSortedMeses(sociedad)" 
                    :key="`mes-${mes}`"
                    :class="[
                      'px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-24',
                      index % 2 === 0 ? 'bg-gray-100 dark:bg-gray-700/70' : 'bg-gray-50 dark:bg-gray-800/50'
                    ]"
                  >
                    {{ getMonthName(mes) }}
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gradient-to-r from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <!-- Fila de Cantidad -->
                <tr class="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-colors duration-150">
                  <td class="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10">
                    <div class="flex items-center space-x-2">
                      <UIcon name="i-heroicons-cube" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">Cantidad</span>
                    </div>
                  </td>
                  <td 
                    v-for="(mes, index) in getSortedMeses(sociedad)"
                    :key="`cantidad-${mes}`"
                    :class="[
                      'px-4 py-3 whitespace-nowrap text-center',
                      index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900/50'
                    ]"
                  >
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ formatNumber(getValueForMes(sociedad, mes, 'cantidad')) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-right bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">
                      {{ formatNumber(getSociedadTotalCantidad(sociedad)) }}
                    </span>
                  </td>
                </tr>
                <!-- Fila de Venta Neta -->
                <tr class="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-colors duration-150">
                  <td class="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10">
                    <div class="flex items-center space-x-2">
                      <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">Venta Neta</span>
                    </div>
                  </td>
                  <td 
                    v-for="(mes, index) in getSortedMeses(sociedad)"
                    :key="`venta-${mes}`"
                    :class="[
                      'px-4 py-3 whitespace-nowrap text-center',
                      index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900/50'
                    ]"
                  >
                    <span class="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                      ${{ formatCurrency(getValueForMes(sociedad, mes, 'venta')) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-right bg-gradient-to-r from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30">
                    <span class="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      ${{ formatCurrency(getSociedadTotalVenta(sociedad)) }}
                    </span>
                  </td>
                </tr>
                <!-- Fila de PPU -->
                <tr class="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-colors duration-150">
                  <td class="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10">
                    <div class="flex items-center space-x-2">
                      <UIcon name="i-heroicons-hashtag" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">PPU</span>
                    </div>
                  </td>
                  <td 
                    v-for="(mes, index) in getSortedMeses(sociedad)"
                    :key="`ppu-${mes}`"
                    :class="[
                      'px-4 py-3 whitespace-nowrap text-center',
                      index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900/50'
                    ]"
                    :title="'PPU = Venta Neta / Cantidad'"
                  >
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ formatPPU(getValueForMes(sociedad, mes, 'venta'), getValueForMes(sociedad, mes, 'cantidad')) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-right bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">
                      {{ formatPPU(getSociedadTotalVenta(sociedad), getSociedadTotalCantidad(sociedad)) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  summary: {
    type: Object,
    default: () => ({
      sociedades: [],
      mesesDisponibles: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

// Nombre de meses
const monthNames = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic'
};

// Computed
const sortedSociedades = computed(() => {
  return props.summary?.sociedades.sort() || [];
});

const totalCantidad = computed(() => {
  return props.data?.reduce((sum, row) => sum + row.Total_Cantidad, 0) || 0;
});

const totalVenta = computed(() => {
  return props.data?.reduce((sum, row) => sum + row.Total_Venta_Neta, 0) || 0;
});

// Métodos
const getSociedadData = (sociedad) => {
  return props.data?.filter(row => row.Sociedad === sociedad) || [];
};

const getSociedadTotalCantidad = (sociedad) => {
  return getSociedadData(sociedad).reduce((sum, row) => sum + row.Total_Cantidad, 0);
};

const getSociedadTotalVenta = (sociedad) => {
  return getSociedadData(sociedad).reduce((sum, row) => sum + row.Total_Venta_Neta, 0);
};

const getSortedMeses = (sociedad) => {
  const meses = getSociedadData(sociedad).map(row => row.MesExtraido);
  return [...new Set(meses)].sort();
};

const getValueForMes = (sociedad, mes, tipo) => {
  const row = getSociedadData(sociedad).find(r => r.MesExtraido === mes);
  if (!row) return 0;
  
  if (tipo === 'cantidad') {
    return row.Total_Cantidad;
  } else if (tipo === 'venta') {
    return row.Total_Venta_Neta;
  }
  return 0;
};

const getMonthName = (mes) => {
  return monthNames[mes] || mes;
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-GT').format(num);
};

const formatCurrency = (num) => {
  return formatNumber(Math.round(num));
};

// Formateo seguro PPU (dos decimales, evita división por cero)
const formatPPU = (venta, cantidad) => {
  const v = Number(venta) || 0;
  const q = Number(cantidad) || 0;
  if (q <= 0 || !Number.isFinite(v) || !Number.isFinite(q)) return '-';
  const ppu = v / q;
  if (!Number.isFinite(ppu)) return '-';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ppu);
};
</script>

