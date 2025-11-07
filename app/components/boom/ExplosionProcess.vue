<template>
  <div
    class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 explosion-container"
  >
    <!-- Botón para iniciar tour específico -->
    <div class="flex justify-end mb-4">
      <UButton
        id="explosion-tour-trigger"
        icon="i-heroicons-rocket-launch"
        size="sm"
        color="cyan"
        variant="solid"
        class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        @click="startTour"
      >
        Tour: Explosión de Materiales
      </UButton>
    </div>
    <div class="text-center py-8">
      <!-- Botón de ejecución o estado en progreso -->
      <div v-if="!isCompleted">
        
        <!-- Estado en progreso del pipeline -->
        <div v-if="explosionInProgress" class="space-y-4 explosion-progress-section">
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

        <!-- Estado procesando documentos CSV -->
        <div v-else-if="generatingFiles" class="space-y-6 generating-files-section">
          <div class="w-20 h-20 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl animate-pulse mx-auto">
            <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-700/50 max-w-md mx-auto text-center">
            <h4 class="text-lg font-semibold text-cyan-700 dark:text-cyan-300 mb-2">
              Procesando documentos
            </h4>
            <p class="text-sm text-cyan-600 dark:text-cyan-400">
              Generando archivos CSV secuencialmente. Esto puede tomar varios minutos.
            </p>
          </div>

          <div class="space-y-3 max-w-3xl mx-auto">
            <div
              v-for="entry in fileStatusEntries"
              :key="entry.fileType"
              class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-cyan-200/30 dark:border-cyan-700/30 shadow-lg p-4"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div
                    :class="[
                      'w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
                      entry.gradient,
                    ]"
                  >
                    <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ entry.label }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ entry.description }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div
                    v-if="entry.status === 'processing'"
                    class="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span
                    :class="[
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold',
                      statusLabels[entry.status].badgeColor,
                      statusLabels[entry.status].textColor,
                    ]"
                  >
                    <UIcon :name="statusLabels[entry.status].icon" class="w-4 h-4" />
                    {{ statusLabels[entry.status].label }}
                  </span>
                </div>
              </div>

              <p v-if="entry.error" class="mt-2 text-xs text-red-600 dark:text-red-400">
                {{ entry.error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Botón de ejecución -->
        <div v-else class="explosion-execution-section">
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
      <div v-else class="space-y-6 explosion-completed-section">
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

        <!-- Botones de descarga de archivos -->
        <div v-if="hasFileErrors" class="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4 text-sm text-red-700 dark:text-red-300">
          Algunos archivos presentaron errores. Revisa el detalle y reintenta la generación si es necesario.
        </div>

        <div class="download-files-section mb-8">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            📁 Archivos generados
          </h3>
          <div class="space-y-3 max-w-2xl mx-auto">
            <button
              v-for="entry in fileStatusEntries"
              :key="entry.fileType"
              :disabled="entry.status !== 'success'"
              @click="entry.status === 'success' ? downloadFile(entry.fileName) : undefined"
              :class="[
                'group w-full backdrop-blur-sm rounded-lg border transition-all duration-300 p-4 text-left',
                entry.status === 'success'
                  ? 'bg-white/90 dark:bg-gray-800/90 shadow-lg border-cyan-200/30 dark:border-cyan-700/30 hover:shadow-xl hover:border-cyan-300/50 dark:hover:border-cyan-600/50 hover:-translate-y-1 cursor-pointer'
                  : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/40 dark:border-gray-700/40 cursor-not-allowed opacity-75',
              ]"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div
                    :class="[
                      'w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
                      entry.gradient,
                    ]"
                  >
                    <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ entry.label }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ entry.description }}
                    </p>
                    <p v-if="typeof entry.recordCount === 'number'" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Registros: {{ entry.recordCount.toLocaleString() }}
                    </p>
                    <p v-if="entry.updatedAt" class="text-xs text-gray-400 dark:text-gray-500">
                      Actualizado: {{ formatDateTime(entry.updatedAt) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span
                    :class="[
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold',
                      statusLabels[entry.status].badgeColor,
                      statusLabels[entry.status].textColor,
                    ]"
                  >
                    <UIcon :name="statusLabels[entry.status].icon" class="w-4 h-4" />
                    {{ statusLabels[entry.status].label }}
                  </span>
                  <UIcon
                    name="i-heroicons-arrow-down-tray"
                    class="w-5 h-5 text-cyan-600 dark:text-cyan-400 transition-transform duration-200"
                    :class="entry.status === 'success' ? 'group-hover:scale-110' : 'opacity-40'"
                  />
                </div>
              </div>

              <p v-if="entry.error" class="mt-3 text-xs text-red-600 dark:text-red-400">
                {{ entry.error }}
              </p>
            </button>
          </div>
        </div>

        <!-- Botón para re-ejecutar explosión -->
        <div class="flex justify-center re-execution-section">
          <UButton
            icon="i-heroicons-arrow-path"
            size="lg"
            color="cyan"
            variant="solid"
            :loading="reexecutingExplosion"
            @click="reexecuteExplosion"
            class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            Re-ejecutar Explosión
          </UButton>
        </div>

        <!-- Control de visibilidad de documentos -->
        <div class="mt-6 flex justify-center items-center space-x-3 document-visibility-toggle">
          <UCheckbox 
            v-model="enableShowDocuments" 
            @change="toggleShowDocuments"
            :disabled="updatingDocuments || !allFilesSuccessful"
          />
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Habilitar visualización de documentos
          </label>
          <div v-if="updatingDocuments" class="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <p v-else-if="!allFilesSuccessful" class="text-xs text-gray-500 dark:text-gray-400">
            Disponible cuando todos los archivos estén listos.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useToast } from "#imports";

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
const emit = defineEmits(['explosion-completed', 'explosion-restarted', 'loading-state-changed']);

