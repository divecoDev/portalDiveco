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
            {{ explosion?.version || "" }}
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            {{ explosion?.descripcion || "" }}
          </p>
        </div>

        <!-- Botones de acción -->
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
            Tour General
          </UButton>

          <NuxtLink :to="`/tools/explosion-materiales/edit/${explosionId}`">
            <UButton
              icon="i-heroicons-pencil"
              size="lg"
              color="blue"
              variant="outline"
               class="bg-gradient-to-r from-gray-500 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Editar
            </UButton>
          </NuxtLink>

          <NuxtLink to="/tools/explosion-materiales">
            <UButton
              icon="i-heroicons-arrow-left"
              size="lg"
              color="gray"
              variant="outline"
               class="bg-gradient-to-r from-gray-500 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Volver al Listado
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      id="stepper-container"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 bg-cyan-50/40 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
    >

      <UStepper
        v-if="availableSteps.length > 0"
        ref="mainStepper"
        v-model="currentMainStep"
        :items="availableSteps"
        color="primary"
        class="w-full"
        id="main-stepper"
      >

        <template #carga-de-insumos>
          <div id="step-carga-insumos" class="relative">
            <!-- Spinner de carga mientras se verifica si hay datos guardados -->
            <div 
              v-if="checkingSavedData"
              class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center"
            >
              <div class="text-center">
                <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Verificando datos cargados...
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Comprobando si ya existen datos de carga de insumos
                </p>
              </div>
            </div>

            <div
              class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <!-- Header con controles -->
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-cyan-500/25"
                  >
                    <UIcon name="i-heroicons-circle-stack" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      Carga de Insumos
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      {{ hasSavedData ? 'Datos cargados y guardados' : 'Proceso de carga de datos' }}
                    </p>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex items-center space-x-3">
                  <UButton
                    v-if="hasSavedData"
                    icon="i-heroicons-arrow-path"
                    size="sm"
                    color="gray"
                    variant="outline"
                    @click="refreshSavedData"
                    :loading="checkingSavedData"
                  >
                    Actualizar
                  </UButton>
                </div>
              </div>

              <!-- Mostrar datos guardados si existen, sino mostrar proceso de carga -->
              <CargaInsumosDataView
                v-if="hasSavedData && !showCargaProcess && !checkingSavedData"
                :document-id="explosion?.id"
                :explosion-id="explosionId"
                @reload-process="handleReloadProcess"
              />

              <CargaInsumosProcess
                v-if="(!hasSavedData || showCargaProcess) && !checkingSavedData"
                :explosion="explosion"
                :skip-load-existing-data="showCargaProcess"
                @carga-insumos-completed="handleBoomProcessCompleted"
              />
            </div>
          </div>
        </template>

        <template #generar-plan-de-produccion>
          <div id="step-plan-produccion" class="relative">
            <!-- Spinner de carga sobre el componente -->
            <div 
              v-if="loadingPlanProduccion"
              class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center"
            >
              <div class="text-center">
                <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Cargando estados de procesos...
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Verificando el estado actual de los procesos
                </p>
              </div>
            </div>

            <PlanProduccionProcess
              :explosion-id="explosionId"
              :boom-id="explosion?.id"
              :is-completed="completedSteps['generar-plan-de-produccion']"
              @plan-completed="handlePlanProduccionCompleted"
              :pversion="explosion?.version"
              @loading-state-changed="handlePlanProduccionLoadingStateChanged"
            />
          </div>
        </template>

        <template #validacion-de-aprovisionamiento>
          <div id="step-validacion-aprovisionamiento">
            <ValidacionAprovisionamiento
            :is-completed="completedSteps['validacion-de-aprovisionamiento']"
            :explosion-id="explosionId"
            :boom-id="explosion?.id"
            @validation-completed="handleValidacionAprovisionamientoCompleted"
          />
          </div>
        </template>

        <template #explocionar>
          <div id="step-explosionar">
            <ExplosionProcess
            :explosion-id="explosionId"
            :boom-id="explosion?.id"
            :pversion="explosion?.version"
            :is-completed="completedSteps['explocionar']"
            @explosion-completed="handleExplosionCompleted"
            @loading-state-changed="handleExplosionLoadingStateChanged"
          />
          </div>
        </template>
      </UStepper>
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
import { useCargaInsumosData } from "~/composables/useCargaInsumosData";
import CargaInsumosDataView from "~/components/CargaInsumosDataView.vue";
import PlanProduccionProcess from "~/components/boom/PlanProduccionProcess.vue";
import ValidacionAprovisionamiento from "~/components/boom/ValidacionAprovisionamiento.vue";
import ExplosionProcess from "~/components/boom/ExplosionProcess.vue";

