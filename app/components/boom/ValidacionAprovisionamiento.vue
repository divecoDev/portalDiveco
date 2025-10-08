<template>
  <div
    class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 validacion-container"
  >
    <!-- Botón para iniciar tour específico -->
    <div class="flex justify-end mb-4">
      <UButton
        id="validacion-tour-trigger"
        icon="i-heroicons-information-circle"
        size="sm"
        color="cyan"
        variant="solid"
        class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        @click="startTour"
      >
        Tour: Validación de Aprovisionamiento
      </UButton>
    </div>
    <div class="text-center py-12">
      <!-- Contenido específico de validación -->
      <div class="space-y-6">
        <!-- Botón de descarga del plan de producción -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-md border border-blue-200 dark:border-blue-700/50 shadow-sm plan-download-section">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200">Plan de Producción</h4>
                <p class="text-xs text-blue-700 dark:text-blue-300">Descarga el archivo CSV con el plan generado</p>
              </div>
            </div>
            <UButton
              icon="i-heroicons-arrow-down-tray"
              size="sm"
              color="blue"
              variant="outline"
              :loading="isDownloading"
              @click="downloadPlanProduccion"
              class="hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {{ isDownloading ? 'Descargando...' : 'Descargar Plan' }}
            </UButton>
          </div>
        </div>


        <!-- Análisis de Materiales sin tabs -->
        <div class="space-y-6 validation-section">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Análisis de Materiales:</h4>
          
          <!-- Estado: Verificando archivos -->
          <div v-if="checkingFileExistence || checkingFileSinCentroExistence" class="text-center py-12">
            <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-300">Verificando disponibilidad de archivos...</p>
          </div>

          <!-- Estado: Sin problemas - Todo está bien -->
          <div v-else-if="!materialesSinAprovisionamientoExists && !materialesSinCentroProduccionExists" class="text-center py-12">
            <div class="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-md flex items-center justify-center mx-auto mb-6 shadow-lg">
              <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h6 class="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">¡Excelente!</h6>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-2">Todos los materiales están correctamente configurados</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">No hay materiales sin aprovisionamiento ni sin centro de producción</p>
          </div>

          <!-- Estado: Hay archivos para descargar -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Card: Materiales Sin Aprovisionamiento -->
            <div v-if="materialesSinAprovisionamientoExists" class="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-md border border-orange-200 dark:border-orange-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md flex items-center justify-center mr-4 shadow-lg">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 class="text-lg font-bold text-orange-800 dark:text-orange-200">Materiales Sin Aprovisionamiento</h5>
                  <p class="text-xs text-orange-700 dark:text-orange-300">Archivo disponible para descarga</p>
                </div>
              </div>
              
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Hay materiales que no tienen aprovisionamiento asignado. Descarga el archivo para revisar el detalle.
              </p>
              
              <div class="flex items-center mb-3">
                <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                <span class="text-sm font-medium text-orange-800 dark:text-orange-200">materialesSinAprovisionamiento.csv</span>
              </div>
              
              <UButton
                icon="i-heroicons-arrow-down-tray"
                size="md"
                color="orange"
                variant="solid"
                :loading="isDownloadingMateriales"
                @click="downloadMaterialesSinAprovisionamiento"
                class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {{ isDownloadingMateriales ? 'Descargando...' : 'Descargar Archivo' }}
              </UButton>
            </div>

            <!-- Card: Materiales Sin Centro de Producción -->
            <div v-if="materialesSinCentroProduccionExists" class="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-md border border-red-200 dark:border-red-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center mr-4 shadow-lg">
                  <UIcon name="i-heroicons-building-office" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 class="text-lg font-bold text-red-800 dark:text-red-200">Materiales Sin Centro</h5>
                  <p class="text-xs text-red-700 dark:text-red-300">Archivo disponible para descarga</p>
                </div>
              </div>
              
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Hay materiales sin centro de producción asignado. Descarga el archivo para revisar el detalle.
              </p>
              
              <div class="flex items-center mb-3">
                <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span class="text-sm font-medium text-red-800 dark:text-red-200">materialesSinCentroProduccion.csv</span>
              </div>
              
              <UButton
                icon="i-heroicons-arrow-down-tray"
                size="md"
                color="red"
                variant="solid"
                :loading="isDownloadingMaterialesSinCentro"
                @click="downloadMaterialesSinCentroProduccion"
                class="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {{ isDownloadingMaterialesSinCentro ? 'Descargando...' : 'Descargar Archivo' }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Botón simple para continuar -->
        <div class="text-center py-6 continue-button-section">
          <UButton
            icon="i-heroicons-arrow-right"
            size="sm"
            color="cyan"
            :loading="isValidating"
            class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold"
            @click="proceedWithExplosion"
          >
            {{ isValidating ? 'Procesando...' : 'Siguiente Paso' }}
          </UButton>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Props
