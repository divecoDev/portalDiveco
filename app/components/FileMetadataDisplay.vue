<template>
  <div v-if="fileMetadata" class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-white" />
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
            {{ fileMetadata.fileName }}
          </h4>
          <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span class="flex items-center">
              <UIcon name="i-heroicons-hashtag" class="w-3 h-3 mr-1" />
              {{ formatFileSize(fileMetadata.fileSize) }}
            </span>
            <span class="flex items-center">
              <UIcon name="i-heroicons-calendar" class="w-3 h-3 mr-1" />
              {{ formatUploadDate(fileMetadata.uploadedAt) }}
            </span>
            <span class="flex items-center">
              <UIcon name="i-heroicons-cloud" class="w-3 h-3 mr-1" />
              Guardado en S3
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <UButton
          icon="i-heroicons-arrow-down-tray"
          size="sm"
          color="cyan"
          variant="ghost"
          @click="downloadFile"
          :loading="isDownloading"
          class="hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
        >
          Descargar
        </UButton>
        
        <UButton
          icon="i-heroicons-eye"
          size="sm"
          color="gray"
          variant="ghost"
          @click="showFileInfo = !showFileInfo"
          class="hover:bg-gray-100 dark:hover:bg-gray-700/50"
        >
          {{ showFileInfo ? 'Ocultar' : 'Ver' }} detalles
        </UButton>
      </div>
    </div>

    <!-- Información detallada del archivo -->
    <div v-if="showFileInfo" class="mt-4 pt-4 border-t border-cyan-200 dark:border-cyan-700/50">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300">Ruta S3:</span>
          <p class="text-gray-600 dark:text-gray-400 font-mono text-xs break-all">
            {{ fileMetadata.s3Path }}
          </p>
        </div>
        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300">Tipo de archivo:</span>
          <p class="text-gray-600 dark:text-gray-400">
            {{ fileMetadata.fileType }}
          </p>
        </div>
        <div v-if="fileMetadata.documentId">
          <span class="font-medium text-gray-700 dark:text-gray-300">Documento ID:</span>
          <p class="text-gray-600 dark:text-gray-400 font-mono text-xs">
            {{ fileMetadata.documentId }}
          </p>
        </div>
        <div v-if="fileMetadata.tipo">
          <span class="font-medium text-gray-700 dark:text-gray-300">Tipo de datos:</span>
          <p class="text-gray-600 dark:text-gray-400 capitalize">
            {{ getTipoLabel(fileMetadata.tipo) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFileUpload } from '../composables/useFileUpload';
import type { FileMetadata } from '../../stores/useCargaInsumosProcess';

// Props
const props = defineProps<{
  fileMetadata: FileMetadata;
}>();

// Composable para manejo de archivos
const { downloadFile: downloadFileFromS3, formatFileSize, formatUploadDate } = useFileUpload();

// Estado local
const isDownloading = ref(false);
const showFileInfo = ref(false);

// Métodos
const downloadFile = async () => {
  try {
    isDownloading.value = true;
    
    console.log(`📥 Descargando archivo: ${props.fileMetadata.fileName}`);
    
    await downloadFileFromS3(props.fileMetadata.s3Path, props.fileMetadata.fileName);
    
  } catch (error) {
    console.error('Error descargando archivo:', error);
  } finally {
    isDownloading.value = false;
  }
};

const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    planVentas: 'Plan de Ventas',
    existencias: 'Existencias',
    cobertura: 'Cobertura'
  };
  return labels[tipo] || tipo;
};
</script>
