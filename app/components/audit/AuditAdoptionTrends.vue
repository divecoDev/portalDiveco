<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Gráfico de Usuarios Activos por Semana -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
        >
          <UIcon
            name="i-heroicons-chart-line"
            class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2"
          />
          Tendencia de Usuarios Activos
        </h2>
        <span class="text-sm text-gray-500 dark:text-gray-400"
          >Últimas 8 semanas</span
        >
      </div>
      <div v-if="weeklyData.length > 0" class="h-64">
        <Line
          :data="chartData"
          :options="chartOptions"
        />
      </div>
      <div
        v-else
        class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400"
      >
        <div class="text-center">
          <UIcon
            name="i-heroicons-chart-bar-square"
            class="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>No hay datos suficientes</p>
        </div>
      </div>
    </div>

    <!-- Top 5 Usuarios Más Productivos -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6"
    >
      <h2
        class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
      >
        <UIcon
          name="i-heroicons-star"
          class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2"
        />
        Usuarios Más Activos
      </h2>
      <div v-if="topUsers.length > 0" class="space-y-3">
        <div
          v-for="(user, index) in topUsers"
          :key="user.userId"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center flex-1 min-w-0">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mr-3"
              :class="
                index === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                  : index === 2
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                  : 'bg-gradient-to-br from-cyan-400 to-cyan-600'
              "
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div
                class="font-semibold text-gray-900 dark:text-white truncate"
              >
                {{ user.userName || user.userEmail }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ user.userEmail }}
              </div>
            </div>
          </div>
          <div class="ml-4 text-right flex-shrink-0">
            <div class="text-lg font-bold text-cyan-600 dark:text-cyan-400">
              {{ user.count }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">acciones</div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No hay datos disponibles</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { AuditLog } from "~/domain/audit/types";
import { useAuditStatistics } from "~/composables/useAuditStatistics";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  logs: AuditLog[];
}>();

const { getWeeklyActiveUsers, getUserProductivity } = useAuditStatistics();

// Datos para el gráfico
const weeklyData = computed(() => getWeeklyActiveUsers(props.logs, 8));
const topUsers = computed(() => getUserProductivity(props.logs, 5));

const chartData = computed(() => ({
  labels: weeklyData.value.map((d) => d.week),
  datasets: [
    {
      label: "Usuarios Activos",
      data: weeklyData.value.map((d) => d.count),
      borderColor: "rgb(6, 182, 212)", // cyan-500
      backgroundColor: "rgba(6, 182, 212, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "rgb(6, 182, 212)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgb(6, 182, 212)",
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context: any) => {
          return `${context.parsed.y} usuarios`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#6b7280",
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        color: "#6b7280",
        font: {
          size: 11,
        },
        stepSize: 1,
        precision: 0,
      },
    },
  },
}));
</script>



