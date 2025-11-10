<template>
  <div class="" id="suic-edit-view">
    <!-- Header de la página integrado -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            id="suic-edit-header"
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon name="i-heroicons-pencil" class="w-7 h-7 text-white" />
            </div>
            Editar Carga SUIC
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Modifica los datos de la carga SUIC
          </p>
        </div>

        <div class="flex items-center space-x-3" id="suic-edit-actions">
          <button
            id="suic-edit-tour-trigger"
            type="button"
            :disabled="loading || !suic"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            @click="startTour"
          >
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
            Tour
          </button>

          <!-- Botón para volver al listado -->
          <NuxtLink to="/tools/suic">
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
    <div v-if="loading" class="flex justify-center items-center py-12" id="suic-edit-loading">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos...</p>
      </div>
    </div>

    <!-- Estado de error -->
    <div v-else-if="!suic" class="text-center py-16" id="suic-edit-not-found">
      <div class="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-600 dark:text-red-400" />
      </div>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Carga SUIC no encontrada</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        La carga SUIC que buscas no existe o ha sido eliminada.
      </p>
      <NuxtLink to="/tools/suic">
        <button
          type="button"
          class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          Volver al Listado
        </button>
      </NuxtLink>
    </div>

    <!-- Contenido principal -->
    <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8" id="suic-edit-form-wrapper">
      <!-- Formulario -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
        id="suic-edit-form-card"
      >
        <!-- Header del formulario con gradiente -->
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div class="flex items-center">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-white mr-3" />
            <h2 class="text-xl font-semibold text-white">Datos de la Carga SUIC</h2>
          </div>
        </div>

        <!-- Contenido del formulario -->
        <div class="p-6" id="suic-edit-form">
          <form @submit.prevent="updateSuic" class="space-y-6" id="suic-edit-form-fields">
            <!-- Descripción (Editable) -->
            <div class="relative" id="edit-field-descripcion">
              <div
                class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
              >
                <label
                  for="descripcion"
                  class="block text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1.5" />
                  Descripción *
                </label>
                <UInput
                  id="descripcion"
                  v-model="formData.descripcion"
                  type="text"
                  placeholder="Ingresa una descripción para esta carga"
                  size="lg"
                  :error="errors.descripcion"
                  class="w-full"
                />
                <p class="mt-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                  Identificador principal de la carga
                </p>
              </div>
            </div>

            <!-- Tipo (Readonly) -->
            <div class="relative" id="edit-field-type">
              <div
                class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/20 dark:to-gray-700/20 p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm"
              >
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-tag" class="w-4 h-4 mr-1.5" />
                  Tipo
                </label>
                <div class="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
                  <span class="inline-flex items-center">
                    <UBadge
                      :color="formData.type === 'Cierre' ? 'green' : 'blue'"
                      variant="subtle"
                      size="lg"
                      class="font-semibold"
                    >
                      {{ formData.type }}
                    </UBadge>
                  </span>
                </div>
                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Tipo de operación SUIC (no editable)
                </p>
              </div>
            </div>

            <!-- Creado por (Readonly) -->
            <div class="relative" id="edit-field-created-by">
              <div
                class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/20 dark:to-gray-700/20 p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm"
              >
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4 mr-1.5" />
                  Creado por
                </label>
                <div class="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
                  {{ formData.createdBy }}
                </div>
                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Usuario que creó el registro (no editable)
                </p>
              </div>
            </div>

            <!-- Archivos (Readonly) -->
            <div class="relative" id="edit-field-archivos">
              <div
                class="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/20 dark:to-gray-700/20 p-4 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm"
              >
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-document" class="w-4 h-4 mr-1.5" />
                  Archivos
                </label>
                <div class="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
                  <span class="inline-flex items-center">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-2" />
                    Pendiente
                  </span>
                </div>
                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Gestión de archivos en desarrollo (no editable)
                </p>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700" id="suic-edit-form-actions">
              <NuxtLink :to="`/tools/suic/view/${suicId}`">
                <button
                  type="button"
                  class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
                >
                  Cancelar
                </button>
              </NuxtLink>
              <button
                type="submit"
                :disabled="!isFormValid || updating"
                class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                <div
                  v-if="updating"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                <UIcon v-else name="i-heroicons-check" class="w-4 h-4" />
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
  requiredRole: ["ADMINISTRAR-SUIC", "ADMIN"],
});

// Cliente de Amplify
const client = generateClient();

// Obtener ID de la ruta
const route = useRoute();
const suicId = route.params.id;

