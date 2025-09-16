<template>
  <div
    class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-1/2"
  >
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Actividad Diaria: Reinicios y Desbloqueos
    </h3>
    <div class="h-64">
      <Line
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
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
);

// Props
const props = defineProps({
  history: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// Computed para procesar datos diarios
const chartData = computed(() => {
  const resetPasswordCounts = {};
  const unlockUserCounts = {};

  // Procesar reinicios de contraseña completados
  props.history
    .filter(
      (record) =>
        record.accion === "RESET_PASSWORD" &&
        record.status === "Completado" &&
        record.date,
    )
    .forEach((record) => {
      const date = new Date(record.date).toISOString().split("T")[0]; // YYYY-MM-DD
      resetPasswordCounts[date] = (resetPasswordCounts[date] || 0) + 1;
    });

  // Procesar desbloqueos de usuarios completados
  props.history
    .filter(
      (record) =>
        record.accion === "UNLOCK_USER" &&
        record.status === "Completado" &&
        record.date,
    )
    .forEach((record) => {
      const date = new Date(record.date).toISOString().split("T")[0]; // YYYY-MM-DD
      unlockUserCounts[date] = (unlockUserCounts[date] || 0) + 1;
    });

  // Obtener todas las fechas únicas
  const allDates = new Set([
    ...Object.keys(resetPasswordCounts),
    ...Object.keys(unlockUserCounts),
  ]);
  const sortedDates = Array.from(allDates).sort();

  // Preparar labels y datos
  const labels = sortedDates.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  });

  const resetPasswordData = sortedDates.map(
    (date) => resetPasswordCounts[date] || 0,
  );
  const unlockUserData = sortedDates.map((date) => unlockUserCounts[date] || 0);

  return {
    labels,
    datasets: [
      {
        label: "Reinicios de Contraseñas",
        data: resetPasswordData,
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: "rgba(6, 182, 212, 1)",
        pointBorderColor: "rgba(6, 182, 212, 1)",
      },
      {
        label: "Desbloqueos de Usuarios",
        data: unlockUserData,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
        pointBorderColor: "rgba(34, 197, 94, 1)",
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
      position: "top",
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.1,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
}));
</script>
