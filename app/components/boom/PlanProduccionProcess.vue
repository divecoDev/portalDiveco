<template>
  <div
    class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <!-- Header del proceso -->
    <div class="text-center mb-4">
      <div
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md relative transition-all duration-500',
          isCompleted
            ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30'
            : 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30'
        ]"
      >
        <UIcon
          name="i-heroicons-beaker"
          :class="[
            'w-6 h-6 transition-all duration-500',
            isCompleted
              ? 'text-green-600 dark:text-green-400'
              : 'text-cyan-600 dark:text-cyan-400'
          ]"
        />
        <div v-if="isCompleted" class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
          <UIcon name="i-heroicons-check" class="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <h3
        :class="[
          'text-lg font-bold mb-1 transition-all duration-500',
          isCompleted
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-900 dark:text-white'
        ]"
      >
        Generar Plan de Producción
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Ejecutar procesos necesarios para generar el plan de producción
      </p>
    </div>

    <!-- Lista de procesos -->
    <div class="space-y-2 mb-4">
      <div
        v-for="proceso in procesosProduccion"
        :key="proceso.id"
        :class="[
          'flex items-center justify-between p-3 rounded-lg border transition-all duration-300',
          getProcesoStatusClass(proceso.status)
        ]"
      >
        <div class="flex items-center space-x-2">
          <!-- Número de orden secuencial -->
          <div class="flex flex-col items-center">
            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                puedeEjecutarProceso(proceso.id) && proceso.status === 'pendiente'
                  ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                  : proceso.status === 'completado'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : proceso.status === 'ejecutando'
                  ? 'bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              ]"
            >
              {{ procesosProduccion.findIndex(p => p.id === proceso.id) + 1 }}
            </div>
          </div>

          <!-- Icono de estado -->
          <div
            :class="[
              'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300',
              getProcesoIconClass(proceso.status)
            ]"
          >
            <UIcon
              :name="getProcesoIcon(proceso.status)"
              class="w-3 h-3"
            />
          </div>

          <!-- Información del proceso -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ proceso.nombre }}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ proceso.descripcion }}
            </p>
          </div>
        </div>

        <!-- Estado y ID de ejecución -->
        <div class="text-right flex flex-col items-end space-y-1">
          <div class="flex items-center space-x-2">
            <div
              :class="[
                'text-xs font-medium',
                getProcesoTextClass(proceso.status)
              ]"
            >
              {{ getProcesoStatusLabel(proceso.status) }}
            </div>
            <!-- ID de ejecución del pipeline -->
            <div v-if="proceso.executionId" class="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-mono">
              <UIcon name="i-heroicons-bolt" class="w-3 h-3" />
              <span>{{ proceso.executionId.slice(-8) }}</span>
            </div>
            <!-- Spinner para procesos en ejecución -->
            <div
              v-if="proceso.status === 'ejecutando'"
              class="w-3 h-3 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
          <!-- Botón para ejecutar proceso individual -->
          <UButton
            v-if="proceso.status === 'pendiente' || proceso.status === 'error'"
            icon="i-heroicons-play"
            size="xs"
            color="cyan"
            variant="ghost"
            class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            :disabled="proceso.status === 'ejecutando' || isCompleted || !puedeEjecutarProceso(proceso.id) || cargandoEstadosIniciales"
            @click="runSingleProcess(proceso.id)"
          >
            Ejecutar
          </UButton>

          <!-- Indicador de dependencia no cumplida -->
          <div
            v-if="proceso.status === 'pendiente' && !puedeEjecutarProceso(proceso.id)"
            class="text-xs text-orange-600 dark:text-orange-400"
          >
            Esperando proceso anterior
          </div>

          <!-- Botón para re-ejecutar desde completado -->
          <UButton
            v-else-if="proceso.status === 'completado'"
            icon="i-heroicons-arrow-path"
            size="xs"
            color="green"
            variant="ghost"
            class="hover:bg-green-50 dark:hover:bg-green-900/20"
            :disabled="cargandoEstadosIniciales"
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
        v-if="!todosLosProcesosCompletados && !ejecucionGlobalEnProgreso"
        icon="i-heroicons-play"
        size="md"
        color="cyan"
        class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
        @click="iniciarPlanProduccion"
      >
        {{ planProduccionIniciado ? 'Continuar Procesos' : 'Iniciar Procesos' }}
      </UButton>

      <div v-else-if="ejecucionGlobalEnProgreso" class="text-center">
        <div class="w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Ejecutando procesos secuencialmente...
        </p>

        <!-- Barra de progreso -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
          <div
            class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-1.5 rounded-full transition-all duration-500"
            :style="{ width: `${progresoProcesos.porcentaje}%` }"
          ></div>
        </div>

        <!-- Información de progreso -->
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {{ progresoProcesos.completados }} de {{ progresoProcesos.total }} procesos completados
          <span v-if="progresoProcesos.enEjecucion > 0" class="text-cyan-600 dark:text-cyan-400">
            ({{ progresoProcesos.enEjecucion }} ejecutándose)
          </span>
        </div>

        <!-- Lista de procesos con estado visual -->
        <div class="text-xs text-gray-500 dark:text-gray-400">
          <div v-for="proceso in procesosProduccion" :key="proceso.id" class="flex items-center justify-center space-x-1 mb-0.5">
            <div
              :class="[
                'w-1.5 h-1.5 rounded-full',
                proceso.status === 'completado' ? 'bg-green-500' :
                proceso.status === 'ejecutando' ? 'bg-cyan-500 animate-pulse' :
                'bg-gray-300'
              ]"
            ></div>
            <span class="text-xs">{{ proceso.nombre }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="todosLosProcesosCompletados" class="text-center">
        <!-- Botones de acción cuando todos los procesos están completados -->
        <div class="flex items-center justify-center space-x-3">
          <!-- Botón para resetear y ejecutar nuevamente -->
          <UButton
            icon="i-heroicons-arrow-path"
            size="sm"
            color="gray"
            class="hover:bg-gray-50 dark:hover:bg-gray-900/20 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold"
            :disabled="cargandoEstadosIniciales"
            @click="resetearPlanProduccion"
          >
            Ejecutar Nuevamente
          </UButton>

          <!-- Botón para avanzar al siguiente paso -->
          <UButton
            icon="i-heroicons-arrow-right"
            size="sm"
            color="cyan"
            class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold"
            :disabled="cargandoEstadosIniciales"
            @click="avanzarSiguientePaso"
          >
            Siguiente Paso
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

const client = generateClient();


const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false
  },
  explosionId: {
    type: String,
    default: ''
  },
  boomId: {
    type: String,
    default: ''
  },
  pversion: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['plan-completed', 'loading-state-changed']);

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
    pipelineName: 'EjecutarCalcularPlanVentasBoom',
    boomFields: {
      runId: 'PiepelineRunIdPlanVentas',
      status: 'SyncSalesPlanStatus'
    },
    hasPipeline: true
  },
  'calcular-plan-demanda': {
    nombre: 'Calcular Plan Demanda',
    descripcion: 'Cálculo del plan de demanda basado en datos sincronizados',
    pipelineName: 'EjecutarCalcularPlanDemadaBoom',
    boomFields: {
      runId: 'PiepelineRunIdPlanDemandas',
      status: 'SyncDemandPlanStatus'
    },
    hasPipeline: true
  }
};

