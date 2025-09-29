<template>
  <div
    class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-1/2"
  >
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Tasa de Éxito vs Errores
    </h3>
    <div class="h-64">
      <Pie
        v-if="chartData && chartData.labels.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
      <div
        v-else
        class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
      >
        <div class="text-center">
          <UIcon name="i-heroicons-chart-pie" class="w-12 h-12 mx-auto mb-2" />
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

// Props
const props = defineProps({
  history: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// Computed para procesar datos de éxito vs errores
const chartData = computed(() => {
  const completedCount = props.history.filter(
    (record) => record.status === "Completado",
  ).length;

  const errorCount = props.history.filter(
    (record) => record.status === "Error",
  ).length;

  return {
    labels: ["Completado", "Error"],
    datasets: [
      {
        data: [completedCount, errorCount],
        backgroundColor: [
          "rgba(6, 182, 212, 0.8)", // Cyan oscuro para completado
          "rgba(239, 68, 68, 0.8)", // Rojo para error
        ],
        borderColor: ["rgba(6, 182, 212, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 2,
      },
    ],
  };
});

// Opciones de la gráfica
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
}));
</script>
