<template>
  <div v-if="hasAlerts" class="space-y-3">
    <!-- Alerta: Accesos no autorizados -->
    <div
      v-if="unauthorizedAttempts.length > 0"
      class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md"
    >
      <div class="flex items-start">
        <UIcon
          name="i-heroicons-shield-exclamation"
          class="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            Intentos de Acceso No Autorizados
          </h3>
          <p class="text-sm text-red-700 dark:text-red-300">
            Se detectaron
            <span class="font-bold">{{ unauthorizedAttempts.length }}</span>
            intentos no autorizados en las últimas 24 horas
          </p>
          <button
            @click="showUnauthorizedDetails = !showUnauthorizedDetails"
            class="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            {{ showUnauthorizedDetails ? "Ocultar" : "Ver" }} detalles
          </button>
          <div v-if="showUnauthorizedDetails" class="mt-3 space-y-2">
            <div
              v-for="(attempt, idx) in unauthorizedAttempts.slice(0, 5)"
              :key="idx"
              class="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-red-200 dark:border-red-800"
            >
              <div class="font-semibold">{{ attempt.userEmail }}</div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ attempt.module }} - {{ attempt.action }} @
                {{ formatTime(attempt.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerta: Deletes masivos -->
    <div
      v-if="massiveDeletes.length > 0"
      class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md"
    >
      <div class="flex items-start">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            Eliminaciones Masivas Detectadas
          </h3>
          <p class="text-sm text-red-700 dark:text-red-300">
            <span class="font-bold">{{ massiveDeletes.length }}</span>
            usuario(s) realizaron múltiples eliminaciones
          </p>
          <div class="mt-2 space-y-1">
            <div
              v-for="(deleteEvent, idx) in massiveDeletes"
              :key="idx"
              class="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-red-200 dark:border-red-800"
            >
              <div class="font-semibold">{{ deleteEvent.userEmail }}</div>
              <div class="text-gray-600 dark:text-gray-400">
                {{ deleteEvent.count }} eliminaciones en una hora
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerta: Actividad fuera de horario -->
    <div
      v-if="offHoursActivity.length > 10"
      class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-md"
    >
      <div class="flex items-start">
        <UIcon
          name="i-heroicons-clock"
          class="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            Actividad Fuera del Horario Laboral
          </h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            Se registraron
            <span class="font-bold">{{ offHoursActivity.length }}</span>
            acciones fuera del horario laboral (6 PM - 6 AM)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { AuditLog } from "~/domain/audit/types";
import { useAuditStatistics } from "~/composables/useAuditStatistics";

const props = defineProps<{
  logs: AuditLog[];
}>();

const { getUnauthorizedAttempts, getOffHoursActivity, getMassiveDeletes } =
  useAuditStatistics();

const showUnauthorizedDetails = ref(false);

// Calcular alertas
const unauthorizedAttempts = computed(() =>
  getUnauthorizedAttempts(props.logs, 24)
);

const offHoursActivity = computed(() => getOffHoursActivity(props.logs));

const massiveDeletes = computed(() => getMassiveDeletes(props.logs));

const hasAlerts = computed(() => {
  return (
    unauthorizedAttempts.value.length > 0 ||
    massiveDeletes.value.length > 0 ||
    offHoursActivity.value.length > 10
  );
});

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
