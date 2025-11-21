<template>
  <div
    class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <div
          class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3"
        >
          <UIcon
            name="i-heroicons-document-text"
            class="w-6 h-6 text-white"
          />
        </div>
        Resumen de Formularios
      </h3>
      <div
        v-if="loading"
        class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Total de Formularios -->
      <div
        class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-center justify-center mb-2">
          <div
            class="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center"
          >
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-white" />
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {{ kpis.totalFormularios }}
          </div>
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Total
          </div>
        </div>
      </div>

      <!-- Aceptados -->
      <div
        class="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50 hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-center justify-center mb-2">
          <div
            class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center"
          >
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-white" />
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {{ kpis.aceptados }}
          </div>
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
            Aceptados
          </div>
          <div class="w-full bg-green-200 dark:bg-green-900/30 rounded-full h-1.5 mt-2">
            <div
              class="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
              :style="{ width: `${kpis.tasaAceptacion}%` }"
            ></div>
          </div>
          <div class="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
            {{ kpis.tasaAceptacion }}%
          </div>
        </div>
      </div>

      <!-- En Proceso -->
      <div
        class="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200/50 dark:border-yellow-700/50 hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-center justify-center mb-2">
          <div
            class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center"
          >
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-white" />
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
            {{ kpis.enProceso }}
          </div>
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            En Proceso
          </div>
          <div class="w-full bg-yellow-200 dark:bg-yellow-900/30 rounded-full h-1.5 mt-2">
            <div
              class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-1.5 rounded-full transition-all duration-500"
              :style="{
                width: `${kpis.totalFormularios > 0 ? (kpis.enProceso / kpis.totalFormularios) * 100 : 0}%`,
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Rechazados -->
      <div
        class="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200/50 dark:border-red-700/50 hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-center justify-center mb-2">
          <div
            class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center"
          >
            <UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-white" />
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
            {{ kpis.rechazados }}
          </div>
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
            Rechazados
          </div>
          <div class="w-full bg-red-200 dark:bg-red-900/30 rounded-full h-1.5 mt-2">
            <div
              class="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full transition-all duration-500"
              :style="{
                width: `${kpis.totalFormularios > 0 ? (kpis.rechazados / kpis.totalFormularios) * 100 : 0}%`,
              }"
            ></div>
          </div>
          <div class="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
            {{ ((kpis.rechazados / kpis.totalFormularios) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViaticoKPI } from "~/domain/viaticos/types";

interface Props {
  kpis: ViaticoKPI;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});
</script>