const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false
  },
  explosionId: {
    type: String,
    required: true
  },
  boomId: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['validation-completed']);

// Estado reactivo
const isValidating = ref(false);
const isDownloading = ref(false);
const isDownloadingMateriales = ref(false);
const isDownloadingMaterialesSinCentro = ref(false);
const materialesSinAprovisionamientoExists = ref(false);
const materialesSinCentroProduccionExists = ref(false);
const checkingFileExistence = ref(false);
const checkingFileSinCentroExistence = ref(false);

const validations = ref([
  {
    id: 'material-availability',
    name: 'Disponibilidad de Materiales',
    completed: false
  },
  {
    id: 'supplier-verification',
    name: 'Verificación de Proveedores',
    completed: false
  },
  {
    id: 'lead-time-validation',
    name: 'Validación de Tiempos de Entrega',
    completed: false
  },
  {
    id: 'cost-verification',
    name: 'Verificación de Costos',
    completed: false
  },
  {
    id: 'quality-standards',
    name: 'Estándares de Calidad',
    completed: false
  }
]);

// Computed
const canValidate = computed(() => {
  return !isValidating.value;
});


// Métodos
const checkMaterialesSinAprovisionamientoExists = async () => {
  if (!props.boomId) {
    materialesSinAprovisionamientoExists.value = false;
    return;
  }

  try {
    checkingFileExistence.value = true;
    
    const fileName = 'materialesSinAprovisionamiento.csv';
    
    // Usar el endpoint API para verificar (con HEAD o solo verificar status)
    const apiUrl = `/api/download-csv?boomId=${props.boomId}&fileName=${fileName}`;
    
    // Hacer una petición HEAD al proxy para verificar sin descargar
    const response = await fetch(apiUrl, {
      method: 'HEAD'
    });
    
    // El archivo existe si la respuesta es exitosa
    materialesSinAprovisionamientoExists.value = response.ok;
    
    if (!materialesSinAprovisionamientoExists.value) {
      console.log('El archivo materialesSinAprovisionamiento.csv no existe o no está disponible');
    }
    
  } catch (error) {
    // Si hay error, asumimos que el archivo está disponible
    // El usuario verá el error real al intentar descargarlo
    console.log('No se pudo verificar la existencia del archivo, se asumirá que está disponible');
    materialesSinAprovisionamientoExists.value = true;
  } finally {
    checkingFileExistence.value = false;
  }
};

const checkMaterialesSinCentroProduccionExists = async () => {
  if (!props.boomId) {
    materialesSinCentroProduccionExists.value = false;
    return;
  }

  try {
    checkingFileSinCentroExistence.value = true;
    
    const fileName = 'materialesSinCentroProduccion.csv';
    
    // Usar el endpoint API para verificar (con HEAD o solo verificar status)
    const apiUrl = `/api/download-csv?boomId=${props.boomId}&fileName=${fileName}`;
    
    // Hacer una petición HEAD al proxy para verificar sin descargar
    const response = await fetch(apiUrl, {
      method: 'HEAD'
    });
    
    // El archivo existe si la respuesta es exitosa
    materialesSinCentroProduccionExists.value = response.ok;
    
    if (!materialesSinCentroProduccionExists.value) {
      console.log('El archivo materialesSinCentroProduccion.csv no existe o no está disponible');
    }
    
  } catch (error) {
    // Si hay error, asumimos que el archivo está disponible
    // El usuario verá el error real al intentar descargarlo
    console.log('No se pudo verificar la existencia del archivo, se asumirá que está disponible');
    materialesSinCentroProduccionExists.value = true;
  } finally {
    checkingFileSinCentroExistence.value = false;
  }
};

