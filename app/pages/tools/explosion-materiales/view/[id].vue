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

                <UButton
                  v-if="hasSavedData"
                  icon="i-heroicons-plus"
                  size="sm"
                  color="cyan"
                  @click="showCargaProcess = !showCargaProcess"
                >
                  {{ showCargaProcess ? 'Ver Datos' : 'Cargar Más' }}
                </UButton>
              </div>
            </div>

            <!-- Mostrar datos guardados si existen, sino mostrar proceso de carga -->
            <CargaInsumosDataView
              v-if="hasSavedData && !showCargaProcess"
              :document-id="explosion?.id"
              :explosion-id="explosionId"
            />

            <CargaInsumosProcess
              v-if="!hasSavedData || showCargaProcess"
              :explosion="explosion"
              @carga-insumos-completed="handleBoomProcessCompleted"
            />
          </div>
        </template>

        <template #generar-plan-de-produccion>
          <div
            class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <!-- Header del proceso -->
            <div class="text-center mb-8">
              <div
                :class="[
                  'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative transition-all duration-500',
                  completedSteps['generar-plan-de-produccion']
                    ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
                    : 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30'
                ]"
              >
                <UIcon
                  name="i-heroicons-beaker"
                  :class="[
                    'w-10 h-10 transition-all duration-500',
                    completedSteps['generar-plan-de-produccion']
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-cyan-600 dark:text-cyan-400'
                  ]"
                />
                <div v-if="completedSteps['generar-plan-de-produccion']" class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <UIcon name="i-heroicons-check" class="w-4 h-4 text-white" />
                </div>
              </div>
              <h3
                :class="[
                  'text-2xl font-bold mb-2 transition-all duration-500',
                  completedSteps['generar-plan-de-produccion']
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-900 dark:text-white'
                ]"
              >
                Generar Plan de Producción
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Ejecutar procesos necesarios para generar el plan de producción
              </p>
            </div>

            <!-- Lista de procesos -->
            <div class="space-y-4 mb-8">
              <div
                v-for="proceso in procesosProduccion"
                :key="proceso.id"
                :class="[
                  'flex items-center justify-between p-4 rounded-lg border transition-all duration-300',
                  getProcesoStatusClass(proceso.status)
                ]"
              >
                <div class="flex items-center space-x-3">
                  <!-- Icono de estado -->
                  <div
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                      getProcesoIconClass(proceso.status)
                    ]"
                  >
                    <UIcon
                      :name="getProcesoIcon(proceso.status)"
                      class="w-4 h-4"
                    />
                  </div>

                  <!-- Información del proceso -->
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">
                      {{ proceso.nombre }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ proceso.descripcion }}
                    </p>
                  </div>
                </div>

                <!-- Estado y duración -->
                <div class="text-right">
                  <div
                    :class="[
                      'text-sm font-medium mb-1',
                      getProcesoTextClass(proceso.status)
                    ]"
                  >
                    {{ getProcesoStatusLabel(proceso.status) }}
                  </div>
                  <div v-if="proceso.duracion" class="text-xs text-gray-400">
                    {{ proceso.duracion }}
                  </div>
                  <!-- Spinner para procesos en ejecución -->
                  <div
                    v-if="proceso.status === 'ejecutando'"
                    class="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mt-1 ml-auto"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Botón de acción principal -->
            <div class="text-center">
              <UButton
                v-if="!planProduccionIniciado && !completedSteps['generar-plan-de-produccion']"
                icon="i-heroicons-play"
                size="lg"
                color="cyan"
                class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
                @click="iniciarPlanProduccion"
              >
                Iniciar Procesos
              </UButton>

              <div v-else-if="planProduccionIniciado && !completedSteps['generar-plan-de-produccion']" class="text-center">
                <div class="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="text-gray-600 dark:text-gray-300">
                  Ejecutando procesos...
                </p>
              </div>

              <div v-else class="flex items-center justify-center">
                <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                  <UIcon name="i-heroicons-check" class="w-8 h-8 text-white" />
                </div>
                <div class="ml-4 text-left">
                  <p class="text-lg font-semibold text-green-600 dark:text-green-400">
                    Plan de Producción Generado
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Todos los procesos completados exitosamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #validacion-de-aprovisionamiento>
          <div
            class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
                                      <div class="text-center py-12">
               <div
                 :class="[
                   'w-32 h-32 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg relative transition-all duration-500',
                   completedSteps['validacion-de-aprovisionamiento']
                     ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
                     : 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30'
                 ]"
               >
                 <UIcon
                   name="i-heroicons-shield-check"
                   :class="[
                     'w-16 h-16 transition-all duration-500',
                     completedSteps['validacion-de-aprovisionamiento']
                       ? 'text-green-600 dark:text-green-400'
                       : 'text-cyan-600 dark:text-cyan-400'
                   ]"
                 />
                 <div v-if="completedSteps['validacion-de-aprovisionamiento']" class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                   <UIcon name="i-heroicons-check" class="w-5 h-5 text-white" />
                 </div>
               </div>
               <h3
                 :class="[
                   'text-2xl font-bold mb-8 transition-all duration-500',
                   completedSteps['validacion-de-aprovisionamiento']
                     ? 'text-green-600 dark:text-green-400'
                     : 'text-gray-900 dark:text-white'
                 ]"
               >
                 Validación de Aprovisionamiento
               </h3>
                              <UButton
                 v-if="!completedSteps['validacion-de-aprovisionamiento']"
                 icon="i-heroicons-check"
                 size="lg"
                 color="cyan"
                 class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
                 @click="completeValidacionAprovisionamiento"
               >
                 Validar Aprovisionamiento
               </UButton>
               <div v-else class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                 <UIcon name="i-heroicons-check" class="w-8 h-8 text-white" />
               </div>
            </div>
          </div>
        </template>

        <template #explocionar>
          <div
            class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
                                      <div class="text-center py-12">
               <div
                 :class="[
                   'w-32 h-32 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg relative transition-all duration-500',
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
               <h3
                 :class="[
                   'text-2xl font-bold mb-8 transition-all duration-500',
                   completedSteps['explocionar']
                     ? 'text-green-600 dark:text-green-400'
                     : 'text-gray-900 dark:text-white'
                 ]"
               >
                 Explosión de Materiales
               </h3>
                              <UButton
                 v-if="!completedSteps['explocionar']"
                 icon="i-heroicons-bolt"
                 size="lg"
                 color="cyan"
                 class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
                 @click="completeExplosion"
               >
                 Ejecutar Explosión
               </UButton>
               <div v-else class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                 <UIcon name="i-heroicons-check" class="w-8 h-8 text-white" />
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

