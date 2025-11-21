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
              <UIcon name="i-heroicons-wallet" class="w-7 h-7 text-white" />
            </div>
            Estado de Cuenta
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Consulta el estado de cuenta y transacciones de viáticos por colaborador
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros -->
      <ViaticosEstadoCuentaFilters
        v-model:employee-id="filters.employeeId"
        v-model:year="filters.year"
        v-model:month="filters.month"
        @change="handleFiltersChange"
      />

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">Cargando estado de cuenta...</p>
        </div>
      </div>

      <!-- Contenido -->
      <div v-else-if="estadoCuenta" class="space-y-6">
        <!-- Resumen de Saldos y Gráfica -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Resumen de Saldos -->
          <ViaticosEstadoCuentaSummary
            :empleado="estadoCuenta.empleado"
            :saldo-mes-anterior="estadoCuenta.saldoMesAnterior"
            :saldo-a-favor="estadoCuenta.saldoAFavor"
          />

          <!-- Gráfica de Débito y Crédito -->
          <ViaticosDebitCreditChart
            :total-debito="estadoCuenta.totalDebito"
            :total-credito="estadoCuenta.totalCredito"
            :loading="loading"
          />
        </div>

        <!-- Tabla de Transacciones -->
        <ViaticosEstadoCuentaTable
          :transacciones="estadoCuenta.transacciones"
          :total-debito="estadoCuenta.totalDebito"
          :total-credito="estadoCuenta.totalCredito"
          :saldo-a-favor="estadoCuenta.saldoAFavor"
          :loading="loading"
        />
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon name="i-heroicons-wallet" class="w-16 h-16 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Selecciona un empleado
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Por favor selecciona un empleado y un período para ver su estado de cuenta
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useViaticosEstadoCuenta } from "~/composables/useViaticosEstadoCuenta";

// Meta tags y breadcrumbs
useSeoMeta({
  title: "Estado de Cuenta - Viáticos - Portal Diveco",
  description: "Consulta el estado de cuenta y transacciones de viáticos por colaborador",
});

const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/tools" },
  { title: "Gestión de Viáticos", href: "/tools/viaticos" },
  { title: "Estado de Cuenta" },
]);

// Filtros (con empleado por defecto)
const filters = ref({
  employeeId: 103292 as number | undefined, // Empleado mock por defecto
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
});

// Obtener estado de cuenta
const {
  estadoCuenta,
  loading,
  debitCreditChartData,
} = useViaticosEstadoCuenta(
  computed(() => filters.value.employeeId),
  computed(() => filters.value.year),
  computed(() => filters.value.month)
);

// Handler para cambios en los filtros
const handleFiltersChange = (newFilters: {
  employeeId?: number;
  year: number;
  month: number;
}) => {
  filters.value = {
    employeeId: newFilters.employeeId,
    year: newFilters.year,
    month: newFilters.month,
  };
};
</script>

