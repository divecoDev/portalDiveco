<template>
  <div class="space-y-4">
    <!-- Header de la tabla con metadatos -->
    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <UIcon :name="getTipoIcon(tipo)" class="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ getTipoLabel(tipo) }}
          </span>
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ formatNumber(data.length) }} registros
        </div>
      </div>

      <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center">
          <UIcon name="i-heroicons-hashtag" class="w-4 h-4 mr-1" />
          <span>{{ metadata.batchId }}</span>
        </div>
        <div class="flex items-center">
          <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
          <span>{{ formatDate(metadata.loadedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Tabla de datos -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                v-for="column in visibleColumns"
                :key="column.key"
                scope="col"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(record, index) in paginatedData"
              :key="index"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
            >
              <td
                v-for="column in visibleColumns"
                :key="column.key"
                class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
              >
                <span v-if="column.type === 'number'" class="font-mono">
                  {{ formatNumber(record[column.key]) }}
                </span>
                <span v-else-if="column.type === 'date'">
                  {{ formatDate(record[column.key]) }}
                </span>
                <span v-else class="truncate max-w-xs block" :title="String(record[column.key] || '')">
                  {{ record[column.key] || '-' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
        <div class="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <span>
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{ Math.min(currentPage * itemsPerPage, data.length) }} de
            {{ formatNumber(data.length) }} registros
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <UButton
            icon="i-heroicons-chevron-left"
            size="sm"
            variant="ghost"
            :disabled="currentPage === 1"
            @click="currentPage--"
          />

          <span class="text-sm text-gray-700 dark:text-gray-300 px-2">
            Página {{ currentPage }} de {{ totalPages }}
          </span>

          <UButton
            icon="i-heroicons-chevron-right"
            size="sm"
            variant="ghost"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </div>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-8">
      <div class="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p class="text-sm text-gray-600 dark:text-gray-300">Cargando datos...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!data.length" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon :name="getTipoIcon(tipo)" class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sin datos</h3>
      <p class="text-gray-500 dark:text-gray-400">
        No se encontraron registros de {{ getTipoLabel(tipo).toLowerCase() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: any[];
  metadata: {
    documentId: string;
    batchId: string;
    fileName: string;
    loadedAt: string;
    totalRecords: number;
  };
  tipo: 'planVentas' | 'existencias' | 'cobertura';
  loading?: boolean;
  itemsPerPage?: number;
}>(), {
  loading: false,
  itemsPerPage: 50
});

// Estado local para paginación
const currentPage = ref(1);

// Configuración de columnas por tipo
const columnConfigs = {
  planVentas: [
    { key: 'ssour', label: 'SSOUR', type: 'text' },
    { key: 'vrsio', label: 'VRSIO', type: 'text' },
    { key: 'spmon', label: 'SPMON', type: 'text' },
    { key: 'sptag', label: 'SPTAG', type: 'text' },
    { key: 'spwoc', label: 'SPWOC', type: 'text' },
    { key: 'spbup', label: 'SPBUP', type: 'text' },
    { key: 'pmnux', label: 'PMNUX', type: 'number' },
    { key: 'wenux', label: 'WENUX', type: 'number' },
    { key: 'vsnda', label: 'VSNDA', type: 'text' },
    { key: 'periv', label: 'PERIV', type: 'text' },
    { key: 'vwdat', label: 'VWDAT', type: 'date' },
    { key: 'basme', label: 'BASME', type: 'text' },
    { key: 'absat', label: 'ABSAT', type: 'number' },
    { key: 'produ', label: 'PRODU', type: 'text' },
    { key: 'lagri', label: 'LAGRI', type: 'text' },
    { key: 'lagrz', label: 'LAGRZ', type: 'text' },
    { key: 'reich', label: 'REICH', type: 'text' },
    { key: 'reicz', label: 'REICZ', type: 'text' }
  ],
  existencias: [
    { key: 'version', label: 'Versión', type: 'text' },
    { key: 'centro', label: 'Centro', type: 'text' },
    { key: 'almacen', label: 'Almacén', type: 'text' },
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'periodo', label: 'Período', type: 'text' },
    { key: 'mes', label: 'Mes', type: 'text' },
    { key: 'libre_u', label: 'Libre U', type: 'number' },
    { key: 'no_liberado', label: 'No Liberado', type: 'number' },
    { key: 'bloqueado', label: 'Bloqueado', type: 'number' },
    { key: 'devolucion', label: 'Devolución', type: 'number' },
    { key: 'traslados', label: 'Traslados', type: 'number' },
    { key: 'calidad', label: 'Calidad', type: 'number' },
    { key: 'bloqueado_em', label: 'Bloqueado EM', type: 'number' }
  ],
  cobertura: [
    { key: 'version', label: 'Versión', type: 'text' },
    { key: 'centro', label: 'Centro', type: 'text' },
    { key: 'periodo', label: 'Período', type: 'text' },
    { key: 'mes', label: 'Mes', type: 'text' },
    { key: 'dias_habiles_mes_planta', label: 'Días Hábiles Mes Planta', type: 'number' },
    { key: 'dias_coberturas_mes', label: 'Días Coberturas Mes', type: 'number' },
    { key: 'dias_habiles_venta', label: 'Días Hábiles Venta', type: 'number' }
  ]
};

// Computed para columnas visibles
const visibleColumns = computed(() => {
  return columnConfigs[props.tipo] || [];
});

// Computed para datos paginados
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.data.slice(start, end);
});

// Computed para total de páginas
const totalPages = computed(() => {
  return Math.ceil(props.data.length / props.itemsPerPage);
});

// Métodos de utilidad
const getTipoIcon = (tipo: string) => {
  const icons: Record<string, string> = {
    planVentas: 'i-heroicons-chart-bar',
    existencias: 'i-heroicons-cube',
    cobertura: 'i-heroicons-calendar-days'
  };
  return icons[tipo] || 'i-heroicons-document-text';
};

const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    planVentas: 'Plan de Ventas',
    existencias: 'Existencias',
    cobertura: 'Cobertura'
  };
  return labels[tipo] || tipo;
};

const formatNumber = (num: number | string) => {
  if (num === null || num === undefined || num === '') return '-';

  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '-';

  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';

  try {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

// Reset paginación cuando cambian los datos
watch(() => props.data, () => {
  currentPage.value = 1;
});

// Reset paginación cuando cambia el tipo
watch(() => props.tipo, () => {
  currentPage.value = 1;
});
</script>
