<template>
  <UCard
    class="animate-fade-in-up border border-cyan-200 dark:border-cyan-700 shadow-lg"
    :style="'box-shadow: var(--diveco-shadow);'"
  >
    <!-- Filtros -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Usuario SAP
          </label>
          <UInput
            v-model="filters.sapUser"
            placeholder="Filtrar por usuario SAP"
            icon="i-heroicons-user"
            @input="applyFilters"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Usuario que realizó la acción
          </label>
          <UInput
            v-model="filters.emailOwner"
            placeholder="Filtrar por email"
            icon="i-heroicons-envelope"
            @input="applyFilters"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Fecha
          </label>
          <UInput
            v-model="filters.date"
            type="date"
            icon="i-heroicons-calendar"
            @input="applyFilters"
          />
        </div>
      </div>
    </div>

    <!-- Gráfica de reinicios diarios -->
    <div class="flex gap-4">
      <div
        class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-1/2"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actividad Diaria: Reinicios y Desbloqueos
        </h3>
        <div class="h-64">
          <Line
            v-if="chartData && chartData.labels.length > 0"
            :data="chartData"
            :options="chartOptions"
          />
          <div
            v-else
            class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
          >
            <div class="text-center">
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-12 h-12 mx-auto mb-2"
              />
              <p>No hay datos para mostrar</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfica de Tasa de Éxito vs Errores -->
      <div
        class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-1/2"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tasa de Éxito vs Errores
        </h3>
        <div class="h-64">
          <Pie
            v-if="successRateData && successRateData.labels.length > 0"
            :data="successRateData"
            :options="successRateOptions"
          />
          <div
            v-else
            class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
          >
            <div class="text-center">
              <UIcon
                name="i-heroicons-chart-pie"
                class="w-12 h-12 mx-auto mb-2"
              />
              <p>No hay datos para mostrar</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4"
        />
        <p class="text-gray-600 dark:text-gray-400">Cargando historial...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredHistory.length === 0" class="text-center py-12">
      <UIcon
        name="i-heroicons-document-text"
        class="w-16 h-16 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No hay registros
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{
          hasFilters
            ? "No se encontraron registros con los filtros aplicados"
            : "No hay registros de reinicio de contraseñas"
        }}
      </p>
    </div>

    <!-- History Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Tipo de Acción
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Usuario SAP
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Realizado por
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Fecha
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <tr
            v-for="record in paginatedHistory"
            :key="record.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div
                  :class="[
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    record.accion === 'RESET_PASSWORD'
                      ? 'bg-cyan-100 dark:bg-cyan-900'
                      : 'bg-green-100 dark:bg-green-900',
                  ]"
                >
                  <UIcon
                    :name="
                      record.accion === 'RESET_PASSWORD'
                        ? 'i-heroicons-key'
                        : 'i-heroicons-lock-open'
                    "
                    :class="[
                      'w-4 h-4',
                      record.accion === 'RESET_PASSWORD'
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-green-600 dark:text-green-400',
                    ]"
                  />
                </div>
                <div class="ml-3">
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ formatActionType(record.accion) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="">
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ record.sapUser }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ formatEmailOwner(record.emailOwner).split("@")[0] + "@..." }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  record.status === 'Completado'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                ]"
              >
                {{ record.status }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
            >
              {{ formatDate(record.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <UButton
                @click="viewDetails(record)"
                variant="ghost"
                color="cyan"
                size="sm"
              >
                <UIcon name="i-heroicons-eye" class="w-4 h-4 mr-1" />
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Mostrando {{ startIndex + 1 }} a {{ endIndex }} de
        {{ filteredHistory.length }} registros
      </div>
      <div class="flex space-x-2">
        <UButton
          @click="currentPage--"
          :disabled="currentPage === 1"
          variant="outline"
          size="sm"
        >
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
        </UButton>
        <span
          class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
        >
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <UButton
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          variant="outline"
          size="sm"
        >
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
        </UButton>
      </div>
    </div>

    <!-- Modal de detalles usando componente separado -->
    <PasswordResetHistoryDetails
      v-model="showDetailsModal"
      :record-id="selectedRecordId"
      @close="closeDetailsModal"
    />
  </UCard>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { generateClient } from "aws-amplify/api";
import { Line, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

// Cliente de Amplify
const client = generateClient();

// Estado reactivo
const history = ref([]);
const isLoading = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;
const showDetailsModal = ref(false);
const selectedRecordId = ref(null);

// Datos para la gráfica
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Reinicios de Contraseñas",
      data: [],
      backgroundColor: "rgba(6, 182, 212, 0.1)", // cyan-500 con transparencia para relleno
      borderColor: "rgba(6, 182, 212, 1)", // cyan-500 sólido para la línea
      borderWidth: 3,
      fill: true, // Rellena el área bajo la línea
      tension: 0.1, // Suaviza la línea
      pointBackgroundColor: "rgba(6, 182, 212, 1)",
      pointBorderColor: "rgba(6, 182, 212, 1)",
    },
    {
      label: "Desbloqueos de Usuarios",
      data: [],
      backgroundColor: "rgba(34, 197, 94, 0.1)", // green-500 con transparencia para relleno
      borderColor: "rgba(34, 197, 94, 1)", // green-500 sólido para la línea
      borderWidth: 3,
      fill: true, // Rellena el área bajo la línea
      tension: 0.1, // Suaviza la línea
      pointBackgroundColor: "rgba(34, 197, 94, 1)",
      pointBorderColor: "rgba(34, 197, 94, 1)",
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.1, // Suaviza las líneas
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
});

// Datos para la gráfica de pie (Tasa de Éxito vs Errores)
const successRateData = ref({
  labels: ["Completado", "Error"],
  datasets: [
    {
      data: [0, 0],
      backgroundColor: [
        "rgba(6, 182, 212, 0.8)", // Cyan oscuro para completado
        "rgba(239, 68, 68, 0.8)", // Rojo para error
      ],
      borderColor: ["rgba(6, 182, 212, 1)", "rgba(239, 68, 68, 1)"],
      borderWidth: 2,
    },
  ],
});

const successRateOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
});

// Filtros
const filters = ref({
  sapUser: "",
  emailOwner: "",
  date: "",
});

// Computed properties
const hasFilters = computed(() => {
  return (
    filters.value.sapUser || filters.value.emailOwner || filters.value.date
  );
});

// Aplicar filtros adicionales en el frontend como respaldo
const filteredHistory = computed(() => {
  let filtered = [...history.value];

  // Filtros adicionales en frontend (por si los de DB no funcionan completamente)
  if (filters.value.sapUser) {
    filtered = filtered.filter(
      (record) =>
        record.sapUser &&
        record.sapUser
          .toLowerCase()
          .includes(filters.value.sapUser.toLowerCase())
    );
  }

  if (filters.value.emailOwner) {
    filtered = filtered.filter(
      (record) =>
        record.emailOwner &&
        record.emailOwner
          .toLowerCase()
          .includes(filters.value.emailOwner.toLowerCase())
    );
  }

  if (filters.value.date) {
    filtered = filtered.filter((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      return recordDate === filters.value.date;
    });
  }

  // Ordenar por fecha descendente (más recientes primero)
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / itemsPerPage);
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage;
});

