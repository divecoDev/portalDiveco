<template>
  <!-- Modal Backdrop usando Teleport para renderizar en body -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Background overlay que cubre toda la pantalla -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity"
        aria-hidden="true"
        @click="closeModal"
      ></div>

      <!-- Container para centrar el modal -->
      <div
        class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Modal positioning helper -->
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >

        <!-- Modal panel -->
        <div
          class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          @click.stop
        >
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <!-- Header -->
            <div
              class="flex items-center justify-between bg-cyan-600 -mx-6 -mt-6 mb-6 px-6 py-4 rounded-t-lg"
            >
              <h3 class="text-lg font-semibold text-white">
                Detalles del Registro
              </h3>
              <button
                @click="closeModal"
                class="text-white hover:text-cyan-100 transition-colors p-1 rounded-full hover:bg-cyan-700"
              >
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="max-h-[70vh] overflow-y-auto">
              <!-- Loading State -->
              <div
                v-if="isLoading"
                class="flex justify-center items-center py-12"
              >
                <div class="text-center">
                  <UIcon
                    name="i-heroicons-arrow-path"
                    class="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4"
                  />
                  <p class="text-gray-600 dark:text-gray-400">
                    Cargando detalles...
                  </p>
                </div>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="text-center py-12">
                <UIcon
                  name="i-heroicons-exclamation-triangle"
                  class="w-16 h-16 text-red-400 mx-auto mb-4"
                />
                <h3
                  class="text-lg font-medium text-gray-900 dark:text-white mb-2"
                >
                  Error al cargar detalles
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  {{ error }}
                </p>
                <button
                  @click="loadDetails"
                  class="inline-flex items-center px-4 py-2 border border-cyan-300 text-sm font-medium rounded-md text-cyan-700 bg-white hover:bg-cyan-50 dark:bg-gray-800 dark:text-cyan-400 dark:border-cyan-600 dark:hover:bg-gray-700 transition-colors"
                >
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
                  Reintentar
                </button>
              </div>

              <!-- Details Content -->
              <div v-else-if="recordDetails" class="space-y-6">
                <!-- Basic Information -->
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4
                    class="text-md font-semibold text-gray-900 dark:text-white mb-4"
                  >
                    Información General
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Usuario SAP
                      </label>
                      <div class="flex items-center">
                        <div
                          class="flex-shrink-0 w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mr-3"
                        >
                          <UIcon
                            name="i-heroicons-user"
                            class="w-4 h-4 text-cyan-600 dark:text-cyan-400"
                          />
                        </div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ recordDetails.sapUser }}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Realizado por
                      </label>
                      <div class="flex items-center">
                        <div
                          class="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3"
                        >
                          <UIcon
                            name="i-heroicons-envelope"
                            class="w-4 h-4 text-blue-600 dark:text-blue-400"
                          />
                        </div>
                        <p class="text-sm text-gray-900 dark:text-white">
                          {{ formatEmailOwner(recordDetails.emailOwner) }}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Tipo de Acción
                      </label>
                      <div class="flex items-center">
                        <div
                          class="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3"
                        >
                          <UIcon
                            name="i-heroicons-cog-6-tooth"
                            class="w-4 h-4 text-purple-600 dark:text-purple-400"
                          />
                        </div>
                        <p class="text-sm text-gray-900 dark:text-white">
                          {{ recordDetails.accion }}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Estado
                      </label>
                      <div class="flex items-center">
                        <span
                          :class="[
                            'inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full',
                            recordDetails.status === 'Completado'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                          ]"
                        >
                          <UIcon
                            :name="
                              recordDetails.status === 'Completado'
                                ? 'i-heroicons-check-circle'
                                : 'i-heroicons-x-circle'
                            "
                            class="w-4 h-4 mr-2"
                          />
                          {{ recordDetails.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Timestamp Information -->
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4
                    class="text-md font-semibold text-gray-900 dark:text-white mb-4"
                  >
                    Información de Tiempo
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Fecha y Hora Completa
                      </label>
                      <div class="flex items-center">
                        <UIcon
                          name="i-heroicons-calendar-days"
                          class="w-5 h-5 text-gray-400 mr-2"
                        />
                        <p class="text-sm text-gray-900 dark:text-white">
                          {{ formatDetailedDate(recordDetails.date) }}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Hace
                      </label>
                      <div class="flex items-center">
                        <UIcon
                          name="i-heroicons-clock"
                          class="w-5 h-5 text-gray-400 mr-2"
                        />
                        <p class="text-sm text-gray-900 dark:text-white">
                          {{ getTimeAgo(recordDetails.date) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- System Information -->
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4
                    class="text-md font-semibold text-gray-900 dark:text-white mb-4"
                  >
                    Información del Sistema
                  </h4>
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        ID del Registro
                      </label>
                      <div
                        class="flex items-center justify-between bg-white dark:bg-gray-800 rounded border p-2"
                      >
                        <code
                          class="text-xs text-gray-600 dark:text-gray-400 font-mono"
                        >
                          {{ recordDetails.id }}
                        </code>
                        <button
                          @click="copyToClipboard(recordDetails.id)"
                          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <UIcon name="i-heroicons-clipboard" class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Operation Logs -->
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h4
                      class="text-md font-semibold text-gray-900 dark:text-white"
                    >
                      Logs de la Operación
                    </h4>
                    <div class="flex space-x-2">
                      <button
                        @click="copyToClipboard(formatLogs(recordDetails.logs))"
                        class="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                      >
                        <UIcon
                          name="i-heroicons-clipboard"
                          class="w-3 h-3 mr-1"
                        />
                        Copiar
                      </button>
                      <button
                        @click="toggleLogsExpanded"
                        class="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-cyan-300 text-cyan-700 bg-white hover:bg-cyan-50 dark:bg-gray-700 dark:text-cyan-400 dark:border-cyan-600 dark:hover:bg-gray-600 transition-colors"
                      >
                        <UIcon
                          :name="
                            logsExpanded
                              ? 'i-heroicons-chevron-up'
                              : 'i-heroicons-chevron-down'
                          "
                          class="w-3 h-3 mr-1"
                        />
                        {{ logsExpanded ? "Contraer" : "Expandir" }}
                      </button>
                    </div>
                  </div>
                  <div
                    :class="[
                      'bg-white dark:bg-gray-800 rounded border p-4 transition-all duration-300',
                      logsExpanded
                        ? 'max-h-96 overflow-y-auto'
                        : 'max-h-32 overflow-hidden',
                    ]"
                  >
                    <pre
                      class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                      >{{ formatLogs(recordDetails.logs) }}</pre
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div
            class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
          >
            <button
              @click="refreshDetails"
              :disabled="isLoading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <UIcon
                :name="
                  isLoading
                    ? 'i-heroicons-arrow-path'
                    : 'i-heroicons-arrow-path'
                "
                :class="['w-4 h-4 mr-2', { 'animate-spin': isLoading }]"
              />
              Actualizar
            </button>
            <button
              @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { generateClient } from "aws-amplify/api";

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  recordId: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "close"]);

// Cliente de Amplify
const client = generateClient();

// Estado reactivo
const recordDetails = ref(null);
const isLoading = ref(false);
const error = ref(null);
const logsExpanded = ref(false);

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Watchers
watch(
  () => props.recordId,
  (newId) => {
    if (newId && props.modelValue) {
      loadDetails();
    }
  },
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.recordId) {
      loadDetails();
    } else if (!isOpen) {
      // Limpiar datos al cerrar
      recordDetails.value = null;
      error.value = null;
      logsExpanded.value = false;
    }
  },
);