// Cliente de Amplify
const client = generateClient();

// Composable para consultar datos de carga de insumos
const { getDataByDocument, hasData } = useCargaInsumosData();

const stepperItems = ref([
  {
    slot: "carga-de-insumos",
    title: "Carga de insumos",
    icon: "i-heroicons-circle-stack",
  },
  {
    slot: "generar-plan-de-produccion",
    title: "Generar plan de producción",
    icon: "i-heroicons-beaker",
  },
  {
    slot: "validacion-de-aprovisionamiento",
    title: "Validacion de Aprovisionamiento",
    icon: "i-heroicons-shield-check",
  },
  {
    slot: "explocionar",
    title: "Explocionar",
    icon: "i-heroicons-bolt",
  },
]);

// Obtener ID de la ruta
const route = useRoute();
const explosionId = route.params.id;

// Meta tags para SEO
useSeoMeta({
  title: "Ver Explosión de Materiales - Portal Diveco",
  description: "Visualizar detalles de explosión de materiales",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Ver Detalles" },
]);

// Estado reactivo
const loading = ref(true);
const explosion = ref(null);
const checkingSavedData = ref(false);
const showCargaProcess = ref(false);
const loadingPlanProduccion = ref(true); // Estado de carga del plan de producción
const boomHasSavedData = ref(false); // Estado específico para datos guardados de este boom

// Computed para verificar si hay datos guardados
const hasSavedData = computed(() => {
  return boomHasSavedData.value;
});

// Estado para el stepper principal
const currentMainStep = ref(0);
const mainStepper = ref();

// Computed para verificar si el stepper está listo
const isStepperReady = computed(() => {
  return mainStepper.value && typeof mainStepper.value.next === 'function';
});

// Estado para controlar qué pasos están completados
const completedSteps = ref({
  'carga-de-insumos': false,
  'generar-plan-de-produccion': false,
  'validacion-de-aprovisionamiento': false,
  'explocionar': false
});


// Métodos
const fetchExplosion = async () => {
  try {
    loading.value = true;
    checkingSavedData.value = true; // Iniciar verificación de datos guardados
    const { data } = await client.models.Boom.get({ id: explosionId });
    explosion.value = data;

    // Debugging logs para verificar el valor de version
    console.log('🔍 Parent Component Debugging - explosion data:', data);
    console.log('🔍 Parent Component Debugging - explosion.version:', data?.version);
    console.log('🔍 Parent Component Debugging - typeof version:', typeof data?.version);
    console.log('🔍 Parent Component Debugging - version length:', data?.version?.length);
    console.log('🔍 Parent Component Debugging - version isEmpty:', data?.version === '' || !data?.version);

    // Verificar si hay datos guardados para esta explosión
    await checkForSavedData();
  } catch (error) {
    console.error("Error al cargar explosión:", error);
    explosion.value = null;
  } finally {
    loading.value = false;
    // checkingSavedData se maneja en checkForSavedData
  }
};

const checkForSavedData = async () => {
  if (!explosion.value?.id) return;

  try {
    checkingSavedData.value = true;
    console.log('🔍 Verificando datos guardados para explosión:', explosion.value.id);

    // Consultar datos específicos para este boom usando el boom_id como document_id
    const response = await getDataByDocument(explosion.value.id);

    console.log('📊 Respuesta de consulta específica:', response);

    if (response.success && response.data && response.data.length > 0) {
      console.log('✅ Se encontraron datos guardados para este boom:', response.data.length, 'conjuntos');
      console.log('📊 Resumen específico:', response.summary);
      
      // Si hay datos específicos para este boom, marcar como completado
      boomHasSavedData.value = true;
      completedSteps.value['carga-de-insumos'] = true;
    } else {
      console.log('📭 No se encontraron datos guardados para este boom específico');
      console.log('🔍 Resumen específico:', response.summary);
      
      // No hay datos específicos para este boom
      boomHasSavedData.value = false;
      completedSteps.value['carga-de-insumos'] = false;
    }
  } catch (error) {
    console.error('❌ Error verificando datos guardados:', error);
    boomHasSavedData.value = false;
    completedSteps.value['carga-de-insumos'] = false;
  } finally {
    checkingSavedData.value = false;
  }
};

