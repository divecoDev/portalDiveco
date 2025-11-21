<template>
  <Bar
    v-if="chartData && chartData.labels.length > 0"
    :data="chartData"
    :options="chartOptions"
  />
  <div
    v-else
    class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
  >
    <div class="text-center">
      <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-2" />
      <p>No hay datos para mostrar</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import type { ViaticoChartData } from "~/domain/viaticos/types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface Props {
  data: ViaticoChartData;
  horizontal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  horizontal: false,
});

const chartData = computed(() => props.data);

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? ("y" as const) : ("x" as const),
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
        },
        color: "#6B7280",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 12,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: "#6B7280",
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      ticks: {
        color: "#6B7280",
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
  },
}));
</script>

