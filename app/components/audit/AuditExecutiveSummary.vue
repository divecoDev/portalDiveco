<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Usuarios Activos -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6 hover:shadow-xl transition-all duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
        >
          <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-white" />
        </div>
        <div
          v-if="loading"
          class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
        Usuarios Activos
      </h3>
      <div class="space-y-1">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ activeUsersToday }}
          <span class="text-sm font-normal text-gray-500">hoy</span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span>{{ activeUsersWeek }} esta semana</span> ·
          <span>{{ activeUsersMonth }} este mes</span>
        </div>
      </div>
    </div>

    <!-- Operaciones Completadas -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6 hover:shadow-xl transition-all duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"
        >
          <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-white" />
        </div>
        <div
          v-if="loading"
          class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
        Operaciones Completadas
      </h3>
      <div class="space-y-1">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ todayStats.total }}
          <span class="text-sm font-normal text-gray-500">hoy</span>
        </div>
        <div class="text-sm">
          <span
            class="font-semibold"
            :class="
              todayStats.successRate >= 95
                ? 'text-green-600 dark:text-green-400'
                : todayStats.successRate >= 80
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            "
          >
            {{ todayStats.successRate }}%
          </span>
          <span class="text-gray-600 dark:text-gray-400"> tasa de éxito</span>
        </div>
      </div>
    </div>

    <!-- Módulo Más Usado -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6 hover:shadow-xl transition-all duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"
        >
          <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 text-white" />
        </div>
        <div
          v-if="loading"
          class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
        Módulo Más Usado
      </h3>
      <div class="space-y-1">
        <div class="text-2xl font-bold text-gray-900 dark:text-white truncate">
          {{ topModuleName }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span>{{ topModuleCount }}</span> operaciones
        </div>
      </div>
    </div>

    <!-- Tasa de Éxito Global -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6 hover:shadow-xl transition-all duration-300"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center"
        >
          <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-white" />
        </div>
        <div
          v-if="loading"
          class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
        Tasa de Éxito Global
      </h3>
      <div class="space-y-2">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ successRate }}%
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="
              successRate >= 95
                ? 'bg-green-500'
                : successRate >= 80
                ? 'bg-yellow-500'
                : 'bg-red-500'
            "
            :style="{ width: `${successRate}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { AuditLog } from "~/domain/audit/types";
import { useAuditStatistics } from "~/composables/useAuditStatistics";

const props = defineProps<{
  logs: AuditLog[];
  loading?: boolean;
}>();

const {
  getActiveUsers,
  getTodayStats,
  getTopModule,
  getSuccessRate,
} = useAuditStatistics();

// Calcular métricas
const activeUsersToday = computed(() =>
  getActiveUsers(props.logs, "today")
);
const activeUsersWeek = computed(() => getActiveUsers(props.logs, "week"));
const activeUsersMonth = computed(() => getActiveUsers(props.logs, "month"));

const todayStats = computed(() => getTodayStats(props.logs));

const topModule = computed(() => getTopModule(props.logs));
const topModuleName = computed(() => {
  const module = topModule.value?.module || "N/A";
  // Formatear nombre del módulo
  return module
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});
const topModuleCount = computed(() => topModule.value?.count || 0);

const successRate = computed(() => getSuccessRate(props.logs));
</script>
