<template>
  <div class="" id="suic-detail-view">
    <!-- Header de la página integrado -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            id="suic-header-title"
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
                <p
                  id="suic-type-badge"
                  class="text-xs bg-cyan-500 text-white px-2 py-1 rounded-full dark:text-gray-300"
                >
                  {{ suic?.type }}
                </p>
               </div>
            </div>
          </h1>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center space-x-3" id="suic-header-actions">
          <button
            id="suic-tour-trigger"
            type="button"
            :disabled="loading"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            @click="startTour"
          >
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
            Tour
          </button>

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
    <div
      id="suic-stepper-container"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 
                bg-cyan-50/40 dark:bg-gray-800/80 backdrop-blur-sm rounded-md 
                shadow-xl border border-cyan-200/50 dark:border-cyan-700/50"
    >
      <UStepper
        ref="mainStepper"
        v-model="currentStep"
        :items="stepperItems"
        color="primary"
        class="w-full"
        id="suic-main-stepper"
      >
        <template #carga-plantilla>
          <div id="step-carga-plantilla">
            <CargaPlantillaSUIC :suic-id="suicId" @next-step="handleNextStep" />
          </div>
        </template>
        
        <template #ejecutar-proceso>
          <div id="step-ejecutar-proceso">
            <ExplosionarSUIC :suic-id="suicId" />
          </div>
        </template>

        <template #ejecutar-rpa>
          <div id="step-ejecutar-rpa">
            <EjecutarRPA :suic-id="suicId" />
          </div>
        </template>
      </UStepper>

      <!-- Botones de navegación -->
      <div class="flex items-center justify-between mt-6 pt-6 border-t border-cyan-200/30 dark:border-cyan-700/30">
        <!-- Botón Anterior -->
        <button
          @click="irAPasoAnterior"
          :disabled="!canGoBackward"
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
          :disabled="!canGoForward"
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
import { nextTick } from "vue";
import { generateClient } from "aws-amplify/data";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { createDefaultSuicFlowState, parseSuicFlowState, serializeSuicFlowState, computeSuggestedSuicStep, canAccessSuicStep } from "~/composables/useSuicFlowState";
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

const toast = useToast();
const flowState = ref(createDefaultSuicFlowState());
let suppressStepGuard = false;
let suicSubscription = null;

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
    title: "Guardar",
    icon: "i-heroicons-cpu-chip",
  },
]);

const currentStep = ref(0);
const manualOverride = ref(false);
const setCurrentStepSafely = (value, options = {}) => {
  const { manual = false } = options;
  suppressStepGuard = true;
  currentStep.value = value;
  manualOverride.value = manual;
  nextTick(() => {
    suppressStepGuard = false;
  });
};

const mainStepper = ref();
const driverObj = ref(null);

watch(
  () => flowState.value,
  (state) => {
    // Si el usuario está en modo revisión manual, solo forzar si pierde acceso
    if (manualOverride.value) {
      if (!canAccessSuicStep(state, currentStep.value)) {
        const suggestedStep = computeSuggestedSuicStep(state);
        setCurrentStepSafely(suggestedStep, { manual: false });
      }
      return;
    }

    // Comportamiento normal: auto-avanzar si hay nuevo paso disponible
    const suggestedStep = computeSuggestedSuicStep(state);
    const forceAccess = !canAccessSuicStep(state, currentStep.value);
    const autoAdvance = suggestedStep > currentStep.value;

    if (forceAccess || autoAdvance) {
      setCurrentStepSafely(suggestedStep, { manual: false });
    }
  },
  { deep: true }
);

watch(
  () => currentStep.value,
  async (next, prev) => {
    if (suppressStepGuard) {
      return;
    }

    if (next < prev) {
      manualOverride.value = true;
    } else if (next > prev) {
      manualOverride.value = false;
    }

    if (!canAccessSuicStep(flowState.value, next)) {
      await nextTick();
      setCurrentStepSafely(prev, { manual: false });

      toast.add({
        title: "Paso bloqueado",
        description: "Completa el paso anterior antes de continuar.",
        color: "yellow",
      });
    }
  }
);

const startSuicSubscription = () => {
  if (suicSubscription) {
    return;
  }

  suicSubscription = client.models.SUIC.onUpdate({
    filter: { id: { eq: suicId } }
  }).subscribe({
    next: (data) => {
      const updatedFlowState = parseSuicFlowState(data?.flowState);
      flowState.value = updatedFlowState;

      // Si el usuario está revisando manualmente, no auto-reposicionar
      if (manualOverride.value) {
        // Solo forzar si el paso actual ya no es accesible
        if (!canAccessSuicStep(updatedFlowState, currentStep.value)) {
          const suggestedStep = computeSuggestedSuicStep(updatedFlowState);
          setCurrentStepSafely(suggestedStep, { manual: false });
        }
        suic.value = data;
        return;
      }

      const remoteStepRaw =
        typeof data?.currentStep === "number"
          ? data.currentStep
          : computeSuggestedSuicStep(updatedFlowState);

      const remoteStep = Math.min(
        Math.max(remoteStepRaw, 0),
        stepperItems.value.length - 1
      );

      if (
        remoteStep > currentStep.value ||
        !canAccessSuicStep(updatedFlowState, currentStep.value)
      ) {
        setCurrentStepSafely(remoteStep, { manual: false });
      }

      suic.value = data;
    },
    error: (error) => {
      console.error("❌ Error en suscripción de SUIC:", error);
    }
  });
};

