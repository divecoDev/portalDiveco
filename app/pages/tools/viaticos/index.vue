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
              <UIcon name="i-heroicons-banknotes" class="w-7 h-7 text-white" />
            </div>
            Gestión de Viáticos
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Dashboard y gestión de liquidación de gastos y viáticos
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtro de fechas -->
      <ViaticosDateFilter
        v-model:start-date="dateFilters.startDate"
        v-model:end-date="dateFilters.endDate"
        @change="handleDateFilterChange"
      />

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">Cargando datos de viáticos...</p>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-8">
        <!-- KPIs Principales -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Indicadores Clave
            </h2>
            <NuxtLink
              to="/tools/viaticos/estado-cuenta"
              class="inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer rounded-md"
            >
              <UIcon name="i-heroicons-wallet" class="w-5 h-5" />
              Estado de Cuenta
            </NuxtLink>
          </div>
          <ViaticosKPIs :kpis="kpis" :loading="loading" />
        </div>

        <!-- Gráficas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Tendencias Temporales -->
          <ViaticosTrendsChart
            :temporal-data="temporalData"
            :loading="loading"
          />

          <!-- Importes por Mes -->
          <ViaticosAmountsChart
            :monthly-amounts="monthlyAmounts"
            :loading="loading"
          />

          <!-- Distribución por Tipo de Documento -->
          <ViaticosByDocumentTypeChart
            :document-type-distribution="documentTypeDistribution"
            :loading="loading"
          />

          <!-- Motivos de Rechazo -->
          <ViaticosRejectionReasonsChart
            :rejection-reasons="rejectionReasons"
            :loading="loading"
          />
        </div>

        <!-- Tabla de Registros -->
        <div>
          <ViaticosTable
            :data="formularios"
            :loading="loading"
            :items-per-page="20"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useViaticosData } from "~/composables/useViaticosData";

// Meta tags y breadcrumbs
useSeoMeta({
  title: "Gestión de Viáticos - Portal Diveco",
  description: "Dashboard y gestión de liquidación de gastos y viáticos",
});

const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/tools" },
  { title: "Gestión de Viáticos" },
]);

// Función para obtener el primer día del mes actual
const getFirstDayOfMonth = (): string => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return firstDay.toISOString().split("T")[0];
};

// Función para obtener la fecha de hoy
const getToday = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Filtros de fecha (valores por defecto: primer día del mes actual hasta hoy)
const dateFilters = ref({
  startDate: getFirstDayOfMonth(),
  endDate: getToday(),
});

// Obtener datos con filtros de fecha (usando computed para reactividad)
const {
  formularios,
  loading,
  kpis,
  statusDistribution,
  temporalData,
  monthlyAmounts,
  topEmployees,
  documentTypeDistribution,
  rejectionReasons,
} = useViaticosData(
  undefined, // employeeId (se implementará después)
  computed(() => dateFilters.value.startDate),
  computed(() => dateFilters.value.endDate)
);

// Handler para cambios en el filtro de fechas
const handleDateFilterChange = (filters: { startDate: string; endDate: string }) => {
  dateFilters.value = filters;
  // Los datos se actualizarán automáticamente porque el composable usa computed
};
</script>

