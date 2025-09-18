<script setup>
import PlanVentasStep from "./boom/PlanVentasStep.vue";
import ExistenciasStep from "./boom/ExistenciasStep.vue";
import CoberturaStep from "./boom/CoberturaStep.vue";
import GuardarStep from "./boom/GuardarStep.vue";

// Emits para comunicarse con el componente padre
const emit = defineEmits(['boom-process-completed']);

// Estado para los pasos del stepper
const items = ref([
  {
    slot: "plan-de-ventas",
    title: "Plan de ventas",
    icon: "i-heroicons-chart-bar",
  },
  {
    slot: "existencias",
    title: "Existencias",
    icon: "i-heroicons-shopping-cart",
  },
  {
    slot: "cobertura",
    title: "Cobertura",
    icon: "i-heroicons-shield-check",
  },
  {
    slot: "guardar",
    title: "Guardar",
    icon: "i-heroicons-cloud-arrow-up",
  }
]);

// Estado para los datos de cada paso
const planVentasData = ref([]);
const existenciasData = ref([]);
const coberturaData = ref([]);

// Estado para el paso actual
const currentStep = ref(0);

// Referencia al stepper para controlar la navegación
const stepper = ref();

// Computed para validaciones de cada paso
const isPlanVentasValid = computed(() => planVentasData.value.length > 0);
const isExistenciasValid = computed(() => existenciasData.value.length > 0);
const isCoberturaValid = computed(() => coberturaData.value.length > 0);

// Computed para controlar la navegación
const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 0: // Plan de ventas
      return isPlanVentasValid.value;
    case 1: // Existencias
      return isExistenciasValid.value;
    case 2: // Cobertura
      return isCoberturaValid.value;
    default:
      return false;
  }
});

const canGoPrev = computed(() => currentStep.value > 0);

// Métodos de navegación
const goNext = () => {
  if (canGoNext.value && stepper.value?.hasNext) {
    stepper.value.next();
    // Scroll al inicio de la página
    window.scrollTo({ top: 185, behavior: "smooth" });
  }
};

const goPrev = () => {
  if (canGoPrev.value && stepper.value?.hasPrev) {
    stepper.value.prev();
    // Scroll al inicio de la página
    window.scrollTo({ top: 185, behavior: "smooth" });
  }
};

// Método para manejar cuando el proceso de guardado se completa
const handleBoomProcessCompleted = () => {
  emit('boom-process-completed');
};

// Los datos se actualizan automáticamente con v-model
// No necesitamos handlers manuales

// Los datos se mantienen reactivos automáticamente
</script>

<template>
  <div class="space-y-6">
    <!-- Stepper con navegación deshabilitada -->
    <UStepper
      ref="stepper"
      v-model="currentStep"
      :items="items"
      color="primary"
      disabled
      class="w-full"
    >
      <template #plan-de-ventas>
        <PlanVentasStep
          :key="`plan-ventas-${planVentasData.length}`"
          v-model="planVentasData"
        />
      </template>

      <template #existencias>
        <ExistenciasStep
          :key="`existencias-${existenciasData.length}`"
          v-model="existenciasData"
        />
      </template>

      <template #cobertura>
        <CoberturaStep
          :key="`cobertura-${coberturaData.length}`"
          v-model="coberturaData"
        />
      </template>

      <template #guardar>
        <GuardarStep
          :key="`guardar-${planVentasData.length}-${existenciasData.length}-${coberturaData.length}`"
          :plan-ventas-data="planVentasData"
          :existencias-data="existenciasData"
          :cobertura-data="coberturaData"
          @all-steps-completed="handleBoomProcessCompleted"
        />
      </template>
    </UStepper>

    <!-- Controles de navegación -->
    <div class="flex justify-between items-center pt-4">
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
