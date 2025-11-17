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

        <!-- Botones de acción -->
        <div class="flex items-center space-x-3">
          <!-- Botón para materiales por centro - Solo para ADMIN y EXPLOSION -->
          <NuxtLink v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')" to="/tools/explosion-materiales/materiales-por-centro">
            <UButton
              icon="i-heroicons-building-office-2"
              class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              Materiales por Centro
            </UButton>
          </NuxtLink>

          <!-- Botón para porcentajes de asignación - Solo para ADMIN y EXPLOSION -->
          <NuxtLink v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')" to="/tools/explosion-materiales/porcentajes-asignacion">
            <UButton
              icon="i-heroicons-percent-badge"
              class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              Aprovisionamiento
            </UButton>
          </NuxtLink>

          <!-- Botón para unificar BOOMs - Solo para ADMIN y EXPLOSION -->
          <NuxtLink v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')" to="/tools/explosion-materiales/unificaciones-boom">
            <UButton
              icon="i-heroicons-squares-plus"
              class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              Unificar BOOMs
            </UButton>
          </NuxtLink>

          <!-- Botón para crear nueva explosión - Para ADMIN y EXPLOSION -->
          <NuxtLink v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')" to="/tools/explosion-materiales/new">
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
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 hover:shadow-xl hover:border-cyan-300/40 dark:hover:border-cyan-600/40 transition-all duration-300 hover:-translate-y-1"
        >
          <div class="p-5">
            <div class="flex items-center justify-between">
              <div class="flex-1 flex flex-col justify-center">
                <!-- Título: Versión (Principal) -->
                <div class="flex items-center space-x-3 mb-3">
                  <h3
                    class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center"
                  >
                    <UIcon name="i-heroicons-hashtag" class="w-6 h-6 mr-2" />
                    {{ explosion.version }}
                  </h3>
                  
                  <!-- Badge de estado de documentos -->
                  <UBadge 
                    :class="explosion.enableShowDocuments ? 'bg-cyan-500 text-white' : 'bg-gray-500 text-white'"
                    variant="soft"
                    size="sm"
                  >
                    <template #leading>
                      <UIcon 
                        :name="explosion.enableShowDocuments ? 'i-heroicons-document-check' : 'i-heroicons-document-minus'" 
                        class="w-3 h-3" 
                      />
                    </template>
                    {{ explosion.enableShowDocuments ? 'Docs Habilitados' : 'Docs No Habilitados' }}
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
                <!-- Botón Ver - Para ADMIN y EXPLOSION -->
                <UButton
                  v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')"
                  icon="i-heroicons-eye"
                  size="sm"
                  color="cyan"
                  variant="ghost"
                  @click="viewExplosion(explosion)"
                  class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                />
                
                <!-- Botón Documentos - Solo para REVISAR-EXPLOSION -->
                <UButton
                  v-if="hasGroup('REVISAR-EXPLOSION')"
                  icon="i-heroicons-document-text"
                  size="sm"
                  color="green"
                  variant="ghost"
                  @click="viewDocuments(explosion)"
                  class="hover:bg-green-50 dark:hover:bg-green-900/20"
                  :disabled="!explosion.enableShowDocuments"
                />
                
                <!-- Botón Editar - Para ADMIN y EXPLOSION -->
                <UButton
                  v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')"
                  icon="i-heroicons-pencil"
                  size="sm"
                  color="blue"
                  variant="ghost"
                  @click="editExplosion(explosion)"
                  class="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                />
                
                <!-- Botón Eliminar - Para ADMIN y EXPLOSION -->
                <UButton
                  v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')"
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

      <!-- Sin Explociones -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
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
        <NuxtLink v-if="hasGroup('ADMIN') || hasGroup('EXPLOSION')" to="/tools/explosion-materiales/new">
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
            ¿Estás seguro de que deseas eliminar la explosión
            <span class="font-semibold text-gray-900 dark:text-white">{{ explosionToDelete?.version }} - {{ explosionToDelete?.descripcion }}</span>?
          </p>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Justificación de eliminación <span class="text-red-500">*</span>
            </label>
            <UTextarea
              v-model="deletionReason"
              placeholder="Ingresa la razón por la cual deseas eliminar esta explosión (mínimo 10 caracteres)"
              :rows="4"
              :error="deletionReasonError"
              class="w-full"
            />
            <p v-if="deletionReasonError" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ deletionReasonError }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Este campo es obligatorio y debe contener al menos 10 caracteres.
            </p>
          </div>
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
            @click="confirmDeleteExplosion"
            :disabled="deleting || !isDeletionReasonValid"
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { useAudit } from "~/composables/useAudit";

definePageMeta({
  middleware: ["auth-revisar-explosion"],
});

// Cliente de Amplify
const client = generateClient();

// Composables
const { hasGroup } = useUserGroups();
const toast = useToast();
const { logDelete, logRead, logAction } = useAudit();

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
const showDeleteModal = ref(false);
const explosionToDelete = ref(null);
const deleting = ref(false);
const deletionReason = ref("");
const deletionReasonError = ref("");

// Opciones para filtros mejoradas
const statusOptions = [
  { label: "Todos los estados", value: "" },
  { label: "🟢 Activo", value: "ACTIVO" },
  { label: "🔴 Inactivo", value: "INACTIVO" },
  { label: "🟡 En Proceso", value: "EN_PROCESO" },
  { label: "🔵 Completado", value: "COMPLETADO" },
];

// Computed
const isDeletionReasonValid = computed(() => {
  return deletionReason.value.trim().length >= 10;
});

