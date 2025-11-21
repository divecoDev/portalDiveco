<template>
  <ViaticosChartContainer
    title="Motivos de Rechazo"
    icon="i-heroicons-exclamation-triangle"
    :loading="loading"
    :empty="rejectionReasons.length === 0"
  >
    <ViaticosBarChart :data="chartData" />
  </ViaticosChartContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ViaticosBarChart from "~/components/viaticos/charts/ViaticosBarChart.vue";
import type { ViaticoRejectionReason, ViaticoChartData } from "~/domain/viaticos/types";

interface Props {
  rejectionReasons: ViaticoRejectionReason[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const chartData = computed<ViaticoChartData>(() => {
  const labels = props.rejectionReasons.map((r) => r.motivo);
  const data = props.rejectionReasons.map((r) => r.cantidad);

  return {
    labels,
    datasets: [
      {
        label: "Cantidad de Rechazos",
        data,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
      },
    ],
  };
});
</script>