// Estado reactivo
const planProduccionIniciado = ref(false);
const ejecucionGlobalEnProgreso = ref(false);
const pollingIntervals = ref({}); // Múltiples intervalos de polling
const procesosProduccion = ref([]);
const esEjecucionNueva = ref(false); // Para distinguir entre ejecución nueva y carga inicial
const cargandoEstadosIniciales = ref(true); // Estado de carga inicial

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

// Watcher para emitir cambios en el estado de carga
watch(cargandoEstadosIniciales, (newValue) => {
  emit('loading-state-changed', newValue);
});

// Métodos para manejar los procesos de producción
const iniciarPlanProduccion = async () => {
  planProduccionIniciado.value = true;
  ejecucionGlobalEnProgreso.value = true;
  esEjecucionNueva.value = true; // Marcar como ejecución nueva

  try {
    // Ejecutar procesos secuencialmente, saltando los que ya están completados
    const procesosOrdenados = ['sincronizar-insumos', 'sincronizar-plan-ventas', 'calcular-plan-demanda'];

    for (const procesoId of procesosOrdenados) {
      const proceso = procesosProduccion.value.find(p => p.id === procesoId);

      // Solo ejecutar si no está completado
      if (proceso && proceso.status !== 'completado') {
        await ejecutarProceso(procesoId);
      }
    }

    // Emitir evento de completado solo si es una ejecución nueva
    if (esEjecucionNueva.value) {
      emit('plan-completed');
    }
  } finally {
    // Siempre resetear el estado de ejecución global al finalizar
    ejecucionGlobalEnProgreso.value = false;
  }
};

const runSingleProcess = async (procesoId) => {
  const proceso = procesosProduccion.value.find(p => p.id === procesoId);
  if (!proceso || proceso.status === 'completado' || proceso.status === 'ejecutando') return;

  // Verificar dependencias secuenciales
  if (!puedeEjecutarProceso(procesoId)) {
    const procesoIndex = procesosProduccion.value.findIndex(p => p.id === procesoId);
    const procesoAnterior = procesosProduccion.value[procesoIndex - 1];

    useToast().add({
      title: "No se puede ejecutar",
      description: `Debe completar primero: ${procesoAnterior.nombre}`,
      color: "orange",
      timeout: 4000
    });
    return;
  }

  // Marcar como ejecución nueva para ejecuciones individuales
  esEjecucionNueva.value = true;

  // La ejecución individual no afecta el estado global
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

    // Preparar argumentos del pipeline
    const pipelineArgs = {
      pipelineName: config.pipelineName
    };

    // Agregar Pversion para pipelines que lo requieren
    if ((config.pipelineName === 'EjecutarCalcularPlanVentasBoom' || 
         config.pipelineName === 'EjecutarCalcularPlanDemadaBoom') && props.pversion) {
      pipelineArgs.Pversion = props.pversion;
      const pipelineType = config.pipelineName === 'EjecutarCalcularPlanVentasBoom' ? 'plan de ventas' : 'plan de demanda';
      console.log(`📋 Enviando Pversion: ${props.pversion} para pipeline de ${pipelineType}`);
    }

    // Agregar boomId para pipelines que lo requieren
    if ((config.pipelineName === 'EjecutarCalcularPlanDemadaBoom' ||
         config.pipelineName === 'EjecutarExtraccionInsumos') && props.boomId) {
      pipelineArgs.boomId = props.boomId;
      const pipelineType = config.pipelineName === 'EjecutarExtraccionInsumos' ? 'sincronización de insumos' : 'plan de demanda';
      console.log(`📋 Enviando boomId: ${props.boomId} para pipeline de ${pipelineType}`);
    }

    // Llamar a la mutación runPipeline
    const { data } = await client.mutations.runPipeline(pipelineArgs);

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
  return `${segundos}s`;
};

