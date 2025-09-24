<template>
  <div
    class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <!-- Header del proceso -->
    <div class="text-center mb-8">
      <div
        :class="[
          'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative transition-all duration-500',
          isCompleted
            ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
            : 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30'
        ]"
      >
        <UIcon
          name="i-heroicons-beaker"
          :class="[
            'w-10 h-10 transition-all duration-500',
            isCompleted
              ? 'text-green-600 dark:text-green-400'
              : 'text-cyan-600 dark:text-cyan-400'
          ]"
        />
        <div v-if="isCompleted" class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <UIcon name="i-heroicons-check" class="w-4 h-4 text-white" />
        </div>
      </div>
      <h3
        :class="[
          'text-2xl font-bold mb-2 transition-all duration-500',
          isCompleted
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
          <!-- ID de ejecución del pipeline -->
          <div v-if="proceso.executionId" class="text-xs text-blue-600 dark:text-blue-400 font-mono">
            ID: {{ proceso.executionId }}
          </div>
          <!-- Spinner para procesos en ejecución -->
          <div
            v-if="proceso.status === 'ejecutando'"
            class="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mt-1 ml-auto"
          ></div>
          <!-- Botón para ejecutar proceso individual -->
          <UButton
            v-if="proceso.status === 'pendiente' || proceso.status === 'error'"
            icon="i-heroicons-play"
            size="sm"
            color="cyan"
            variant="ghost"
            class="mt-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            :disabled="proceso.status === 'ejecutando' || isCompleted"
            @click="runSingleProcess(proceso.id)"
          >
            Ejecutar
          </UButton>

          <!-- Botón para re-ejecutar desde completado -->
          <UButton
            v-else-if="proceso.status === 'completado'"
            icon="i-heroicons-arrow-path"
            size="sm"
            color="green"
            variant="ghost"
            class="mt-2 hover:bg-green-50 dark:hover:bg-green-900/20"
            @click="reEjecutarDesdeCompletado(proceso.id)"
          >
            Re-ejecutar
          </UButton>
        </div>
      </div>
    </div>

    <!-- Botón de acción principal -->
    <div class="text-center">
      <UButton
        v-if="!planProduccionIniciado && !isCompleted"
        icon="i-heroicons-play"
        size="lg"
        color="cyan"
        class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
        @click="iniciarPlanProduccion"
      >
        Iniciar Procesos
      </UButton>

      <div v-else-if="planProduccionIniciado && !isCompleted" class="text-center">
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

<script setup>
import { generateClient } from "aws-amplify/data";

// Cliente de Amplify
const client = generateClient();

// Props
const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false
  },
  explosionId: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['plan-completed']);

// Configuración centralizada de procesos
const procesosConfig = {
  'sincronizar-insumos': {
    nombre: 'Sincronizar Insumos',
    descripcion: 'Ejecución del pipeline de extracción de insumos',
    pipelineName: 'EjecutarExtraccionInsumos',
    boomFields: {
      runId: 'PiepelineRunIdInsumos',
      status: 'SyncInsumosStatus'
    },
    hasPipeline: true
  },
  'sincronizar-plan-ventas': {
    nombre: 'Sincronizar Plan de Ventas',
    descripcion: 'Sincronización del plan de ventas actual',
    pipelineName: 'EjecutarExtraccionInsumos', // Temporal: usar mismo pipeline
    boomFields: {
      runId: 'PiepelineRunIdPlanVentas',
      status: 'SyncSalesPlanStatus'
    },
    hasPipeline: true
  },
  'calcular-plan-demanda': {
    nombre: 'Calcular Plan Demanda',
    descripcion: 'Cálculo del plan de demanda basado en datos sincronizados',
    pipelineName: 'EjecutarExtraccionInsumos', // Temporal: usar mismo pipeline
    boomFields: {
      runId: 'PiepelineRunIdPlanDemandas',
      status: 'SyncDemandPlanStatus'
    },
    hasPipeline: true
  }
};

// Estado reactivo
const planProduccionIniciado = ref(false);
const pollingIntervals = ref({}); // Múltiples intervalos de polling
const procesosProduccion = ref([]);

// Inicializar procesos basándose en la configuración
const inicializarProcesos = () => {
  procesosProduccion.value = Object.entries(procesosConfig).map(([id, config]) => ({
    id,
    nombre: config.nombre,
    descripcion: config.descripcion,
    status: 'pendiente',
    duracion: null,
    inicioTiempo: null,
    finTiempo: null,
    executionId: null
  }));
};

// Inicializar procesos al montar el componente
inicializarProcesos();

