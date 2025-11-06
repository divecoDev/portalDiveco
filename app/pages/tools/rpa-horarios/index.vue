<template>
  <div class="0">
    <!-- Header de la página integrado -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon
                name="i-heroicons-clock"
                class="w-7 h-7 text-white"
              />
            </div>
            Horarios RPA
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Gestión de ventanas de ejecución de RPA y períodos de bloqueo
          </p>
        </div>

        <!-- Botón para crear nueva ventana -->
        <NuxtLink to="/tools/rpa-horarios/new">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            Nueva Ventana
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros y búsqueda compactos -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Búsqueda -->
          <div class="flex-1">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar por nombre..."
              size="md"
              class="w-full"
            />
          </div>

          <!-- Filtro por estado -->
          <div class="sm:w-48">
            <select
              v-model="selectedStatus"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">
            Cargando ventanas de ejecución...
          </p>
        </div>
      </div>

      <!-- Lista de ventanas -->
      <div v-else-if="filteredWindows.length > 0" class="space-y-3">
        <div
          v-for="window in filteredWindows"
          :key="window.id"
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 hover:shadow-xl hover:border-cyan-300/40 dark:hover:border-cyan-600/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div class="p-5">
            <!-- Header del card -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-clock"
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <h3
                    class="text-xl font-bold text-cyan-600 dark:text-cyan-400"
                  >
                    {{ window.name }}
                  </h3>
                  <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span class="flex items-center">
                      <UIcon name="i-heroicons-clock" class="w-3 h-3 mr-1" />
                      {{ window.startTime }} - {{ window.endTime }}
                    </span>
                    <span class="flex items-center">
                      <UIcon name="i-heroicons-globe-alt" class="w-3 h-3 mr-1" />
                      {{ window.timezone }}
                    </span>
                    <span
                      class="flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                      :class="window.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                    >
                      {{ window.isActive ? "Activo" : "Inactivo" }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="flex items-center space-x-2">
                <NuxtLink :to="`/tools/rpa-horarios/edit/${window.id}`">
                  <UButton
                    icon="i-heroicons-pencil"
                    size="sm"
                    color="cyan"
                    variant="ghost"
                    class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                  />
                </NuxtLink>
                <UButton
                  icon="i-heroicons-trash"
                  size="sm"
                  color="red"
                  variant="ghost"
                  class="hover:bg-red-50 dark:hover:bg-red-900/20"
                  @click="confirmDelete(window)"
                />
              </div>
            </div>

            <!-- Descripción -->
            <p
              v-if="window.description"
              class="text-sm text-gray-600 dark:text-gray-300 mb-3"
            >
              {{ window.description }}
            </p>

            <!-- Días de la semana -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="day in window.daysOfWeek"
                :key="day"
                class="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-md text-xs font-medium"
              >
                {{ getDayName(day) }}
              </span>
            </div>

            <!-- Metadata -->
            <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-1.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                <span>{{ formatDate(window.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-clock"
            class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No hay ventanas configuradas
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {{ searchQuery || selectedStatus ? 'No se encontraron resultados para tu búsqueda.' : 'Comienza creando tu primera ventana de ejecución de RPA.' }}
        </p>
        <NuxtLink to="/tools/rpa-horarios/new">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            Nueva Ventana
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <Teleport to="body">
      <UModal v-model:open="showDeleteModal">
        <template #header>
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-t-lg" style="margin: -1.5rem -1.5rem -1.5rem; width: calc(100% + 3rem);">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-exclamation-triangle"
                  class="w-5 h-5 text-white"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">
                  Confirmar Eliminación
                </h3>
                <p class="text-sm text-cyan-100">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
          </div>
        </template>

        <template #body>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar la ventana
              <span class="font-semibold text-gray-900 dark:text-white">{{ windowToDelete?.name }}</span>?
            </p>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-center space-x-3">
            <button
              type="button"
              @click="closeDeleteModal"
              :disabled="deleting"
              class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:from-gray-600 disabled:hover:to-gray-700 disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="deleteWindow"
              :disabled="deleting"
              class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              <div
                v-if="deleting"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              <UIcon v-else name="i-heroicons-trash" class="w-4 h-4" />
              {{ deleting ? "Eliminando..." : "Eliminar" }}
            </button>
          </div>
        </template>
      </UModal>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { generateClient } from "aws-amplify/data";
import { useAudit } from "~/composables/useAudit";

// Definir el layout y middleware
definePageMeta({
  layout: "default",
  middleware: ["require-role"],
  requiredRole: ["ADMINISTRAR-RPA-HORARIOS", "ADMIN"],
});

// Cliente de Amplify
const client = generateClient();

// Meta tags para SEO
useSeoMeta({
  title: "Horarios RPA - Portal Diveco",
  description: "Gestión de ventanas de ejecución de RPA y períodos de bloqueo",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/" },
  { title: "Horarios RPA" },
]);

const toast = useToast();
const { logDelete } = useAudit();

// Estado reactivo
const loading = ref(false);
const windows = ref([]);
const searchQuery = ref("");
const selectedStatus = ref("");
const showDeleteModal = ref(false);
const windowToDelete = ref(null);
const deleting = ref(false);

// Mapeo de días de la semana
const dayNames = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

// Computed
const filteredWindows = computed(() => {
  let filtered = windows.value;

  // Filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((window) =>
      window.name?.toLowerCase().includes(query) ||
      window.description?.toLowerCase().includes(query)
    );
  }

  // Filtro por estado
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === "active";
    filtered = filtered.filter((window) => window.isActive === isActive);
  }

  return filtered;
});

// Métodos
const getDayName = (day) => {
  return dayNames[day] || day;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fetchWindows = async () => {
  loading.value = true;
  try {
    const { data, errors } = await client.models.RpaExecutionWindow.list();

    if (errors) {
      console.error("Error fetching windows:", errors);
      toast.add({
        title: "Error",
        description: "No se pudieron cargar las ventanas de ejecución",
        color: "red",
      });
      return;
    }

    // Ordenar por hora de inicio (ascendente)
    windows.value = (data || []).sort((a, b) => {
      // Convertir hora de inicio a minutos para comparar
      const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };
      
      const minutesA = timeToMinutes(a.startTime || "00:00");
      const minutesB = timeToMinutes(b.startTime || "00:00");
      
      // Si tienen la misma hora, ordenar por nombre
      if (minutesA === minutesB) {
        return (a.name || "").localeCompare(b.name || "");
      }
      
      return minutesA - minutesB;
    });
  } catch (error) {
    console.error("Error fetching windows:", error);
    toast.add({
      title: "Error",
      description: "No se pudieron cargar las ventanas de ejecución",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (window) => {
  windowToDelete.value = window;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  windowToDelete.value = null;
};

const deleteWindow = async () => {
  if (!windowToDelete.value) return;

  deleting.value = true;

  try {
    await client.models.RpaExecutionWindow.delete({
      id: windowToDelete.value.id,
    });

    // Log de auditoría
    await logDelete({
      module: "rpa-horarios",
      entityType: "RpaExecutionWindow",
      entityId: windowToDelete.value.id,
      changes: {
        before: windowToDelete.value,
        after: null,
      },
    });

    toast.add({
      title: "Éxito",
      description: "Ventana eliminada correctamente",
      color: "green",
    });

    // Recargar lista
    await fetchWindows();
    closeDeleteModal();
  } catch (error) {
    console.error("Error deleting window:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar la ventana",
      color: "red",
    });
  } finally {
    deleting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchWindows();
});
</script>

