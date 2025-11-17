<template>
  <div
    class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden"
  >
    <!-- Header de la tabla -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <UIcon
            name="i-heroicons-table-cells"
            class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2"
          />
          Registros de Viáticos
        </h2>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Total: {{ totalRecords }}
        </div>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div
          class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando registros...</p>
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-else-if="paginatedData.length === 0"
      class="flex justify-center items-center py-12"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center mx-auto mb-4"
        >
          <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay registros
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          No se encontraron formularios en el rango de fechas seleccionado
        </p>
      </div>
    </div>

    <!-- Tabla -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="sortBy('Id_Formulario')"
            >
              <div class="flex items-center">
                Formulario
                <UIcon
                  v-if="sortField === 'Id_Formulario'"
                  :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="w-4 h-4 ml-1"
                />
              </div>
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
            >
              Factura/Serie
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
            >
              Doc_Preliminar
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
            >
              Id_Empleado
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
            >
              Empleado
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
            >
              Fecha_Factura
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="sortBy('Fecha_Documento')"
            >
              <div class="flex items-center">
                Fecha Ingreso
                <UIcon
                  v-if="sortField === 'Fecha_Documento'"
                  :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="w-4 h-4 ml-1"
                />
              </div>
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
            >
              Importe
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(item, index) in paginatedData"
            :key="item.Id_Registro"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            :class="index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {{ item.Id_Formulario }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ item.Factura_Serie }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              <div v-if="item.Doc_Preliminar" class="flex items-center">
                {{ item.Doc_Preliminar }}
                <div
                  class="w-2 h-2 bg-green-500 rounded-full ml-2"
                  title="Documento preliminar"
                ></div>
              </div>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getEstadoClass(item.Estado),
                ]"
              >
                {{ item.Estado }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ item.Id_Empleado }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ item.nombre_empleado }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(item.Fecha_Factura) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(item.Fecha_Documento) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
              {{ formatCurrency(item.Importe_Aceptada || 0) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
      v-if="!loading && paginatedData.length > 0"
      class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ totalRecords }} registros
      </div>

      <div class="flex items-center space-x-2">
        <UButton
          icon="i-heroicons-chevron-left"
          size="sm"
          color="gray"
          variant="outline"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Anterior
        </UButton>

        <span class="text-sm text-gray-600 dark:text-gray-400 px-3">
          Página {{ currentPage }} de {{ totalPages }}
        </span>

        <UButton
          icon="i-heroicons-chevron-right"
          size="sm"
          color="gray"
          variant="outline"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Siguiente
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { ViaticoFormulario } from "~/domain/viaticos/types";

interface Props {
  data: ViaticoFormulario[];
  loading?: boolean;
  itemsPerPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  itemsPerPage: 20,
});

// Estado de paginación y ordenamiento
const currentPage = ref(1);
const sortField = ref<keyof ViaticoFormulario | null>(null);
const sortDirection = ref<"asc" | "desc">("asc");

// Ordenar datos
const sortedData = computed(() => {
  if (!sortField.value) return props.data;

  return [...props.data].sort((a, b) => {
    const aValue = a[sortField.value!];
    const bValue = b[sortField.value!];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection.value === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection.value === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
});

// Datos paginados
const totalRecords = computed(() => sortedData.value.length);
const totalPages = computed(() => Math.ceil(totalRecords.value / props.itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + props.itemsPerPage, totalRecords.value)
);

const paginatedData = computed(() => {
  return sortedData.value.slice(startIndex.value, endIndex.value);
});

// Función para ordenar
const sortBy = (field: keyof ViaticoFormulario) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
  currentPage.value = 1; // Reset a la primera página al ordenar
};

// Función para obtener clase de estado
const getEstadoClass = (estado: string) => {
  const classes = {
    Aceptada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    "En Proceso": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Rechazada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    "No Registrada": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };
  return classes[estado as keyof typeof classes] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
};

// Función para formatear fecha
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
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

// Función para formatear moneda
const formatCurrency = (value: number): string => {
  if (value === 0 || !value) return "-";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Resetear página cuando cambian los datos
watch(
  () => props.data.length,
  () => {
    currentPage.value = 1;
  }
);
</script>

