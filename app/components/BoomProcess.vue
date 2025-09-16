<script setup>
import PlanVentasStep from "./boom/PlanVentasStep.vue";
import ExistenciasStep from "./boom/ExistenciasStep.vue";
import CoberturaStep from "./boom/CoberturaStep.vue";

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

// Handlers para actualizar los datos desde los componentes hijos
const handlePlanVentasUpdate = (data) => {
  planVentasData.value = data;
};

const handleExistenciasUpdate = (data) => {
  existenciasData.value = data;
};

const handleCoberturaUpdate = (data) => {
  coberturaData.value = data;
};
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
          v-model="planVentasData"
          @update:modelValue="handlePlanVentasUpdate"
        />
      </template>

      <template #existencias>
        <ExistenciasStep
          v-model="existenciasData"
          @update:modelValue="handleExistenciasUpdate"
        />
      </template>

      <template #cobertura>
        <CoberturaStep
          v-model="coberturaData"
          @update:modelValue="handleCoberturaUpdate"
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
        class="cursor-pointer"
        :disabled="!canGoNext"
        icon="i-heroicons-arrow-right"
        @click="goNext"
      />
    </div>

    <!-- Mensaje de validación -->
    <div
      v-if="!canGoNext"
      class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-md p-4"
    >
      <div class="flex items-center">
        <UIcon
          name="i-heroicons-information-circle"
          class="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2"
        />
        <p class="text-sm text-amber-800 dark:text-amber-200">
          <template v-if="currentStep === 0">
            Debes cargar los datos del plan de ventas para continuar al
            siguiente paso.
          </template>
          <template v-else-if="currentStep === 1">
            Debes cargar los datos de existencias para continuar al siguiente
            paso.
          </template>
          <template v-else-if="currentStep === 2">
            Debes cargar los datos de días de cobertura para procesar la
            explosión de materiales.
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
