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
            Editar Carga SUIC
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Modifica los datos de la carga SUIC
          </p>
        </div>

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

    <!-- Estado de carga inicial -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando datos...</p>
      </div>
    </div>

    <!-- Estado de error -->
    <div v-else-if="!suic" class="text-center py-16">
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
    <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Formulario -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
      >
        <!-- Header del formulario con gradiente -->
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div class="flex items-center">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-white mr-3" />
            <h2 class="text-xl font-semibold text-white">Datos de la Carga SUIC</h2>
          </div>
        </div>

        <!-- Contenido del formulario -->
        <div class="p-6">
          <form @submit.prevent="updateSuic" class="space-y-6">
            <!-- Descripción (Editable) -->
            <div class="relative">
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
            <div class="relative">
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
            <div class="relative">
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
            <div class="relative">
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
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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

// Lifecycle
onMounted(() => {
  fetchSuic();
});
</script>
