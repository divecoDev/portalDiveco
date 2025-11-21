<template>
  <div
    class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden"
  >
    <!-- Header de la tabla -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
        <UIcon
          name="i-heroicons-table-cells"
          class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2"
        />
        Detalle de Transacciones
      </h2>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div
          class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando transacciones...</p>
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-else-if="transacciones.length === 0"
      class="flex justify-center items-center py-12"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center mx-auto mb-4"
        >
          <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay transacciones
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          No se encontraron transacciones para el período seleccionado
        </p>
      </div>
    </div>

    <!-- Tabla -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-cyan-500 to-cyan-600">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Fecha de Operación
            </th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Factura_Serie
            </th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
              Debito
            </th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
              Credito
            </th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
              Balance
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(transaccion, index) in transacciones"
            :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            :class="index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ formatDate(transaccion.fechaOperacion) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ transaccion.facturaSerie }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium" :class="transaccion.debito > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'">
              {{ transaccion.debito > 0 ? formatCurrency(transaccion.debito) : "-" }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium" :class="transaccion.credito > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'">
              {{ transaccion.credito > 0 ? formatCurrency(transaccion.credito) : "-" }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold" :class="transaccion.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ formatCurrency(transaccion.balance) }}
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <td colspan="2" class="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
              TOTAL QUETZALES
            </td>
            <td class="px-6 py-4 text-sm text-right font-bold text-red-600 dark:text-red-400">
              {{ formatCurrency(totalDebito) }}
            </td>
            <td class="px-6 py-4 text-sm text-right font-bold text-green-600 dark:text-green-400">
              {{ formatCurrency(totalCredito) }}
            </td>
            <td class="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">
              {{ formatCurrency(saldoAFavor) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViaticoTransaccion } from "~/domain/viaticos/types";

interface Props {
  transacciones: ViaticoTransaccion[];
  totalDebito: number;
  totalCredito: number;
  saldoAFavor: number;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
</script>