const refreshSavedData = async () => {
  await checkForSavedData();

  useToast().add({
    title: "Datos actualizados",
    description: "Los datos de carga de insumos se han actualizado",
    color: "green",
    timeout: 2000
  });
};

// Método para manejar la recarga del proceso de carga de insumos
const handleReloadProcess = async () => {
  console.log('🔄 Recargando proceso de carga de insumos');
  
  try {
    // Importar dinámicamente el store
    const { useCargaInsumosProcessStore } = await import('../stores/useCargaInsumosProcess');
    const cargaInsumosStore = useCargaInsumosProcessStore();
    
    // Limpiar todos los datos del store
    console.log('🧹 Limpiando datos previos del store...');
    cargaInsumosStore.clearAllData();
    
    // Restablecer el boom_id en el store para la nueva carga
    if (explosion.value?.id) {
      cargaInsumosStore.setBoomId(explosion.value.id);
      console.log(`🎯 Boom ID restablecido: ${explosion.value.id}`);
    }
    
    // Mostrar el componente de proceso en lugar de la vista de datos
    showCargaProcess.value = true;
    
    useToast().add({
      title: "Proceso reiniciado",
      description: "Los datos anteriores han sido limpiados. Puedes cargar nuevos archivos",
      color: "cyan",
      timeout: 3000
    });
    
    console.log('✅ Store limpiado y proceso de recarga iniciado');
  } catch (error) {
    console.error('❌ Error al limpiar datos del store:', error);
    
    // Aún así mostrar el proceso de carga
    showCargaProcess.value = true;
    
    useToast().add({
      title: "Recargando proceso",
      description: "Puedes cargar nuevos archivos para actualizar los datos",
      color: "cyan",
      timeout: 3000
    });
  }
};

// Función para verificar los estados de todos los procesos
const checkProcessStates = async () => {
  if (!explosion.value?.id) return;

  try {
    console.log('🔍 Verificando estados de procesos para explosión:', explosion.value.id);
    
    // Verificar estado del plan de producción
    await checkPlanProduccionState();
    
    // Verificar estado de validación de aprovisionamiento
    await checkValidacionAprovisionamientoState();
    
    console.log('✅ Estados de procesos verificados:', completedSteps.value);
  } catch (error) {
    console.error('❌ Error verificando estados de procesos:', error);
  }
};

// Función para verificar el estado del plan de producción
const checkPlanProduccionState = async () => {
  try {
    const { data } = await client.models.Boom.get({ id: explosion.value.id });
    if (!data) return;

    // Verificar si todos los procesos del plan de producción están completados
    const procesosConfig = {
      'sincronizar-insumos': 'SyncInsumosStatus',
      'sincronizar-plan-ventas': 'SyncSalesPlanStatus', 
      'calcular-plan-demanda': 'SyncDemandPlanStatus'
    };

    let todosCompletados = true;
    for (const [procesoId, statusField] of Object.entries(procesosConfig)) {
      const status = data[statusField];
      if (!status || !status.toString().toUpperCase().includes('COMPLETADO')) {
        todosCompletados = false;
        break;
      }
    }

    if (todosCompletados) {
      completedSteps.value['generar-plan-de-produccion'] = true;
      console.log('✅ Plan de producción marcado como completado');
    }
  } catch (error) {
    console.error('❌ Error verificando estado del plan de producción:', error);
  }
};

// Función para verificar el estado de validación de aprovisionamiento
const checkValidacionAprovisionamientoState = async () => {
  try {
    // Si el plan de producción está completado, permitir acceso a validación
    if (completedSteps.value['generar-plan-de-produccion']) {
      // Por ahora, marcamos como completado si el plan está listo
      // En el futuro, aquí se podría verificar si ya se realizó la validación
      completedSteps.value['validacion-de-aprovisionamiento'] = true;
      console.log('✅ Validación de aprovisionamiento habilitada');
    }
  } catch (error) {
    console.error('❌ Error verificando estado de validación:', error);
  }
};


// Computed para verificar si todos los procesos están completos
const allProcessesCompleted = computed(() => {
  return Object.values(completedSteps.value).every(completed => completed === true);
});

