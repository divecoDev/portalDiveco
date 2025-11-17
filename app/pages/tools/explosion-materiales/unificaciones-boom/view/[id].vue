<template>
  <div class="min-h-screen">
    <!-- Header de la página -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h1
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon
                name="i-heroicons-document-magnifying-glass"
                class="w-7 h-7 text-white"
              />
            </div>
            Detalle de Unificación
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Información completa de la unificación de BOOMs
          </p>
        </div>

        <!-- Botón volver -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/tools/explosion-materiales/unificaciones-boom">
            <UButton
              icon="i-heroicons-arrow-left"
              color="gray"
              variant="outline"
              size="md"
            >
              Volver
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">
            Cargando unificación...
          </p>
        </div>
      </div>

      <!-- Detalle de la unificación -->
      <div v-else-if="unification" class="space-y-6">
        <!-- Card principal con información general -->
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20"
        >
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
            <h2 class="text-2xl font-bold text-white flex items-center">
              <UIcon name="i-heroicons-squares-plus" class="w-6 h-6 mr-3" />
              {{ unification.descripcion }}
            </h2>
          </div>

          <div class="p-6">
            <!-- Grid de información -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Usuario -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Creado por
                </div>
                <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <UIcon name="i-heroicons-user" class="w-4 h-4 mr-1" />
                  {{ unification.username }}
                </div>
              </div>

              <!-- Fecha de creación -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fecha de creación
                </div>
                <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
                  {{ formatDate(unification.createdAt) }}
                </div>
              </div>

              <!-- Estado -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Estado
                </div>
                <UBadge
                  color="cyan"
                  variant="soft"
                  size="sm"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-check-badge" class="w-3 h-3" />
                  </template>
                  {{ unification.status }}
                </UBadge>
              </div>

              <!-- Total BOOMs -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  BOOMs incluidos
                </div>
                <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {{ unification.boomsIncluidos?.length || 0 }}
                </div>
              </div>
            </div>

            <!-- Información adicional si existe -->
            <div v-if="unification.aditionalData" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Información Adicional
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="unification.aditionalData.versions">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Versiones incluidas
                  </div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    {{ unification.aditionalData.versions }}
                  </div>
                </div>
                <div v-if="unification.aditionalData.createdBy">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Creado por
                  </div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    {{ unification.aditionalData.createdBy }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de BOOMs incluidos -->
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20"
        >
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center">
              <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 mr-3" />
              BOOMs Incluidos ({{ unification.boomsIncluidos?.length || 0 }})
            </h2>
          </div>

          <div class="p-6">
            <div v-if="unification.boomsIncluidos && unification.boomsIncluidos.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead class="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">#</th>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">Versión</th>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">Descripción</th>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">Fecha de creación</th>
                    <th scope="col" class="px-4 py-3 text-right font-semibold tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr
                    v-for="(boom, index) in unification.boomsIncluidos"
                    :key="boom.id"
                    class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                  >
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                      {{ index + 1 }}
                    </td>
                    <td class="px-4 py-3 text-cyan-600 dark:text-cyan-400 font-semibold flex items-center">
                      <UIcon name="i-heroicons-hashtag" class="w-4 h-4 mr-1" />
                      {{ boom.version }}
                    </td>
                    <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {{ boom.descripcion }}
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                      {{ formatDate(boom.createdAt) }}
                    </td>
                    <td class="px-4 py-3 text-right">
                      <NuxtLink :to="`/tools/explosion-materiales/view/${boom.id}`">
                        <UButton
                          icon="i-heroicons-arrow-top-right-on-square"
                          size="xs"
                          color="cyan"
                          variant="ghost"
                          class="transition-transform hover:scale-[1.02]"
                        >
                          Ver BOOM
                        </UButton>
                      </NuxtLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Estado vacío -->
            <div v-else class="text-center py-8">
              <p class="text-gray-600 dark:text-gray-400">
                No hay BOOMs incluidos en esta unificación
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-16 h-16 text-red-600 dark:text-red-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Unificación no encontrada
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          La unificación solicitada no existe o no tienes permisos para verla
        </p>
        <NuxtLink to="/tools/explosion-materiales/unificaciones-boom">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
            Volver al listado
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: ["EXPLOSION", "ADMIN"],
});

// Route params
const route = useRoute();
const unificationId = route.params.id;

// Cliente de Amplify
const client = generateClient();

// Composables
const toast = useToast();
const { logAction } = useAudit();

// Meta tags para SEO
useSeoMeta({
  title: "Detalle de Unificación - Portal Diveco",
  description: "Información detallada de la unificación de explosiones",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Unificaciones", href: "/tools/explosion-materiales/unificaciones-boom" },
  { title: "Detalle" },
]);

// Estado reactivo
const unification = ref(null);
const loading = ref(false);

// Métodos
const fetchUnification = async () => {
  try {
    loading.value = true;

    const { data, errors } = await client.models.BoomUnificacion.get({
      id: unificationId,
      selectionSet: [
        'id',
        'descripcion',
        'username',
        'status',
        'boomsIncluidos',
        'createdAt',
        'updatedAt',
        'aditionalData'
      ]
    });

    if (errors || !data) {
      console.error("Error fetching unification:", errors);
      toast.add({
        title: "Error",
        description: "No se pudo cargar la unificación",
        color: "red",
      });
      return;
    }

    // Parsear JSON
    unification.value = {
      ...data,
      boomsIncluidos: typeof data.boomsIncluidos === 'string'
        ? JSON.parse(data.boomsIncluidos)
        : data.boomsIncluidos,
      aditionalData: data.aditionalData && typeof data.aditionalData === 'string'
        ? JSON.parse(data.aditionalData)
        : data.aditionalData
    };

    // Registrar auditoría
    await logAction(
      "READ",
      "boom-unificacion",
      "BoomUnificacion",
      unificationId,
      {
        after: {
          descripcion: unification.value.descripcion,
        },
      },
      { context: "detalle-unificacion" }
    );

  } catch (error) {
    console.error("Error loading unification:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al cargar la unificación",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
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
  fetchUnification();
});
</script>