const checkAndEmitCompleted = () => {
  const allCompleted = procesosProduccion.value.every(p => p.status === 'completado');
  if (allCompleted) {
    // Resetear estados cuando todos los procesos estén completados
    planProduccionIniciado.value = true; // Mantener como iniciado
    ejecucionGlobalEnProgreso.value = false; // Ya no está en progreso global

    // Solo emitir si es una ejecución nueva, no al cargar estado inicial
    if (esEjecucionNueva.value) {
      emit('plan-completed');
    }
  }
};

// Computed para verificar si todos los procesos están completados
const todosLosProcesosCompletados = computed(() => {
  return procesosProduccion.value.every(p => p.status === 'completado');
});

// Función para verificar si un proceso puede ser ejecutado (dependencias secuenciales)
const puedeEjecutarProceso = (procesoId) => {
  const procesoIndex = procesosProduccion.value.findIndex(p => p.id === procesoId);

  // El primer proceso siempre se puede ejecutar
  if (procesoIndex === 0) {
    return true;
  }

  // Verificar que todos los procesos anteriores estén completados
  for (let i = 0; i < procesoIndex; i++) {
    if (procesosProduccion.value[i].status !== 'completado') {
      return false;
    }
  }

  return true;
};

// Función para obtener el siguiente proceso que se puede ejecutar
const obtenerSiguienteProcesoEjecutable = () => {
  return procesosProduccion.value.find(p =>
    p.status === 'pendiente' && puedeEjecutarProceso(p.id)
  );
};

// Cargar estado inicial desde Boom para reflejar ejecución en curso
onMounted(async () => {
  try {
    if (!props.explosionId) return;
    const { data } = await client.models.Boom.get({ id: props.explosionId });
    if (!data) return;

    // IMPORTANTE: No marcar como ejecución nueva al cargar estado inicial
    esEjecucionNueva.value = false;

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
          // No establecer ejecucionGlobalEnProgreso aquí porque es una ejecución previa
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
          // No establecer ejecucionGlobalEnProgreso aquí porque ya está completado
          console.log(`✅ Estado inicial: ${config.nombre} completada, runId:`, runIdPrevio);

          // Consultar el estado del pipeline para verificar
          await consultarEstadoPipeline(runIdPrevio, procesoId);
        }
      }
    }
  } catch (e) {
    console.warn('No se pudo cargar estado inicial de Boom:', e);
  } finally {
    // Marcar como completada la carga de estados iniciales
    cargandoEstadosIniciales.value = false;
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

    // Marcar como ejecución nueva para re-ejecuciones
    esEjecucionNueva.value = true;

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

// Función para resetear completamente el estado del plan de producción
const resetearPlanProduccion = () => {
  // Resetear estados globales
  planProduccionIniciado.value = false;
  ejecucionGlobalEnProgreso.value = false;

  // Resetear todos los procesos
  procesosProduccion.value.forEach(proceso => {
    proceso.status = 'pendiente';
    proceso.executionId = null;
    proceso.finTiempo = null;
    proceso.duracion = null;
  });

  // Detener todos los polling
  detenerTodosLosPolling();

  console.log('🔄 Plan de producción reseteado completamente');
};

// Función para avanzar al siguiente paso
const avanzarSiguientePaso = () => {
  // Emitir evento para que el componente padre maneje la navegación
  emit('plan-completed');
  
  // Mostrar notificación de éxito
  useToast().add({
    title: "Avanzando al siguiente paso",
    description: "Continuando a la validación de aprovisionamiento",
    color: "cyan",
    timeout: 3000
  });
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

// Computed para calcular el progreso de los procesos
const progresoProcesos = computed(() => {
  const total = procesosProduccion.value.length;
  const completados = procesosProduccion.value.filter(p => p.status === 'completado').length;
  const enEjecucion = procesosProduccion.value.filter(p => p.status === 'ejecutando').length;

  return {
    total,
    completados,
    enEjecucion,
    pendientes: total - completados - enEjecucion,
    porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0
  };
});
</script>
