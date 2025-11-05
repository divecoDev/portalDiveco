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
            Nuevo Aprovisionamiento
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Crea un nuevo aprovisionamiento entre centros
          </p>
        </div>

        <!-- Botón para volver al listado -->
        <NuxtLink to="/tools/explosion-materiales/porcentajes-asignacion">
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
            <UIcon name="i-heroicons-percent-badge" class="w-6 h-6 text-white mr-3" />
            <h2 class="text-xl font-semibold text-white">Nuevo Aprovisionamiento</h2>
          </div>
        </div>

        <div class="p-6">
          <!-- Formulario -->
          <form @submit.prevent="createPorcentaje" class="space-y-6">
            <!-- Campos principales -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Centro de Origen -->
              <div class="relative">
                <div class="p-4">
                  <label
                    class="flex text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center"
                  >
                    <UIcon name="i-heroicons-building-office" class="w-4 h-4 mr-1.5" />
                    Centro de Origen *
                  </label>
                  <UInput
                    v-model="formData.centroIdOrigen"
                    type="number"
                    placeholder="1001"
                    size="lg"
                    :error="errors.centroIdOrigen"
                    class="w-full"
                  />
                  <p class="mt-1.5 text-xs text-gray-500">ID del centro de origen o suministro</p>
                </div>
              </div>

              <!-- Material ID -->
              <div class="relative">
                <div class="p-4">
                  <label
                    class="flex text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center"
                  >
                    <UIcon name="i-heroicons-cube" class="w-4 h-4 mr-1.5" />
                    Material ID *
                  </label>
                  <UInput
                    v-model="formData.materialId"
                    type="number"
                    placeholder="12345"
                    size="lg"
                    :error="errors.materialId"
                    class="w-full"
                  />
                  <p class="mt-1.5 text-xs text-gray-500">ID del material o producto</p>
                </div>
              </div>
            </div>

            <!-- Segunda fila de campos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Centro de Aprovisionamiento -->
              <div class="relative">
                <div class="p-4">
                  <label
                    class="flex text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center"
                  >
                    <UIcon name="i-heroicons-building-office-2" class="w-4 h-4 mr-1.5" />
                    Centro de Aprovisionamiento *
                  </label>
                  <UInput
                    v-model="formData.centroIdAprov"
                    type="number"
                    placeholder="2001"
                    size="lg"
                    :error="errors.centroIdAprov"
                    class="w-full"
                  />
                  <p class="mt-1.5 text-xs text-gray-500">ID del centro de aprovisionamiento o destino</p>
                </div>
              </div>

              <!-- Porcentaje (Destacado) -->
              <div class="relative">
                <div
                  class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
                >
                  <label
                    class="flex text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2 items-center"
                  >
                    <UIcon name="i-heroicons-percent-badge" class="w-4 h-4 mr-1.5" />
                    Porcentaje de Asignación *
                  </label>
                  <UInput
                    v-model="formData.porcentaje"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="100.00"
                    size="lg"
                    :error="errors.porcentaje"
                    class="w-full text-center text-lg font-bold"
                  />
                  <p
                    class="mt-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium"
                  >
                    Valor entre 0.00 y 100.00
                  </p>
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-md p-4">
              <div class="flex items-start space-x-3">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Información sobre Aprovisionamiento
                  </h4>
                  <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• El porcentaje debe estar entre 0.00 y 100.00</li>
                    <li>• La combinación de Centro Origen + Material + Centro Aprov debe ser única</li>
                    <li>• Los aprovisionamientos se usan para distribuir la producción entre centros</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div
              class="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700"
            >
              <NuxtLink to="/tools/explosion-materiales/porcentajes-asignacion">
                <UButton
                  color="gray"
                  variant="outline"
                  size="lg"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  Cancelar
                </UButton>
              </NuxtLink>
              
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
                {{ creating ? "Creando..." : "Crear Aprovisionamiento" }}
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

// Composables
const { logCreate } = useAudit();

// Meta tags para SEO
useSeoMeta({
  title: "Nuevo Aprovisionamiento - Portal Diveco",
  description: "Crear un nuevo aprovisionamiento entre centros de producción",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Aprovisionamiento", href: "/tools/explosion-materiales/porcentajes-asignacion" },
  { title: "Nuevo Aprovisionamiento" },
]);

// Estado reactivo
const creating = ref(false);

// Datos del formulario
const formData = ref({
  centroIdOrigen: null,
  materialId: null,
  centroIdAprov: null,
  porcentaje: null,
});

// Errores de validación
const errors = ref({
  centroIdOrigen: "",
  materialId: "",
  centroIdAprov: "",
  porcentaje: "",
});