// Cliente de Amplify
const client = generateClient<Schema>();

// Estado reactivo
const explosionInProgress = ref(false);
const explosionPollingInterval = ref(null); // Para polling del pipeline de explosión
const explosionFilesPollingInterval = ref(null); // Para polling del estado de archivos CSV
const reexecutingExplosion = ref(false);
const enableShowDocuments = ref(false);
const updatingDocuments = ref(false);
const generatingFiles = ref(false);

const EXPLOSION_FILE_TYPES = [
  "aprovisionamiento",
  "modeloSemielaborados",
  "materiaPrimaSemielaborados",
  "planVentas",
  "planProduccion",
];

const explosionFileDefinitions = [
  {
    fileType: "aprovisionamiento",
    fileName: "AprovisionamientoConfigurado.csv",
    label: "Aprovisionamiento configurado",
    description: "Configuración de reglas de aprovisionamiento por centro y material.",
    gradient: "from-green-500 to-green-600",
  },
  {
    fileType: "modeloSemielaborados",
    fileName: "PlanModeloConSemielaborados.csv",
    label: "Plan por modelo con semielaborados",
    description: "Detalle de producción por modelo considerando semielaborados.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    fileType: "materiaPrimaSemielaborados",
    fileName: "PlanModeloMateriasPrimaConSemielaborados.csv",
    label: "Plan por materia prima con semielaborados",
    description: "Necesidades de materias primas asociadas a semielaborados.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    fileType: "planVentas",
    fileName: "PlanVentas.csv",
    label: "Plan de ventas",
    description: "Proyección de ventas por periodo y modelo.",
    gradient: "from-red-500 to-red-600",
  },
  {
    fileType: "planProduccion",
    fileName: "PlanProduccion.csv",
    label: "Plan de producción",
    description: "Resumen final del plan de producción consolidado.",
    gradient: "from-orange-500 to-orange-600",
  },
];

const statusLabels = {
  pending: {
    label: "Pendiente",
    icon: "i-heroicons-clock",
    textColor: "text-gray-500 dark:text-gray-400",
    badgeColor: "bg-gray-200 dark:bg-gray-700",
  },
  processing: {
    label: "Procesando",
    icon: "i-heroicons-arrow-path",
    textColor: "text-cyan-600 dark:text-cyan-300",
    badgeColor: "bg-cyan-100 dark:bg-cyan-900/40",
  },
  success: {
    label: "Listo",
    icon: "i-heroicons-check-circle",
    textColor: "text-green-600 dark:text-green-300",
    badgeColor: "bg-green-100 dark:bg-green-900/40",
  },
  error: {
    label: "Error",
    icon: "i-heroicons-exclamation-circle",
    textColor: "text-red-600 dark:text-red-300",
    badgeColor: "bg-red-100 dark:bg-red-900/40",
  },
};

