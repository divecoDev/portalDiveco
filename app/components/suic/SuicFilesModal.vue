<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-t-lg"
           style="margin: -1.5rem -1.5rem -1.5rem; width: calc(100% + 3rem);">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Archivos Originales SUIC</h3>
            <p class="text-sm text-cyan-100">Archivos Excel cargados en S3</p>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-300">Cargando archivos...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div class="flex items-start space-x-3">
            <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error</p>
              <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Lista de archivos -->
        <div v-else-if="filesList.length > 0" class="space-y-3">
          <div
            v-for="fileInfo in filesList"
            :key="fileInfo.key"
            class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow border border-cyan-200/20 dark:border-cyan-700/20 p-4 hover:shadow-lg transition-all"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <UIcon name="i-heroicons-document" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ fileInfo.countryCode === 'ALL' ? 'Archivo Multi-País' : `País: ${fileInfo.countryCode}` }}
                  </h4>
                </div>
                
                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-7">
                  <p class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                    <span>{{ formatDate(fileInfo.uploadedAt) }}</span>
                  </p>
                  <p class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-folder" class="w-4 h-4" />
                    <span class="font-mono text-xs">{{ fileInfo.s3Path }}</span>
                  </p>
                  <p v-if="fileInfo.countries" class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                    <span>Países: {{ fileInfo.countries.join(', ') }}</span>
                  </p>
                </div>
              </div>
              
              <div class="flex flex-col space-y-2">
                <button
                  @click="downloadFile(fileInfo.s3Path, fileInfo.uploadedAt)"
                  :disabled="downloading[fileInfo.key]"
                  class="rounded-md inline-flex items-center px-3 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UIcon 
                    :name="downloading[fileInfo.key] ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-down-tray'" 
                    class="w-4 h-4" 
                    :class="{ 'animate-spin': downloading[fileInfo.key] }"
                  />
                  {{ downloading[fileInfo.key] ? 'Descargando...' : 'Descargar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-16">
          <div class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UIcon name="i-heroicons-document-check" class="w-16 h-16 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">No hay archivos</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Aún no se han cargado archivos originales para este SUIC
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <button
          @click="isOpen = false"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded transition-colors"
        >
          Cerrar
        </button>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import { useSuicFileUpload } from '~/composables/useSuicFileUpload';

const props = defineProps({
  open: Boolean,
  suicId: String,
  filesPath: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:open']);

const { downloadSuicFile, getDownloadUrl } = useSuicFileUpload();

// Estado
const isLoading = ref(false);
const error = ref(null);
const downloading = ref({});

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

// Computed para lista de archivos
const filesList = computed(() => {
  let filesPath = props.filesPath || {};
  
  // Si filesPath es un string (JSON), parsearlo
  if (typeof filesPath === 'string') {
    try {
      filesPath = JSON.parse(filesPath);
    } catch (e) {
      console.error('Error parseando filesPath JSON:', e);
      return [];
    }
  }
  
  const list = [];
  
  Object.entries(filesPath).forEach(([key, value]) => {
    if (value && typeof value === 'object' && value.s3Path) {
      list.push({
        key: key,
        countryCode: key,
        s3Path: value.s3Path,
        uploadedAt: value.uploadedAt,
        countries: value.countries || (key !== 'ALL' ? [key] : undefined)
      });
    }
  });
  
  return list.sort((a, b) => {
    // Ordenar por fecha (más reciente primero)
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });
});

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha desconocida';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Función para descargar archivo
const downloadFile = async (s3Path, uploadedAt) => {
  const downloadKey = `${s3Path}_${uploadedAt}`;
  
  try {
    downloading.value[downloadKey] = true;
    
    console.log('⬇️ Iniciando descarga de archivo:', s3Path);
    
    // Descargar el archivo como Blob
    const blob = await downloadSuicFile(s3Path);
    console.log('✅ Archivo descargado como Blob:', blob);
    
    // Extraer nombre del archivo del path
    const fileName = s3Path.split('/').pop() || 'archivo.xlsx';
    console.log('📝 Nombre del archivo:', fileName);
    
    // Crear URL del blob
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Crear enlace temporal para forzar descarga
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName; // Forzar nombre de descarga
    link.setAttribute('download', fileName); // Asegurar atributo download
    
    // Agregar al DOM temporalmente
    document.body.appendChild(link);
    
    // Hacer click para iniciar descarga
    link.click();
    
    // Limpiar después de un breve delay
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Liberar memoria
    }, 100);
    
    console.log('✅ Descarga iniciada exitosamente');
    
    useToast().add({
      title: 'Descarga completada',
      description: `Archivo ${fileName} descargado`,
      color: 'green'
    });
    
  } catch (error) {
    console.error('❌ Error descargando archivo:', error);
    useToast().add({
      title: 'Error en descarga',
      description: error.message || 'No se pudo descargar el archivo',
      color: 'red'
    });
  } finally {
    downloading.value[downloadKey] = false;
  }
};

// Cargar archivos al abrir el modal
watch(() => props.open, (newValue) => {
  if (newValue) {
    console.log('📂 Cargando archivos para SUIC:', props.suicId);
    console.log('📋 filesPath:', props.filesPath);
  }
});
</script>

