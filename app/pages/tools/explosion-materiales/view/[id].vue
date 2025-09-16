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
            {{ explosion?.version || "" }}
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            {{ explosion?.descripcion || "" }}
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

    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
    >
      <UStepper :items="stepperItems" color="neutral" class="w-full">
        <template #carga-de-insumos>
          <div
            class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <BoomProcess :explosion="explosion" />
          </div>
        </template>
      </UStepper>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
// Cliente de Amplify
const client = generateClient();

const stepperItems = ref([
  {
    slot: "carga-de-insumos",
    title: "Carga de insumos",
    icon: "i-heroicons-circle-stack",
  },
  {
    slot: "generar-plan-de-produccion",
    title: "Generar plan de producción",
    icon: "i-heroicons-beaker",
  },
  {
    slot: "validacion-de-aprovisionamiento",
    title: "Validacion de Aprovisionamiento",
    icon: "i-heroicons-shield-check",
  },
  {
    slot: "explocionar",
    title: "Explocionar",
    icon: "i-heroicons-bolt",
  },
]);

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
      "¿Estás seguro de que deseas eliminar esta explosión de materiales? Esta acción no se puede deshacer.",
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
