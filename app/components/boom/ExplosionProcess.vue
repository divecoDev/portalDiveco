<template>
  <div
    class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <div class="text-center py-8">
      <!-- Botón de ejecución o estado en progreso -->
      <div v-if="!isCompleted">
        
        <!-- Estado en progreso -->
        <div v-if="explosionInProgress" class="space-y-4">
          <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl animate-pulse mx-auto">
            <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700/50 max-w-md mx-auto">
            <h4 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Pipeline en Progreso
            </h4>
            <p class="text-sm text-blue-600 dark:text-blue-400">
              La explosión de materiales se está ejecutando. Esto puede tomar varios minutos.
            </p>
          </div>
        </div>

        <!-- Botón de ejecución -->
        <div v-else>
          <UButton
            icon="i-heroicons-bolt"
            size="lg"
            color="cyan"
            class="rounded-md inline-flex items-center px-8 py-4 text-base gap-3 shadow-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0 cursor-pointer"
            @click="confirmAndExecuteExplosion"
          >
            Ejecutar Explosión
          </UButton>
        </div>
      </div>

      <!-- Estado completado -->
      <div v-else class="space-y-6">
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

        <!-- Botón para re-ejecutar explosión -->
        <div class="flex justify-center">
          <UButton
            icon="i-heroicons-arrow-path"
            size="lg"
            color="cyan"
            variant="solid"
            :loading="reexecutingExplosion"
            @click="reexecuteExplosion"
            class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
            Re-ejecutar Explosión
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

