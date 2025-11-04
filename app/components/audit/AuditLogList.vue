<template>
  <div class="space-y-3">
    <!-- Lista de logs -->
    <div
      v-for="log in logs"
      :key="log.id"
      class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 hover:shadow-xl hover:border-cyan-300/40 dark:hover:border-cyan-600/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      @click="viewLogDetail(log)"
    >
      <div class="p-5">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex flex-col justify-center">
            <!-- Información principal -->
            <div class="flex items-center space-x-3 mb-3">
              <UBadge
                :color="actionColor(log.action)"
                variant="soft"
                size="sm"
              >
                <template #leading>
                  <UIcon :name="actionIcon(log.action)" class="w-3 h-3" />
                </template>
                {{ formatAction(log.action) }}
              </UBadge>

              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ log.userName || log.userEmail }}
              </h3>

              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ getModuleDisplayName(log.module) }}
              </span>
            </div>

            <!-- Detalles secundarios -->
            <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center">
                <UIcon name="i-heroicons-cube" class="w-4 h-4 mr-1" />
                <span>{{ log.entityType }}</span>
                <span v-if="log.entityId" class="ml-1 text-gray-500">({{ log.entityId }})</span>
              </div>

              <div class="flex items-center">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
                <span>{{ formatTimestamp(log.timestamp).relative }}</span>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center space-x-1 ml-4">
            <UButton
              icon="i-heroicons-eye"
              size="sm"
              color="cyan"
              variant="ghost"
              @click.stop="viewLogDetail(log)"
              class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            >
              Ver Detalle
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="logs.length === 0 && !loading" class="text-center py-16">
      <div
        class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
      >
        <UIcon
          name="i-heroicons-document-text"
          class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
        />
      </div>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No hay logs de auditoría
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        No se encontraron registros de auditoría con los filtros aplicados
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatAuditAction, getModuleDisplayName, formatTimestamp } from "~/utils/audit-helpers";
import type { AuditLog } from "~/domain/audit/types";
import type { AuditAction } from "~/domain/audit/types";

interface Props {
  logs: AuditLog[];
  loading?: boolean;
}

interface Emits {
  (e: "view-detail", log: AuditLog): void;
}

const props = withDefaults(defineProps<Props>(), {
  logs: () => [],
  loading: false,
});

const emit = defineEmits<Emits>();

const viewLogDetail = (log: AuditLog) => {
  emit("view-detail", log);
};

const formatAction = (action: AuditAction): string => {
  return formatAuditAction(action).label;
};

const actionColor = (action: AuditAction): string => {
  return formatAuditAction(action).color;
};

const actionIcon = (action: AuditAction): string => {
  return formatAuditAction(action).icon;
};
</script>