const deleteExplosion = async () => {
  if (
    confirm(
      "¿Estás seguro de que deseas eliminar esta explosión de materiales? Esta acción no se puede deshacer.",
    )
  ) {
    try {
      await client.models.Boom.delete({ id: explosionId });

      useToast().add({
        title: "Explosión eliminada",
        description: "La explosión de materiales se ha eliminado correctamente",
        color: "green",
      });

      // Redirigir al listado
      await navigateTo("/tools/explosion-materiales");
    } catch (error) {
      console.error("Error al eliminar explosión:", error);
      useToast().add({
        title: "Error",
        description: "No se pudo eliminar la explosión de materiales",
        color: "red",
      });
    }
  }
};


// Método para manejar cuando el proceso BOOM se completa
const handleBoomProcessCompleted = async () => {
  // Marcar el primer paso como completado
  completedSteps.value['carga-de-insumos'] = true;
  boomHasSavedData.value = true;
  
  // Ocultar el proceso de carga y volver a la vista de datos
  showCargaProcess.value = false;

  // Esperar a que el DOM se actualice
  await nextTick();

  // Avanzar al siguiente paso del stepper principal
  if (isStepperReady.value && mainStepper.value.hasNext) {
    try {
      mainStepper.value.next();
      // Scroll suave hacia el stepper
      setTimeout(() => {
        window.scrollTo({ top: 200, behavior: "smooth" });
      }, 100);

      // Mostrar notificación de éxito
      useToast().add({
        title: "Proceso completado",
        description: "Los datos se han guardado exitosamente. Continuando al siguiente paso...",
        color: "green",
        timeout: 4000
      });
    } catch (error) {
      console.warn("Error al avanzar stepper:", error);
    }
  }
};

// Computed para determinar qué pasos están disponibles
const availableSteps = computed(() => {
  return stepperItems.value.map((item, index) => {
    let disabled = false;
    let status = 'pending'; // pending, completed, current, disabled

    // Si todos los procesos están completos, permitir navegación libre
    if (allProcessesCompleted.value) {
      disabled = false;
      status = 'completed';
      return {
        ...item,
        disabled,
        status
      };
    }

    // El primer paso siempre está disponible
    if (index === 0) {
      disabled = false;
      status = completedSteps.value['carga-de-insumos'] ? 'completed' : 'current';
    }
    // Los siguientes pasos dependen del anterior
    else if (index === 1) {
      // Paso 2: Generar plan de producción
      disabled = !completedSteps.value['carga-de-insumos'];
      status = completedSteps.value['carga-de-insumos'] 
        ? (completedSteps.value['generar-plan-de-produccion'] ? 'completed' : 'current')
        : 'disabled';
    }
    else if (index === 2) {
      // Paso 3: Validación de aprovisionamiento
      disabled = !completedSteps.value['generar-plan-de-produccion'];
      status = completedSteps.value['generar-plan-de-produccion'] 
        ? (completedSteps.value['validacion-de-aprovisionamiento'] ? 'completed' : 'current')
        : 'disabled';
    }
    else if (index === 3) {
      // Paso 4: Explosionar
      disabled = !completedSteps.value['validacion-de-aprovisionamiento'];
      status = completedSteps.value['validacion-de-aprovisionamiento'] 
        ? (completedSteps.value['explocionar'] ? 'completed' : 'current')
        : 'disabled';
    }

    return {
      ...item,
      disabled,
      status
    };
  });
});

// Método para manejar cuando el plan de producción se completa
const handlePlanProduccionCompleted = async () => {
  // Marcar como completado
  completedSteps.value['generar-plan-de-produccion'] = true;

  // Avanzar al siguiente paso
  await completePlanProduccion();
};

// Método para manejar el cambio de estado de carga del plan de producción
const handlePlanProduccionLoadingStateChanged = (isLoading) => {
  loadingPlanProduccion.value = isLoading;
};

