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
              <UIcon name="i-heroicons-pencil" class="w-7 h-7 text-white" />
            </div>
            Editar Explosión de Materiales
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Modifica los datos de la explosión de materiales
          </p>
        </div>

        <!-- Botones de acción del header -->
        <div class="flex items-center space-x-3">
          <!-- Botón para iniciar tour guiado -->
          <UButton
            id="tour-trigger"
            icon="i-heroicons-information-circle"
            size="lg"
            color="cyan"
            variant="solid"
            class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            @click="startTour"
          >
            🎯 Tour Guiado
          </UButton>

          <!-- Botón para volver al listado -->
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
    <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Formulario -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
      >
        <!-- Header del formulario con gradiente -->
        <div id="form-header" class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-pencil"
                class="w-6 h-6 text-white mr-3"
              />
              <h2 class="text-xl font-semibold text-white">Editar Explosión</h2>
            </div>
            <div class="flex items-center text-white/80 text-sm">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
              <span>{{ formatDate(explosion.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="p-6">
          <!-- Botón de prueba del tour -->
          <div class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span class="text-sm text-yellow-800 dark:text-yellow-200">
                  ¿Primera vez aquí? Inicia el tour guiado para conocer todas las funciones
                </span>
              </div>
              <UButton
                size="sm"
                color="yellow"
                variant="solid"
                @click="startTour"
                class="ml-3"
              >
                Iniciar Tour
              </UButton>
            </div>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="updateExplosion" class="space-y-6">
            <!-- Campos en una sola fila compacta -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Número de Versión (Destacado) -->
              <div id="version-field" class="relative">
                <div
                  class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
                >
                  <label
                    class="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center"
                  >
                    <UIcon name="i-heroicons-hashtag" class="w-4 h-4 mr-1.5" />
                    Número de Versión *
                  </label>
                  <UInput
                    v-model="formData.version"
                    type="number"
                    placeholder="275"
                    size="lg"
                    :error="errors.version"
                    class="w-full text-center text-lg font-bold"
                  />
                  <p
                    class="mt-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium"
                  >
                    Identificador principal
                  </p>
                </div>
              </div>

              <!-- Descripción -->
              <div id="description-field" class="relative">
                <div class="p-4">
                  <label
                    class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                  >
                    <UIcon
                      name="i-heroicons-document-text"
                      class="w-4 h-4 mr-1.5"
                    />
                    Descripción *
                  </label>
                  <UInput
                    v-model="formData.descripcion"
                    placeholder="08-04 2025"
                    size="lg"
                    :error="errors.descripcion"
                    class="w-full"
                  />
                  <p class="mt-1.5 text-xs text-gray-500">Formato de plan</p>
                </div>
              </div>
            </div>

            <!-- Estado -->
            <div id="status-field" class="relative">
              <div class="p-4">
                <label
                  class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-flag" class="w-4 h-4 mr-1.5" />
                  Estado
                </label>
                <USelect
                  v-model="formData.status"
                  :options="statusOptions"
                  placeholder="Seleccionar estado"
                  size="lg"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Botones de acción -->
            <div
              id="action-buttons"
              class="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700"
            >
              <NuxtLink
                :to="`/tools/explosion-materiales/view/${explosion.id}`"
              >
                <UButton
                  icon="i-heroicons-eye"
                  color="gray"
                  variant="outline"
                  size="lg"
                >
                  Ver Detalles
                </UButton>
              </NuxtLink>

              <button
                type="submit"
                :disabled="!isFormValid || updating"
                class="rounded-md inline-flex items-center disabled:cursor-not-allowed disabled:opacity-75 px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg border-0 cursor-pointer"
              >
                <UIcon
                  v-if="!updating"
                  name="i-heroicons-check"
                  class="w-5 h-5"
                />
                <div
                  v-if="updating"
                  class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                {{ updating ? "Guardando..." : "Guardar Cambios" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: "EXPLOSION",
});

// Cliente de Amplify
const client = generateClient();

// Obtener ID de la ruta
const route = useRoute();
const explosionId = route.params.id;

// Composable de autenticación
const { currentUser } = useAuth();

// Meta tags para SEO
useSeoMeta({
  title: "Editar Explosión de Materiales - Portal Diveco",
  description: "Editar explosión de materiales en el sistema",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Editar" },
]);

// Estado reactivo
const loading = ref(true);
const updating = ref(false);
const explosion = ref(null);

// Datos del formulario
const formData = ref({
  descripcion: "",
  version: null,
  status: "EN_PROCESO",
});

// Errores de validación
const errors = ref({
  descripcion: "",
  version: "",
});

// Opciones de estado mejoradas
const statusOptions = [
  {
    label: "🟢 Activo",
    value: "ACTIVO",
    icon: "i-heroicons-check-circle",
  },
  {
    label: "🔴 Inactivo",
    value: "INACTIVO",
    icon: "i-heroicons-x-circle",
  },
  {
    label: "🟡 En Proceso",
    value: "EN_PROCESO",
    icon: "i-heroicons-clock",
  },
  {
    label: "🔵 Completado",
    value: "COMPLETADO",
    icon: "i-heroicons-check-badge",
  },
];

// Computed para validar formulario
const isFormValid = computed(() => {
  return formData.value.descripcion.trim() && formData.value.version;
});

// Métodos
const fetchExplosion = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.Boom.get({ id: explosionId });

    if (data) {
      explosion.value = data;
      // Llenar el formulario con los datos existentes
      formData.value = {
        descripcion: data.descripcion || "",
        version: parseInt(data.version) || null,
        status: data.status || "EN_PROCESO",
      };
    }
  } catch (error) {
    console.error("Error al cargar explosión:", error);
    explosion.value = null;
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  errors.value = {
    descripcion: "",
    version: "",
  };

  let isValid = true;

  // Validar descripción
  if (!formData.value.descripcion.trim()) {
    errors.value.descripcion = "La descripción es requerida";
    isValid = false;
  }

  // Validar versión
  if (!formData.value.version || formData.value.version <= 0) {
    errors.value.version =
      "El número de versión es requerido y debe ser mayor a 0";
    isValid = false;
  }

  return isValid;
};

const updateExplosion = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    updating.value = true;

    const updatedData = {
      id: explosionId,
      descripcion: formData.value.descripcion.trim(),
      version: String(formData.value.version),
      status: formData.value.status,
    };

    await client.models.Boom.update(updatedData);

    // Mostrar notificación de éxito
    useToast().add({
      title: "Explosión actualizada exitosamente",
      description: `La explosión "${updatedData.descripcion}" se ha actualizado correctamente`,
      color: "green",
    });

    // Redirigir a la vista de detalles
    await navigateTo(`/tools/explosion-materiales/view/${explosionId}`);
  } catch (error) {
    console.error("Error al actualizar explosión:", error);
    useToast().add({
      title: "Error al actualizar explosión",
      description:
        "No se pudo actualizar la explosión de materiales. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    updating.value = false;
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

// Limpiar errores cuando se cambian los valores
watch(
  () => formData.value.descripcion,
  () => {
    if (errors.value.descripcion) {
      errors.value.descripcion = "";
    }
  },
);

watch(
  () => formData.value.version,
  () => {
    if (errors.value.version) {
      errors.value.version = "";
    }
  },
);

// Configuración del tour guiado
const driverObj = ref(null);

const initializeTour = () => {
  driverObj.value = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    popoverClass: 'driver-popover-custom',
    steps: [
      {
        element: '#tour-trigger',
        popover: {
          title: '🎯 Tour Guiado',
          description: '¡Bienvenido! Este tour te guiará a través de la página de edición de explosión de materiales. Puedes iniciarlo en cualquier momento desde este botón.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#form-header',
        popover: {
          title: '📋 Información del Formulario',
          description: 'Aquí puedes ver el título del formulario y la fecha de creación de la explosión. Esta información te ayuda a identificar qué estás editando.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#version-field',
        popover: {
          title: '🔢 Número de Versión',
          description: 'Este es el campo más importante. El número de versión identifica únicamente cada explosión de materiales. Debe ser un número entero positivo.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#description-field',
        popover: {
          title: '📝 Descripción',
          description: 'Aquí puedes agregar una descripción descriptiva de la explosión. Por ejemplo, puedes usar el formato de plan como "08-04 2025".',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#status-field',
        popover: {
          title: '🏷️ Estado',
          description: 'Selecciona el estado actual de la explosión: Activo, Inactivo, En Proceso o Completado. Esto ayuda a gestionar el flujo de trabajo.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#action-buttons',
        popover: {
          title: '⚡ Acciones Disponibles',
          description: 'Desde aquí puedes ver los detalles de la explosión o guardar los cambios realizados. El botón de guardar se habilita cuando todos los campos requeridos están completos.',
          side: 'top',
          align: 'end'
        }
      },
      {
        popover: {
          title: '🎉 ¡Tour Completado!',
          description: 'Ya conoces todos los elementos principales de la página de edición. ¡Ahora puedes editar explosiones de materiales con confianza!',
          side: 'center'
        }
      }
    ]
  });
};

const startTour = () => {
  if (!driverObj.value) {
    initializeTour();
  }
  driverObj.value.drive();
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchExplosion();
});
</script>

<style>
/* Estilos personalizados para el tour de Driver.js */
.driver-popover-custom {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  border: 2px solid #0891b2;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.driver-popover-custom .driver-popover-title {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.driver-popover-custom .driver-popover-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.5;
}

.driver-popover-custom .driver-popover-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
}

.driver-popover-custom .driver-popover-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.driver-popover-custom .driver-popover-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.driver-popover-custom .driver-popover-btn.driver-popover-btn-primary {
  background: rgba(255, 255, 255, 0.9);
  color: #0891b2;
  border-color: rgba(255, 255, 255, 0.9);
}

.driver-popover-custom .driver-popover-btn.driver-popover-btn-primary:hover {
  background: white;
  color: #0e7490;
}

.driver-popover-custom .driver-popover-progress-bar {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  height: 4px;
}

.driver-popover-custom .driver-popover-progress-bar-fill {
  background: white;
  border-radius: 4px;
}

.driver-popover-custom .driver-popover-close-btn {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
}

.driver-popover-custom .driver-popover-close-btn:hover {
  color: white;
}

/* Animación suave para el overlay */
.driver-overlay {
  transition: opacity 0.3s ease;
}

/* Estilo para el elemento destacado */
.driver-highlighted-element {
  border-radius: 8px !important;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3) !important;
}
</style>
