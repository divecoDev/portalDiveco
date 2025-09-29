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
          <NuxtLink :to="`/tools/explosion-materiales/edit/${explosionId}`">
            <UButton
              icon="i-heroicons-pencil"
              size="lg"
              color="blue"
              variant="outline"
              class="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
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
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
            >
              Volver al Listado
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 bg-cyan-50/40 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
    >
      <UStepper
        v-if="availableSteps.length > 0"
        ref="mainStepper"
        v-model="currentMainStep"
        :items="availableSteps"
        color="primary"
        class="w-full"
      >

        <template #carga-de-insumos>
          <div class="relative">
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
              />

              <CargaInsumosProcess
                v-if="(!hasSavedData || showCargaProcess) && !checkingSavedData"
                :explosion="explosion"
                @carga-insumos-completed="handleBoomProcessCompleted"
              />
            </div>
          </div>
        </template>

        <template #generar-plan-de-produccion>
          <div class="relative">
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
          <ValidacionAprovisionamiento
            :is-completed="completedSteps['validacion-de-aprovisionamiento']"
            :explosion-id="explosionId"
            :boom-id="explosion?.id"
            @validation-completed="handleValidacionAprovisionamientoCompleted"
          />
        </template>

        <template #explocionar>
          <div
            class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="text-center py-8">
              <!-- Icono principal -->
              <div
                :class="[
                  'w-32 h-32 rounded-md flex items-center justify-center mx-auto mb-6 shadow-lg relative transition-all duration-500',
                  completedSteps['explocionar']
                    ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
                    : 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30'
                ]"
              >
                <UIcon
                  name="i-heroicons-bolt"
                  :class="[
                    'w-16 h-16 transition-all duration-500',
                    completedSteps['explocionar']
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-cyan-600 dark:text-cyan-400'
                  ]"
                />
                <div v-if="completedSteps['explocionar']" class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <UIcon name="i-heroicons-check" class="w-5 h-5 text-white" />
                </div>
              </div>

              <!-- Botón de ejecución o estado completado -->
              <div v-if="!completedSteps['explocionar']">
                <UButton
                  icon="i-heroicons-bolt"
                  size="lg"
                  color="cyan"
                  class="rounded-md inline-flex items-center px-8 py-4 text-base gap-3 shadow-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0 cursor-pointer"
                  @click="confirmAndExecuteExplosion"
                >
                  <UIcon name="i-heroicons-rocket-launch" class="w-6 h-6" />
                  Ejecutar Explosión
                </UButton>
              </div>

              <!-- Estado completado -->
              <div v-else class="space-y-4">
                <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-pulse mx-auto">
                  <UIcon name="i-heroicons-check" class="w-10 h-10 text-white" />
                </div>
                
                <div class="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700/50 max-w-md mx-auto">
                  <h4 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                    ¡Explosión Completada!
                  </h4>
                  <p class="text-sm text-green-600 dark:text-green-400">
                    La explosión de materiales se ha ejecutado exitosamente. Los resultados están disponibles para descarga.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UStepper>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import { useCargaInsumosData } from "~/composables/useCargaInsumosData";
import CargaInsumosDataView from "~/components/CargaInsumosDataView.vue";
import PlanProduccionProcess from "~/components/boom/PlanProduccionProcess.vue";
import ValidacionAprovisionamiento from "~/components/boom/ValidacionAprovisionamiento.vue";

// Cliente de Amplify
const client = generateClient();

// Composable para consultar datos de carga de insumos
const { getSummary, hasData } = useCargaInsumosData();

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

// Computed para verificar si hay datos guardados
const hasSavedData = computed(() => {
  return completedSteps.value['carga-de-insumos'] && hasData.value;
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

    // Intentar obtener un resumen para ver si hay datos
    const response = await getSummary();

    if (response.success && response.summary && response.summary.totalRecords > 0) {
      console.log('✅ Se encontraron datos guardados:', response.summary);
      console.log('📊 Resumen de datos:', {
        totalDocuments: response.summary.totalDocuments,
        totalRecords: response.summary.totalRecords,
        types: response.summary.types
      });
      // Si hay datos, marcar como completado el primer paso
      completedSteps.value['carga-de-insumos'] = true;
    } else {
      console.log('📭 No se encontraron datos guardados');
      console.log('🔍 Respuesta recibida:', response);
    }
  } catch (error) {
    console.error('❌ Error verificando datos guardados:', error);
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

const confirmAndExecuteExplosion = () => {
  // Mostrar confirmación antes de ejecutar
  if (confirm(
    "¿Está seguro de que desea ejecutar la explosión final de materiales?\n\n" +
    "Este proceso procesará todos los datos y generará los resultados finales. " +
    "Esta acción no se puede deshacer una vez iniciada."
  )) {
    executeExplosion();
  }
};

const executeExplosion = async () => {
  try {
    // Simular proceso de explosión (en producción aquí se llamaría a la API)
    const loadingToast = useToast().add({
      title: "Ejecutando explosión...",
      description: "Procesando datos y generando resultados. Esto puede tomar varios minutos.",
      color: "blue",
      timeout: 0 // No se cierra automáticamente
    });

    // Simular delay del proceso
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Marcar como completado
    completedSteps.value['explocionar'] = true;

    // Cerrar toast de carga
    useToast().remove(loadingToast.id);

    // Mostrar notificación de éxito
    useToast().add({
      title: "¡Explosión completada!",
      description: "La explosión de materiales se ha ejecutado exitosamente. Los resultados están listos.",
      color: "green",
      timeout: 5000
    });

  } catch (error) {
    console.error("Error ejecutando explosión:", error);
    
    useToast().add({
      title: "Error en explosión",
      description: "Ocurrió un error durante la ejecución de la explosión de materiales",
      color: "red",
      timeout: 4000
    });
  }
};

// Método legacy para compatibilidad
const completeExplosion = confirmAndExecuteExplosion;


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

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchExplosion();
  // Verificar estados de procesos después de cargar la explosión
  await checkProcessStates();
});
</script>
