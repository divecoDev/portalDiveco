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
            Detalle de Auditoría
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Información detallada del log de auditoría
          </p>
        </div>

        <UButton
          icon="i-heroicons-arrow-left"
          size="md"
          color="gray"
          variant="outline"
          @click="goBack"
        >
          Volver
        </UButton>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">Cargando detalle del log...</p>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Error al cargar el log
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {{ error }}
        </p>
        <UButton
          icon="i-heroicons-arrow-path"
          size="md"
          color="red"
          variant="outline"
          @click="loadLogDetail"
        >
          Reintentar
        </UButton>
      </div>

      <!-- Detalle del log -->
      <AuditLogDetail
        v-else-if="currentLog"
        :log="currentLog"
        :loading="loading"
        @close="goBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "require-role"],
  requiredRole: ["ADMIN", "AUDITORIA"],
  layout: "default",
});

import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAudit } from "~/composables/useAudit";
import AuditLogDetail from "~/components/audit/AuditLogDetail.vue";

const route = useRoute();
const { currentLog, loading, error, getAuditLogDetail } = useAudit();

const logId = route.params.id as string;

useSeoMeta({
  title: `Detalle de Auditoría - Portal Diveco`,
  description: "Información detallada del log de auditoría",
});

const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Auditoría", href: "/tools/auditoria" },
  { title: "Detalle" },
]);

const loadLogDetail = async () => {
  await getAuditLogDetail(logId);
};

const goBack = () => {
  navigateTo("/tools/auditoria");
};

onMounted(() => {
  if (logId) {
    loadLogDetail();
  }
});
</script>

