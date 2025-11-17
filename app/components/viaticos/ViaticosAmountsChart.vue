<template>
  <ViaticosChartContainer
    title="Importes por Mes"
    icon="i-heroicons-banknotes"
    :loading="loading"
    :empty="monthlyAmounts.length === 0"
  >
    <ViaticosBarChart :data="chartData" />
  </ViaticosChartContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ViaticosBarChart from "~/components/viaticos/charts/ViaticosBarChart.vue";
import type { ViaticoMonthlyAmount, ViaticoChartData } from "~/domain/viaticos/types";

interface Props {
  monthlyAmounts: ViaticoMonthlyAmount[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const chartData = computed<ViaticoChartData>(() => {
  const labels = props.monthlyAmounts.map((m) => m.mes);

  return {
    labels,
    datasets: [
      {
        label: "Importe Aceptado",
        data: props.monthlyAmounts.map((m) => m.importeAceptado),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
      },
      {
        label: "Importe Rechazado",
        data: props.monthlyAmounts.map((m) => m.importeRechazado),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
      },
    ],
  };
});
</script>

