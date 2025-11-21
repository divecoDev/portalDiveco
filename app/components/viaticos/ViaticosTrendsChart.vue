<template>
  <ViaticosChartContainer
    title="Tendencias Temporales"
    icon="i-heroicons-chart-bar"
    :loading="loading"
    :empty="temporalData.length === 0"
  >
    <ViaticosLineChart :data="chartData" />
  </ViaticosChartContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ViaticosLineChart from "~/components/viaticos/charts/ViaticosLineChart.vue";
import type { ViaticoTemporalData, ViaticoChartData } from "~/domain/viaticos/types";

interface Props {
  temporalData: ViaticoTemporalData[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const chartData = computed<ViaticoChartData>(() => {
  const labels = props.temporalData.map((d) => {
    const date = new Date(d.fecha);
    return date.toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "2-digit",
    });
  });

  return {
    labels,
    datasets: [
      {
        label: "Registrados",
        data: props.temporalData.map((d) => d.registrados),
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Contabilizados",
        data: props.temporalData.map((d) => d.contabilizados),
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Rechazados",
        data: props.temporalData.map((d) => d.rechazados),
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
});
</script>

