<template>
  <div class="space-y-6">
    <!-- Header con resumen -->


  </div>
</template>

<script setup lang="ts">
import { useCargaInsumosData } from '~/composables/useCargaInsumosData';
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
