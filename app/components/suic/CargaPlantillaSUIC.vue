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

        <!-- Botón para refrescar estado MySQL -->
        <button
          @click="loadMySQLSummary"
          :disabled="isLoadingSummary"
          class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-blue-800 to-cyan-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <UIcon :name="isLoadingSummary ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-path'" class="w-5 h-5" :class="{ 'animate-spin': isLoadingSummary }" />
          {{ isLoadingSummary ? 'Refrescando...' : 'Refrescar Estado' }}
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
      :save-states="saveStates"
      :months-metadata="monthsMetadata"
      :is-validating="isValidating"
      :validation-progress="validationProgress"
      :mysql-counts="mysqlCounts"
      @clear-country="handleClearCountry"
      @clear-all="handleClearAll"
      @retry-country="handleRetryCountry"
    />

    <section class="flex justify-center gap-4 mt-6">
      <!-- Botón para guardar en MySQL -->
        <button
          v-if="hasDataToSave"
          @click="handleSaveToMySQL"
          :disabled="isSaving"
          class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-800 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5" />
          {{ isSaving ? 'Guardando...' : 'Guardar en Base de Datos' }}
        </button>

        <!-- Botón para siguiente paso -->
        <button
          v-if="canProceedToNextStep"
          @click="handleNextStep"
          class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
          Siguiente: Generar SUIC
        </button>
    </section>

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
import { useSuicMySQL } from '~/composables/useSuicMySQL';
import { useSuicValidations } from '~/composables/useSuicValidations';

const props = defineProps({
  suicId: {
    type: String,
    required: true
  }
});

// Definir emits
const emit = defineEmits(['next-step']);

// Usar composables
const { loadedCounts, loadData, clearCountry, clearAll, clearCountriesInMySQL, isLoading, error, loadDataFromStorageAsync } = useSuicData(props.suicId);
const { saveSuicToMySQL, getSuicSummary } = useSuicMySQL();
const { validateMultipleCountries, monthsMetadata, isValidating, validationProgress } = useSuicValidations();

// Estados para guardado
const saveStates = ref({});
const isSaving = ref(false);
const previewData = ref({});
const isLoadingPreview = ref(false);
const previewModalRef = ref(null);

// Estados para MySQL
const mysqlCounts = ref({});
const isLoadingSummary = ref(false);

// Computed para verificar si hay datos para guardar
const hasDataToSave = computed(() => {
  return Object.keys(loadedCounts.value).length > 0;
});

// Computed para verificar si puede proceder al siguiente paso
const canProceedToNextStep = computed(() => {
  // Debe haber al menos un país con datos guardados en MySQL
  const hasCountriesInMySQL = Object.keys(mysqlCounts.value).length > 0;
  
  if (!hasCountriesInMySQL) return false;
  
  // TODO: Validar que los meses sean consistentes usando monthsMetadata
  // Por ahora retornamos true si hay países en MySQL
  return true;
});

const showUploadModal = ref(false);
const showConfirmModal = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmText = ref('');
const pendingAction = ref(null);

// Función para cargar resumen de MySQL
const loadMySQLSummary = async () => {
  isLoadingSummary.value = true;
  try {
    const summary = await getSuicSummary(props.suicId);
    
    if (summary.success && summary.countries) {
      const counts = {};
      summary.countries.forEach(country => {
        counts[country.paisCode] = {
          count: country.totalRecords,
          availableMonths: country.availableMonths || []
        };
      });
      mysqlCounts.value = counts;
      console.log('✅ Resumen MySQL cargado:', counts);
      
      // Limpiar países que ya están en MySQL de IndexedDB
      const countsForCleanup = {};
      summary.countries.forEach(country => {
        countsForCleanup[country.paisCode] = country.totalRecords;
      });
      await clearCountriesInMySQL(countsForCleanup);
      
      // Recargar datos para actualizar conteos locales
      await loadData();
    } else {
      console.warn('⚠️ No se obtuvo resumen válido de MySQL');
      mysqlCounts.value = {};
    }
  } catch (error) {
    console.error('❌ Error cargando resumen MySQL:', error);
    mysqlCounts.value = {};
  } finally {
    isLoadingSummary.value = false;
  }
};