// Estado para el plan de producción
const planProduccionIniciado = ref(false);
const procesosProduccion = ref([
  {
    id: 'sincronizar-maestros',
    nombre: 'Sincronizar Maestros',
    descripcion: 'Sincronización de datos maestros del sistema',
    status: 'pendiente', // pendiente, ejecutando, completado, error
    duracion: null,
    inicioTiempo: null,
    finTiempo: null
  },
  {
    id: 'sincronizar-plan-ventas',
    nombre: 'Sincronizar Plan de Ventas',
    descripcion: 'Sincronización del plan de ventas actual',
    status: 'pendiente',
    duracion: null,
    inicioTiempo: null,
    finTiempo: null
  },
  {
    id: 'calcular-plan-demanda',
    nombre: 'Calcular Plan Demanda',
    descripcion: 'Cálculo del plan de demanda basado en datos sincronizados',
    status: 'pendiente',
    duracion: null,
    inicioTiempo: null,
    finTiempo: null
  }
]);

// Métodos
const fetchExplosion = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.Boom.get({ id: explosionId });
    explosion.value = data;

    // Verificar si hay datos guardados para esta explosión
    await checkForSavedData();
  } catch (error) {
    console.error("Error al cargar explosión:", error);
    explosion.value = null;
  } finally {
    loading.value = false;
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

    // El primer paso siempre está disponible
    if (index === 0) {
      disabled = false;
    }
    // Los siguientes pasos dependen del anterior
    else if (index === 1) {
      disabled = !completedSteps.value['carga-de-insumos'];
    }
    else if (index === 2) {
      disabled = !completedSteps.value['generar-plan-de-produccion'];
    }
    else if (index === 3) {
      disabled = !completedSteps.value['validacion-de-aprovisionamiento'];
    }

    return {
      ...item,
      disabled
    };
  });
});