const normalizeStatusList = (files = []) => {
  const snapshot = new Map(files.map((item) => [item.fileType, item]));

  return explosionFileDefinitions.map((definition) => {
    const existing = snapshot.get(definition.fileType) || {};

    return {
      fileType: definition.fileType,
      fileName: definition.fileName,
      status: existing.status || "pending",
      recordCount: existing.recordCount,
      s3Key: existing.s3Key,
      error: existing.error,
      updatedAt: existing.updatedAt,
    };
  });
};

const generationStatus = ref(null);
const fileStatuses = ref(normalizeStatusList());

const setStatusFromSnapshot = (snapshot = null) => {
  if (!snapshot) {
    generationStatus.value = null;
    fileStatuses.value = normalizeStatusList();
    return;
  }

  generationStatus.value = snapshot;
  fileStatuses.value = normalizeStatusList(snapshot.files);
};

const updateLocalStatus = (fileType, status, extras = {}) => {
  fileStatuses.value = fileStatuses.value.map((entry) => {
    if (entry.fileType !== fileType) {
      return entry;
    }

    const next = {
      ...entry,
      status,
      recordCount: extras.recordCount,
      s3Key: extras.s3Key,
      error: extras.error,
      updatedAt: extras.updatedAt ?? new Date().toISOString(),
    };

    if (status === 'pending' || status === 'processing') {
      next.recordCount = undefined;
      next.s3Key = undefined;
      next.error = undefined;
    }

    return next;
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const fileStatusEntries = computed(() =>
  explosionFileDefinitions.map((definition) => {
    const status = fileStatuses.value.find((item) => item.fileType === definition.fileType);

    return {
      ...definition,
      status: status?.status ?? 'pending',
      recordCount: status?.recordCount,
      s3Key: status?.s3Key,
      error: status?.error,
      updatedAt: status?.updatedAt,
    };
  }),
);

const allFilesSuccessful = computed(() =>
  fileStatuses.value.length > 0 && fileStatuses.value.every((item) => item.status === 'success'),
);

const hasFileErrors = computed(() => fileStatuses.value.some((item) => item.status === 'error'));

// Watcher para emitir cambios en el estado de carga
watch(explosionInProgress, (newValue) => {
  emit('loading-state-changed', newValue);
});

// Watcher para cerrar documentos cuando no están listos
watch(allFilesSuccessful, (isReady) => {
  if (!isReady && enableShowDocuments.value) {
    enableShowDocuments.value = false;
  }
});

// Función para obtener el estado general de generación desde S3
const fetchGenerationStatus = async () => {
  if (!props.boomId || !props.pversion || props.pversion.trim() === '') {
    setStatusFromSnapshot(null);
    return;
  }

  try {
    console.log(`🔄 Verificando estado de archivos CSV: boomId=${props.boomId}, pversion=${props.pversion}`);
    
    // Usar query para obtener estado desde S3 (verifica archivos existentes)
    const { data } = await client.queries.getExplosionGenerationStatus({
      boomId: props.boomId,
      pversion: props.pversion,
    });

    let response = data?.getExplosionGenerationStatus ?? data;

    if (typeof response === 'string') {
      response = JSON.parse(response);
    }

    console.log('📊 Estado de archivos recibido:', response);
    setStatusFromSnapshot(response);
  } catch (error) {
    console.warn('⚠️ No se pudo obtener el estado de generación de archivos:', error);
  }
};

watch(
  () => [props.boomId, props.pversion],
  async ([boomId, version]) => {
    if (boomId && version && version.trim() !== '') {
      await fetchGenerationStatus();
      // Polling periódico para verificar archivos en S3 cada 5 segundos
      if (explosionFilesPollingInterval.value) {
        clearInterval(explosionFilesPollingInterval.value);
      }
      explosionFilesPollingInterval.value = setInterval(async () => {
        console.log('🔄 Polling estado de archivos CSV...');
        await fetchGenerationStatus();
      }, 5000);
      console.log('✅ Polling de archivos CSV iniciado');
    } else {
      setStatusFromSnapshot(null);
      if (explosionFilesPollingInterval.value) {
        clearInterval(explosionFilesPollingInterval.value);
        explosionFilesPollingInterval.value = null;
      }
    }
  },
  { immediate: true },
);

// Función para generar archivos CSV desde MSSQL
const generateExplosionFiles = async () => {
  if (!props.pversion || props.pversion.trim() === '') {
    useToast().add({
      title: "Error de configuración",
      description: "La versión del boom no está definida. No se pueden generar los archivos CSV.",
      color: "red",
      timeout: 5000,
    });
    return false;
  }

  const toast = useToast();

  try {
    generatingFiles.value = true;

    console.log('📊 Iniciando generación asíncrona de archivos CSV desde MSSQL...');
    console.log(`📋 boomId: ${props.boomId}, pversion: ${props.pversion}`);

    // Cargar estado inicial
    await fetchGenerationStatus();

    // Mostrar mensaje de proceso iniciado
    toast.add({
      title: "Proceso iniciado",
      description: "La generación de archivos CSV ha comenzado. Recibirás actualizaciones en tiempo real.",
      color: "cyan",
      timeout: 5000,
    });

    // Iniciar todas las generaciones sin esperar respuestas
    // Las suscripciones manejarán todas las actualizaciones automáticamente
    const generationPromises = EXPLOSION_FILE_TYPES.map(async (fileType) => {
      const definition = explosionFileDefinitions.find((item) => item.fileType === fileType);

      if (!definition) {
        return;
      }

      console.log(`📄 Iniciando generación de ${definition.fileName}...`);
      
      // Actualizar estado local a "processing" inmediatamente
      updateLocalStatus(fileType, 'processing');

      try {
        // Llamar a la mutación sin esperar la respuesta completa
        // La Lambda retornará inmediatamente y ejecutará en segundo plano
        await client.mutations.generateExplosionFile({
          boomId: props.boomId,
          pversion: props.pversion,
          fileType,
        });

        console.log(`✅ Solicitud de generación enviada para ${definition.fileName}`);
      } catch (mutationError) {
        const errorMessage = mutationError instanceof Error
          ? mutationError.message
          : `Error desconocido al iniciar generación de ${definition.fileName}`;

        console.error(`❌ Error iniciando generación de ${definition.fileName}:`, mutationError);

        // Actualizar estado local a error
        updateLocalStatus(fileType, 'error', { error: errorMessage });

        toast.add({
          title: "Error iniciando generación",
          description: errorMessage,
          color: "red",
          timeout: 6000,
        });
      }
    });

    // Esperar a que todas las solicitudes se envíen (no esperamos que terminen)
    await Promise.allSettled(generationPromises);

    // El polling periódico verificará los archivos en S3 automáticamente
    generatingFiles.value = false;

    return true;
  } catch (error) {
    console.error('❌ Error general iniciando generación de archivos:', error);

    toast.add({
      title: "Error generando archivos",
      description: error instanceof Error ? error.message : 'Error desconocido al generar archivos CSV',
      color: "red",
      timeout: 5000,
    });

    generatingFiles.value = false;

    return false;
  }
};

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

// Función para descargar archivos desde CloudFront
const downloadFile = (fileName) => {
  try {
    // Construir la URL de CloudFront con el boom_id
    const cloudfrontUrl = `https://d1p0twkya81b3k.cloudfront.net/${props.boomId}/${fileName}?v=${new Date().getTime()}`;
    
    console.log(`📥 Descargando archivo: ${fileName} desde: ${cloudfrontUrl}`);
    
    // Abrir la URL en una nueva pestaña para iniciar la descarga
    window.open(cloudfrontUrl, '_blank');
    
    // Mostrar notificación de descarga iniciada
    useToast().add({
      title: "Descarga iniciada",
      description: `Iniciando descarga de ${fileName}`,
      color: "green",
      timeout: 3000
    });
    
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    
    useToast().add({
      title: "Error en descarga",
      description: `No se pudo descargar el archivo ${fileName}`,
      color: "red",
      timeout: 4000
    });
  }
};

// Función para limpiar completamente el estado de polling
const limpiarEstadoPolling = () => {
  console.log('🧹 Limpiando estado de polling completamente');
  
  // Detener polling activo si existe
  if (explosionPollingInterval.value) {
    clearInterval(explosionPollingInterval.value);
    explosionPollingInterval.value = null;
    console.log('🛑 Polling detenido para reinicio');
  }
  
  // Resetear estado de UI
  explosionInProgress.value = false;
  console.log('🧹 Estado de UI reseteado');
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

      // Emitir evento para ocultar la sección de documentos de la ejecución anterior
      emit('explosion-restarted');

      // Limpiar completamente el estado de polling
      limpiarEstadoPolling();
      setStatusFromSnapshot(null);

      // Limpiar el estado del Boom para permitir nueva ejecución
      await client.models.Boom.update({
        id: props.explosionId,
        PiepelineRunIdExplocion: null,
        ExecuteBoomStatus: null
      });

      console.log('🔄 Estado reseteado, ejecutando nueva explosión automáticamente...');

      // Mostrar notificación de que se está ejecutando
      useToast().add({
        title: "Re-ejecutando explosión",
        description: "Se ha iniciado una nueva ejecución del pipeline de explosión.",
        color: "blue",
        timeout: 3000
      });

      // Pequeño delay para asegurar que el estado se actualice correctamente
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ejecutar automáticamente el pipeline después de resetear
      await executeExplosion();

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
    // Validar que Pversion no esté vacío antes de ejecutar
    if (!props.pversion || props.pversion.trim() === '') {
      console.error('❌ Error: Pversion está vacío o no definido');
      useToast().add({
        title: "Error de configuración",
        description: "La versión del boom no está definida. No se puede ejecutar la explosión.",
        color: "red",
        timeout: 5000
      });
      return;
    }

    console.log('🚀 Ejecutando pipeline ExplocionarDesdePortal...');

    setStatusFromSnapshot(null);

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
    console.log('🔍 Debugging Pversion - props.pversion:', props.pversion);
    console.log('🔍 Debugging Pversion - typeof:', typeof props.pversion);
    console.log('🔍 Debugging Pversion - length:', props.pversion?.length);
    console.log('🔍 Debugging Pversion - isEmpty:', props.pversion === '' || !props.pversion);
    
    if (props.pversion && props.pversion.trim() !== '') {
      pipelineArgs.Pversion = props.pversion;
      console.log(`📋 Enviando Pversion: ${props.pversion} para pipeline de explosión`);
    } else {
      console.warn('⚠️ Pversion está vacío o no definido, no se enviará al pipeline');
      console.warn('⚠️ Esto podría causar problemas en el pipeline de Azure Data Factory');
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

// Función centralizada para manejar todo el polling del pipeline
const managePolling = async (runId, status) => {
  console.log(`🔄 managePolling llamado con runId: ${runId}, status: ${status}`);
  
  // Estados que requieren polling activo
  const pollingStates = ['Queued', 'InProgress'];
  
  // Estados finales que detienen el polling COMPLETAMENTE
  const finalStates = ['Succeeded', 'Failed', 'Canceling', 'Cancelled'];
  
  if (finalStates.includes(status)) {
    // Detener polling si está activo y NO permitir más consultas
    if (explosionPollingInterval.value) {
      console.log('🛑 Pipeline terminado, deteniendo polling completamente - estado:', status);
      clearInterval(explosionPollingInterval.value);
      explosionPollingInterval.value = null;
    }
    console.log('🛑 Pipeline en estado final, no se realizarán más consultas hasta reinicio');
    return;
  }
  
  if (pollingStates.includes(status) || !status) {
    // Solo iniciar polling si no hay uno activo
    if (!explosionPollingInterval.value) {
      console.log('🔄 Iniciando polling para estado:', status || 'desconocido');
      await iniciarPollingExplosion(runId);
    } else {
      console.log('🔄 Polling ya activo, no iniciando nuevo interval');
    }
  }
};

// Función para iniciar polling del estado del pipeline de explosión
const iniciarPollingExplosion = async (runId) => {
  try {
    console.log(`🔄 Iniciando polling para pipeline de explosión con runId: ${runId}`);
    
    // Consultar el estado inicial
    await consultarEstadoPipelineExplosion(runId);
    
    // Si ya no hay intervalo (fue detenido por estado final), no continuar
    if (!explosionPollingInterval.value) {
      console.log('🛑 Polling fue detenido, no configurando interval');
      return;
    }
    
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
        
        // Si el intervalo fue detenido por estado final, no continuar
        if (!explosionPollingInterval.value) {
          console.log('🛑 Polling detenido por estado final, cancelando interval');
          clearInterval(intervalId);
          return;
        }
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
    
    // Si el pipeline está en estado final, no continuar con más consultas
    const finalStates = ['Succeeded', 'Failed', 'Canceling', 'Cancelled'];
    if (finalStates.includes(status)) {
      console.log('🛑 Pipeline terminado, no se realizarán más consultas automáticas');
      return;
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
  
  // Actualizar estado de UI según el status
  const inProgressStates = ['Queued', 'InProgress'];
  explosionInProgress.value = inProgressStates.includes(status);
  
  switch (status) {
    case 'Succeeded':
      console.log('✅ Pipeline completado exitosamente');
      
      // Asegurar que explosionInProgress esté en false para mostrar estado de procesando documentos
      explosionInProgress.value = false;
      
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
      
      // Generar archivos CSV antes de marcar como completado
      console.log('📊 Generando archivos CSV desde MSSQL...');
      const filesGenerated = await generateExplosionFiles();
      
      if (filesGenerated) {
        // Actualizar Boom con estado completado solo si los archivos se generaron exitosamente
        await actualizarBoomStatusExplosion('Completado');
        
        // Emitir evento de completado
        emit('explosion-completed');
        
        useToast().add({
          title: "¡Explosión completada!",
          description: "La explosión de materiales se ha ejecutado exitosamente. Los archivos CSV están listos para descarga.",
          color: "green",
          timeout: 5000
        });
      } else {
        // Si hubo errores generando archivos, marcar como error pero no completado
        console.warn('⚠️ Error generando archivos CSV, no se marca como completado');
        await actualizarBoomStatusExplosion('Error');
        
        useToast().add({
          title: "Pipeline completado con errores",
          description: "El pipeline terminó exitosamente, pero hubo errores al generar los archivos CSV. Puedes reintentar.",
          color: "orange",
          timeout: 5000
        });
      }
      break;

    case 'Failed':
    case 'Canceling':
    case 'Cancelled':
      console.log('❌ Pipeline de explosión falló con estado:', status);
      
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
      break;

    case 'InProgress':
      console.log('⏳ Pipeline de explosión aún en progreso...');
      break;

    default:
      console.warn('⚠️ Estado desconocido del pipeline de explosión:', status);
  }
  
  // Manejar polling usando la función centralizada
  await managePolling(runId, status);
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

    // Cargar el estado inicial del campo enableShowDocuments
    enableShowDocuments.value = data.enableShowDocuments ?? false;
    console.log('📄 Estado inicial de enableShowDocuments:', enableShowDocuments.value);

    if (runIdExplosion && statusExplosion) {
      // Mapear estados de la base de datos a estados del pipeline
      let pipelineStatus = null;
      
      if (statusExplosion === 'En Proceso') {
        pipelineStatus = 'InProgress'; // Asumir que está en progreso si no sabemos el estado exacto
      } else if (statusExplosion === 'Completado') {
        pipelineStatus = 'Succeeded';
        explosionInProgress.value = false;
        emit('explosion-completed');
        console.log('✅ Pipeline de explosión ya completado');
        return; // No necesitamos polling para estado completado
      } else if (statusExplosion === 'Error') {
        explosionInProgress.value = false;
        console.log('❌ Pipeline de explosión en estado de error, permitiendo reintento');
        return; // No necesitamos polling para estado de error
      }
      
      // Si necesitamos polling, usar la función centralizada
      if (pipelineStatus) {
        explosionInProgress.value = true;
        await managePolling(runIdExplosion, pipelineStatus);
      }
    }
  } catch (error) {
    console.error('❌ Error verificando estado inicial del pipeline de explosión:', error);
  }
};

// Función para alternar la visibilidad de documentos
const toggleShowDocuments = async () => {
  try {
    updatingDocuments.value = true;
    
    await client.models.Boom.update({
      id: props.explosionId,
      enableShowDocuments: enableShowDocuments.value
    });
    
    useToast().add({
      title: "Configuración actualizada",
      description: `Documentos ${enableShowDocuments.value ? 'habilitados' : 'deshabilitados'} para visualización`,
      color: "green",
      timeout: 3000
    });
    
    console.log('📄 Estado de documentos actualizado:', enableShowDocuments.value);
  } catch (error) {
    console.error('❌ Error actualizando enableShowDocuments:', error);
    
    // Revertir el estado del checkbox en caso de error
    enableShowDocuments.value = !enableShowDocuments.value;
    
    useToast().add({
      title: "Error",
      description: "No se pudo actualizar la configuración de documentos",
      color: "red",
      timeout: 4000
    });
  } finally {
    updatingDocuments.value = false;
  }
};

// Cargar estado inicial al montar el componente
onMounted(async () => {
  await checkInitialExplosionState();
});

// Configuración del tour específico para ExplosionProcess
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
        element: '#explosion-tour-trigger',
        popover: {
          title: '🚀 Tour: Explosión de Materiales',
          description: 'Este tour te mostrará el proceso final de explosión de materiales y los reportes que se generan como resultado.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.explosion-container',
        popover: {
          title: '💥 Proceso de Explosión Final',
          description: 'Aquí se ejecuta el proceso principal que genera todos los reportes finales: Aprovisionamiento, Explosión por modelo, Explosión por materia prima, Plan de Ventas y Plan de Producción.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.explosion-execution-section',
        popover: {
          title: '⚡ Ejecutar Explosión',
          description: 'Botón principal para iniciar el proceso de explosión. Una vez ejecutado, se generarán todos los reportes finales del análisis de materiales.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.explosion-progress-section',
        popover: {
          title: '⏳ Proceso en Ejecución',
          description: 'Durante la ejecución, el sistema procesa todos los datos y genera los reportes. Este proceso puede tomar varios minutos.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.explosion-completed-section',
        popover: {
          title: '✅ Explosión Completada',
          description: 'Una vez completada la explosión, todos los reportes estarán disponibles: Aprovisionamiento configurado, Explosión por modelo, Explosión por materia prima, Plan de Ventas y Plan de Producción.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.download-files-section',
        popover: {
          title: '📁 Archivos para Descargar',
          description: 'Una vez completada la explosión, aquí encontrarás 5 archivos CSV listos para descargar: Aprovisionamiento configurado, Explosión del plan por modelo con semielaborados, Explosión del plan por materia prima con semielaborados, Plan de Ventas y Plan de Producción.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.re-execution-section',
        popover: {
          title: '🔄 Re-ejecutar Explosión',
          description: 'Si necesitas regenerar los reportes con datos actualizados, puedes re-ejecutar el proceso de explosión en cualquier momento.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.document-visibility-toggle',
        popover: {
          title: '📄 Control de Visibilidad',
          description: 'Habilita o deshabilita el acceso a los documentos generados para otros perfiles de usuario.',
          side: 'top',
          align: 'center'
        }
      },
      {
        popover: {
          title: '📊 Reportes Generados',
          description: 'Como resultado de la explosión obtendrás: Aprovisionamiento configurado, Explosión del plan por modelo con semielaborados, Explosión del plan por materia prima con semielaborados, Plan de Ventas y Plan de Producción.',
          side: 'center'
        }
      },
      {
        popover: {
          title: '🎉 ¡Tour Completado!',
          description: 'Ya conoces el proceso final de explosión de materiales. Recuerda que este paso genera todos los reportes finales necesarios para el análisis completo.',
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

// Limpiar polling al desmontar el componente
onUnmounted(() => {
  // Limpiar polling del pipeline de explosión
  if (explosionPollingInterval.value) {
    clearInterval(explosionPollingInterval.value);
    explosionPollingInterval.value = null;
  }
  
  // Limpiar polling del estado de archivos CSV
  if (explosionFilesPollingInterval.value) {
    clearInterval(explosionFilesPollingInterval.value);
    explosionFilesPollingInterval.value = null;
  }
  
  limpiarEstadoPolling();
  console.log('🧹 Componente desmontado, estado de polling limpiado');
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
