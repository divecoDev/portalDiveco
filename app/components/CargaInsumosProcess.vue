<script setup>
import PlanVentasStep from "./boom/PlanVentasStep.vue";
import ExistenciasStep from "./boom/ExistenciasStep.vue";
import CoberturaStep from "./boom/CoberturaStep.vue";
import GuardarStep from "./boom/GuardarStep.vue";
import { useCargaInsumosProcessStore } from "../../stores/useCargaInsumosProcess";
import { useCargaInsumosData } from "../composables/useCargaInsumosData";

// Props para recibir la explosión
const props = defineProps({
  explosion: {
    type: Object,
    required: true
  }
});

// Emits para comunicarse con el componente padre
const emit = defineEmits(['carga-insumos-completed']);

// Usar el store de Carga de Insumos
const cargaInsumosStore = useCargaInsumosProcessStore();

// Usar el composable para consultar datos existentes
const { queryData, loading: dataLoading, error: dataError } = useCargaInsumosData();

// Estado para controlar si se están cargando datos existentes
const loadingExistingData = ref(false);

// Inicializar el store al montar el componente
onMounted(async () => {
  await cargaInsumosStore.initialize();

  // Establecer el boom_id en el store y verificar datos existentes
  if (props.explosion?.id) {
    await checkAndLoadExistingData(props.explosion.id);
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
  if (newExplosion?.id) {
    await checkAndLoadExistingData(newExplosion.id);
  }
}, { immediate: true });
</script>

<template>
  <div class="space-y-6">
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
      class="w-full"
    >
      <template #plan-de-ventas>
        <PlanVentasStep
          :key="`plan-ventas-${cargaInsumosStore.planVentas.data.length}-${cargaInsumosStore.planVentas.loadedAt?.getTime()}`"
          v-model="planVentasData"
          :boom-version="explosion?.version"
          @version-validation-changed="handleVersionValidationChanged"
        />
      </template>

      <template #existencias>
        <ExistenciasStep
          :key="`existencias-${cargaInsumosStore.existencias.data.length}-${cargaInsumosStore.existencias.loadedAt?.getTime()}`"
          v-model="existenciasData"
          :boom-version="explosion?.version"
          @version-validation-changed="handleExistenciasVersionValidationChanged"
        />
      </template>

      <template #cobertura>
        <CoberturaStep
          :key="`cobertura-${cargaInsumosStore.cobertura.data.length}-${cargaInsumosStore.cobertura.loadedAt?.getTime()}`"
          v-model="coberturaData"
        />
      </template>

      <template #guardar>
        <GuardarStep
          :key="`guardar-${cargaInsumosStore.dataStats.total}-${cargaInsumosStore.lastSaved?.getTime()}`"
          :plan-ventas-data="cargaInsumosStore.planVentas.data"
          :existencias-data="cargaInsumosStore.existencias.data"
          :cobertura-data="cargaInsumosStore.cobertura.data"
          @all-steps-completed="handleCargaInsumosCompleted"
        />
      </template>
    </UStepper>

    <!-- Controles de navegación -->
    <div v-if="!loadingExistingData" class="flex justify-between items-center pt-4">
      <UButton
        class="cursor-pointer"
        :disabled="!canGoPrev"
        icon="i-heroicons-arrow-left"
        @click="goPrev"
      />

      <div class="text-center">
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