// Métodos
const loadDetails = async () => {
  if (!props.recordId) return;

  isLoading.value = true;
  error.value = null;

  try {
    console.log("📋 Cargando detalles del registro:", props.recordId);

    const { errors, data } = await client.models.SapUserActionHistory.get({
      id: props.recordId,
    });

    if (errors) {
      console.error("❌ Error al cargar detalles:", errors);
      throw new Error("Error al cargar los detalles del registro");
    }

    if (!data) {
      throw new Error("Registro no encontrado");
    }

    recordDetails.value = data;
    console.log("✅ Detalles cargados:", data);
  } catch (err) {
    console.error("❌ Error crítico al cargar detalles:", err);
    error.value = err.message || "Error desconocido";
  } finally {
    isLoading.value = false;
  }
};

const refreshDetails = () => {
  loadDetails();
};

const closeModal = () => {
  isOpen.value = false;
  emit("close");
};

const toggleLogsExpanded = () => {
  logsExpanded.value = !logsExpanded.value;
};

const formatDetailedDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatEmailOwner = (email) => {
  // Limpiar prefijos como "microsoftentraidsaml_"
  return email.replace(/^[^_]*_/, "");
};

const formatLogs = (logsString) => {
  try {
    const logs = JSON.parse(logsString);
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    return logsString;
  }
};

const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Hace menos de un minuto";
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 30) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `Hace ${diffMonths} mes${diffMonths > 1 ? "es" : ""}`;

  const diffYears = Math.floor(diffDays / 365);
  return `Hace ${diffYears} año${diffYears > 1 ? "s" : ""}`;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    const toast = useToast();
    toast.add({
      title: "Copiado al portapapeles",
      description: "El contenido ha sido copiado exitosamente",
      color: "green",
      timeout: 3000,
    });
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err);
    const toast = useToast();
    toast.add({
      title: "Error al copiar",
      description: "No se pudo copiar el contenido",
      color: "red",
      timeout: 3000,
    });
  }
};
</script>

<style scoped>
/* Estilos para el scroll personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Transiciones suaves para la expansión de logs */
.transition-all {
  transition: max-height 0.3s ease-in-out;
}

/* Estilos para el código */
pre {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}

code {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}
</style>