const loadMaterialesData = async () => {
  try {
    // En producción, aquí se haría una llamada a la API
    // Por ahora usamos datos de ejemplo
    console.log('Cargando datos de materiales para boom:', props.boomId);
    
    // Verificar si existen los archivos de materiales (en paralelo para mejor rendimiento)
    await Promise.all([
      checkMaterialesSinAprovisionamientoExists(),
      checkMaterialesSinCentroProduccionExists()
    ]);
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error('Error cargando datos de materiales:', error);
    
    useToast().add({
      title: "Error cargando datos",
      description: "No se pudieron cargar los datos de materiales",
      color: "red",
      timeout: 3000
    });
  }
};

const downloadPlanProduccion = async () => {
  if (isDownloading.value || !props.boomId) return;

  try {
    isDownloading.value = true;
    
    // Construir la URL del archivo
    const fileName = `plan-produccion-${props.boomId}.csv`;
    const fileUrl = `https://d1p0twkya81b3k.cloudfront.net/${fileName}`;
    
    // Crear un enlace temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar notificación de éxito
    useToast().add({
      title: "Descarga iniciada",
      description: `El archivo ${fileName} se está descargando`,
      color: "blue",
      timeout: 3000
    });
    
  } catch (error) {
    console.error('Error al descargar el plan de producción:', error);
    
    useToast().add({
      title: "Error en descarga",
      description: "No se pudo descargar el plan de producción",
      color: "red",
      timeout: 3000
    });
  } finally {
    isDownloading.value = false;
  }
};

const downloadMaterialesSinAprovisionamiento = async () => {
  if (isDownloadingMateriales.value || !props.boomId) return;

  try {
    isDownloadingMateriales.value = true;
    
    const fileName = 'materialesSinAprovisionamiento.csv';
    
    // Descargar directamente desde CloudFront
    const fileUrl = `https://d1p0twkya81b3k.cloudfront.net/${props.boomId}/${fileName}`;
    
    // Crear un enlace temporal para forzar la descarga directa
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.style.display = 'none';
    link.target = '_blank';
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar notificación de éxito
    useToast().add({
      title: "Descarga iniciada",
      description: `El archivo ${fileName} se está descargando`,
      color: "green",
      timeout: 3000
    });
    
  } catch (error) {
    console.error('Error al descargar materiales sin aprovisionamiento:', error);
    
    useToast().add({
      title: "Error en descarga",
      description: "No se pudo iniciar la descarga del archivo",
      color: "red",
      timeout: 3000
    });
  } finally {
    isDownloadingMateriales.value = false;
  }
};

const downloadMaterialesSinCentroProduccion = async () => {
  if (isDownloadingMaterialesSinCentro.value || !props.boomId) return;

  try {
    isDownloadingMaterialesSinCentro.value = true;
    
    const fileName = 'materialesSinCentroProduccion.csv';
    
    // Descargar directamente desde CloudFront
    const fileUrl = `https://d1p0twkya81b3k.cloudfront.net/${props.boomId}/${fileName}`;
    
    // Crear un enlace temporal para forzar la descarga directa
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.style.display = 'none';
    link.target = '_blank';
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar notificación de éxito
    useToast().add({
      title: "Descarga iniciada",
      description: `El archivo ${fileName} se está descargando`,
      color: "green",
      timeout: 3000
    });
    
  } catch (error) {
    console.error('Error al descargar materiales sin centro de producción:', error);
    
    useToast().add({
      title: "Error en descarga",
      description: "No se pudo iniciar la descarga del archivo",
      color: "red",
      timeout: 3000
    });
  } finally {
    isDownloadingMaterialesSinCentro.value = false;
  }
};

const proceedWithExplosion = async () => {
  if (isValidating.value) return;

  try {
    isValidating.value = true;

    // Simular delay mínimo
    await new Promise(resolve => setTimeout(resolve, 500));

    // Emitir evento de completado
    emit('validation-completed');

    // Mostrar notificación simple
    useToast().add({
      title: "Continuando",
      description: "Avanzando al siguiente paso",
      color: "green",
      timeout: 2000
    });

  } catch (error) {
    console.error('Error al continuar:', error);
    
    useToast().add({
      title: "Error",
      description: "No se pudo continuar al siguiente paso",
      color: "red",
      timeout: 3000
    });
  } finally {
    isValidating.value = false;
  }
};

