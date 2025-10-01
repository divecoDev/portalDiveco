<template>
  <div class="space-y-6">
    <!-- Header con resumen -->
    <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden">
      <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-white mr-3" />
            <div>
              <h2 class="text-xl font-semibold text-white">Archivos de Insumos</h2>
              <p class="text-sm text-cyan-100">Descarga los archivos originales cargados</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <UButton
              v-if="loading"
              disabled
              icon="i-heroicons-arrow-path"
              class="animate-spin"
              size="sm"
            />
            <UButton
              v-else
              icon="i-heroicons-arrow-path"
              @click="refreshData"
              size="sm"
              variant="ghost"
              class="text-white hover:bg-white/20"
            />
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="p-6">
        <!-- Estado de carga -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-300">Cargando archivos...</p>
          </div>
        </div>

        <!-- Estado de error -->
        <div v-else-if="error" class="text-center py-12">
          <div class="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Error al cargar archivos</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">{{ error }}</p>
          <UButton
            icon="i-heroicons-arrow-path"
            @click="refreshData"
            class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
          >
            Reintentar
          </UButton>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="!boomData" class="text-center py-16">
          <div class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">No hay archivos disponibles</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            No se encontraron archivos de insumos para esta explosión.
          </p>
        </div>

        <!-- Lista de archivos disponibles -->
        <div v-else class="space-y-4">
          <!-- Plan de Ventas -->
          <div v-if="boomData.insumoPlanVentasPath" class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-md border border-gray-200/50 dark:border-gray-600/50 p-4 transition-all duration-300 hover:shadow-md hover:border-cyan-300/40 dark:hover:border-cyan-600/40">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center shadow-sm">
                  <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Plan de Ventas</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ getFileName(boomData.insumoPlanVentasPath) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  @click="downloadFile('planVentas', boomData.insumoPlanVentasPath)"
                  :loading="downloadingFiles.planVentas"
                  size="sm"
                  color="primary"
                  variant="ghost"
                  class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                >
                  Descargar
                </UButton>
              </div>
            </div>
          </div>

          <!-- Existencias -->
          <div v-if="boomData.insumoExistenciasPath" class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-md border border-gray-200/50 dark:border-gray-600/50 p-4 transition-all duration-300 hover:shadow-md hover:border-cyan-300/40 dark:hover:border-cyan-600/40">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center shadow-sm">
                  <UIcon name="i-heroicons-cube" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Existencias</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ getFileName(boomData.insumoExistenciasPath) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  @click="downloadFile('existencias', boomData.insumoExistenciasPath)"
                  :loading="downloadingFiles.existencias"
                  size="sm"
                  color="primary"
                  variant="ghost"
                  class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                >
                  Descargar
                </UButton>
              </div>
            </div>
          </div>

          <!-- Cobertura -->
          <div v-if="boomData.insumoCoberturaPath" class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-md border border-gray-200/50 dark:border-gray-600/50 p-4 transition-all duration-300 hover:shadow-md hover:border-cyan-300/40 dark:hover:border-cyan-600/40">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center shadow-sm">
                  <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Cobertura</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ getFileName(boomData.insumoCoberturaPath) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  @click="downloadFile('cobertura', boomData.insumoCoberturaPath)"
                  :loading="downloadingFiles.cobertura"
                  size="sm"
                  color="primary"
                  variant="ghost"
                  class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                >
                  Descargar
                </UButton>
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay archivos -->
          <div v-if="!hasAnyFiles" class="text-center py-8">
            <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/50 rounded-md flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay archivos disponibles</h4>
            <p class="text-gray-600 dark:text-gray-300">Los archivos de insumos no han sido cargados aún.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCargaInsumosData } from '~/composables/useCargaInsumosData';
import { getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';

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
const boomData = ref<any>(null);
const downloadingFiles = ref({
  planVentas: false,
  existencias: false,
  cobertura: false
});

// Cliente de Amplify
const client = generateClient();

// Computed para verificar si hay archivos disponibles
const hasAnyFiles = computed(() => {
  return boomData.value && (
    boomData.value.insumoPlanVentasPath ||
    boomData.value.insumoExistenciasPath ||
    boomData.value.insumoCoberturaPath
  );
});

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
    
    // Cargar datos del Boom si hay explosionId
    if (props.explosionId) {
      await loadBoomData();
    }
  } catch (err) {
    console.error('Error cargando datos:', err);
  }
};

const loadBoomData = async () => {
  try {
    console.log(`🔍 Cargando datos del Boom para explosionId: ${props.explosionId}`);
    
    const { data: boomResponse } = await (client as any).models.Boom.get({ id: props.explosionId });
    
    if (boomResponse) {
      boomData.value = boomResponse;
      console.log(`✅ Datos del Boom cargados:`, boomResponse);
    } else {
      console.log(`⚠️ No se encontraron datos del Boom para ID: ${props.explosionId}`);
    }
  } catch (err) {
    console.error('Error cargando datos del Boom:', err);
  }
};

const refreshData = async () => {
  clearState();
  boomData.value = null;
  await loadData();
};

// Función para obtener el nombre del archivo desde el path
const getFileName = (path: string) => {
  if (!path) return 'Archivo no disponible';
  
  // Extraer el nombre del archivo del path
  const fileName = path.split('/').pop() || 'archivo';
  
  // Remover timestamp si existe (formato: timestamp_nombrearchivo.ext)
  const parts = fileName.split('_');
  if (parts.length > 1) {
    return parts.slice(1).join('_');
  }
  
  return fileName;
};

// Función para descargar archivos usando la API de Amplify Storage
const downloadFile = async (tipo: 'planVentas' | 'existencias' | 'cobertura', s3Path: string) => {
  if (!s3Path) {
    useToast().add({
      title: 'Error',
      description: 'No hay archivo disponible para descargar',
      color: 'error'
    });
    return;
  }

  try {
    console.log(`📥 Iniciando descarga de archivo ${tipo}: ${s3Path}`);
    
    // Marcar como descargando
    downloadingFiles.value[tipo] = true;

    // Obtener URL de descarga usando getUrl de Amplify Storage
    const { url, expiresAt } = await getUrl({
      path: s3Path,
      options: {
        expiresIn: 3600, // 1 hora de validez
        validateObjectExistence: true // Verificar que el archivo existe
      }
    });

    console.log(`✅ URL de descarga obtenida:`, url.toString());
    console.log(`⏰ URL expira en:`, expiresAt);

    // Crear enlace de descarga y activarlo
    const link = document.createElement('a');
    link.href = url.toString();
    link.download = getFileName(s3Path);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Agregar al DOM, hacer click y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    useToast().add({
      title: 'Descarga iniciada',
      description: `El archivo ${tipo} se está descargando`,
      color: 'success'
    });

  } catch (error) {
    console.error(`❌ Error descargando archivo ${tipo}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    useToast().add({
      title: 'Error al descargar',
      description: `No se pudo descargar el archivo: ${errorMessage}`,
      color: 'error'
    });
  } finally {
    // Marcar como no descargando
    downloadingFiles.value[tipo] = false;
  }
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

watch(() => props.explosionId, (newExplosionId) => {
  if (newExplosionId && props.autoLoad) {
    loadBoomData();
  }
});

// Exponer métodos para uso externo
defineExpose({
  loadData,
  refreshData,
  clearState,
  downloadFile
});
</script>