// Métodos para manejar los procesos de producción
const iniciarPlanProduccion = async () => {
  planProduccionIniciado.value = true;

  // Ejecutar procesos secuencialmente
  await ejecutarProceso('sincronizar-insumos');
  await ejecutarProceso('sincronizar-plan-ventas');
  await ejecutarProceso('calcular-plan-demanda');

  // Emitir evento de completado
  emit('plan-completed');
};

const runSingleProcess = async (procesoId) => {
  const proceso = procesosProduccion.value.find(p => p.id === procesoId);
  if (!proceso || proceso.status === 'completado' || proceso.status === 'ejecutando') return;
  await ejecutarProceso(procesoId);
  checkAndEmitCompleted();
};

const ejecutarProceso = async (procesoId) => {
  const proceso = procesosProduccion.value.find(p => p.id === procesoId);
  if (!proceso) return;

  // Marcar como ejecutando
  proceso.status = 'ejecutando';
  proceso.inicioTiempo = new Date();

  try {
    const config = procesosConfig[procesoId];
    if (!config) {
      throw new Error(`Configuración no encontrada para el proceso: ${procesoId}`);
    }

    // Si el proceso tiene pipeline, ejecutarlo
    if (config.hasPipeline) {
      await ejecutarPipeline(proceso, config);
    } else {
      // Simular tiempo de ejecución para procesos sin pipeline
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
    }
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

const ejecutarPipeline = async (proceso, config) => {
  try {
    console.log(`🚀 Ejecutando pipeline ${config.pipelineName} para ${proceso.nombre}...`);

    // Llamar a la mutación runPipeline
    const { data } = await client.mutations.runPipeline({
      pipelineName: config.pipelineName
    });

    console.log('📋 Respuesta del pipeline:', data);

    // Posibles formatos devueltos por la API:
    // 1) data.runPipeline = string con JSON: '{"runId":"..."}'
    // 2) data.runPipeline = { runId: '...' }
    // 3) data = { runId: '...' }
    let runId = null;
    const raw = data?.runPipeline ?? data;

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        runId = parsed?.runId ?? null;
      } catch (e) {
        console.warn('No se pudo parsear runPipeline string:', e);
      }
    } else if (raw && typeof raw === 'object') {
      runId = raw?.runId ?? raw?.data?.runId ?? null;
    }

    if (runId) {
      proceso.executionId = runId;
      proceso.status = 'ejecutando'; // Mantener en ejecución; se finalizará por polling/evento externo

      // Persistir en Boom el runId y el estado "En Proceso" si hay explosionId
      try {
        if (props.explosionId) {
          const updateData = {
            id: props.explosionId,
            [config.boomFields.runId]: runId,
            [config.boomFields.status]: 'En Proceso'
          };

          await client.models.Boom.update(updateData);
          console.log(`📝 Boom actualizado con runId y estado En Proceso para ${proceso.nombre}`);
        } else {
          console.warn('explosionId no provisto; no se puede persistir runId en Boom');
        }
      } catch (persistErr) {
        console.warn('No se pudo actualizar Boom con el runId:', persistErr);
      }

      useToast().add({
        title: "Pipeline iniciado",
        description: `Pipeline ${proceso.nombre} iniciado. ID: ${runId}`,
        color: "blue",
        timeout: 3000
      });

      console.log(`✅ Pipeline iniciado con runId: ${runId}`);

      // Consultar el estado del pipeline después de iniciarlo
      await consultarEstadoPipeline(runId, proceso.id);
    } else {
      throw new Error('No se recibió runId válido del pipeline');
    }
  } catch (error) {
    console.error(`❌ Error ejecutando pipeline ${config.pipelineName}:`, error);
    throw error;
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

const checkAndEmitCompleted = () => {
  const allCompleted = procesosProduccion.value.every(p => p.status === 'completado');
  if (allCompleted) emit('plan-completed');
};

// Cargar estado inicial desde Boom para reflejar ejecución en curso
onMounted(async () => {
  try {
    if (!props.explosionId) return;
    const { data } = await client.models.Boom.get({ id: props.explosionId });
    if (!data) return;

    // Verificar cada proceso configurado
    for (const [procesoId, config] of Object.entries(procesosConfig)) {
      const proceso = procesosProduccion.value.find(p => p.id === procesoId);
      if (!proceso) continue;

      const runIdPrevio = data && data[config.boomFields.runId] ? data[config.boomFields.runId] : null;
      const statusSync = data && data[config.boomFields.status] ? data[config.boomFields.status] : null;

      if (runIdPrevio && statusSync) {
        const statusUpper = String(statusSync).toUpperCase();

        if (statusUpper.includes('PROCESO')) {
          // Estado en proceso - iniciar polling
          proceso.executionId = runIdPrevio;
          proceso.status = 'ejecutando';
          planProduccionIniciado.value = true;
          console.log(`🔄 Estado inicial: ${config.nombre} en ejecución, runId:`, runIdPrevio);

          // Consultar el estado del pipeline inmediatamente
          await consultarEstadoPipeline(runIdPrevio, procesoId);

          // Iniciar polling automático para monitorear el estado
          iniciarPolling(runIdPrevio, procesoId);
        } else if (statusUpper.includes('COMPLETADO')) {
          // Estado completado - mostrar como completado
          proceso.executionId = runIdPrevio;
          proceso.status = 'completado';
          planProduccionIniciado.value = true;
          console.log(`✅ Estado inicial: ${config.nombre} completada, runId:`, runIdPrevio);

          // Consultar el estado del pipeline para verificar
          await consultarEstadoPipeline(runIdPrevio, procesoId);
        }
      }
    }
  } catch (e) {
    console.warn('No se pudo cargar estado inicial de Boom:', e);
  }
});

// Función para consultar el estado del pipeline
const consultarEstadoPipeline = async (runId, procesoId) => {
  try {
    console.log(`🔍 Consultando estado del pipeline con runId: ${runId} para proceso: ${procesoId}`);

    const { data } = await client.queries.getStatusPipeline({
      runId: runId
    });

    console.log('📊 Respuesta del estado del pipeline:', data);

    // Parsear la respuesta del pipeline
    const pipelineData = parsePipelineResponse(data);
    console.log('🔍 Pipeline data parseado:', pipelineData);

    if (!pipelineData) {
      console.warn('⚠️ No se pudo parsear la respuesta del pipeline');
      return;
    }

    // Actualizar el estado del proceso según la respuesta
    console.log('🔄 Llamando a actualizarEstadoProceso con:', pipelineData.status);
    await actualizarEstadoProceso(pipelineData, procesoId);

  } catch (error) {
    console.error('❌ Error consultando estado del pipeline:', error);
  }
};

// Función para parsear la respuesta del pipeline
const parsePipelineResponse = (data) => {
  try {
    // La respuesta puede venir directamente en data o en data.getStatusPipeline
    let rawResponse = data?.getStatusPipeline || data;
    if (!rawResponse) return null;

    // Si viene como string JSON, parsearlo; si ya es objeto, usarlo directamente
    const pipelineInfo = typeof rawResponse === 'string'
      ? JSON.parse(rawResponse)
      : rawResponse;

    console.log('📋 Pipeline info parseado:', pipelineInfo);
    return pipelineInfo;
  } catch (error) {
    console.error('❌ Error parseando respuesta del pipeline:', error);
    return null;
  }
};

// Función para actualizar el estado del proceso según la respuesta del pipeline
const actualizarEstadoProceso = async (pipelineInfo, procesoId) => {
  console.log('🎯 actualizarEstadoProceso llamada con:', pipelineInfo, 'para proceso:', procesoId);

  const proceso = procesosProduccion.value.find(p => p.id === procesoId);
  if (!proceso) {
    console.warn(`⚠️ No se encontró el proceso ${procesoId}`);
    return;
  }

  const config = procesosConfig[procesoId];
  if (!config) {
    console.warn(`⚠️ No se encontró la configuración para el proceso ${procesoId}`);
    return;
  }

  const status = pipelineInfo.status;
  console.log('🔄 Actualizando estado del proceso:', status);

  // Actualizar el estado del proceso según el status del pipeline
  // Estados posibles: Queued, InProgress, Succeeded, Failed, Canceling, Cancelled
  switch (status) {
    case 'Succeeded':
      proceso.status = 'completado';
      proceso.finTiempo = new Date();
      proceso.duracion = calcularDuracion(proceso.inicioTiempo, proceso.finTiempo);

      // Actualizar Boom con estado completado
      await actualizarBoomStatus('Completado', config);

      useToast().add({
        title: "Pipeline completado",
        description: `${proceso.nombre} completado exitosamente`,
        color: "green",
        timeout: 3000
      });

      // Detener polling y verificar si todos los procesos están completados
      detenerPolling(procesoId);
      checkAndEmitCompleted();
      break;

    case 'Failed':
    case 'Canceling':
    case 'Cancelled':
      console.log('❌ Pipeline falló con estado:', status);
      proceso.status = 'error';
      proceso.finTiempo = new Date();

      console.log('📝 Actualizando proceso a estado error');

      // Actualizar Boom con estado de error
      await actualizarBoomStatus('Error', config);

      useToast().add({
        title: "Pipeline falló",
        description: `${proceso.nombre} terminó con estado: ${status}. Puedes reintentar la ejecución.`,
        color: "red",
        timeout: 5000
      });

      // Detener polling y permitir re-ejecutar limpiando el runId
      detenerPolling(procesoId);
      await limpiarRunIdParaReintento(procesoId, config);
      break;

    case 'Queued':
      // Pipeline en cola, preparándose para ejecutar
      proceso.status = 'ejecutando';
      console.log('⏳ Pipeline en cola, preparándose para ejecutar...');
      iniciarPolling(pipelineInfo.runId, procesoId);
      break;

    case 'InProgress':
      // Mantener en ejecutando y iniciar polling
      proceso.status = 'ejecutando';
      console.log('⏳ Pipeline aún en progreso...');
      iniciarPolling(pipelineInfo.runId, procesoId);
      break;

    default:
      console.warn('⚠️ Estado desconocido del pipeline:', status);
  }
};

// Función para actualizar el estado en Boom
const actualizarBoomStatus = async (nuevoEstado, config) => {
  try {
    if (!props.explosionId) return;

    await client.models.Boom.update({
      id: props.explosionId,
      [config.boomFields.status]: nuevoEstado
    });

    console.log(`📝 Boom actualizado con estado: ${nuevoEstado} para ${config.nombre}`);
  } catch (error) {
    console.error('❌ Error actualizando estado en Boom:', error);
  }
};

// Función para limpiar runId y permitir reintento (solo para errores)
const limpiarRunIdParaReintento = async (procesoId, config) => {
  try {
    if (!props.explosionId) return;

    // Limpiar en la base de datos
    await client.models.Boom.update({
      id: props.explosionId,
      [config.boomFields.runId]: null,
      [config.boomFields.status]: 'Pendiente'
    });

    // Limpiar en el estado local del proceso
    const proceso = procesosProduccion.value.find(p => p.id === procesoId);
    if (proceso) {
      proceso.executionId = null;
      proceso.status = 'pendiente';
      proceso.finTiempo = null;
      proceso.duracion = null;
    }

    console.log(`🔄 RunId limpiado para permitir reintento de ${config.nombre}`);
  } catch (error) {
    console.error('❌ Error limpiando runId:', error);
  }
};

// Función para re-ejecutar desde estado completado
const reEjecutarDesdeCompletado = async (procesoId) => {
  try {
    if (!props.explosionId) return;

    const config = procesosConfig[procesoId];
    if (!config) {
      throw new Error(`Configuración no encontrada para el proceso: ${procesoId}`);
    }

    // Limpiar runId anterior y resetear estado
    await client.models.Boom.update({
      id: props.explosionId,
      [config.boomFields.runId]: null,
      [config.boomFields.status]: 'Pendiente'
    });

    // Resetear el proceso local
    const proceso = procesosProduccion.value.find(p => p.id === procesoId);
    if (proceso) {
      proceso.executionId = null;
      proceso.status = 'pendiente';
      proceso.finTiempo = null;
      proceso.duracion = null;
    }

    // Ejecutar nuevo pipeline
    await ejecutarPipeline(proceso, config);

    console.log(`🔄 Re-ejecutando pipeline desde estado completado para ${config.nombre}`);
  } catch (error) {
    console.error('❌ Error re-ejecutando pipeline:', error);
  }
};

// Función para iniciar polling del estado del pipeline
const iniciarPolling = (runId, procesoId) => {
  // Limpiar polling anterior si existe para este proceso
  detenerPolling(procesoId);

  console.log(`🔄 Iniciando polling cada 10 segundos para runId: ${runId} (proceso: ${procesoId})`);

  // Polling cada 10 segundos
  pollingIntervals.value[procesoId] = setInterval(async () => {
    console.log(`⏰ Polling automático - consultando estado del pipeline: ${runId} (proceso: ${procesoId})`);
    await consultarEstadoPipeline(runId, procesoId);
  }, 10000);
};

// Función para detener el polling
const detenerPolling = (procesoId) => {
  if (pollingIntervals.value[procesoId]) {
    clearInterval(pollingIntervals.value[procesoId]);
    delete pollingIntervals.value[procesoId];
    console.log(`⏹️ Polling detenido para proceso: ${procesoId}`);
  }
};

// Función para detener todos los polling
const detenerTodosLosPolling = () => {
  Object.keys(pollingIntervals.value).forEach(procesoId => {
    detenerPolling(procesoId);
  });
};

// Limpiar polling al desmontar el componente
onUnmounted(() => {
  detenerTodosLosPolling();
});

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
</script>