// Método legacy para compatibilidad
const executeValidation = proceedWithExplosion;

// Reset validations when component is reset
const resetValidations = () => {
  validations.value.forEach(validation => {
    validation.completed = false;
  });
};

// Watch for completion status changes
watch(() => props.isCompleted, (newValue) => {
  if (!newValue) {
    resetValidations();
  }
});

// Lifecycle
onMounted(() => {
  // Cargar datos de materiales
  loadMaterialesData();
});

// Configuración del tour específico para Validación de Aprovisionamiento
const driverObj = ref(null);

const initializeTour = () => {
  driverObj.value = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    popoverClass: 'driver-popover-custom',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Finalizar',
    steps: [
      {
        element: '#validacion-tour-trigger',
        popover: {
          title: '✅ Tour: Validación de Aprovisionamiento',
          description: 'Este tour te mostrará cómo validar los materiales aprovisionados y descargar el plan de producción antes de la explosión.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.validacion-container',
        popover: {
          title: '📋 Proceso de Validación',
          description: 'Aquí puedes validar la demanda de producción previa y realizar ajustes a los insumos si es necesario antes de la explosión.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.plan-download-section',
        popover: {
          title: '📥 Descarga del Plan de Producción',
          description: 'Descarga el archivo CSV con el plan de producción generado para revisar la demanda previa a la explosión.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.validation-section',
        popover: {
          title: '🔍 Análisis de Materiales',
          description: 'Esta sección muestra si hay materiales con problemas de aprovisionamiento o sin centro de producción. Si todo está correcto, verás un mensaje de éxito. Si hay problemas, podrás descargar los archivos CSV con los detalles.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.continue-button-section',
        popover: {
          title: '⚡ Continuar al Siguiente Paso',
          description: 'Una vez validados los materiales y revisado el plan, puedes continuar al paso final de explosión.',
          side: 'top',
          align: 'center'
        }
      },
      {
        popover: {
          title: '🎉 ¡Tour Completado!',
          description: 'Ya conoces cómo validar los materiales y revisar el plan de producción. Asegúrate de revisar todos los materiales antes de continuar.',
          side: 'center'
        }
      }
    ]
  });
};

const startTour = () => {
  if (!driverObj.value) {
    initializeTour();
  }
  driverObj.value.drive();
};

// Expose methods for parent component
defineExpose({
  resetValidations,
  executeValidation,
  proceedWithExplosion,
  loadMaterialesData,
  checkMaterialesSinAprovisionamientoExists,
  checkMaterialesSinCentroProduccionExists
});
</script>

<style>
/* Estilos personalizados para el tour de Driver.js */
.driver-popover-custom {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border: 2px solid #0891b2;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.driver-popover-custom .driver-popover-title {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.driver-popover-custom .driver-popover-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.5;
}

.driver-popover-custom .driver-popover-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
}

.driver-popover-custom .driver-popover-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.driver-popover-custom .driver-popover-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.driver-popover-custom .driver-popover-btn.driver-popover-btn-primary {
  background: rgba(255, 255, 255, 0.9);
  color: #0891b2;
  border-color: rgba(255, 255, 255, 0.9);
}

.driver-popover-custom .driver-popover-btn.driver-popover-btn-primary:hover {
  background: white;
  color: #0e7490;
}

.driver-popover-custom .driver-popover-progress-bar {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  height: 4px;
}

.driver-popover-custom .driver-popover-progress-bar-fill {
  background: white;
  border-radius: 4px;
}

.driver-popover-custom .driver-popover-close-btn {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
}

.driver-popover-custom .driver-popover-close-btn:hover {
  color: white;
}

/* Animación suave para el overlay */
.driver-overlay {
  transition: opacity 0.3s ease;
}

/* Estilo para el elemento destacado */
.driver-highlighted-element {
  border-radius: 8px !important;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3) !important;
}
</style>
