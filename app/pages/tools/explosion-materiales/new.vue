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
              <UIcon
                name="i-heroicons-plus-circle"
                class="w-7 h-7 text-white"
              />
            </div>
            Nueva Explosión de Materiales
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Crea una nueva explosión de materiales
          </p>
        </div>

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

    <!-- Contenido principal -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Formulario -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
      >
        <!-- Header del formulario con gradiente -->
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div class="flex items-center">
            <UIcon name="i-heroicons-hashtag" class="w-6 h-6 text-white mr-3" />
            <h2 class="text-xl font-semibold text-white">Nueva Explosión</h2>
          </div>
        </div>

        <div class="p-6">
          <!-- Formulario -->
          <form @submit.prevent="createExplosion" class="space-y-6">
            <!-- Campos en una sola fila compacta -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Número de Versión (Destacado) -->
              <div class="relative">
                <div
                  class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
                >
                  <label
                    class="block text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center"
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
              <div class="relative">
                <div class="p-4">
                  <label
                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
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

            <!-- Botones de acción -->
            <div
              class="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700"
            >
              <button
                type="submit"
                :disabled="!isFormValid || creating"
                class="rounded-md inline-flex items-center disabled:cursor-not-allowed disabled:opacity-75 px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg border-0 cursor-pointer"
              >
                <UIcon
                  v-if="!creating"
                  name="i-heroicons-plus"
                  class="w-5 h-5"
                />
                <div
                  v-if="creating"
                  class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                {{ creating ? "Creando..." : "Crear Explosión" }}
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
  requiredRole: "EXPLOSION",
});

// Cliente de Amplify
const client = generateClient();

// Composable de autenticación
const { currentUser } = useAuth();

// Meta tags para SEO
useSeoMeta({
  title: "Nueva Explosión de Materiales - Portal Diveco",
  description: "Crear una nueva explosión de materiales en el sistema",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Nueva Explosión" },
]);

// Estado reactivo
const creating = ref(false);

// Datos del formulario
const formData = ref({
  descripcion: "",
  version: null,
});

// Errores de validación
const errors = ref({
  descripcion: "",
  version: "",
});

// Computed para validar formulario
const isFormValid = computed(() => {
  return formData.value.descripcion.trim() && formData.value.version;
});

// Métodos de validación
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

// Método para crear explosión
const createExplosion = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    creating.value = true;

    // Obtener el usuario actual desde el composable useAuth
    const username =
      currentUser.value?.username ||
      currentUser.value?.signInDetails?.loginId ||
      "Usuario desconocido";

    const explosionData = {
      descripcion: formData.value.descripcion.trim(),
      version: String(formData.value.version), // Convertir a string
      status: "EN_PROCESO", // Estado por defecto
      username: username,
      aditionalData: JSON.stringify({
        createdAt: new Date().toISOString(),
        source: "web-form",
      }), // Objeto JSON válido por defecto
    };

    await client.models.Boom.create(explosionData);

    // Mostrar notificación de éxito
    useToast().add({
      title: "Explosión creada exitosamente",
      description: `La explosión "${explosionData.descripcion}" se ha creado correctamente`,
      color: "green",
    });

    // Redirigir al listado
    await navigateTo("/tools/explosion-materiales");
  } catch (error) {
    console.error("Error al crear explosión:", error);
    useToast().add({
      title: "Error al crear explosión",
      description:
        "No se pudo crear la explosión de materiales. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    creating.value = false;
  }
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
</script>
