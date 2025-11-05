<script setup>
import PlanVentasStep from "./boom/PlanVentasStep.vue";
import ExistenciasStep from "./boom/ExistenciasStep.vue";
import CoberturaStep from "./boom/CoberturaStep.vue";
import GuardarStep from "./boom/GuardarStep.vue";
import { useCargaInsumosProcessStore } from "../../stores/useCargaInsumosProcess";
import { useCargaInsumosData } from "../composables/useCargaInsumosData";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Props para recibir la explosión
const props = defineProps({
  explosion: {
    type: Object,
    required: true
  },
  skipLoadExistingData: {
    type: Boolean,
    default: false
  }
});

// Emits para comunicarse con el componente padre
const emit = defineEmits(['carga-insumos-completed']);

// Usar el store de Carga de Insumos
const cargaInsumosStore = useCargaInsumosProcessStore();

// Usar el composable para consultar datos existentes
const { queryData, loading: dataLoading, error: dataError } = useCargaInsumosData();

// Composables
const { logAction } = useAudit();

// Estado para controlar si se están cargando datos existentes
const loadingExistingData = ref(false);

// Inicializar el store al montar el componente
onMounted(async () => {
  await cargaInsumosStore.initialize();

  // Establecer el boom_id en el store y verificar datos existentes
  // Solo si NO se está saltando la carga de datos existentes (modo recarga)
  if (props.explosion?.id && !props.skipLoadExistingData) {
    await checkAndLoadExistingData(props.explosion.id);
  } else if (props.explosion?.id && props.skipLoadExistingData) {
    // Si estamos en modo recarga, solo establecer el boom_id sin cargar datos
    console.log('🔄 Modo recarga activado - Saltando carga de datos existentes');
    cargaInsumosStore.setBoomId(props.explosion.id);
  }
});

// Referencia al stepper para controlar la navegación
const stepper = ref();

// Computed para obtener datos reactivos del store
const items = computed(() => cargaInsumosStore.stepItems);
const currentStep = computed({
  get: () => cargaInsumosStore.currentStep,
  set: (value) => cargaInsumosStore.goToStep(value)
});

// Estado para validación de versión del plan de ventas
const planVentasVersionValid = ref(true);

// Estado para validación de versión de existencias
const existenciasVersionValid = ref(true);

// Estado para validación de versión de cobertura
const coberturaVersionValid = ref(true);

// Computed para validaciones desde el store
const isPlanVentasValid = computed(() => cargaInsumosStore.isPlanVentasValid);
const isExistenciasValid = computed(() => cargaInsumosStore.isExistenciasValid);
const isCoberturaValid = computed(() => cargaInsumosStore.isCoberturaValid);
const canGoNext = computed(() => {
  // Validar según el paso actual
  switch (cargaInsumosStore.currentStep) {
    case 0: // Plan de ventas
      return cargaInsumosStore.canGoNext && planVentasVersionValid.value;
    case 1: // Existencias
      return cargaInsumosStore.canGoNext && existenciasVersionValid.value;
    case 2: // Cobertura
      return cargaInsumosStore.canGoNext && coberturaVersionValid.value;
    default:
      return cargaInsumosStore.canGoNext;
  }
});
const canGoPrev = computed(() => cargaInsumosStore.canGoPrev);

// Computed para los datos de cada paso desde el store
const planVentasData = computed({
  get: () => cargaInsumosStore.planVentas.data,
  set: (value) => cargaInsumosStore.updatePlanVentasData(value)
});

const existenciasData = computed({
  get: () => cargaInsumosStore.existencias.data,
  set: (value) => cargaInsumosStore.updateExistenciasData(value)
});

const coberturaData = computed({
  get: () => cargaInsumosStore.cobertura.data,
  set: (value) => cargaInsumosStore.updateCoberturaData(value)
});

// Métodos de navegación usando el store
const goNext = () => {
  if (cargaInsumosStore.goToNextStep() && stepper.value?.hasNext) {
    stepper.value.next();
    // Scroll al inicio de la página
    window.scrollTo({ top: 185, behavior: "smooth" });
  }
};

const goPrev = () => {
  if (cargaInsumosStore.goToPrevStep() && stepper.value?.hasPrev) {
    stepper.value.prev();
    // Scroll al inicio de la página
    window.scrollTo({ top: 185, behavior: "smooth" });
  }
};

// Método para manejar cuando el proceso de carga se completa
const handleCargaInsumosCompleted = () => {
  emit('carga-insumos-completed');
};

// Método para manejar cambios en la validación de versión
const handleVersionValidationChanged = (isValid) => {
  planVentasVersionValid.value = isValid;
};

// Método para manejar cambios en la validación de versión de existencias
const handleExistenciasVersionValidationChanged = (isValid) => {
  existenciasVersionValid.value = isValid;
};

