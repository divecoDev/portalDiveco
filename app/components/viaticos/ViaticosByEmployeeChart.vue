<template>
  <ViaticosChartContainer
    title="Top Empleados"
    icon="i-heroicons-user-group"
    :loading="loading"
    :empty="topEmployees.length === 0"
  >
    <ViaticosBarChart :data="chartData" :horizontal="true" />
  </ViaticosChartContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ViaticosBarChart from "~/components/viaticos/charts/ViaticosBarChart.vue";
import type { ViaticoEmployeeData, ViaticoChartData } from "~/domain/viaticos/types";

interface Props {
  topEmployees: ViaticoEmployeeData[];
  loading?: boolean;
  metric?: "cantidad" | "importe";
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  metric: "cantidad",
});

const chartData = computed<ViaticoChartData>(() => {
  const labels = props.topEmployees.map((e) => e.empleado);
  const data =
    props.metric === "cantidad"
      ? props.topEmployees.map((e) => e.cantidadFormularios)
      : props.topEmployees.map((e) => e.importeTotal);

  return {
    labels,
    datasets: [
      {
        label: props.metric === "cantidad" ? "Cantidad de Formularios" : "Importe Total (GTQ)",
        data,
        backgroundColor: "rgba(6, 182, 212, 0.8)",
        borderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 2,
      },
    ],
  };
});
</script>