// Métodos para completar cada paso
const completePlanProduccion = async () => {
  completedSteps.value['generar-plan-de-produccion'] = true;

  // Esperar a que el DOM se actualice
  await nextTick();

  // Avanzar al siguiente paso si es posible
  if (isStepperReady.value && mainStepper.value.hasNext) {
    try {
      mainStepper.value.next();
      setTimeout(() => {
        window.scrollTo({ top: 200, behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.warn("Error al avanzar stepper:", error);
    }
  }

  useToast().add({
    title: "Plan generado",
    description: "El plan de producción se ha generado exitosamente",
    color: "green",
    timeout: 3000
  });
};

const handleValidacionAprovisionamientoCompleted = async () => {
  // Marcar como completado - el usuario ha tomado la decisión de proceder
  completedSteps.value['validacion-de-aprovisionamiento'] = true;

  // Esperar a que el DOM se actualice
  await nextTick();

  // Avanzar al siguiente paso (explosión) si es posible
  if (isStepperReady.value && mainStepper.value.hasNext) {
    try {
      mainStepper.value.next();
      
      // Scroll suave hacia el stepper
      setTimeout(() => {
        window.scrollTo({ top: 200, behavior: "smooth" });
      }, 100);

      // Mostrar notificación simple
      useToast().add({
        title: "Continuando",
        description: "Avanzando al paso final",
        color: "green",
        timeout: 2000
      });
    } catch (error) {
      console.warn("Error al avanzar stepper:", error);
    }
  }
};

// Método para manejar cuando el proceso de explosión se completa
const handleExplosionCompleted = async () => {
  // Marcar como completado
  completedSteps.value['explocionar'] = true;

  // Mostrar notificación de éxito
  useToast().add({
    title: "¡Proceso completado!",
    description: "La explosión de materiales se ha ejecutado exitosamente",
    color: "green",
    timeout: 4000
  });

  console.log('✅ Proceso de explosión completado');
};

// Método para manejar el cambio de estado de carga del proceso de explosión
const handleExplosionLoadingStateChanged = (isLoading) => {
  // Este método se puede usar para mostrar indicadores globales si es necesario
  console.log('🔄 Estado de carga del proceso de explosión:', isLoading);
};



const getStatusConfig = (status) => {
  const statusConfig = {
    ACTIVO: {
      color: "green",
      label: "Activo",
      icon: "i-heroicons-check-circle",
    },
    INACTIVO: {
      color: "red",
      label: "Inactivo",
      icon: "i-heroicons-x-circle",
    },
    EN_PROCESO: {
      color: "orange",
      label: "En Proceso",
      icon: "i-heroicons-clock",
    },
    COMPLETADO: {
      color: "blue",
      label: "Completado",
      icon: "i-heroicons-check-badge",
    },
  };
  return (
    statusConfig[status] || {
      color: "gray",
      label: status || "Sin estado",
      icon: "i-heroicons-question-mark-circle",
    }
  );
};

const formatDate = (date) => {
  if (!date) return "No disponible";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateCompact = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatRelativeDate = (date) => {
  if (!date) return "";

  const now = new Date();
  const targetDate = new Date(date);
  const diffInHours = Math.abs(now - targetDate) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return "Hace menos de una hora";
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  } else if (diffInHours < 168) {
    // 7 días
    const days = Math.floor(diffInHours / 24);
    return `Hace ${days} día${days > 1 ? "s" : ""}`;
  } else {
    const weeks = Math.floor(diffInHours / 168);
    return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  }
};

// Configuración del tour guiado
const driverObj = ref(null);

const initializeTour = () => {
  driverObj.value = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    popoverClass: 'driver-popover-custom',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Finalizar',
    steps: [
      {
        element: '#tour-trigger',
        popover: {
          title: '🎯 Tour General del Proceso',
          description: '¡Bienvenido! Este tour te mostrará los pasos generales del proceso de explosión de materiales.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#main-stepper',
        popover: {
          title: '📋 Proceso de 4 Pasos',
          description: 'El proceso completo consta de 4 pasos secuenciales que debes completar en orden.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#main-stepper .stepper-item:nth-child(1)',
        popover: {
          title: '📦 Paso 1: Carga de Insumos',
          description: 'Carga los documentos necesarios de acuerdo a las plantillas establecidas.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#main-stepper .stepper-item:nth-child(2)',
        popover: {
          title: '🏭 Paso 2: Generar Plan de Producción',
          description: 'Este paso ejecutarás los procesos de extracción y preparación de la información en base a los documentos que cargaste.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#main-stepper .stepper-item:nth-child(3)',
        popover: {
          title: '✅ Paso 3: Validación de Aprovisionamiento',
          description: 'Revisa que todos los materiales estén correctamente configurados y valida el plan de producción a explotar.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#main-stepper .stepper-item:nth-child(4)',
        popover: {
          title: '💥 Paso 4: Explosionar',
          description: 'Se ejecutará el proceso principal y podrás descargar la información resultante.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        popover: {
          title: '🎉 ¡Tour General Completado!',
          description: 'Ya conoces los 4 pasos principales. Cada paso se habilita al completar el anterior.',
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
onMounted(async () => {
  await fetchExplosion();
  // Verificar estados de procesos después de cargar la explosión
  await checkProcessStates();
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
