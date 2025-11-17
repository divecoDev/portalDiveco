<template>
  <div class="min-h-screen">
    <!-- Header de la página -->
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
                name="i-heroicons-squares-plus"
                class="w-7 h-7 text-white"
              />
            </div>
            Unificaciones de BOOMs
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Gestión de unificaciones de explosiones de materiales
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center space-x-3">
          <NuxtLink to="/tools/explosion-materiales">
            <UButton
              icon="i-heroicons-arrow-left"
              color="gray"
              variant="outline"
              size="md"
            >
              Volver
            </UButton>
          </NuxtLink>

          <NuxtLink to="/tools/explosion-materiales/unificaciones-boom/new">
            <button
              type="button"
              class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              Nueva Unificación
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros y búsqueda -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Búsqueda -->
          <div class="flex-1">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar por descripción..."
              size="md"
              class="w-full"
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
            Cargando unificaciones...
          </p>
        </div>
      </div>

      <!-- Lista de unificaciones -->
      <div v-else-if="filteredUnifications.length > 0" class="space-y-6">
        <div
          v-for="unification in filteredUnifications"
          :key="unification.id"
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 hover:shadow-xl hover:border-cyan-300/40 dark:hover:border-cyan-600/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div class="p-6">
            <!-- Header de la unificación -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3
                  class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center mb-2"
                >
                  <UIcon
                    name="i-heroicons-squares-plus"
                    class="w-6 h-6 mr-2"
                  />
                  {{ unification.descripcion }}
                </h3>
                <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
                    <span>{{ formatDate(unification.createdAt) }}</span>
                  </div>
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-user" class="w-4 h-4 mr-1" />
                    <span>{{ unification.username }}</span>
                  </div>
                  <UBadge
                    color="cyan"
                    variant="soft"
                    size="sm"
                  >
                    <template #leading>
                      <UIcon name="i-heroicons-check-badge" class="w-3 h-3" />
                    </template>
                    {{ unification.boomsIncluidos?.length || 0 }} BOOMs unificados
                  </UBadge>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex items-center space-x-2">
                <NuxtLink :to="`/tools/explosion-materiales/unificaciones-boom/view/${unification.id}`">
                  <UButton
                    icon="i-heroicons-eye"
                    size="sm"
                    color="cyan"
                    variant="ghost"
                    class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                    title="Ver detalle"
                  >
                    Ver
                  </UButton>
                </NuxtLink>
                <UButton
                  icon="i-heroicons-trash"
                  size="sm"
                  color="red"
                  variant="ghost"
                  class="hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Eliminar unificación"
                  @click="confirmDelete(unification)"
                >
                  Eliminar
                </UButton>
              </div>
            </div>

            <!-- Información adicional -->
            <div
              class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50"
            >
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-2" />
                BOOMs Incluidos en esta Unificación
              </h4>

              <!-- Lista de BOOMs incluidos -->
              <div v-if="unification.boomsIncluidos && unification.boomsIncluidos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  v-for="boom in unification.boomsIncluidos"
                  :key="boom.id"
                  class="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-cyan-200/50 dark:border-cyan-700/50"
                >
                  <div>
                    <div class="text-sm font-bold text-cyan-600 dark:text-cyan-400 flex items-center">
                      <UIcon name="i-heroicons-hashtag" class="w-4 h-4 mr-1" />
                      {{ boom.version }}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {{ boom.descripcion }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensaje si no hay BOOMs -->
              <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
                No hay BOOMs asociados a esta unificación
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
            name="i-heroicons-squares-plus"
            class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No hay unificaciones disponibles
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {{
            searchQuery
              ? "No se encontraron unificaciones que coincidan con tu búsqueda"
              : "Aún no se han creado unificaciones de BOOMs. Crea la primera unificación ahora."
          }}
        </p>
        <NuxtLink to="/tools/explosion-materiales/unificaciones-boom/new">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            Crear Primera Unificación
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación de eliminación -->
  <Teleport to="body">
    <UModal v-model:open="showDeleteModal">
      <template #header>
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-lg" style="margin: -1.5rem -1.5rem -1.5rem; width: calc(100% + 3rem);">
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
              <p class="text-sm text-red-100">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            ¿Estás seguro de que deseas eliminar la unificación
            <span class="font-semibold text-gray-900 dark:text-white">"{{ unificationToDelete?.descripcion }}"</span>?
          </p>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Justificación de eliminación <span class="text-red-500">*</span>
            </label>
            <UTextarea
              v-model="deletionReason"
              placeholder="Ingresa la razón por la cual deseas eliminar esta unificación (mínimo 10 caracteres)"
              :rows="4"
              :error="deletionReasonError"
              class="w-full"
            />
            <p v-if="deletionReasonError" class="mt-2 text-sm text-red-600 dark:text-red-400">
              {{ deletionReasonError }}
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton
            color="gray"
            variant="outline"
            @click="closeDeleteModal"
            :disabled="isDeleting"
          >
            Cancelar
          </UButton>
          <UButton
            color="red"
            @click="deleteUnification"
            :loading="isDeleting"
            :disabled="!isDeletionReasonValid"
          >
            <template v-if="!isDeleting">
              <UIcon name="i-heroicons-trash" class="w-4 h-4 mr-2" />
              Eliminar Unificación
            </template>
            <template v-else>
              Eliminando...
            </template>
          </UButton>
        </div>
      </template>
    </UModal>
  </Teleport>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: ["EXPLOSION", "ADMIN"],
});

