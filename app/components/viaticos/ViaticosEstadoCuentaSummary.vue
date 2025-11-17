<template>
  <div
    class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden"
  >
    <!-- Header con información del empleado -->
    <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white mb-1">
            {{ empleado.nombre }}
          </h2>
          <p class="text-sm text-cyan-100">
            Código: <span class="font-semibold">{{ empleado.codigo }}</span>
          </p>
        </div>
        <UIcon
          name="i-heroicons-wallet"
          class="w-8 h-8 text-white opacity-80"
        />
      </div>
    </div>

    <!-- Contenido de saldos -->
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <UIcon
          name="i-heroicons-banknotes"
          class="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-2"
        />
        Resumen de Saldos
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Saldo Mes Anterior -->
      <div class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg p-5 border border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Saldo Mes Anterior
          </h4>
          <UIcon
            name="i-heroicons-arrow-left-circle"
            class="w-5 h-5 text-gray-400"
          />
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(saldoMesAnterior) }}
        </div>
      </div>

      <!-- Saldo a Favor -->
      <div class="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-5 border border-green-200/50 dark:border-green-700/50">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Saldo a Favor
          </h4>
          <UIcon
            name="i-heroicons-banknotes"
            class="w-5 h-5 text-green-500"
          />
        </div>
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">
          {{ formatCurrency(saldoAFavor) }}
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  empleado: {
    nombre: string;
    codigo: string;
  };
  saldoMesAnterior: number;
  saldoAFavor: number;
}

defineProps<Props>();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
</script>

