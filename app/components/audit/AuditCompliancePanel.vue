<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Cambios Críticos Recientes -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6"
    >
      <h2
        class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
      >
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-6 h-6 text-red-500 dark:text-red-400 mr-2"
        />
        Cambios Críticos (48h)
      </h2>
      <div v-if="criticalChanges.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
        <NuxtLink
          v-for="(change, idx) in criticalChanges.slice(0, 10)"
          :key="idx"
          :to="`/tools/auditoria/${change.id}`"
          class="block p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center mb-1">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mr-2"
                  :class="
                    change.action === 'DELETE'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                  "
                >
                  {{ change.action }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ change.module }}
                </span>
              </div>
              <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ change.userEmail }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatTime(change.timestamp) }}
              </div>
            </div>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-5 h-5 text-gray-400 ml-2 flex-shrink-0"
            />
          </div>
        </NuxtLink>
      </div>
      <div
        v-else
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-shield-check"
          class="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500"
        />
        <p>No hay cambios críticos recientes</p>
      </div>
    </div>

    <!-- Operaciones por Módulo -->
    <div
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6"
    >
      <h2
        class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
      >
        <UIcon
          name="i-heroicons-pie-chart"
          class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2"
        />
        Uso por Módulo (30 días)
      </h2>
      <div v-if="moduleUsage.length > 0" class="space-y-3">
        <div
          v-for="(module, index) in moduleUsage"
          :key="module.module"
          class="flex items-center justify-between"
        >
          <div class="flex items-center flex-1 min-w-0">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mr-3"
              :class="getModuleColor(index)"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div
                class="font-semibold text-gray-900 dark:text-white truncate"
              >
                {{ formatModuleName(module.module) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ module.count }} operaciones
              </div>
            </div>
          </div>
          <div class="ml-4 flex-shrink-0">
            <div class="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getModuleBarColor(index)"
                :style="{
                  width: `${(module.count / maxModuleCount) * 100}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        <UIcon
          name="i-heroicons-squares-2x2"
          class="w-12 h-12 mx-auto mb-2 opacity-50"
        />
        <p>No hay datos disponibles</p>
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
}>();

const { getCriticalChanges, getModuleUsage } = useAuditStatistics();

// Calcular datos
const criticalChanges = computed(() => getCriticalChanges(props.logs, 48));
const moduleUsage = computed(() => getModuleUsage(props.logs));

const maxModuleCount = computed(() => {
  if (moduleUsage.value.length === 0) return 1;
  return Math.max(...moduleUsage.value.map((m) => m.count));
});

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatModuleName = (module: string) => {
  return module
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getModuleColor = (index: number) => {
  const colors = [
    "bg-gradient-to-br from-cyan-500 to-cyan-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-green-500 to-green-600",
    "bg-gradient-to-br from-yellow-500 to-yellow-600",
    "bg-gradient-to-br from-orange-500 to-orange-600",
  ];
  return colors[index % colors.length];
};

const getModuleBarColor = (index: number) => {
  const colors = [
    "bg-cyan-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
  ];
  return colors[index % colors.length];
};
</script>
