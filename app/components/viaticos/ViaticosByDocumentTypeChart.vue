<template>
  <ViaticosChartContainer
    title="Distribución por Tipo de Documento"
    icon="i-heroicons-document-duplicate"
    :loading="loading"
    :empty="documentTypeDistribution.length === 0"
  >
    <ViaticosPieChart :data="chartData" />
  </ViaticosChartContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ViaticosPieChart from "~/components/viaticos/charts/ViaticosPieChart.vue";
import type { ViaticoDocumentTypeData, ViaticoChartData } from "~/domain/viaticos/types";

interface Props {
  documentTypeDistribution: ViaticoDocumentTypeData[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const chartData = computed<ViaticoChartData>(() => {
  const labels = props.documentTypeDistribution.map((d) => d.tipo);
  const data = props.documentTypeDistribution.map((d) => d.cantidad);

  // Colores para diferentes tipos de documentos
  const colors = [
    "rgba(6, 182, 212, 0.8)",
    "rgba(34, 197, 94, 0.8)",
    "rgba(234, 179, 8, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(236, 72, 153, 0.8)",
  ];

  const borderColors = [
    "rgba(6, 182, 212, 1)",
    "rgba(34, 197, 94, 1)",
    "rgba(234, 179, 8, 1)",
    "rgba(239, 68, 68, 1)",
    "rgba(168, 85, 247, 1)",
    "rgba(236, 72, 153, 1)",
  ];

  return {
    labels,
    datasets: [
      {
        label: "Cantidad",
        data,
        backgroundColor: labels.map((_, index) => colors[index % colors.length]),
        borderColor: labels.map((_, index) => borderColors[index % borderColors.length]),
        borderWidth: 2,
      },
    ],
  };
});
</script>