const endIndex = computed(() => {
  return Math.min(
    startIndex.value + itemsPerPage,
    filteredHistory.value.length
  );
});

const paginatedHistory = computed(() => {
  return filteredHistory.value.slice(startIndex.value, endIndex.value);
});

// Métodos
const loadHistory = async () => {
  isLoading.value = true;
  try {
    console.log("📋 Cargando historial de reinicios con filtros...");

    // Solo aplicar filtro de fecha en la base de datos (el que sabemos que funciona)
    const queryConfig = {
      limit: 5000, // Aumentar límite para obtener más datos históricos
    };

    // Solo filtrar por fecha en la DB si está presente
    if (filters.value.date) {
      queryConfig.filter = {
        date: {
          beginsWith: filters.value.date,
        },
      };
      console.log("🗓️ Aplicando filtro de fecha en DB:", filters.value.date);
    }

    console.log("🔍 Filtros aplicados:", queryConfig);

    const { errors, data: historyData } =
      await client.models.SapUserActionHistory.list(queryConfig);

    if (errors) {
      console.error("❌ Error al cargar historial:", errors);
      throw new Error("Error al cargar el historial");
    }

    history.value = historyData || [];
    console.log(`✅ Historial cargado: ${history.value.length} registros`);
    console.log("📊 Filtros activos:", {
      sapUser: filters.value.sapUser,
      emailOwner: filters.value.emailOwner,
      date: filters.value.date,
    });

    // Log de fechas para debug
    if (history.value.length > 0) {
      const dates = history.value
        .map((record) => record.date)
        .filter((date) => date)
        .sort();

      console.log("📅 Rango de fechas en los datos:", {
        fecha_mas_antigua: dates[0],
        fecha_mas_reciente: dates[dates.length - 1],
        total_fechas_unicas: new Set(dates).size,
        muestra_fechas: dates.slice(0, 5).concat(dates.slice(-5)),
      });
    }

    // Procesar datos para la gráfica
    processDailyData();
    processSuccessRateData();

    // Log de muestra de datos para debugging
    if (history.value.length > 0) {
      console.log("📋 Muestra de datos cargados:", {
        primer_registro: {
          sapUser: history.value[0].sapUser,
          emailOwner: history.value[0].emailOwner,
          date: history.value[0].date,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error crítico al cargar historial:", error);
    const toast = useToast();
    toast.add({
      title: "Error al cargar historial",
      description: "No se pudo cargar el historial de reinicios",
      color: "red",
      timeout: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

const refreshHistory = () => {
  loadHistory();
};

const applyFilters = () => {
  currentPage.value = 1; // Resetear a la primera página al filtrar
  loadHistory(); // Recargar datos con los nuevos filtros
};

const viewDetails = (record) => {
  selectedRecordId.value = record.id;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedRecordId.value = null;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatEmailOwner = (email) => {
  // Limpiar prefijos como "microsoftentraidsaml_"
  return email.replace(/^[^_]*_/, "");
};

const formatActionType = (accion) => {
  const actionMap = {
    RESET_PASSWORD: "Reinicio",
    UNLOCK_USER: "Desbloqueo",
  };
  return actionMap[accion] || accion;
};

// Función para procesar datos diarios para la gráfica
const processDailyData = () => {
  const resetPasswordCounts = {};
  const unlockUserCounts = {};

  // Procesar reinicios de contraseña completados
  history.value
    .filter(
      (record) =>
        record.accion === "RESET_PASSWORD" &&
        record.status === "Completado" &&
        record.date
    )
    .forEach((record) => {
      const date = new Date(record.date).toISOString().split("T")[0]; // YYYY-MM-DD
      resetPasswordCounts[date] = (resetPasswordCounts[date] || 0) + 1;
    });

  // Procesar desbloqueos de usuarios completados
  history.value
    .filter(
      (record) =>
        record.accion === "UNLOCK_USER" &&
        record.status === "Completado" &&
        record.date
    )
    .forEach((record) => {
      const date = new Date(record.date).toISOString().split("T")[0]; // YYYY-MM-DD
      unlockUserCounts[date] = (unlockUserCounts[date] || 0) + 1;
    });

  // Obtener todas las fechas únicas
  const allDates = new Set([
    ...Object.keys(resetPasswordCounts),
    ...Object.keys(unlockUserCounts),
  ]);
  const sortedDates = Array.from(allDates).sort();

  // Preparar labels y datos
  const labels = sortedDates.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  });

  const resetPasswordData = sortedDates.map(
    (date) => resetPasswordCounts[date] || 0
  );
  const unlockUserData = sortedDates.map((date) => unlockUserCounts[date] || 0);

  // Actualizar datos de la gráfica
  chartData.value = {
    labels,
    datasets: [
      {
        label: "Reinicios de Contraseñas",
        data: resetPasswordData,
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: "rgba(6, 182, 212, 1)",
        pointBorderColor: "rgba(6, 182, 212, 1)",
      },
      {
        label: "Desbloqueos de Usuarios",
        data: unlockUserData,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
        pointBorderColor: "rgba(34, 197, 94, 1)",
      },
    ],
  };

  console.log("📊 Datos de gráfica procesados:", {
    fechas: sortedDates,
    reinicios: resetPasswordData,
    desbloqueos: unlockUserData,
    total_dias: labels.length,
    rango_fechas: {
      primera: sortedDates[0] || "N/A",
      ultima: sortedDates[sortedDates.length - 1] || "N/A",
    },
  });
};

// Función para procesar datos de éxito vs errores
const processSuccessRateData = () => {
  const completedCount = history.value.filter(
    (record) => record.status === "Completado"
  ).length;

  const errorCount = history.value.filter(
    (record) => record.status === "Error"
  ).length;

  // Actualizar datos de la gráfica de pie
  successRateData.value = {
    labels: ["Completado", "Error"],
    datasets: [
      {
        data: [completedCount, errorCount],
        backgroundColor: [
          "rgba(6, 182, 212, 0.8)", // Cyan oscuro para completado
          "rgba(239, 68, 68, 0.8)", // Rojo para error
        ],
        borderColor: ["rgba(6, 182, 212, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 2,
      },
    ],
  };

  const total = completedCount + errorCount;
  const successRate =
    total > 0 ? ((completedCount / total) * 100).toFixed(1) : 0;

  console.log("📊 Tasa de éxito procesada:", {
    completados: completedCount,
    errores: errorCount,
    total: total,
    tasa_exito: `${successRate}%`,
  });
};

// Lifecycle
onMounted(async () => {
  loadHistory();
});
</script>

<style scoped>
/* Estilos para la tabla responsiva */
@media (max-width: 768px) {
  table {
    font-size: 0.875rem;
  }

  th,
  td {
    padding: 0.5rem 0.75rem;
  }
}

/* Animación para las filas de la tabla */
tbody tr {
  transition: background-color 0.2s ease-in-out;
}

/* Estilos para el modal */
.modal-content {
  max-height: 80vh;
  overflow-y: auto;
}

/* Estilos para los filtros */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
</style>
