<template>
  <div class="0" id="suic-list-view">
    <!-- Header de la página integrado -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            id="suic-list-header"
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-7 h-7 text-white"
              />
            </div>
            SUIC
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Gestión de cargas SUIC para el sistema
          </p>
        </div>

        <!-- Botón para crear nueva carga -->
        <div class="flex items-center space-x-3" id="suic-list-actions">
          <button
            id="suic-list-tour-trigger"
            type="button"
            :disabled="loading"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            @click="startTour"
          >
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
            Tour
          </button>

          <NuxtLink to="/tools/suic/new">
            <button
              id="suic-list-create-button"
              type="button"
              class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              Nueva Carga
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros y búsqueda compactos -->
      <div
        id="suic-list-filters"
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

          <!-- Filtro por tipo -->
          <div class="sm:w-48">
            <select
              v-model="selectedType"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
            >
              <option value="">Todos los tipos</option>
              <option value="Cierre">Cierre</option>
              <option value="Recarga">Recarga</option>
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
            Cargando registros SUIC...
          </p>
        </div>
      </div>

      <!-- Lista de cargas SUIC -->
      <div v-else-if="filteredCargas.length > 0" class="space-y-3" id="suic-list-cards">
        <div
          v-for="carga in filteredCargas"
          :key="carga.id"
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 hover:shadow-xl hover:border-cyan-300/40 dark:hover:border-cyan-600/40 transition-all duration-300 hover:-translate-y-1"
          :id="`suic-card-${carga.id}`"
        >
          <div class="p-5">
            <!-- Header del card -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <h3
                    class="text-xl font-bold text-cyan-600 dark:text-cyan-400"
                  >
                    {{ carga.descripcion }}
                  </h3>
                  <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Creado por: {{ carga.createdBy }}</span>
                    <span class="flex items-center">
                      <UIcon name="i-heroicons-tag" class="w-3 h-3 mr-1" />
                      {{ carga.type }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="flex items-center space-x-2 suic-card-actions">
                <NuxtLink :to="`/tools/suic/view/${carga.id}`">
                  <UButton
                    icon="i-heroicons-eye"
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
                  @click="confirmDelete(carga)"
                  :id="`delete-action-${carga.id}`"
                />
              </div>
            </div>

            <!-- Metadata -->
            <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-1.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                <span>{{ formatDate(carga.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16" id="suic-empty-state">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No hay cargas SUIC
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {{ searchQuery ? 'No se encontraron resultados para tu búsqueda.' : 'Comienza creando tu primera carga SUIC.' }}
        </p>
        <NuxtLink to="/tools/suic/new">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            Nueva Carga
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
            ¿Estás seguro de que deseas eliminar la carga
            <span class="font-semibold text-gray-900 dark:text-white">{{ cargaToDelete?.descripcion }}</span>?
          </p>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Justificación de eliminación <span class="text-red-500">*</span>
            </label>
            <UTextarea
              v-model="deletionReason"
              placeholder="Ingresa la razón por la cual deseas eliminar esta carga (mínimo 10 caracteres)"
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
            @click="deleteCarga"
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { useAudit } from "~/composables/useAudit";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Definir el layout y middleware
definePageMeta({
  layout: "default",
  middleware: ["require-role"],
  requiredRole: ["ADMINISTRAR-SUIC", "ADMIN"],
});

// Cliente de Amplify
const client = generateClient();

// Meta tags para SEO
useSeoMeta({
  title: "SUIC - Portal Diveco",
  description: "Gestión de cargas SUIC para el sistema",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/" },
  { title: "SUIC" },
]);

const toast = useToast();
const { logDelete } = useAudit();

// Estado reactivo
const loading = ref(false);
const cargas = ref([]);
const searchQuery = ref("");
const selectedType = ref("");
const showDeleteModal = ref(false);
const cargaToDelete = ref(null);
const deleting = ref(false);
const deletionReason = ref("");
const deletionReasonError = ref("");
const driverObj = ref(null);

// Computed
const isDeletionReasonValid = computed(() => {
  return deletionReason.value.trim().length >= 10;
});

const filteredCargas = computed(() => {
  let filtered = cargas.value;

  // Filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((carga) =>
      carga.descripcion?.toLowerCase().includes(query)
    );
  }

  // Filtro por tipo
  if (selectedType.value) {
    filtered = filtered.filter((carga) => carga.type === selectedType.value);
  }

  return filtered;
});

const hasData = computed(() => filteredCargas.value.length > 0);
const firstCardSelector = computed(() => {
  if (!hasData.value) {
    return null;
  }

  return `#suic-card-${filteredCargas.value[0].id}`;
});

const firstDeleteSelector = computed(() => {
  if (!hasData.value) {
    return null;
  }

  return `#delete-action-${filteredCargas.value[0].id}`;
});

// Métodos
const fetchCargas = async () => {
  loading.value = true;
  try {
    const { data, errors } = await client.models.SUIC.list();

    if (errors) {
      console.error("Error fetching SUIC cargas:", errors);
      toast.add({
        title: "Error",
        description: "No se pudieron cargar los registros SUIC",
        color: "red",
      });
      return;
    }

    // Filtrar registros eliminados (soft delete)
    const activeCargas = (data || []).filter(
      (carga) => !carga.deletedAt || carga.deletedAt === null || carga.deletedAt === undefined
    );

    // Ordenar por fecha de creación descendente (más recientes primero)
    cargas.value = activeCargas.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching SUIC cargas:", error);
    toast.add({
      title: "Error",
      description: "No se pudieron cargar los registros SUIC",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (carga) => {
  cargaToDelete.value = carga;
  deletionReason.value = "";
  deletionReasonError.value = "";
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletionReason.value = "";
  deletionReasonError.value = "";
  cargaToDelete.value = null;
};

const deleteCarga = async () => {
  if (!cargaToDelete.value) return;

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
    const { data, errors } = await client.models.SUIC.update({
      id: cargaToDelete.value.id,
      deletedAt: now,
      deletedBy: user.userId,
      deletionReason: deletionReason.value.trim(),
    });

    if (errors) {
      console.error("Error soft deleting SUIC carga:", errors);
      toast.add({
        title: "Error",
        description: "No se pudo eliminar la carga SUIC",
        color: "red",
      });
      return;
    }

    // Registrar en AuditLog
    try {
      await logDelete(
        "suic",
        "SUIC",
        cargaToDelete.value.id,
        cargaToDelete.value,
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
      description: "Carga SUIC eliminada correctamente",
      color: "green",
    });

    // Recargar la lista
    await fetchCargas();

    // Cerrar modal
    closeDeleteModal();
  } catch (error) {
    console.error("Error soft deleting SUIC carga:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar la carga SUIC",
      color: "red",
    });
  } finally {
    deleting.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

const initializeTour = () => {
  if (driverObj.value) {
    driverObj.value.destroy();
  }

  const steps = [
    {
      element: "#suic-list-header",
      popover: {
        title: "📊 Panel SUIC",
        description:
          "Este encabezado te recuerda dónde estás y centraliza el acceso a las acciones para trabajar con SUIC.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#suic-list-actions",
      popover: {
        title: "⚙️ Acciones principales",
        description:
          "Desde aquí puedes crear una nueva carga o iniciar nuevamente este tour cuando necesites una guía rápida.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#suic-list-filters",
      popover: {
        title: "🔍 Filtros inteligentes",
        description:
          "Busca por descripción o filtra por tipo para encontrar rápidamente la carga que necesitas gestionar.",
        side: "bottom",
        align: "center",
      },
    },
  ];

  if (hasData.value && firstCardSelector.value) {
    steps.push(
      {
        element: firstCardSelector.value,
        popover: {
          title: "🗂️ Tarjeta de carga",
          description:
            "Cada tarjeta resume los datos esenciales de una carga SUIC, incluyendo autor y tipo.",
          side: "top",
          align: "center",
        },
      },
      {
        element: `${firstCardSelector.value} .suic-card-actions`,
        popover: {
          title: "👁️ Ver detalles",
          description:
            "Accede a la vista detallada con el ícono de ojo o gestiona la eliminación con el ícono de papelera.",
          side: "left",
          align: "center",
        },
      },
      {
        element: firstDeleteSelector.value,
        popover: {
          title: "🗑️ Eliminar carga",
          description:
            "Al eliminar se solicitará una justificación y se registrará en auditoría para mantener el control.",
          side: "left",
          align: "center",
        },
      }
    );
  } else {
    steps.push({
      element: "#suic-empty-state",
      popover: {
        title: "✨ Estado inicial",
        description:
          "Cuando no existen cargas activas verás este recordatorio, con acceso directo para crear la primera.",
        side: "top",
        align: "center",
      },
    });
  }

  steps.push({
    popover: {
      title: "🎉 Tour completado",
      description:
        "Listo. Ya conoces los elementos principales para listar y administrar las cargas SUIC.",
      side: "center",
    },
  });

  driverObj.value = driver({
    showProgress: true,
    allowClose: true,
    popoverClass: "driver-popover-custom",
    steps,
  });
};

const startTour = () => {
  if (loading.value) {
    return;
  }

  initializeTour();
  driverObj.value?.drive();
};

// Watch para limpiar error de validación cuando el usuario escribe
watch(deletionReason, () => {
  if (deletionReasonError.value && isDeletionReasonValid.value) {
    deletionReasonError.value = "";
  }
});

// Lifecycle
onMounted(() => {
  fetchCargas();
});

onBeforeUnmount(() => {
  driverObj.value?.destroy();
  driverObj.value = null;
});
</script>

<style>
.driver-popover-custom {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border: 2px solid #0891b2;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(8, 145, 178, 0.35);
}

.driver-popover-custom .driver-popover-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.05rem;
}

.driver-popover-custom .driver-popover-description {
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.95rem;
  line-height: 1.5;
}

.driver-popover-custom .driver-popover-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.driver-popover-custom .driver-popover-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.driver-popover-custom .driver-popover-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.driver-popover-custom .driver-popover-btn.driver-popover-btn-primary {
  background: rgba(255, 255, 255, 0.92);
  color: #0e7490;
  border-color: rgba(255, 255, 255, 0.92);
}

.driver-popover-custom .driver-popover-btn.driver-popover-btn-primary:hover {
  background: #ffffff;
  color: #155e75;
}

.driver-popover-custom .driver-popover-progress-bar {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  height: 4px;
}

.driver-popover-custom .driver-popover-progress-bar-fill {
  background: #ffffff;
  border-radius: 4px;
}

.driver-popover-custom .driver-popover-close-btn {
  color: rgba(255, 255, 255, 0.7);
}
</style>