// Métodos para manejar los procesos de producción
const iniciarPlanProduccion = async () => {
  planProduccionIniciado.value = true;

  // Ejecutar procesos secuencialmente
  await ejecutarProceso('sincronizar-maestros');
  await ejecutarProceso('sincronizar-plan-ventas');
  await ejecutarProceso('calcular-plan-demanda');

  // Marcar como completado
  completedSteps.value['generar-plan-de-produccion'] = true;

  // Avanzar al siguiente paso
  await completePlanProduccion();
};

const ejecutarProceso = async (procesoId) => {
  const proceso = procesosProduccion.value.find(p => p.id === procesoId);
  if (!proceso) return;

  // Marcar como ejecutando
  proceso.status = 'ejecutando';
  proceso.inicioTiempo = new Date();

  try {
    // Simular tiempo de ejecución (en producción aquí iría la llamada real al API)
    const tiempoEjecucion = Math.random() * 3000 + 2000; // Entre 2-5 segundos
    await new Promise(resolve => setTimeout(resolve, tiempoEjecucion));

    // Marcar como completado
    proceso.status = 'completado';
    proceso.finTiempo = new Date();
    proceso.duracion = calcularDuracion(proceso.inicioTiempo, proceso.finTiempo);

    useToast().add({
      title: "Proceso completado",
      description: `${proceso.nombre} ejecutado exitosamente`,
      color: "green",
      timeout: 2000
    });
  } catch (error) {
    // Marcar como error
    proceso.status = 'error';
    proceso.finTiempo = new Date();

    useToast().add({
      title: "Error en proceso",
      description: `Error al ejecutar ${proceso.nombre}`,
      color: "red",
      timeout: 3000
    });

    console.error(`Error en proceso ${procesoId}:`, error);
  }
};

const calcularDuracion = (inicio, fin) => {
  const diferencia = fin - inicio;
  const segundos = Math.floor(diferencia / 1000);

  if (segundos < 60) {
    return `${segundos}s`;
  } else {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}m ${segundosRestantes}s`;
  }
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

const completeValidacionAprovisionamiento = async () => {
  completedSteps.value['validacion-de-aprovisionamiento'] = true;

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
    title: "Validación completada",
    description: "La validación de aprovisionamiento se ha completado exitosamente",
    color: "green",
    timeout: 3000
  });
};

const completeExplosion = () => {
  completedSteps.value['explocionar'] = true;

  useToast().add({
    title: "Explosión completada",
    description: "La explosión de materiales se ha ejecutado exitosamente",
    color: "green",
    timeout: 3000
  });
};

// Métodos para manejar estilos y estados de los procesos
const getProcesoStatusClass = (status) => {
  const statusClasses = {
    'pendiente': 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600',
    'ejecutando': 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700/50',
    'completado': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50',
    'error': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50'
  };
  return statusClasses[status] || statusClasses['pendiente'];
};

const getProcesoIconClass = (status) => {
  const iconClasses = {
    'pendiente': 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300',
    'ejecutando': 'bg-cyan-200 dark:bg-cyan-700 text-cyan-700 dark:text-cyan-300',
    'completado': 'bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-300',
    'error': 'bg-red-200 dark:bg-red-700 text-red-700 dark:text-red-300'
  };
  return iconClasses[status] || iconClasses['pendiente'];
};

const getProcesoIcon = (status) => {
  const icons = {
    'pendiente': 'i-heroicons-clock',
    'ejecutando': 'i-heroicons-arrow-path',
    'completado': 'i-heroicons-check',
    'error': 'i-heroicons-x-mark'
  };
  return icons[status] || icons['pendiente'];
};

const getProcesoTextClass = (status) => {
  const textClasses = {
    'pendiente': 'text-gray-600 dark:text-gray-400',
    'ejecutando': 'text-cyan-600 dark:text-cyan-400',
    'completado': 'text-green-600 dark:text-green-400',
    'error': 'text-red-600 dark:text-red-400'
  };
  return textClasses[status] || textClasses['pendiente'];
};

const getProcesoStatusLabel = (status) => {
  const labels = {
    'pendiente': 'Pendiente',
    'ejecutando': 'Ejecutando...',
    'completado': 'Completado',
    'error': 'Error'
  };
  return labels[status] || 'Desconocido';
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

// Cargar datos al montar el componente
onMounted(() => {
  fetchExplosion();
});
</script>
