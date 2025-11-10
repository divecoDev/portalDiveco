<template>
  <div class="" id="suic-create-view">
    <!-- Header de la página integrado -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            id="suic-create-header"
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon
                name="i-heroicons-plus-circle"
                class="w-7 h-7 text-white"
              />
            </div>
            Nueva Carga SUIC
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Crea una nueva carga SUIC
          </p>
        </div>

        <div class="flex items-center space-x-3" id="suic-create-actions">
          <button
            id="suic-create-tour-trigger"
            type="button"
            :disabled="creating"
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

    <!-- Contenido principal -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Formulario -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
        id="suic-create-form-card"
      >
        <!-- Header del formulario con gradiente -->
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div class="flex items-center">
            <UIcon
              name="i-heroicons-document-text"
              class="w-6 h-6 text-white mr-3"
            />
            <h2 class="text-xl font-semibold text-white">Nueva Carga</h2>
          </div>
        </div>

        <div class="p-6" id="suic-create-form">
          <!-- Formulario -->
          <form @submit.prevent="createCarga" class="space-y-6" id="suic-create-form-fields">
            <!-- Descripción (Destacado) -->
            <div class="relative" id="field-descripcion">
              <div
                class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
              >
                <label
                  class="block text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center"
                >
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-4 h-4 mr-1.5"
                  />
                  Descripción *
                </label>
                <UInput
                  v-model="formData.descripcion"
                  type="text"
                  placeholder="Ingresa una descripción para esta carga"
                  size="lg"
                  :error="errors.descripcion"
                  class="w-full"
                />
                <p
                  class="mt-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium"
                >
                  Identificador principal de la carga
                </p>
              </div>
            </div>

            <!-- Tipo (Destacado) -->
            <div class="relative" id="field-type">
              <div
                class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
              >
                <label
                  class="block text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-tag" class="w-4 h-4 mr-1.5" />
                  Tipo *
                </label>
                <select
                  v-model="formData.type"
                  :class="[
                    'w-full px-4 py-3 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500',
                    errors.type 
                      ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                      : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                  ]"
                >
                  <option value="" disabled>Selecciona el tipo de carga</option>
                  <option value="Cierre">Cierre</option>
                  <option value="Recarga">Recarga</option>
                </select>
                <p
                  class="mt-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium"
                >
                  Tipo de operación SUIC
                </p>
              </div>
            </div>

            <!-- Created By (Readonly) -->
            <div class="relative" id="field-created-by">
              <label
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <UIcon name="i-heroicons-user" class="w-4 h-4 mr-1.5" />
                Creado por
              </label>
              <div class="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
                {{ formData.createdBy || 'Cargando usuario...' }}
              </div>
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Usuario que crea el registro (autocompletado)
              </p>
            </div>

            <!-- Mensajes de error generales -->
            <div
              v-if="Object.keys(errors).length > 0"
              class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
              id="suic-create-validation"
            >
              <div class="flex items-center">
                <UIcon
                  name="i-heroicons-exclamation-circle"
                  class="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
                />
                <span class="text-sm text-red-800 dark:text-red-200 font-medium">
                  Por favor, corrige los errores antes de continuar
                </span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 pt-4" id="suic-create-form-actions">
              <NuxtLink to="/tools/suic">
                <UButton
                  type="button"
                  color="gray"
                  variant="outline"
                  size="lg"
                  :disabled="creating"
                >
                  Cancelar
                </UButton>
              </NuxtLink>

              <button
                type="submit"
                :disabled="!isFormValid || creating"
                class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                <div
                  v-if="creating"
                  class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                <UIcon v-else name="i-heroicons-check" class="w-5 h-5" />
                {{ creating ? "Creando..." : "Crear Carga" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { generateClient } from "aws-amplify/data";
import { createDefaultSuicFlowState, serializeSuicFlowState } from "~/composables/useSuicFlowState";
import { fetchUserAttributes } from "aws-amplify/auth";
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
  title: "Nueva Carga SUIC - Portal Diveco",
  description: "Crear una nueva carga SUIC en el sistema",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/" },
  { title: "SUIC", href: "/tools/suic" },
  { title: "Nueva Carga" },
]);

const toast = useToast();
const router = useRouter();

// Estado reactivo
const creating = ref(false);
const userAttributes = ref(null);

const formData = ref({
  descripcion: "",
  createdBy: "",
  type: "Cierre",
  filesPath: {},
});

const errors = ref({
  descripcion: "",
  type: "",
});
const driverObj = ref(null);

// Computed
const isFormValid = computed(() => {
  return formData.value.descripcion.trim() !== "" && formData.value.type.trim() !== "";
});