// Método para manejar cambios en la validación de versión de cobertura
const handleCoberturaVersionValidationChanged = (isValid) => {
  coberturaVersionValid.value = isValid;
};

// Método para manejar metadatos de archivo actualizados
const handleFileMetadataUpdated = async (payload) => {
  console.log(`🔍 DEBUG CargaInsumosProcess handleFileMetadataUpdated - Payload:`, payload);
  
  const { tipo, metadata } = payload;
  
  console.log(`🔍 DEBUG: Actualizando metadatos para tipo: ${tipo}`);
  console.log(`🔍 DEBUG: Metadatos recibidos:`, metadata);
  console.log(`🔍 DEBUG: S3 Path: ${metadata?.s3Path || 'undefined'}`);
  
  // Actualizar el store con los metadatos del archivo
  if (tipo === 'planVentas') {
    cargaInsumosStore.updatePlanVentasData(
      cargaInsumosStore.planVentas.data, 
      cargaInsumosStore.planVentas.fileName, 
      metadata
    );
  } else if (tipo === 'existencias') {
    cargaInsumosStore.updateExistenciasData(
      cargaInsumosStore.existencias.data, 
      cargaInsumosStore.existencias.fileName, 
      metadata
    );
  } else if (tipo === 'cobertura') {
    cargaInsumosStore.updateCoberturaData(
      cargaInsumosStore.cobertura.data, 
      cargaInsumosStore.cobertura.fileName, 
      metadata
    );
  }

  // Registrar auditoría de carga de archivo
  if (metadata && props.explosion?.id) {
    try {
      const actionMap = {
        planVentas: 'UPLOAD_PLAN_VENTAS',
        existencias: 'UPLOAD_EXISTENCIAS',
        cobertura: 'UPLOAD_COBERTURA',
      };
      
      await logAction(
        actionMap[tipo] || 'UPLOAD_FILE',
        "boom",
        "Boom",
        props.explosion.id,
        undefined,
        {
          fileName: metadata.fileName,
          fileType: metadata.fileType,
          fileSize: metadata.fileSize,
          step: tipo,
          s3Path: metadata.s3Path,
          version: props.explosion.version,
        }
      );
    } catch (auditError) {
      console.warn("Error al registrar auditoría de carga de archivo:", auditError);
      // No bloquear la operación si falla la auditoría
    }
  }
};

// Watcher para sincronizar el stepper con el store
watch(() => cargaInsumosStore.currentStep, (newStep) => {
  if (stepper.value && stepper.value.modelValue !== newStep) {
    stepper.value.modelValue = newStep;
  }
});

// Función para verificar y cargar datos existentes
const checkAndLoadExistingData = async (boomId) => {
  try {
    loadingExistingData.value = true;
    console.log(`🔍 Verificando datos existentes para boom_id: ${boomId}`);
    
    // Establecer el boom_id en el store
    cargaInsumosStore.setBoomId(boomId);
    
    // Consultar datos existentes usando el boom_id como document_id
    const response = await queryData({ documentId: boomId });
    
    console.log(`📊 Respuesta de consulta de datos existentes:`, response);
    
    if (response.success && response.data && response.data.length > 0) {
      console.log(`✅ Se encontraron datos existentes para boom_id: ${boomId}`);
      
      // Cargar los datos existentes en el store
      await cargaInsumosStore.loadExistingData(response.data);
      
      console.log(`📥 Datos existentes cargados en el store`);
    } else {
      console.log(`📭 No se encontraron datos existentes para boom_id: ${boomId}`);
      console.log(`🔄 Mostrando vista de carga de datos`);
    }
    
  } catch (error) {
    console.error(`❌ Error verificando datos existentes:`, error);
    // En caso de error, continuar con la vista de carga
  } finally {
    loadingExistingData.value = false;
  }
};

// Watcher para detectar cambios en la prop explosion
watch(() => props.explosion, async (newExplosion) => {
  // Solo cargar datos existentes si NO estamos en modo recarga
  if (newExplosion?.id && !props.skipLoadExistingData) {
    await checkAndLoadExistingData(newExplosion.id);
  }
}, { immediate: true });