// Composable de toast
const toast = useToast();

// Meta tags para SEO
useSeoMeta({
  title: "Editar Carga SUIC - Portal Diveco",
  description: "Editar carga SUIC en el sistema",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "SUIC", href: "/tools/suic" },
  { title: "Editar" },
]);

// Estado reactivo
const loading = ref(true);
const updating = ref(false);
const suic = ref(null);
const driverObj = ref(null);

// Datos del formulario
const formData = ref({
  descripcion: "",
  type: "",
  createdBy: "",
});

// Errores de validación
const errors = ref({
  descripcion: "",
});

// Computed para validar formulario
const isFormValid = computed(() => {
  return formData.value.descripcion.trim() !== "";
});

// Métodos
const fetchSuic = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.SUIC.get({ id: suicId });

    if (data) {
      suic.value = data;
      // Llenar el formulario con los datos existentes
      formData.value = {
        descripcion: data.descripcion || "",
        type: data.type || "",
        createdBy: data.createdBy || "",
      };
    }
  } catch (error) {
    console.error("Error al cargar SUIC:", error);
    suic.value = null;
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  errors.value = {
    descripcion: "",
  };

  let isValid = true;

  // Validar descripción
  if (!formData.value.descripcion.trim()) {
    errors.value.descripcion = "La descripción es requerida";
    isValid = false;
  }

  return isValid;
};

const updateSuic = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    updating.value = true;

    const updatedData = {
      id: suicId,
      descripcion: formData.value.descripcion.trim(),
    };

    await client.models.SUIC.update(updatedData);

    // Mostrar notificación de éxito
    toast.add({
      title: "Carga SUIC actualizada exitosamente",
      description: `La carga "${updatedData.descripcion}" se ha actualizado correctamente`,
      color: "green",
    });

    // Redirigir a la vista de detalles
    await navigateTo(`/tools/suic/view/${suicId}`);
  } catch (error) {
    console.error("Error al actualizar SUIC:", error);
    toast.add({
      title: "Error al actualizar",
      description: "No se pudo actualizar la carga SUIC. Inténtalo de nuevo.",
      color: "red",
    });
  } finally {
    updating.value = false;
  }
};

const initializeTour = () => {
  if (driverObj.value) {
    driverObj.value.destroy();
  }

  const steps = [
    {
      element: "#suic-edit-header",
      popover: {
        title: "✏️ Edición de carga",
        description:
          "Esta pantalla te permite actualizar la información principal de la carga SUIC seleccionada.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#suic-edit-actions",
      popover: {
        title: "🧭 Acciones rápidas",
        description:
          "Vuelve al listado general o lanza el tour nuevamente para repasar el flujo.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#suic-edit-form-card",
      popover: {
        title: "📄 Detalle de la carga",
        description:
          "Aquí encontrarás todos los campos que se pueden revisar y actualizar.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#edit-field-descripcion",
      popover: {
        title: "📝 Descripción editable",
        description:
          "Modifica la descripción asegurando un nombre claro y representativo. Es obligatorio.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#edit-field-type",
      popover: {
        title: "🏷️ Tipo de carga",
        description:
          "Se muestra el tipo original cargado. Es solo lectura para mantener la trazabilidad.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#edit-field-created-by",
      popover: {
        title: "👤 Creado por",
        description:
          "Consulta quién generó la carga originalmente. También es información de solo lectura.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#edit-field-archivos",
      popover: {
        title: "📁 Archivos asociados",
        description:
          "En futuras iteraciones podrás gestionar los archivos. Hoy sirve de referencia del estado.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#suic-edit-form-actions",
      popover: {
        title: "🚀 Guardar cambios",
        description:
          "Cancela para volver sin guardar o confirma los cambios cuando la información sea válida.",
        side: "top",
        align: "end",
      },
    },
    {
      popover: {
        title: "🎉 Tour completado",
        description:
          "Ya conoces los puntos clave para editar una carga SUIC de forma segura.",
        side: "center",
      },
    },
  ];

  driverObj.value = driver({
    showProgress: true,
    allowClose: true,
    popoverClass: "driver-popover-custom",
    steps,
  });
};

const startTour = () => {
  if (loading.value || !suic.value) {
    return;
  }

  initializeTour();
  driverObj.value?.drive();
};

watch(
  () => formData.value.descripcion,
  () => {
    if (errors.value.descripcion) {
      errors.value.descripcion = "";
    }
  }
);

// Lifecycle
onMounted(() => {
  fetchSuic();
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
