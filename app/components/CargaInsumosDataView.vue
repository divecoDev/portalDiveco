<template>
  <div class="space-y-6">
    <!-- Header con resumen -->
    <div
      class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-t-lg"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon name="i-heroicons-circle-stack" class="w-6 h-6 text-white mr-3" />
          <h2 class="text-xl font-semibold text-white">Datos de Carga de Insumos</h2>
        </div>
        <div class="text-white text-sm">
          {{ formatDate(lastLoaded) }}
        </div>
      </div>
    </div>

    <!-- Resumen de datos -->
    <div class="p-6 bg-white dark:bg-gray-800">
      <div v-if="summary" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <!-- Total de registros -->
        <div
          class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700/50 shadow-sm"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Registros</p>
              <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {{ formatNumber(summary.totalRecords) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Total de documentos -->
        <div
          class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700/50 shadow-sm"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <UIcon name="i-heroicons-folder" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-green-600 dark:text-green-400 font-medium">Documentos</p>
              <p class="text-2xl font-bold text-green-700 dark:text-green-300">
                {{ formatNumber(summary.totalDocuments) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Plan de Ventas -->
        <div
          class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700/50 shadow-sm"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Plan Ventas</p>
              <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {{ formatNumber(summary.types.planVentas) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Existencias -->
        <div
          class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700/50 shadow-sm"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <UIcon name="i-heroicons-cube" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-orange-600 dark:text-orange-400 font-medium">Existencias</p>
              <p class="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {{ formatNumber(summary.types.existencias) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs para diferentes tipos de datos -->
      <UTabs v-model="selectedTab" :items="tabItems" class="w-full">
        <template #planVentas>
          <CargaInsumosDataTable
            v-if="planVentasData"
            :data="planVentasData.data"
            :metadata="planVentasData.metadata"
            tipo="planVentas"
            :loading="loading"
          />
          <div v-else-if="!loading" class="text-center py-12">
            <UIcon name="i-heroicons-chart-bar" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">No hay datos de Plan de Ventas</p>
          </div>
        </template>

        <template #existencias>
          <CargaInsumosDataTable
            v-if="existenciasData"
            :data="existenciasData.data"
            :metadata="existenciasData.metadata"
            tipo="existencias"
            :loading="loading"
          />
          <div v-else-if="!loading" class="text-center py-12">
            <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">No hay datos de Existencias</p>
          </div>
        </template>

        <template #cobertura>
          <CargaInsumosDataTable
            v-if="coberturaData"
            :data="coberturaData.data"
            :metadata="coberturaData.metadata"
            tipo="cobertura"
            :loading="loading"
          />
          <div v-else-if="!loading" class="text-center py-12">
            <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">No hay datos de Cobertura</p>
          </div>
        </template>
      </UTabs>

      <!-- Estado de carga -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos...</p>
      </div>

      <!-- Estado de error -->
      <div v-if="error && !loading" class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar datos</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">{{ error }}</p>
        <UButton
          icon="i-heroicons-arrow-path"
          color="red"
          variant="outline"
          @click="refreshData"
        >
          Reintentar
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCargaInsumosData } from '~/composables/useCargaInsumosData';
import CargaInsumosDataTable from './CargaInsumosDataTable.vue';

// Props
const props = withDefaults(defineProps<{
  documentId?: string;
  explosionId?: string;
  autoLoad?: boolean;
}>(), {
  autoLoad: true
});

// Composable
const {
  loading,
  error,
  data,
  summary,
  queryData,
  getDataByDocument,
  clearState
} = useCargaInsumosData();

// Estado local
const selectedTab = ref(0);

// Computed para tabs
const tabItems = computed(() => {
  const items = [];

  if (planVentasData.value) {
    items.push({
      key: 'planVentas',
      label: 'Plan de Ventas',
      icon: 'i-heroicons-chart-bar',
      count: planVentasData.value.data.length
    });
  }

  if (existenciasData.value) {
    items.push({
      key: 'existencias',
      label: 'Existencias',
      icon: 'i-heroicons-cube',
      count: existenciasData.value.data.length
    });
  }

  if (coberturaData.value) {
    items.push({
      key: 'cobertura',
      label: 'Cobertura',
      icon: 'i-heroicons-calendar-days',
      count: coberturaData.value.data.length
    });
  }

  return items;
});

// Computed para datos filtrados por tipo
const planVentasData = computed(() => {
  return data.value.find(record => record.tipo === 'planVentas');
});

const existenciasData = computed(() => {
  return data.value.find(record => record.tipo === 'existencias');
});

const coberturaData = computed(() => {
  return data.value.find(record => record.tipo === 'cobertura');
});

// Computed para última carga
const lastLoaded = computed(() => {
  if (!data.value.length) return null;

  const latestRecord = data.value.reduce((latest, record) => {
    const recordDate = new Date(record.metadata.loadedAt);
    const latestDate = new Date(latest.metadata.loadedAt);
    return recordDate > latestDate ? record : latest;
  });

  return latestRecord.metadata.loadedAt;
});

// Métodos
const loadData = async () => {
  try {
    if (props.documentId) {
      await getDataByDocument(props.documentId);
    } else {
      // Cargar resumen general
      await queryData();
    }
  } catch (err) {
    console.error('Error cargando datos:', err);
  }
};

const refreshData = async () => {
  clearState();
  await loadData();
};

// Utilidades de formateo
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-ES').format(num);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

// Lifecycle
onMounted(async () => {
  if (props.autoLoad) {
    await loadData();
  }
});

// Watchers
watch(() => props.documentId, (newDocumentId) => {
  if (newDocumentId && props.autoLoad) {
    loadData();
  }
});

// Exponer métodos para uso externo
defineExpose({
  loadData,
  refreshData,
  clearState
});
</script>