// Configuración del tour específico para Carga de Insumos
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
        element: '.carga-insumos-stepper',
        popover: {
          title: '📦 Tour: Carga de Insumos',
          description: 'Este tour te mostrará cómo cargar los documentos necesarios para el proceso de explosión de materiales.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.stepper-navigation',
        popover: {
          title: '🔄 Navegación del Proceso',
          description: 'Aquí puedes navegar entre los 4 pasos: Plan de Ventas, Existencias, Cobertura y Guardar. Los primeros 3 pasos tienen la misma estructura.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.step-content',
        popover: {
          title: '📋 Contenido del Paso',
          description: 'En esta área se muestra el contenido específico de cada paso. Vamos a ver los elementos comunes en el primer paso.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.template-download-section',
        popover: {
          title: '📥 Descargar Plantilla',
          description: 'Aquí puedes descargar la plantilla de Excel para llenar los datos según el formato requerido.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.file-upload-section',
        popover: {
          title: '📤 Cargar Archivo',
          description: 'Sube el archivo de Excel con los datos siguiendo la plantilla descargada. El sistema validará el formato automáticamente.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.data-preview-section',
        popover: {
          title: '👁️ Vista Previa de Datos',
          description: 'Una vez cargado el archivo, aquí podrás ver una vista previa de los datos para verificar que se cargaron correctamente.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.step-navigation-controls',
        popover: {
          title: '⚡ Controles de Navegación',
          description: 'Usa estos botones para avanzar al siguiente paso o volver al anterior. El botón "Siguiente" se habilita cuando los datos son válidos.',
          side: 'top',
          align: 'center'
        }
      },
      {
        popover: {
          title: '🎉 ¡Tour Completado!',
          description: 'Ya conoces la estructura común de los pasos de carga. Los pasos 1, 2 y 3 funcionan igual, solo cambia el tipo de datos.',
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
</script>

<template>
  <div class="space-y-6">
    <!-- Botón para iniciar tour específico -->
    <div class="flex justify-end mb-4">
      <UButton
        id="carga-insumos-tour-trigger"
        icon="i-heroicons-information-circle"
        size="sm"
        color="cyan"
        variant="solid"
        class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        @click="startTour"
      >
        Tour: Carga de Insumos
      </UButton>
    </div>

    <!-- Estado de carga de datos existentes -->
    <div v-if="loadingExistingData" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Verificando datos existentes...</p>
      </div>
    </div>

    <!-- Stepper con navegación deshabilitada -->
    <UStepper
      v-else
      ref="stepper"
      v-model="currentStep"
      :items="items"
      color="primary"
      disabled
      class="w-full carga-insumos-stepper"
    >
      <template #plan-de-ventas>
        <div class="step-content">
          <PlanVentasStep
            :key="`plan-ventas-${cargaInsumosStore.planVentas.data.length}-${cargaInsumosStore.planVentas.loadedAt?.getTime()}`"
            v-model="planVentasData"
            :boom-version="explosion?.version"
            :document-id="explosion?.id"
            @version-validation-changed="handleVersionValidationChanged"
            @file-metadata-updated="handleFileMetadataUpdated"
          />
        </div>
      </template>

      <template #existencias>
        <ExistenciasStep
          :key="`existencias-${cargaInsumosStore.existencias.data.length}-${cargaInsumosStore.existencias.loadedAt?.getTime()}`"
          v-model="existenciasData"
          :boom-version="explosion?.version"
          :document-id="explosion?.id"
          @version-validation-changed="handleExistenciasVersionValidationChanged"
          @file-metadata-updated="handleFileMetadataUpdated"
        />
      </template>

      <template #cobertura>
        <CoberturaStep
          :key="`cobertura-${cargaInsumosStore.cobertura.data.length}-${cargaInsumosStore.cobertura.loadedAt?.getTime()}`"
          v-model="coberturaData"
          :boom-version="explosion?.version"
          :document-id="explosion?.id"
          @version-validation-changed="handleCoberturaVersionValidationChanged"
          @file-metadata-updated="handleFileMetadataUpdated"
        />
      </template>

      <template #guardar>
        <GuardarStep
          :key="`guardar-${cargaInsumosStore.dataStats.total}-${cargaInsumosStore.lastSaved?.getTime()}`"
          :plan-ventas-data="cargaInsumosStore.planVentas.data"
          :existencias-data="cargaInsumosStore.existencias.data"
          :cobertura-data="cargaInsumosStore.cobertura.data"
          :boom-id="explosion?.id"
          @all-steps-completed="handleCargaInsumosCompleted"
        />
      </template>
    </UStepper>

    <!-- Controles de navegación -->
    <div v-if="!loadingExistingData" class="flex justify-between items-center pt-4 step-navigation-controls">
      <UButton
        class="cursor-pointer"
        :disabled="!canGoPrev"
        icon="i-heroicons-arrow-left"
        @click="goPrev"
      />

      <div class="text-center stepper-navigation">
        <span class="font-bold text-gray-500 dark:text-gray-400">
          Paso {{ currentStep + 1 }} de {{ items.length }}
        </span>
      </div>

      <UButton
        v-if="currentStep < items.length - 1"
        class="cursor-pointer"
        :disabled="!canGoNext"
        icon="i-heroicons-arrow-right"
        @click="goNext"
      />
    </div>
</div>
</template>

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