// Cliente de Amplify
const client = generateClient();

// Composables
const toast = useToast();
const { logAction } = useAudit();

// Meta tags para SEO
useSeoMeta({
  title: "Unificaciones de BOOMs - Portal Diveco",
  description: "Gestión de unificaciones de explosiones de materiales",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Unificaciones" },
]);

// Estado reactivo
const unifications = ref([]);
const loading = ref(false);
const searchQuery = ref("");

// Estado del modal de eliminación
const showDeleteModal = ref(false);
const unificationToDelete = ref(null);
const deletionReason = ref("");
const deletionReasonError = ref("");
const isDeleting = ref(false);

// Computed properties
const filteredUnifications = computed(() => {
  if (!searchQuery.value) {
    return unifications.value;
  }

  const query = searchQuery.value.toLowerCase();
  return unifications.value.filter((unification) => {
    return unification.descripcion?.toLowerCase().includes(query);
  });
});

// Métodos
const fetchUnifications = async () => {
  try {
    loading.value = true;
    
    // Query con campos específicos
    const { data, errors } = await client.models.BoomUnificacion.list({
      selectionSet: [
        'id',
        'descripcion',
        'username',
        'status',
        'boomsIncluidos',
        'createdAt',
        'aditionalData',
        'deletedAt'
      ],
      filter: {
        // Solo unificaciones no eliminadas
        deletedAt: { 
          attributeExists: false 
        }
      },
      limit: 100
    });
    
    if (errors) {
      console.error("Error fetching unifications:", errors);
      toast.add({
        title: "Error",
        description: "No se pudieron cargar las unificaciones",
        color: "red",
      });
      return;
    }
    
    // Parsear boomsIncluidos de JSON a objetos
    unifications.value = (data || []).map(unif => ({
      ...unif,
      boomsIncluidos: typeof unif.boomsIncluidos === 'string' 
        ? JSON.parse(unif.boomsIncluidos) 
        : unif.boomsIncluidos,
      aditionalData: unif.aditionalData && typeof unif.aditionalData === 'string'
        ? JSON.parse(unif.aditionalData)
        : unif.aditionalData
    }));
    
    // Registrar auditoría
    try {
      await logAction(
        "READ",
        "boom-unificacion",
        "BoomUnificacion",
        undefined,
        {
          after: {
            totalRecords: unifications.value.length,
          },
        },
        { context: "listado-unificaciones" }
      );
    } catch (auditError) {
      console.warn("Error al registrar auditoría:", auditError);
    }
    
  } catch (error) {
    console.error("Error al cargar unificaciones:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al cargar las unificaciones",
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

// Funciones de eliminación
const confirmDelete = (unification) => {
  unificationToDelete.value = unification;
  deletionReason.value = "";
  deletionReasonError.value = "";
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletionReason.value = "";
  deletionReasonError.value = "";
  unificationToDelete.value = null;
};

const isDeletionReasonValid = computed(() => {
  return deletionReason.value.trim().length >= 10;
});

const deleteUnification = async () => {
  if (!unificationToDelete.value) return;

  // Validar justificación
  if (!isDeletionReasonValid.value) {
    deletionReasonError.value = "La justificación debe tener al menos 10 caracteres";
    return;
  }

  try {
    isDeleting.value = true;

    // Obtener usuario actual
    const session = await fetchAuthSession();
    const userEmail = session.tokens?.idToken?.payload?.email || 'unknown';

    // Actualizar unificación con soft delete
    const { data, errors } = await client.models.BoomUnificacion.update({
      id: unificationToDelete.value.id,
      deletedAt: new Date().toISOString(),
      deletedBy: userEmail,
      deletionReason: deletionReason.value.trim(),
    });

    if (errors) {
      console.error("Error deleting unification:", errors);
      toast.add({
        title: "Error",
        description: "No se pudo eliminar la unificación",
        color: "red",
      });
      return;
    }

    // Registrar auditoría
    await logAction(
      "DELETE",
      "boom-unificacion",
      "BoomUnificacion",
      unificationToDelete.value.id,
      {
        before: { 
          descripcion: unificationToDelete.value.descripcion,
          boomsIncluidos: unificationToDelete.value.boomsIncluidos 
        },
        after: { 
          deletedAt: data.deletedAt,
          deletedBy: data.deletedBy,
          deletionReason: data.deletionReason
        }
      }
    );

    toast.add({
      title: "Unificación eliminada",
      description: "La unificación ha sido eliminada correctamente",
      color: "green",
    });

    // Cerrar modal y recargar listado
    closeDeleteModal();
    fetchUnifications();

  } catch (error) {
    console.error("Error deleting unification:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al eliminar la unificación",
      color: "red",
    });
  } finally {
    isDeleting.value = false;
  }
};

// Watch para limpiar error de validación
watch(deletionReason, () => {
  if (deletionReasonError.value && isDeletionReasonValid.value) {
    deletionReasonError.value = "";
  }
});

// Cargar datos al montar el componente
onMounted(() => {
  fetchUnifications();
});
</script>

