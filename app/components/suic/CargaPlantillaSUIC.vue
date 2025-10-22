<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
    <!-- Botones de acción -->
    <div class="text-center mb-6">
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <!-- Botón para descargar plantilla -->
        <button
          @click="downloadTemplate"
          class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5" />
          Descargar Plantilla
        </button>
        
        <!-- Botón para abrir modal de carga -->
        <button
          @click="showUploadModal = true"
          class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-5 h-5" />
          Cargar Archivo Excel
        </button>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
        Descarga la plantilla oficial o sube tu archivo Excel regional
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg mb-6">
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error de Almacenamiento</p>
          <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Indicadores de países -->
    <SuicCountryIndicators 
      v-else
      :loaded-counts="loadedCounts"
      @clear-country="handleClearCountry"
      @clear-all="handleClearAll"
    />

    <!-- Modal de carga -->
    <SuicUploadModal
      v-model:open="showUploadModal"
      :suic-id="suicId"
      @data-loaded="handleDataLoaded"
    />

    <!-- Modal de confirmación para limpiar -->
    <SuicConfirmReplaceModal
      v-model:open="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirmText"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { useSuicData } from '~/composables/useSuicData';

const props = defineProps({
  suicId: {
    type: String,
    required: true
  }
});

// Usar composable para manejar datos
const { loadedCounts, loadData, clearCountry, clearAll, isLoading, error } = useSuicData(props.suicId);

const showUploadModal = ref(false);
const showConfirmModal = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmText = ref('');
const pendingAction = ref(null);

// Cargar datos al montar
onMounted(async () => {
  await loadData();
});

// Manejar datos cargados desde modal
const handleDataLoaded = async () => {
  await loadData(); // Recargar conteos
  showUploadModal.value = false;
};

// Limpiar país con confirmación
const handleClearCountry = (paisCode) => {
  confirmTitle.value = 'Eliminar Datos';
  confirmMessage.value = `¿Estás seguro de eliminar los datos de ${paisCode}?`;
  confirmText.value = 'Eliminar';
  pendingAction.value = () => clearCountry(paisCode);
  showConfirmModal.value = true;
};

// Limpiar todo con confirmación
const handleClearAll = () => {
  confirmTitle.value = 'Eliminar Todos los Datos';
  confirmMessage.value = '¿Estás seguro de eliminar todos los datos cargados?';
  confirmText.value = 'Eliminar Todo';
  pendingAction.value = () => clearAll();
  showConfirmModal.value = true;
};

// Confirmar acción
const handleConfirm = async () => {
  if (pendingAction.value) {
    await pendingAction.value();
    await loadData();
  }
  showConfirmModal.value = false;
  pendingAction.value = null;
};

// Descargar plantilla oficial
const downloadTemplate = () => {
  try {
    const templateUrl = 'https://d1p0twkya81b3k.cloudfront.net/templates/SUIC.xlsx';
    
    // Crear elemento temporal para forzar descarga
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'SUIC_Template.xlsx';
    link.target = '_blank';
    
    // Agregar al DOM temporalmente
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    
    // Mostrar notificación de éxito
    useToast().add({
      title: 'Descarga iniciada',
      description: 'La plantilla SUIC se está descargando',
      color: 'green'
    });
    
  } catch (error) {
    console.error('Error al descargar plantilla:', error);
    useToast().add({
      title: 'Error en descarga',
      description: 'No se pudo descargar la plantilla. Inténtalo de nuevo.',
      color: 'red'
    });
  }
};
</script>