const stopSuicSubscription = () => {
  if (suicSubscription && typeof suicSubscription.unsubscribe === "function") {
    suicSubscription.unsubscribe();
  }
  suicSubscription = null;
};

// Métodos
const fetchSuic = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.SUIC.get({ id: suicId });

    if (data) {
      suic.value = data;
      const normalizedFlowState = parseSuicFlowState(data.flowState);
      flowState.value = normalizedFlowState;

      const suggestedStepRaw =
        typeof data.currentStep === "number"
          ? data.currentStep
          : computeSuggestedSuicStep(normalizedFlowState);

      const suggestedStep = Math.min(
        Math.max(suggestedStepRaw, 0),
        stepperItems.value.length - 1
      );

      if (!data.flowState) {
        await client.models.SUIC.update({
          id: suicId,
          flowState: serializeSuicFlowState(normalizedFlowState),
          currentStep: suggestedStep,
        });
      }

      if (
        suggestedStep > currentStep.value ||
        !canAccessSuicStep(normalizedFlowState, currentStep.value)
      ) {
        setCurrentStepSafely(suggestedStep, { manual: false });
      }
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
const handleNextStep = async () => {
  await fetchSuic();
  const suggestedStep = computeSuggestedSuicStep(flowState.value);

  if (suggestedStep > currentStep.value) {
    setCurrentStepSafely(suggestedStep, { manual: false });
    return;
  }

  if (currentStep.value < 1) {
    setCurrentStepSafely(1, { manual: false });
  }
};

const irAPasoAnterior = () => {
  const previousStep = currentStep.value - 1;
  if (previousStep >= 0) {
    setCurrentStepSafely(previousStep, { manual: true });
    console.log(`⬅️ Navegando al paso ${previousStep}`);
  }
};

const irAPasoSiguiente = () => {
  const nextStep = currentStep.value + 1;

  if (nextStep >= stepperItems.value.length) {
    return;
  }

  if (!canAccessSuicStep(flowState.value, nextStep)) {
    toast.add({
      title: "Paso bloqueado",
      description: "Completa el paso anterior antes de continuar.",
      color: "yellow",
    });
    return;
  }

  setCurrentStepSafely(nextStep, { manual: false });
  console.log(`➡️ Navegando al paso ${nextStep}`);
};

const canGoBackward = computed(() => currentStep.value > 0);
const canGoForward = computed(() => {
  const nextStep = currentStep.value + 1;
  if (nextStep >= stepperItems.value.length) {
    return false;
  }

  if (nextStep === 1) {
    return flowState.value.step1.status === "completed";
  }

  if (nextStep === 2) {
    return flowState.value.step2.status === "completed";
  }

  return false;
});

const initializeTour = () => {
  if (driverObj.value) {
    driverObj.value.destroy();
  }

  driverObj.value = driver({
    showProgress: true,
    popoverClass: "driver-popover-custom",
    allowClose: true,
    steps: [
      {
        element: "#suic-header-title",
        popover: {
          title: "👋 Bienvenido",
          description:
            "Aquí verás el resumen principal de la carga SUIC seleccionada, incluyendo su descripción y tipo.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#suic-type-badge",
        popover: {
          title: "🏷️ Tipo de carga",
          description:
            "Este badge indica el tipo o categoría de la carga SUIC que estás revisando.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#suic-header-actions",
        popover: {
          title: "🧭 Acciones principales",
          description:
            "Desde aquí puedes editar la carga, regresar al listado o reiniciar este tour cuando lo necesites.",
          side: "left",
          align: "center",
        },
      },
      {
        element: "#suic-main-stepper",
        popover: {
          title: "🪜 Flujo guiado",
          description:
            "El proceso SUIC se divide en tres pasos. Cada uno se habilita al completar el anterior para guiarte de forma ordenada.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#step-carga-plantilla",
        popover: {
          title: "📤 Paso 1: Carga de Plantilla",
          description:
            "Carga la plantilla SUIC y valida que los datos sean correctos antes de continuar.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#step-ejecutar-proceso",
        popover: {
          title: "⚙️ Paso 2: Generar SUIC",
          description:
            "Ejecuta el proceso automático que genera la información necesaria con base en la plantilla cargada.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#step-ejecutar-rpa",
        popover: {
          title: "🤖 Paso 3: Guardar con RPA",
          description:
            "Finaliza guardando los datos en los sistemas correspondientes mediante la automatización RPA.",
          side: "top",
          align: "center",
        },
      },
      {
        popover: {
          title: "🎉 Tour completado",
          description:
            "¡Listo! Ya conoces las acciones principales y el flujo completo para trabajar una carga SUIC.",
          side: "center",
        },
      },
    ],
  });
};

const startTour = () => {
  if (loading.value) {
    return;
  }

  if (!driverObj.value) {
    initializeTour();
  }

  driverObj.value?.drive();
};

// Lifecycle
onMounted(() => {
  fetchSuic();
  startSuicSubscription();
});

onBeforeUnmount(() => {
  stopSuicSubscription();
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
