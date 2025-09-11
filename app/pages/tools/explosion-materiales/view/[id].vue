<template>
  <div class="">
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
              <UIcon name="i-heroicons-eye" class="w-7 h-7 text-white" />
            </div>
            Detalles de Explosión
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Información detallada de la explosión de materiales
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center space-x-3">
          <NuxtLink :to="`/tools/explosion-materiales/edit/${explosionId}`">
            <UButton
              icon="i-heroicons-pencil"
              size="lg"
              color="blue"
              variant="outline"
              class="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
            >
              Editar
            </UButton>
          </NuxtLink>

          <NuxtLink to="/tools/explosion-materiales">
            <UButton
              icon="i-heroicons-arrow-left"
              size="lg"
              color="gray"
              variant="outline"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
            >
              Volver al Listado
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Estado de carga inicial -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div
          class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-300">
          Cargando datos de la explosión...
        </p>
      </div>
    </div>

    <!-- Error si no se encuentra la explosión -->
    <div v-else-if="!explosion" class="text-center py-16">
      <div
        class="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
      >
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-16 h-16 text-red-600 dark:text-red-400"
        />
      </div>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Explosión no encontrada
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        No se pudo encontrar la explosión de materiales solicitada
      </p>
      <NuxtLink to="/tools/explosion-materiales">
        <UButton icon="i-heroicons-arrow-left" color="cyan" variant="solid">
          Volver al Listado
        </UButton>
      </NuxtLink>
    </div>

    <!-- Contenido principal -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Card principal con información de la explosión -->
      <div
        class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden"
      >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-hashtag"
                class="w-6 h-6 text-white mr-3"
              />
              <div>
                <h2 class="text-2xl font-bold text-white">
                  Versión {{ explosion.version }}
                </h2>
                <p class="text-cyan-100 text-sm">
                  {{ explosion.descripcion }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <UBadge
                :color="getStatusConfig(explosion.status).color"
                variant="solid"
                size="md"
                class="px-3 py-1 flex items-center gap-1.5"
              >
                <UIcon
                  :name="getStatusConfig(explosion.status).icon"
                  class="w-4 h-4"
                />
                {{ getStatusConfig(explosion.status).label }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Información detallada -->
        <div class="p-4">
          <!-- Grid compacto con información adicional -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Usuario -->
            <div
              class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-center"
            >
              <UIcon
                name="i-heroicons-user"
                class="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1"
              />
              <div
                class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >
                Usuario
              </div>
              <div
                class="text-sm font-semibold text-gray-900 dark:text-white truncate"
              >
                {{ explosion.username || "No especificado" }}
              </div>
            </div>

            <!-- Fecha de creación -->
            <div
              class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-center"
            >
              <UIcon
                name="i-heroicons-calendar"
                class="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1"
              />
              <div
                class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >
                Creado
              </div>
              <div class="text-xs font-semibold text-gray-900 dark:text-white">
                {{ formatDateCompact(explosion.createdAt) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatRelativeDate(explosion.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Descripción completa -->
          <div class="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
            <div class="flex items-center mb-2">
              <UIcon
                name="i-heroicons-document-text"
                class="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2"
              />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >Descripción</span
              >
            </div>
            <p class="text-gray-900 dark:text-white font-medium">
              {{ explosion.descripcion }}
            </p>
          </div>

          <!-- Acciones disponibles -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >Acciones:</span
              >

              <div class="flex items-center space-x-2">
                <NuxtLink
                  :to="`/tools/explosion-materiales/edit/${explosion.id}`"
                >
                  <UButton
                    icon="i-heroicons-pencil"
                    color="blue"
                    variant="outline"
                    size="sm"
                  >
                    Editar
                  </UButton>
                </NuxtLink>

                <UButton
                  icon="i-heroicons-trash"
                  color="red"
                  variant="outline"
                  size="sm"
                  @click="deleteExplosion"
                >
                  Eliminar
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

// Cliente de Amplify
const client = generateClient();

// Obtener ID de la ruta
const route = useRoute();
const explosionId = route.params.id;

// Meta tags para SEO
useSeoMeta({
  title: "Ver Explosión de Materiales - Portal Diveco",
  description: "Visualizar detalles de explosión de materiales",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Ver Detalles" },
]);

// Estado reactivo
const loading = ref(true);
const explosion = ref(null);

// Métodos
const fetchExplosion = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.Boom.get({ id: explosionId });
    explosion.value = data;
  } catch (error) {
    console.error("Error al cargar explosión:", error);
    explosion.value = null;
  } finally {
    loading.value = false;
  }
};

const deleteExplosion = async () => {
  if (
    confirm(
      "¿Estás seguro de que deseas eliminar esta explosión de materiales? Esta acción no se puede deshacer."
    )
  ) {
    try {
      await client.models.Boom.delete({ id: explosionId });

      useToast().add({
        title: "Explosión eliminada",
        description: "La explosión de materiales se ha eliminado correctamente",
        color: "green",
      });

      // Redirigir al listado
      await navigateTo("/tools/explosion-materiales");
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

const getStatusConfig = (status) => {
  const statusConfig = {
    ACTIVO: {
      color: "green",
      label: "Activo",
      icon: "i-heroicons-check-circle",
    },
    INACTIVO: {
      color: "red",
      label: "Inactivo",
      icon: "i-heroicons-x-circle",
    },
    EN_PROCESO: {
      color: "orange",
      label: "En Proceso",
      icon: "i-heroicons-clock",
    },
    COMPLETADO: {
      color: "blue",
      label: "Completado",
      icon: "i-heroicons-check-badge",
    },
  };
  return (
    statusConfig[status] || {
      color: "gray",
      label: status || "Sin estado",
      icon: "i-heroicons-question-mark-circle",
    }
  );
};

const formatDate = (date) => {
  if (!date) return "No disponible";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateCompact = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatRelativeDate = (date) => {
  if (!date) return "";

  const now = new Date();
  const targetDate = new Date(date);
  const diffInHours = Math.abs(now - targetDate) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return "Hace menos de una hora";
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  } else if (diffInHours < 168) {
    // 7 días
    const days = Math.floor(diffInHours / 24);
    return `Hace ${days} día${days > 1 ? "s" : ""}`;
  } else {
    const weeks = Math.floor(diffInHours / 168);
    return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchExplosion();
});
</script>
