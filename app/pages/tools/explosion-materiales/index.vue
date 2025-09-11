<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-cyan-950"
  >
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
                name="i-heroicons-squares-2x2"
                class="w-7 h-7 text-white"
              />
            </div>
            Explosión de Materiales
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Gestión de explosión de materiales
          </p>
        </div>

        <!-- Botón para crear nueva explosión -->
        <NuxtLink to="/tools/explosion-materiales/new">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            Nueva Explosión
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros y búsqueda compactos -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Búsqueda -->
          <div class="flex-1">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar por versión o descripción..."
              size="md"
              class="w-full"
            />
          </div>

          <!-- Filtro por estado -->
          <div class="sm:w-48">
            <USelect
              v-model="selectedStatus"
              :options="statusOptions"
              placeholder="Filtrar por estado"
              size="md"
            />
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
            Cargando explosiones de materiales...
          </p>
        </div>
      </div>

      <!-- Lista de explosiones -->
      <div v-else-if="filteredExplosions.length > 0" class="space-y-3">
        <div
          v-for="explosion in filteredExplosions"
          :key="explosion.id"
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 hover:shadow-xl hover:border-cyan-300/40 dark:hover:border-cyan-600/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div class="p-5">
            <div class="flex items-start justify-between">
              <div class="flex-1 flex flex-col justify-center">
                <!-- Título: Versión (Principal) -->
                <div class="flex items-center space-x-3 mb-3">
                  <h3
                    class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center"
                  >
                    <UIcon name="i-heroicons-hashtag" class="w-6 h-6 mr-2" />
                    {{ explosion.version }}
                  </h3>
                  <UBadge
                    :color="getStatusColor(explosion.status)"
                    variant="subtle"
                    size="sm"
                  >
                    {{ explosion.status }}
                  </UBadge>
                </div>

                <!-- Descripción con Fecha -->
                <div class="flex items-center space-x-4">
                  <p class="text-lg text-gray-700 dark:text-gray-300">
                    {{ explosion.descripcion }}
                  </p>
                  <div
                    class="flex items-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
                    <span>{{ formatDate(explosion.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex items-center space-x-1 ml-4">
                <UButton
                  icon="i-heroicons-eye"
                  size="sm"
                  color="cyan"
                  variant="ghost"
                  @click="viewExplosion(explosion)"
                  class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                />
                <UButton
                  icon="i-heroicons-pencil"
                  size="sm"
                  color="blue"
                  variant="ghost"
                  @click="editExplosion(explosion)"
                  class="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                />
                <UButton
                  icon="i-heroicons-trash"
                  size="sm"
                  color="red"
                  variant="ghost"
                  @click="deleteExplosion(explosion)"
                  class="hover:bg-red-50 dark:hover:bg-red-900/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío mejorado -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-squares-2x2"
            class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {{
            searchQuery || selectedStatus
              ? "No se encontraron resultados"
              : "No hay explosiones de materiales"
          }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {{
            searchQuery || selectedStatus
              ? "Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas"
              : "Crea tu primera explosión de materiales para comenzar a gestionar tu inventario"
          }}
        </p>
        <NuxtLink to="/tools/explosion-materiales/new">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            Nueva Explosión
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

// Cliente de Amplify
const client = generateClient();

// Meta tags para SEO
useSeoMeta({
  title: "Explosión de Materiales - Portal Diveco",
  description: "Gestiona explosiones de materiales.",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales" },
]);

// Estado reactivo
const explosions = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedStatus = ref("");

// Opciones para filtros
const statusOptions = [
  { label: "Todos", value: "" },
  { label: "Activo", value: "ACTIVO" },
  { label: "Inactivo", value: "INACTIVO" },
  { label: "En Proceso", value: "EN_PROCESO" },
  { label: "Completado", value: "COMPLETADO" },
];

// Computed para filtrar explosiones
const filteredExplosions = computed(() => {
  let filtered = explosions.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (explosion) =>
        explosion.version?.toLowerCase().includes(query) ||
        explosion.descripcion?.toLowerCase().includes(query)
    );
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(
      (explosion) => explosion.status === selectedStatus.value
    );
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Métodos
const fetchExplosions = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.Boom.list();
    explosions.value = data || [];
  } catch (error) {
    console.error("Error al cargar explosiones:", error);
    explosions.value = [];
  } finally {
    loading.value = false;
  }
};

const viewExplosion = (explosion) => {
  // TODO: Implementar vista detallada
  console.log("Ver explosión:", explosion);
};

const editExplosion = (explosion) => {
  // TODO: Implementar edición
  console.log("Editar explosión:", explosion);
};

const deleteExplosion = async (explosion) => {
  if (
    confirm(
      "¿Estás seguro de que deseas eliminar esta explosión de materiales?"
    )
  ) {
    try {
      await client.models.Boom.delete({ id: explosion.id });
      await fetchExplosions();

      useToast().add({
        title: "Explosión eliminada",
        description: "La explosión de materiales se ha eliminado correctamente",
        color: "green",
      });
    } catch (error) {
      console.error("Error al eliminar explosión:", error);
      useToast().add({
        title: "Error",
        description: "No se pudo eliminar la explosión de materiales",
        color: "red",
      });
    }
  }
};

const getStatusColor = (status) => {
  const colors = {
    ACTIVO: "green",
    INACTIVO: "red",
    EN_PROCESO: "yellow",
    COMPLETADO: "blue",
  };
  return colors[status] || "gray";
};

const formatDate = (date) => {
  if (!date) return "No disponible";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchExplosions();
});
</script>
