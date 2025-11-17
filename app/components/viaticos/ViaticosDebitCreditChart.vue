<template>
  <div
    class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden h-full"
  >
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <UIcon
          name="i-heroicons-chart-pie"
          class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2"
        />
        Debito y Credito
      </h3>
    </div>

    <!-- Contenido -->
    <div class="p-6">
      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">Cargando gráfica...</p>
        </div>
      </div>

      <!-- Gráfica o Estado vacío -->
      <div v-if="!loading">
        <div v-if="chartData" class="flex justify-center items-center">
          <div class="w-full max-w-sm">
            <ViaticosPieChart :data="chartData" />
          </div>
        </div>
        <div
          v-else
          class="flex justify-center items-center py-12"
        >
          <div class="text-center">
            <div
              class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center mx-auto mb-4"
            >
              <UIcon name="i-heroicons-chart-pie" class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sin datos
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              No hay información de débito y crédito disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ViaticosPieChart from "~/components/viaticos/charts/ViaticosPieChart.vue";
import type { ViaticoChartData } from "~/domain/viaticos/types";

interface Props {
  totalDebito: number;
  totalCredito: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const formatAmount = (value: number): string => {
  if (value >= 1000) {
    return `Q${(value / 1000).toFixed(2)} mil`;
  }
  return `Q${value.toFixed(2)}`;
};

const chartData = computed<ViaticoChartData | null>(() => {
  if (props.totalDebito === 0 && props.totalCredito === 0) return null;

  const total = props.totalDebito + props.totalCredito;
  const debitoPorcentaje = total > 0 ? (props.totalDebito / total) * 100 : 0;
  const creditoPorcentaje = total > 0 ? (props.totalCredito / total) * 100 : 0;

  return {
    labels: [
      `Debito (${formatAmount(props.totalDebito)} - ${debitoPorcentaje.toFixed(2)}%)`,
      `Credito (${formatAmount(props.totalCredito)} - ${creditoPorcentaje.toFixed(2)}%)`,
    ],
    datasets: [
      {
        label: "Monto",
        data: [props.totalDebito, props.totalCredito],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Azul para débito
          "rgba(34, 197, 94, 0.8)", // Verde para crédito
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };
});
</script>