// Cargar datos al montar
onMounted(async () => {
  await loadData();
  
  // Cargar resumen desde MySQL
  await loadMySQLSummary();
  
  // Validar datos existentes si los hay
  try {
    console.log('🔍 Iniciando validación de datos existentes...');
    const allData = await loadDataFromStorageAsync();
    
    if (Object.keys(allData).length > 0) {
      await validateMultipleCountries(allData);
      console.log('✅ Validación de datos existentes completada');
    }
  } catch (error) {
    console.error('❌ Error validando datos existentes:', error);
    useToast().add({
      title: 'Advertencia',
      description: 'No se pudieron validar los datos existentes',
      color: 'yellow'
    });
  }
});

// Manejar datos cargados desde modal
const handleDataLoaded = async () => {
  await loadData(); // Recargar conteos
  
  // Validar datos cargados
  try {
    console.log('🔍 Iniciando validación de datos cargados...');
    const allData = await loadDataFromStorageAsync();
    
    if (Object.keys(allData).length > 0) {
      await validateMultipleCountries(allData);
      console.log('✅ Validación de datos completada');
    }
  } catch (error) {
    console.error('❌ Error validando datos:', error);
    useToast().add({
      title: 'Advertencia',
      description: 'No se pudieron validar los datos cargados',
      color: 'yellow'
    });
  }
  
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

// Reintentar guardado de país específico
const handleRetryCountry = async (paisCode) => {
  try {
    // Cargar datos del país específico desde IndexedDB
    const allData = await loadDataFromStorageAsync();
    const countryData = allData[paisCode];
    
    if (!countryData) {
      useToast().add({
        title: 'Error',
        description: `No se encontraron datos para ${paisCode}`,
        color: 'red'
      });
      return;
    }

    // Inicializar estado de guardado
    saveStates.value[paisCode] = {
      status: 'saving',
      progress: 0
    };

    // Guardar con callback de progreso
    const results = await saveSuicToMySQL(
      props.suicId,
      paisCode,
      countryData,
      (batchIndex, totalBatches) => {
        saveStates.value[paisCode].progress = batchIndex / totalBatches;
      }
    );

    // Verificar si hay errores en los resultados
    const hasErrors = results.some(result => 
      result.errors && result.errors.length > 0
    );

    if (hasErrors) {
      // Marcar como error si hay errores en cualquier lote
      saveStates.value[paisCode] = {
        status: 'error',
        progress: 1,
        errorCount: results.reduce((total, result) => 
          total + (result.errors?.length || 0), 0
        )
      };

      useToast().add({
        title: `Error en ${paisCode}`,
        description: `Se procesaron ${results.reduce((sum, r) => sum + r.processedRecords, 0)} registros pero con errores`,
        color: 'red'
      });
    } else {
      // Marcar como guardado exitoso
      saveStates.value[paisCode] = {
        status: 'saved',
        progress: 1
      };

      useToast().add({
        title: `${paisCode} guardado`,
        description: `${countryData.length} registros guardados exitosamente`,
        color: 'green'
      });
    }

    // Refrescar resumen MySQL después de guardar exitosamente
    await loadMySQLSummary();

  } catch (error) {
    console.error(`Error reintentando guardado de ${paisCode}:`, error);
    saveStates.value[paisCode] = {
      status: 'error',
      progress: 0
    };

    useToast().add({
      title: `Error en ${paisCode}`,
      description: error.message,
      color: 'red'
    });
  }
};

// Guardar datos en MySQL
const handleSaveToMySQL = async () => {
  isSaving.value = true;

  try {
    // Cargar datos de IndexedDB
    const allData = await loadDataFromStorageAsync();

    // Procesar cada país
    for (const [paisCode, data] of Object.entries(allData)) {
      // Inicializar estado
      saveStates.value[paisCode] = {
        status: 'saving',
        progress: 0
      };

      try {
        // Guardar con callback de progreso
        const results = await saveSuicToMySQL(
          props.suicId,
          paisCode,
          data,
          (batchIndex, totalBatches) => {
            saveStates.value[paisCode].progress = batchIndex / totalBatches;
          }
        );

        // Verificar si hay errores en los resultados
        const hasErrors = results.some(result => 
          result.errors && result.errors.length > 0
        );

        if (hasErrors) {
          // Marcar como error si hay errores en cualquier lote
          saveStates.value[paisCode] = {
            status: 'error',
            progress: 1,
            errorCount: results.reduce((total, result) => 
              total + (result.errors?.length || 0), 0
            )
          };

          useToast().add({
            title: `Error en ${paisCode}`,
            description: `Se procesaron ${results.reduce((sum, r) => sum + r.processedRecords, 0)} registros pero con errores`,
            color: 'red'
          });
        } else {
          // Marcar como guardado exitoso
          saveStates.value[paisCode] = {
            status: 'saved',
            progress: 1
          };

          useToast().add({
            title: `${paisCode} guardado`,
            description: `${data.length} registros guardados exitosamente`,
            color: 'green'
          });
        }

      } catch (error) {
        console.error(`Error guardando ${paisCode}:`, error);
        saveStates.value[paisCode] = {
          status: 'error',
          progress: 0
        };

        useToast().add({
          title: `Error en ${paisCode}`,
          description: error.message,
          color: 'red'
        });
      }
    }

    // Refrescar resumen MySQL después de guardar
    await loadMySQLSummary();

    useToast().add({
      title: 'Proceso completado',
      description: 'Todos los datos han sido procesados',
      color: 'blue'
    });

  } catch (error) {
    console.error('Error general:', error);
    useToast().add({
      title: 'Error',
      description: 'Error guardando datos en MySQL',
      color: 'red'
    });
  } finally {
    isSaving.value = false;
  }
};

// Función para previsualizar datos
const handlePreviewData = async () => {
  isLoadingPreview.value = true;
  
  try {
    // Cargar datos desde IndexedDB
    const allData = await loadDataFromStorageAsync();
    console.log('📊 Datos cargados desde IndexedDB:', allData);
    
    // Preparar datos para previsualización (solo primeros 10 por país)
    const previewDataByCountry = {};
    
    for (const [paisCode, data] of Object.entries(allData)) {
      console.log(`📋 Procesando país ${paisCode}:`, data.length, 'registros');
      previewDataByCountry[paisCode] = data.slice(0, 10); // Solo primeros 10 registros
    }
    
    console.log('👁️ Datos de previsualización preparados:', previewDataByCountry);
    previewData.value = previewDataByCountry;
    
    useToast().add({
      title: 'Previsualización cargada',
      description: `Datos de ${Object.keys(previewDataByCountry).length} países listos para revisar`,
      color: 'blue'
    });
    
  } catch (error) {
    console.error('Error cargando previsualización:', error);
    useToast().add({
      title: 'Error en previsualización',
      description: 'No se pudieron cargar los datos para previsualizar',
      color: 'red'
    });
  } finally {
    isLoadingPreview.value = false;
  }
};

// Función para cerrar modal de previsualización
const handlePreviewClose = () => {
  previewData.value = {};
  if (previewModalRef.value) {
    previewModalRef.value.closeModal();
  }
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

// Manejar siguiente paso
const handleNextStep = () => {
  // Emitir evento para que el componente padre avance en el stepper
  emit('next-step');
  
  useToast().add({
    title: 'Procediendo a Generación',
    description: 'Avanzando al siguiente paso del proceso SUIC',
    color: 'blue'
  });
};
</script>