// Props
const props = defineProps({
  explosionId: {
    type: String,
    required: true
  },
  boomId: {
    type: String,
    required: true
  },
  pversion: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['explosion-completed', 'loading-state-changed']);

// Cliente de Amplify
const client = generateClient();

// Estado reactivo
const explosionInProgress = ref(false);
const explosionPollingInterval = ref(null);
const reexecutingExplosion = ref(false);

// Watcher para emitir cambios en el estado de carga
watch(explosionInProgress, (newValue) => {
  emit('loading-state-changed', newValue);
});

// Métodos
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

// Función para re-ejecutar la explosión
const reexecuteExplosion = async () => {
  if (
    confirm(
      "¿Está seguro de que desea re-ejecutar la explosión de materiales?\n\n" +
      "Esto reiniciará el proceso de explosión y generará nuevos resultados. " +
      "Los resultados anteriores serán reemplazados."
    )
  ) {
    try {
      reexecutingExplosion.value = true;

      // Limpiar polling activo si existe
      if (explosionPollingInterval.value) {
        clearInterval(explosionPollingInterval.value);
        explosionPollingInterval.value = null;
      }

      // Resetear estados
      explosionInProgress.value = false;

      // Limpiar el estado del Boom para permitir nueva ejecución
      await client.models.Boom.update({
        id: props.explosionId,
        PiepelineRunIdExplocion: null,
        ExecuteBoomStatus: null
      });

      // Mostrar notificación de éxito
      useToast().add({
        title: "Listo para re-ejecutar",
        description: "El estado se ha reseteado. Puedes ejecutar nuevamente la explosión.",
        color: "green",
        timeout: 3000
      });

      // Emitir evento para notificar al componente padre que se puede ejecutar nuevamente
      emit('explosion-completed');

    } catch (error) {
      console.error("Error al re-ejecutar explosión:", error);
      useToast().add({
        title: "Error",
        description: "No se pudo resetear el estado para re-ejecutar la explosión",
        color: "red",
        timeout: 4000
      });
    } finally {
      reexecutingExplosion.value = false;
    }
  }
};

const executeExplosion = async () => {
  try {
    console.log('🚀 Ejecutando pipeline ExplocionarDesdePortal...');

    // Preparar argumentos del pipeline
    const pipelineArgs = {
      pipelineName: 'ExplocionarDesdePortal'
    };

    // Agregar boomId para el pipeline de explosión
    if (props.boomId) {
      pipelineArgs.boomId = props.boomId;
      console.log(`📋 Enviando boomId: ${props.boomId} para pipeline de explosión`);
    }

    // Agregar Pversion para el pipeline de explosión
    if (props.pversion) {
      pipelineArgs.Pversion = props.pversion;
      console.log(`📋 Enviando Pversion: ${props.pversion} para pipeline de explosión`);
    }

    // Mostrar toast de carga
    const loadingToast = useToast().add({
      title: "Ejecutando explosión...",
      description: "Iniciando pipeline de explosión de materiales. Esto puede tomar varios minutos.",
      color: "blue",
      timeout: 0 // No se cierra automáticamente
    });

    // Llamar a la mutación runPipeline
    const { data } = await client.mutations.runPipeline(pipelineArgs);

    console.log('📋 Respuesta del pipeline de explosión:', data);

    // Procesar la respuesta del pipeline
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
      // La respuesta ahora incluye más información: runId, runGroupId, status, etc.
      runId = raw?.runId ?? raw?.data?.runId ?? null;
      
      // Si la respuesta incluye el status directamente, procesarlo
      if (raw?.status) {
        console.log('📋 Pipeline ejecutado con status:', raw.status);
        
        // Si el pipeline se completó inmediatamente, guardar el runId primero
        if (raw.status === 'Succeeded' || raw.status === 'Failed') {
          // Persistir en Boom el runId y el estado antes de procesar
          try {
            console.log('📝 Guardando runId para pipeline completado inmediatamente:', runId);
            await client.models.Boom.update({
              id: props.explosionId,
              PiepelineRunIdExplocion: runId,
              ExecuteBoomStatus: raw.status === 'Succeeded' ? 'En Proceso' : 'Error'
            });
            console.log('📝 RunId guardado para pipeline completado inmediatamente');
          } catch (persistErr) {
            console.error('❌ Error guardando runId para pipeline completado:', persistErr);
          }
        }
        
        await procesarEstadoPipeline(raw.status, runId);
        return; // No necesitamos iniciar polling si ya tenemos el resultado
      }
    }

    if (runId) {
      console.log(`✅ Pipeline de explosión iniciado con runId: ${runId}`);

      // Marcar como en progreso en la UI
      explosionInProgress.value = true;

      // Persistir en Boom el runId y el estado "En Proceso"
      try {
        console.log('📝 Intentando actualizar Boom con:', {
          id: props.explosionId,
          PiepelineRunIdExplocion: runId,
          ExecuteBoomStatus: 'En Proceso'
        });
        
        const updateResult = await client.models.Boom.update({
          id: props.explosionId,
          PiepelineRunIdExplocion: runId,
          ExecuteBoomStatus: 'En Proceso'
        });
        
        console.log('📝 Resultado de actualización Boom:', updateResult);
        
        // Verificar que se guardó correctamente
        const { data: verifyData } = await client.models.Boom.get({ id: props.explosionId });
        console.log('📝 Verificación post-actualización:', {
          PiepelineRunIdExplocion: verifyData?.PiepelineRunIdExplocion,
          ExecuteBoomStatus: verifyData?.ExecuteBoomStatus
        });
        
        console.log('📝 Boom actualizado con runId y estado En Proceso para explosión');
      } catch (persistErr) {
        console.error('❌ Error actualizando Boom con el runId:', persistErr);
        console.error('❌ Detalles del error:', persistErr.message);
      }

      // Cerrar toast de carga inicial
      useToast().remove(loadingToast.id);

      // Mostrar notificación de pipeline iniciado
      useToast().add({
        title: "Pipeline iniciado",
        description: `Pipeline de explosión iniciado. ID: ${runId}`,
        color: "blue",
        timeout: 3000
      });

      // Iniciar polling del estado del pipeline
      await iniciarPollingExplosion(runId);

    } else {
      throw new Error('No se recibió runId válido del pipeline de explosión');
    }

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

// Función para iniciar polling del estado del pipeline de explosión
const iniciarPollingExplosion = async (runId) => {
  try {
    console.log(`🔄 Iniciando polling para pipeline de explosión con runId: ${runId}`);
    
    // Consultar el estado inicial
    await consultarEstadoPipelineExplosion(runId);
    
    // Configurar polling cada 10 segundos con timeout de 30 minutos
    const startTime = Date.now();
    const timeoutMs = 30 * 60 * 1000; // 30 minutos
    
    const intervalId = setInterval(async () => {
      try {
        console.log('🔄 Ejecutando polling de explosión...', new Date().toISOString());
        
        // Verificar timeout
        if (Date.now() - startTime > timeoutMs) {
          console.warn('⏰ Timeout del polling de explosión alcanzado');
          clearInterval(intervalId);
          explosionPollingInterval.value = null;
          
          // Resetear estado de progreso
          explosionInProgress.value = false;
          
          useToast().add({
            title: "Timeout del pipeline",
            description: "El pipeline de explosión ha tardado más de lo esperado. Verifica el estado manualmente.",
            color: "orange",
            timeout: 5000
          });
          return;
        }
        
        await consultarEstadoPipelineExplosion(runId);
      } catch (error) {
        console.error('Error en polling de explosión:', error);
        // No limpiar el interval aquí, continuar intentando
      }
    }, 10000);
    
    console.log('⏰ Polling configurado cada 10 segundos para runId:', runId);
    
    // Guardar el intervalId para poder detenerlo después
    explosionPollingInterval.value = intervalId;
    
  } catch (error) {
    console.error('Error iniciando polling de explosión:', error);
  }
};

// Función para consultar el estado del pipeline de explosión
const consultarEstadoPipelineExplosion = async (runId) => {
  try {
    console.log(`🔍 Consultando estado del pipeline de explosión: ${runId}`);
    console.log('🔍 Estado actual de explosionInProgress:', explosionInProgress.value);
    
    const { data } = await client.queries.getStatusPipeline({ runId });
    
    console.log('📋 Respuesta completa de getStatusPipeline:', data);
    
    if (!data) {
      console.warn('No se recibió respuesta del estado del pipeline');
      return;
    }

    // La respuesta viene directamente en data, no en data.getStatusPipeline
    let pipelineInfo = data.getStatusPipeline || data;
    console.log('📋 Pipeline info raw:', pipelineInfo);
    console.log('📋 Tipo de pipelineInfo:', typeof pipelineInfo);
    
    // Si pipelineInfo es un string JSON, parsearlo
    if (typeof pipelineInfo === 'string') {
      try {
        pipelineInfo = JSON.parse(pipelineInfo);
        console.log('📋 Pipeline info parseado:', pipelineInfo);
      } catch (e) {
        console.warn('No se pudo parsear pipelineInfo string:', e);
        return;
      }
    }
    
    if (!pipelineInfo) {
      console.warn('Información del pipeline no disponible - el pipeline puede estar aún inicializándose');
      // No retornar aquí, continuar con el polling
      return;
    }

    const status = pipelineInfo.status;
    console.log('🔄 Estado del pipeline de explosión:', status);
    console.log('🔄 Estado actual de explosionInProgress antes de procesar:', explosionInProgress.value);

    // Usar la función centralizada para procesar el estado
    console.log('🔄 Llamando a procesarEstadoPipeline con status:', status, 'y runId:', runId);
    await procesarEstadoPipeline(status, runId);
    
    console.log('🔄 Estado de explosionInProgress después de procesar:', explosionInProgress.value);
    
    // Si el pipeline está completado o falló, detener el polling
    if (status === 'Succeeded' || status === 'Failed' || status === 'Canceling' || status === 'Cancelled') {
      if (explosionPollingInterval.value) {
        clearInterval(explosionPollingInterval.value);
        explosionPollingInterval.value = null;
        console.log('🛑 Polling detenido - pipeline finalizado');
      }
    }
  } catch (error) {
    console.error('❌ Error consultando estado del pipeline de explosión:', error);
    
    // Si es un error de red o timeout, continuar con el polling
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      console.log('🔄 Error de red detectado, continuando con el polling...');
      return;
    }
    
    // Para otros errores, mostrar notificación pero no detener el polling
    console.warn('⚠️ Error consultando pipeline, pero continuando con el polling...');
  }
};

// Función para procesar el estado del pipeline directamente desde la respuesta
const procesarEstadoPipeline = async (status, runId) => {
  console.log(`🔄 Procesando estado del pipeline: ${status} para runId: ${runId}`);
  console.log('🔄 Estado actual de explosionInProgress al inicio de procesarEstadoPipeline:', explosionInProgress.value);
  
  switch (status) {
    case 'Succeeded':
      console.log('✅ Pipeline completado exitosamente - actualizando UI y base de datos');
      console.log('✅ Estado de explosionInProgress ANTES de cambiar a false:', explosionInProgress.value);
      
      // Pipeline completado exitosamente
      explosionInProgress.value = false;
      
      console.log('✅ Estado de explosionInProgress DESPUÉS de cambiar a false:', explosionInProgress.value);
      
      // Asegurar que el runId esté guardado antes de marcar como completado
      try {
        const { data: currentData } = await client.models.Boom.get({ id: props.explosionId });
        if (!currentData?.PiepelineRunIdExplocion && runId) {
          console.log('📝 RunId no encontrado, guardándolo ahora:', runId);
          await client.models.Boom.update({
            id: props.explosionId,
            PiepelineRunIdExplocion: runId
          });
        }
      } catch (error) {
        console.warn('⚠️ No se pudo verificar/guardar runId:', error);
      }
      
      // Actualizar Boom con estado completado
      console.log('✅ Actualizando Boom con estado Completado...');
      await actualizarBoomStatusExplosion('Completado');
      console.log('✅ Boom actualizado exitosamente');
      
      // Emitir evento de completado
      console.log('✅ Emitiendo evento explosion-completed...');
      emit('explosion-completed');
      console.log('✅ Evento explosion-completed emitido');
      
      useToast().add({
        title: "¡Explosión completada!",
        description: "La explosión de materiales se ha ejecutado exitosamente. Los resultados están listos.",
        color: "green",
        timeout: 5000
      });
      
      console.log('✅ Pipeline de explosión completado exitosamente');
      break;

    case 'Failed':
    case 'Canceling':
    case 'Cancelled':
      console.log('❌ Pipeline de explosión falló con estado:', status);
      
      // Resetear estado de progreso
      explosionInProgress.value = false;
      
      // Actualizar Boom con estado de error
      await actualizarBoomStatusExplosion('Error');
      
      useToast().add({
        title: "Pipeline de explosión falló",
        description: `La explosión terminó con estado: ${status}. Puedes reintentar la ejecución.`,
        color: "red",
        timeout: 5000
      });
      break;

    case 'Queued':
      console.log('⏳ Pipeline de explosión en cola, preparándose para ejecutar...');
      explosionInProgress.value = true;
      // Solo iniciar polling si no está ya ejecutándose
      if (!explosionPollingInterval.value) {
        await iniciarPollingExplosion(runId);
      }
      break;

    case 'InProgress':
      console.log('⏳ Pipeline de explosión aún en progreso...');
      explosionInProgress.value = true;
      // Solo iniciar polling si no está ya ejecutándose
      if (!explosionPollingInterval.value) {
        await iniciarPollingExplosion(runId);
      }
      break;

    default:
      console.warn('⚠️ Estado desconocido del pipeline de explosión:', status);
      // Para estados desconocidos, iniciar polling
      if (runId) {
        explosionInProgress.value = true;
        await iniciarPollingExplosion(runId);
      }
  }
};

// Función para actualizar el estado de explosión en Boom
const actualizarBoomStatusExplosion = async (nuevoEstado) => {
  try {
    console.log('📝 Intentando actualizar Boom con estado:', nuevoEstado);
    console.log('📝 ID del boom a actualizar:', props.explosionId);
    
    const result = await client.models.Boom.update({
      id: props.explosionId,
      ExecuteBoomStatus: nuevoEstado
    });
    
    console.log('📝 Resultado de la actualización de Boom:', result);
    
    // Verificar que se guardó correctamente
    const { data: verifyData } = await client.models.Boom.get({ id: props.explosionId });
    console.log('📝 Verificación post-actualización estado:', {
      ExecuteBoomStatus: verifyData?.ExecuteBoomStatus
    });
    
    console.log(`📝 Boom actualizado con estado de explosión: ${nuevoEstado}`);
  } catch (error) {
    console.error('❌ Error actualizando estado de explosión en Boom:', error);
    console.error('❌ Detalles del error:', error.message);
  }
};

// Función para verificar el estado inicial del pipeline de explosión
const checkInitialExplosionState = async () => {
  try {
    const { data } = await client.models.Boom.get({ id: props.explosionId });
    if (!data) return;

    const runIdExplosion = data.PiepelineRunIdExplocion;
    const statusExplosion = data.ExecuteBoomStatus;

    console.log('🔍 Estado inicial del pipeline de explosión:', { runIdExplosion, statusExplosion });

    if (runIdExplosion && statusExplosion) {
      // Si hay un runId y el estado es "En Proceso", iniciar polling
      if (statusExplosion === 'En Proceso') {
        console.log('🔄 Pipeline de explosión en progreso, iniciando polling...');
        explosionInProgress.value = true; // Marcar como en progreso en la UI
        await iniciarPollingExplosion(runIdExplosion);
      }
      // Si el estado es "Completado", marcar como completado
      else if (statusExplosion === 'Completado') {
        explosionInProgress.value = false; // Resetear estado de progreso
        console.log('✅ Pipeline de explosión ya completado');
        
        // Emitir evento para notificar al componente padre que ya está completado
        emit('explosion-completed');
        console.log('✅ Evento explosion-completed emitido para estado inicial completado');
      }
      // Si el estado es "Error", permitir reintento
      else if (statusExplosion === 'Error') {
        explosionInProgress.value = false; // Resetear estado de progreso
        console.log('❌ Pipeline de explosión en estado de error, permitiendo reintento');
      }
    }
  } catch (error) {
    console.error('❌ Error verificando estado inicial del pipeline de explosión:', error);
  }
};

// Cargar estado inicial al montar el componente
onMounted(async () => {
  await checkInitialExplosionState();
});

// Limpiar polling al desmontar el componente
onUnmounted(() => {
  if (explosionPollingInterval.value) {
    clearInterval(explosionPollingInterval.value);
    explosionPollingInterval.value = null;
    console.log('🧹 Polling de explosión limpiado al desmontar componente');
  }
});
</script>