// Computed para filtrar explosiones
const filteredExplosions = computed(() => {
  let filtered = explosions.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (explosion) =>
        explosion.version?.toLowerCase().includes(query) ||
        explosion.descripcion?.toLowerCase().includes(query),
    );
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(
      (explosion) => explosion.status === selectedStatus.value,
    );
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Métodos
const fetchExplosions = async () => {
  try {
    loading.value = true;
    const { data, errors } = await client.models.Boom.list();

    if (errors) {
      console.error("Error fetching Boom explosions:", errors);
      toast.add({
        title: "Error",
        description: "No se pudieron cargar los registros de explosiones",
        color: "red",
      });
      return;
    }

    // Filtrar registros eliminados (soft delete)
    const activeExplosions = (data || []).filter(
      (explosion) => !explosion.deletedAt || explosion.deletedAt === null || explosion.deletedAt === undefined
    );

    explosions.value = activeExplosions;
    
    // Registrar auditoría LIST con información de los registros consultados
    try {
      await logAction(
        "READ",
        "boom",
        "Boom",
        undefined,
        {
          after: {
            totalRecords: activeExplosions.length,
            records: activeExplosions.map(exp => ({
              id: exp.id,
              version: exp.version,
              descripcion: exp.descripcion,
              status: exp.status,
            })),
          },
        },
        {
          totalExplosions: activeExplosions.length,
          filters: {
            status: selectedStatus.value || null,
            searchQuery: searchQuery.value || null,
          },
          recordIds: activeExplosions.map(exp => exp.id),
        }
      );
    } catch (auditError) {
      console.warn("Error al registrar auditoría LIST:", auditError);
      // No bloquear la carga si falla la auditoría
    }
    
    // Debug: verificar si el campo enableShowDocuments está presente
    console.log('📊 Datos cargados:', explosions.value);
    if (explosions.value.length > 0) {
      console.log('📄 Primer elemento enableShowDocuments:', explosions.value[0].enableShowDocuments);
      console.log('📄 Campos disponibles:', Object.keys(explosions.value[0]));
    }
  } catch (error) {
    console.error("Error al cargar explosiones:", error);
    toast.add({
      title: "Error",
      description: "No se pudieron cargar los registros de explosiones",
      color: "red",
    });
    explosions.value = [];
  } finally {
    loading.value = false;
  }
};

const viewExplosion = async (explosion) => {
  // Registrar auditoría VIEW con datos del registro consultado
  try {
    await logAction(
      "READ",
      "boom",
      "Boom",
      explosion.id,
      {
        after: {
          id: explosion.id,
          version: explosion.version,
          descripcion: explosion.descripcion,
          status: explosion.status,
          createdAt: explosion.createdAt,
          username: explosion.username,
        },
      },
      {
        version: explosion.version,
        descripcion: explosion.descripcion,
        status: explosion.status,
        action: "VIEW_FROM_LIST",
      }
    );
  } catch (auditError) {
    console.warn("Error al registrar auditoría VIEW:", auditError);
    // No bloquear la navegación si falla la auditoría
  }
  
  navigateTo(`/tools/explosion-materiales/view/${explosion.id}`);
};

const viewDocuments = (explosion) => {
  navigateTo(`/tools/explosion-materiales/documents/${explosion.id}`);
};

const editExplosion = (explosion) => {
  navigateTo(`/tools/explosion-materiales/edit/${explosion.id}`);
};

const deleteExplosion = (explosion) => {
  explosionToDelete.value = explosion;
  deletionReason.value = "";
  deletionReasonError.value = "";
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletionReason.value = "";
  deletionReasonError.value = "";
  explosionToDelete.value = null;
};

const confirmDeleteExplosion = async () => {
  if (!explosionToDelete.value) return;

  // Validar justificación
  if (!isDeletionReasonValid.value) {
    deletionReasonError.value = "La justificación debe tener al menos 10 caracteres";
    return;
  }

  deleting.value = true;
  deletionReasonError.value = "";

  try {
    // Obtener usuario actual
    const user = await getCurrentUser();
    
    // Realizar soft delete usando update
    const now = new Date().toISOString();
    const { data, errors } = await client.models.Boom.update({
      id: explosionToDelete.value.id,
      deletedAt: now,
      deletedBy: user.userId,
      deletionReason: deletionReason.value.trim(),
    });

    if (errors) {
      console.error("Error soft deleting Boom explosion:", errors);
      toast.add({
        title: "Error",
        description: "No se pudo eliminar la explosión de materiales",
        color: "red",
      });
      return;
    }

    // Registrar en AuditLog
    try {
      await logDelete(
        "boom",
        "Boom",
        explosionToDelete.value.id,
        explosionToDelete.value,
        {
          deletionReason: deletionReason.value.trim(),
          deletedAt: now,
          deletedBy: user.userId,
        }
      );
    } catch (auditError) {
      console.warn("Error al registrar auditoría:", auditError);
      // No bloquear la eliminación si falla la auditoría
    }

    toast.add({
      title: "Éxito",
      description: "Explosión de materiales eliminada correctamente",
      color: "green",
    });

    // Recargar la lista
    await fetchExplosions();

    // Cerrar modal
    closeDeleteModal();
  } catch (error) {
    console.error("Error soft deleting Boom explosion:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar la explosión de materiales",
      color: "red",
    });
  } finally {
    deleting.value = false;
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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Watch para limpiar error de validación cuando el usuario escribe
watch(deletionReason, () => {
  if (deletionReasonError.value && isDeletionReasonValid.value) {
    deletionReasonError.value = "";
  }
});

// Cargar datos al montar el componente
onMounted(() => {
  fetchExplosions();
});
</script>
