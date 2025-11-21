<template>
  <div class="space-y-6">
    <!-- KPI Principal: Importe Total Aceptado y Resumen de Formularios -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ViaticosKPICard
        title="Importe Total Aceptado"
        :value="kpis.importeTotalAceptado"
        icon="i-heroicons-banknotes"
        color="green"
        :loading="loading"
        :format-value="formatCurrency"
        :is-primary="true"
      />
      <ViaticosFormulariosSummaryCard
        :kpis="kpis"
        :loading="loading"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ViaticoKPI } from "~/domain/viaticos/types";

interface Props {
  kpis: ViaticoKPI;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const formatCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};
</script>

