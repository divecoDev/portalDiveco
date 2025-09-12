<script setup>
import PlanVentasStep from "./boom/PlanVentasStep.vue";
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
  <div>
    <h1 class="text-2xl font-bold mb-4">Carga de insumos</h1>

    <UStepper color="neutral" :items="items" class="w-full">
      <template #plan-de-ventas>
        <PlanVentasStep
          v-model="planVentasData"
          @update:modelValue="handlePlanVentasUpdate"
        />
      </template>

      <template #existencias>
        <div class="text-center py-12">
          <div
            class="w-24 h-24 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <UIcon
              name="i-heroicons-shopping-cart"
              class="w-12 h-12 text-cyan-600 dark:text-cyan-400"
            />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Existencias
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            Componente en desarrollo
          </p>
        </div>
      </template>

      <template #cobertura>
        <div class="text-center py-12">
          <div
            class="w-24 h-24 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <UIcon
              name="i-heroicons-shield-check"
              class="w-12 h-12 text-cyan-600 dark:text-cyan-400"
            />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Cobertura
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            Componente en desarrollo
          </p>
        </div>
      </template>
    </UStepper>
  </div>
</template>