// Métodos
const validateForm = () => {
  errors.value = {};

  if (!formData.value.descripcion.trim()) {
    errors.value.descripcion = "La descripción es obligatoria";
  }

  if (!formData.value.type.trim()) {
    errors.value.type = "El tipo es obligatorio";
  }

  return Object.keys(errors.value).length === 0;
};

const createCarga = async () => {
  if (!validateForm()) {
    toast.add({
      title: "Error de validación",
      description: "Por favor, completa todos los campos obligatorios",
      color: "red",
    });
    return;
  }

  creating.value = true;

  try {
    const { data, errors: createErrors } = await client.models.SUIC.create({
      descripcion: formData.value.descripcion.trim(),
      createdBy: formData.value.createdBy.trim(),
      type: formData.value.type.trim(),
      filesPath: JSON.stringify(formData.value.filesPath || {}),
      flowState: serializeSuicFlowState(createDefaultSuicFlowState()),
      currentStep: 0
    });

    if (createErrors) {
      console.error("Error creating SUIC carga:", createErrors);
      toast.add({
        title: "Error",
        description: "No se pudo crear la carga SUIC",
        color: "red",
      });
      return;
    }

    toast.add({
      title: "Éxito",
      description: "Carga SUIC creada correctamente",
      color: "green",
    });

    // Redireccionar al listado
    router.push("/tools/suic");
  } catch (error) {
    console.error("Error creating SUIC carga:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al crear la carga SUIC",
      color: "red",
    });
  } finally {
    creating.value = false;
  }
};

const initializeTour = () => {
  if (driverObj.value) {
    driverObj.value.destroy();
  }

  const steps = [
    {
      element: "#suic-create-header",
      popover: {
        title: "🆕 Nueva carga SUIC",
        description:
          "En esta vista crearás una carga SUIC desde cero siguiendo los campos obligatorios.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#suic-create-actions",
      popover: {
        title: "🧭 Acciones de navegación",
        description:
          "Regresa al listado o inicia este recorrido guiado en cualquier momento.",
        side: "left",
        align: "center",
      },
    },
    {
      element: "#suic-create-form-card",
      popover: {
        title: "📄 Formulario principal",
        description:
          "Completa los campos resaltados para definir la nueva carga SUIC.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#field-descripcion",
      popover: {
        title: "📝 Descripción",
        description:
          "Ingresa un nombre claro para identificar la carga. Es un campo obligatorio.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#field-type",
      popover: {
        title: "🏷️ Tipo de carga",
        description:
          "Selecciona si la carga corresponde a un Cierre o una Recarga.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#field-created-by",
      popover: {
        title: "👤 Datos del creador",
        description:
          "El sistema completa automáticamente el usuario que genera la carga.",
        side: "top",
        align: "center",
      },
    },
  ];

  if (Object.keys(errors.value).length > 0) {
    steps.push({
      element: "#suic-create-validation",
      popover: {
        title: "⚠️ Validaciones",
        description:
          "Cuando falten datos obligatorios verás este mensaje para corregirlos antes de enviar.",
        side: "top",
        align: "center",
      },
    });
  }

  steps.push(
    {
      element: "#suic-create-form-actions",
      popover: {
        title: "🚀 Acciones finales",
        description:
          "Puedes cancelar y volver al listado o crear la carga cuando toda la información sea válida.",
        side: "top",
        align: "end",
      },
    },
    {
      popover: {
        title: "🎉 Tour completado",
        description:
          "¡Listo! Ya conoces el flujo para registrar una nueva carga SUIC.",
        side: "center",
      },
    }
  );

  driverObj.value = driver({
    showProgress: true,
    allowClose: true,
    popoverClass: "driver-popover-custom",
    steps,
  });
};

const startTour = () => {
  if (creating.value) {
    return;
  }

  initializeTour();
  driverObj.value?.drive();
};

// Limpiar errores cuando el usuario escribe
watch(
  () => formData.value.descripcion,
  () => {
    if (errors.value.descripcion) {
      errors.value.descripcion = "";
    }
  }
);

watch(
  () => formData.value.type,
  () => {
    if (errors.value.type) {
      errors.value.type = "";
    }
  }
);

// Lifecycle
onMounted(async () => {
  try {
    const attributes = await fetchUserAttributes();
    userAttributes.value = attributes;
    formData.value.createdBy = attributes.email || "unknown";
  } catch (error) {
    console.error("Error fetching user attributes:", error);
    toast.add({
      title: "Advertencia",
      description: "No se pudo obtener el usuario actual",
      color: "yellow",
    });
  }
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

<style scoped>
/* Animaciones personalizadas si es necesario */
</style>

