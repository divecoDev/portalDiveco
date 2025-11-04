<template>
  <div>
    <!-- Header de la página -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon name="i-heroicons-document-text" class="w-7 h-7 text-white" />
            </div>
            Auditoría
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Bitácora de acciones y cambios en el sistema
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros -->
      <AuditFilters
        v-model:search="filters.search"
        v-model:module="filters.module"
        v-model:action="filters.action"
        v-model:date="filters.date"
        @clear="handleClearFilters"
      />

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">Cargando logs de auditoría...</p>
        </div>
      </div>

      <!-- Lista de logs -->
      <div v-else>
        <AuditLogList :logs="logs" :loading="loading" @view-detail="handleViewDetail" />

        <!-- Paginación -->
        <div
          v-if="pagination && pagination.totalPages > 1"
          class="mt-6 flex items-center justify-between"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} -
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de
            {{ pagination.total }} registros
          </div>

          <div class="flex items-center space-x-2">
            <UButton
              icon="i-heroicons-chevron-left"
              size="sm"
              color="gray"
              variant="outline"
              :disabled="!pagination.hasPreviousPage"
              @click="loadPreviousPage"
            >
              Anterior
            </UButton>

            <span class="text-sm text-gray-600 dark:text-gray-400">
              Página {{ pagination.page }} de {{ pagination.totalPages }}
            </span>

            <UButton
              icon="i-heroicons-chevron-right"
              size="sm"
              color="gray"
              variant="outline"
              :disabled="!pagination.hasNextPage"
              @click="loadNextPage"
            >
              Siguiente
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "require-role"],
  requiredRole: ["ADMIN", "AUDITORIA"],
  layout: "default",
});

import { ref, watch, onMounted } from "vue";
import { useAudit } from "~/composables/useAudit";
import type { AuditModule, AuditAction } from "~/domain/audit/types";
import AuditFilters from "~/components/audit/AuditFilters.vue";
import AuditLogList from "~/components/audit/AuditLogList.vue";

useSeoMeta({
  title: "Auditoría - Portal Diveco",
  description: "Bitácora de acciones y cambios en el sistema",
});

const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Auditoría" },
]);

const { logs, loading, pagination, getAuditLogs } = useAudit();

// Filtros
const filters = ref<{
  search: string;
  module?: AuditModule;
  action?: AuditAction;
  date?: string;
}>({
  search: "",
  module: undefined,
  action: undefined,
  date: undefined,
});

// Página actual
const currentPage = ref(1);

// Cargar logs
const loadLogs = async () => {
  await getAuditLogs({
    search: filters.value.search || undefined,
    module: filters.value.module,
    action: filters.value.action,
    startDate: filters.value.date ? `${filters.value.date}T00:00:00Z` : undefined,
    endDate: filters.value.date ? `${filters.value.date}T23:59:59Z` : undefined,
    page: currentPage.value,
    limit: 50,
  });
};

// Handlers
const handleClearFilters = () => {
  filters.value = {
    search: "",
    module: undefined,
    action: undefined,
    date: undefined,
  };
  currentPage.value = 1;
  loadLogs();
};

const handleViewDetail = (log: any) => {
  navigateTo(`/tools/auditoria/${log.id}`);
};

const loadPreviousPage = () => {
  if (pagination.value && pagination.value.hasPreviousPage) {
    currentPage.value = pagination.value.page - 1;
    loadLogs();
  }
};

const loadNextPage = () => {
  if (pagination.value && pagination.value.hasNextPage) {
    currentPage.value = pagination.value.page + 1;
    loadLogs();
  }
};

// Watchers
watch(
  () => filters.value,
  () => {
    currentPage.value = 1;
    loadLogs();
  },
  { deep: true }
);

// Cargar logs al montar
onMounted(() => {
  loadLogs();
});
</script>