// Computed para validar formulario
const isFormValid = computed(() => {
  return (
    formData.value.centroIdOrigen &&
    formData.value.materialId &&
    formData.value.centroIdAprov &&
    formData.value.porcentaje !== null &&
    formData.value.porcentaje >= 0 &&
    formData.value.porcentaje <= 100
  );
});

// Métodos de validación
const validateForm = () => {
  errors.value = {
    centroIdOrigen: "",
    materialId: "",
    centroIdAprov: "",
    porcentaje: "",
  };

  let isValid = true;

  // Validar centro de origen
  if (!formData.value.centroIdOrigen || formData.value.centroIdOrigen <= 0) {
    errors.value.centroIdOrigen = "El centro de origen es requerido y debe ser mayor a 0";
    isValid = false;
  }

  // Validar material ID
  if (!formData.value.materialId || formData.value.materialId <= 0) {
    errors.value.materialId = "El material ID es requerido y debe ser mayor a 0";
    isValid = false;
  }

  // Validar centro de aprovisionamiento
  if (!formData.value.centroIdAprov || formData.value.centroIdAprov <= 0) {
    errors.value.centroIdAprov = "El centro de aprovisionamiento es requerido y debe ser mayor a 0";
    isValid = false;
  }

  // Validar porcentaje
  if (formData.value.porcentaje === null || formData.value.porcentaje === undefined) {
    errors.value.porcentaje = "El porcentaje es requerido";
    isValid = false;
  } else if (formData.value.porcentaje < 0 || formData.value.porcentaje > 100) {
    errors.value.porcentaje = "El porcentaje debe estar entre 0 y 100";
    isValid = false;
  }

  return isValid;
};

// Método para crear porcentaje
const createPorcentaje = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    creating.value = true;

    const { data } = await client.queries.aprovisionamiento({
      operation: "create",
      centroIdOrigen: parseInt(formData.value.centroIdOrigen),
      materialId: parseInt(formData.value.materialId),
      centroIdAprov: parseInt(formData.value.centroIdAprov),
      porcentaje: parseFloat(formData.value.porcentaje),
    });

    // Parsear la respuesta JSON que viene como string
    let responseData;
    try {
      responseData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Error al procesar la respuesta del servidor');
    }

    if (responseData?.success) {
      // Registrar auditoría CREATE
      const entityId = `${formData.value.centroIdOrigen}-${formData.value.materialId}-${formData.value.centroIdAprov}`;
      const newData = {
        centroIdOrigen: parseInt(formData.value.centroIdOrigen),
        materialId: parseInt(formData.value.materialId),
        centroIdAprov: parseInt(formData.value.centroIdAprov),
        porcentaje: parseFloat(formData.value.porcentaje),
      };
      
      try {
        await logCreate(
          "boom",
          "Aprovisionamiento",
          entityId,
          newData,
          {
            centroIdOrigen: newData.centroIdOrigen,
            materialId: newData.materialId,
            centroIdAprov: newData.centroIdAprov,
            porcentaje: newData.porcentaje,
          }
        );
      } catch (auditError) {
        console.warn("Error al registrar auditoría CREATE:", auditError);
        // No bloquear la creación si falla la auditoría
      }

      // Mostrar notificación de éxito
      useToast().add({
        title: "Aprovisionamiento creado exitosamente",
        description: `El aprovisionamiento se ha creado correctamente`,
        color: "green",
      });

      // Redirigir al listado
      await navigateTo("/tools/explosion-materiales/porcentajes-asignacion");
    } else {
      throw new Error(responseData?.message || "Error desconocido");
    }
  } catch (error) {
    console.error("Error al crear porcentaje:", error);
    
    let errorMessage = "No se pudo crear el aprovisionamiento. Intenta nuevamente.";
    
    if (error.message?.includes("Duplicate entry")) {
      errorMessage = "Ya existe un aprovisionamiento para esta combinación de centro origen, material y centro de aprovisionamiento.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    useToast().add({
      title: "Error al crear aprovisionamiento",
      description: errorMessage,
      color: "red",
    });
  } finally {
    creating.value = false;
  }
};

// Limpiar errores cuando se cambian los valores
watch(
  () => formData.value.centroIdOrigen,
  () => {
    if (errors.value.centroIdOrigen) {
      errors.value.centroIdOrigen = "";
    }
  },
);

watch(
  () => formData.value.materialId,
  () => {
    if (errors.value.materialId) {
      errors.value.materialId = "";
    }
  },
);

watch(
  () => formData.value.centroIdAprov,
  () => {
    if (errors.value.centroIdAprov) {
      errors.value.centroIdAprov = "";
    }
  },
);

watch(
  () => formData.value.porcentaje,
  () => {
    if (errors.value.porcentaje) {
      errors.value.porcentaje = "";
    }
  },
);
</script>
