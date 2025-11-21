<template>
  <ViaticosChartContainer
    title="Distribución por Estado"
    icon="i-heroicons-chart-pie"
    :loading="loading"
    :empty="statusDistribution.length === 0"
  >
    <ViaticosPieChart :data="chartData" />
  </ViaticosChartContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ViaticosPieChart from "~/components/viaticos/charts/ViaticosPieChart.vue";
import type { ViaticoStatusDistribution, ViaticoChartData } from "~/domain/viaticos/types";

interface Props {
  statusDistribution: ViaticoStatusDistribution[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const chartData = computed<ViaticoChartData>(() => {
  const labels = props.statusDistribution.map((s) => s.estado);
  const data = props.statusDistribution.map((s) => s.cantidad);

  const colors = {
    Aceptada: "rgba(34, 197, 94, 0.8)",
    "En Proceso": "rgba(234, 179, 8, 0.8)",
    Rechazada: "rgba(239, 68, 68, 0.8)",
  };

  const borderColors = {
    Aceptada: "rgba(34, 197, 94, 1)",
    "En Proceso": "rgba(234, 179, 8, 1)",
    Rechazada: "rgba(239, 68, 68, 1)",
  };

  return {
    labels,
    datasets: [
      {
        label: "Formularios",
        data,
        backgroundColor: labels.map((label) => colors[label as keyof typeof colors]),
        borderColor: labels.map((label) => borderColors[label as keyof typeof borderColors]),
        borderWidth: 2,
      },
    ],
  };
});
</script>

