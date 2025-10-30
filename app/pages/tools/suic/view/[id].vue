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
              <UIcon name="i-heroicons-eye" class="w-7 h-7 text-white" />
            </div>
            <div class="flex space-x-4 items-center">
               <div>
                <p class="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {{ suic?.descripcion || "Cargando..." }}
                </p>
               </div>
               <div>
                <p class="text-xs bg-cyan-500 text-white px-2 py-1 rounded-mddark:text-gray-300 rounded-full">
                  {{ suic?.type }}
                </p>
               </div>
            </div>
          </h1>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center space-x-3">
          <NuxtLink :to="`/tools/suic/edit/${suicId}`">
            <UButton
              icon="i-heroicons-pencil"
              size="lg"
              color="blue"
              variant="outline"
              class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Editar
            </UButton>
          </NuxtLink>

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

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando detalles...</p>
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

    <!-- Stepper de procesos -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 
                bg-cyan-50/40 dark:bg-gray-800/80 backdrop-blur-sm rounded-md 
                shadow-xl border border-cyan-200/50 dark:border-cyan-700/50">
      <UStepper
        ref="mainStepper"
        v-model="currentStep"
        :items="stepperItems"
        color="primary"
        class="w-full"
      >
        <template #carga-plantilla>
          <CargaPlantillaSUIC :suic-id="suicId" @next-step="handleNextStep" />
        </template>
        
        <template #ejecutar-proceso>
          <ExplosionarSUIC :suic-id="suicId" />
        </template>

        <template #ejecutar-rpa>
          <EjecutarRPA :suic-id="suicId" />
        </template>
      </UStepper>

      <!-- Botones de navegación -->
      <div class="flex items-center justify-between mt-6 pt-6 border-t border-cyan-200/30 dark:border-cyan-700/30">
        <!-- Botón Anterior -->
        <button
          @click="irAPasoAnterior"
          :disabled="currentStep === 0"
          class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          Anterior
        </button>

        <!-- Indicador de pasos -->
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Paso {{ currentStep + 1 }} de {{ stepperItems.length }}
          </span>
        </div>

        <!-- Botón Siguiente -->
        <button
          @click="irAPasoSiguiente"
          :disabled="currentStep === stepperItems.length - 1"
          class="rounded-md inline-flex items-center px-6 py-3 text-base gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Siguiente
          <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import CargaPlantillaSUIC from "~/components/suic/CargaPlantillaSUIC.vue";
import ExplosionarSUIC from "~/components/suic/ExplosionarSUIC.vue";
import EjecutarRPA from "~/components/suic/EjecutarRPA.vue";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: ["ADMINISTRAR-SUIC", "ADMIN"],
});

// Cliente de Amplify
const client = generateClient();

// Obtener ID de la ruta
const route = useRoute();
const suicId = route.params.id;

// Meta tags para SEO
useSeoMeta({
  title: "Ver Carga SUIC - Portal Diveco",
  description: "Visualizar detalles de carga SUIC",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "SUIC", href: "/tools/suic" },
  { title: "Ver Detalles" },
]);

// Estado reactivo
const loading = ref(true);
const suic = ref(null);

// Stepper
const stepperItems = ref([
  {
    slot: "carga-plantilla",
    title: "Carga de Plantilla SUIC",
    icon: "i-heroicons-document-arrow-up",
  },
  {
    slot: "ejecutar-proceso",
    title: "Generar SUIC",
    icon: "i-heroicons-cog",
  },
  {
    slot: "ejecutar-rpa",
    title: "Ejecutar RPA",
    icon: "i-heroicons-cpu-chip",
  },
]);

const currentStep = ref(0);
const mainStepper = ref();

// Métodos
const fetchSuic = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.SUIC.get({ id: suicId });

    if (data) {
      suic.value = data;
    }
  } catch (error) {
    console.error("Error al cargar SUIC:", error);
    suic.value = null;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "No disponible";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Manejar siguiente paso
const handleNextStep = () => {
  if (mainStepper.value) {
    // Avanzar al siguiente paso
    currentStep.value = 1;
    console.log('✅ Avanzando al paso de Generar SUIC');
  }
};

// Navegar al paso anterior
const irAPasoAnterior = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    console.log(`⬅️ Navegando al paso ${currentStep.value}`);
  }
};

// Navegar al paso siguiente
const irAPasoSiguiente = () => {
  if (currentStep.value < stepperItems.value.length - 1) {
    currentStep.value++;
    console.log(`➡️ Navegando al paso ${currentStep.value}`);
  }
};

// Lifecycle
onMounted(() => {
  fetchSuic();
});
</script>
