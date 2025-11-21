<template>
  <div class="min-h-screen">
    <!-- Header de la página -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h1
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon
                name="i-heroicons-document-magnifying-glass"
                class="w-7 h-7 text-white"
              />
            </div>
            Detalle de Unificación
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Información completa de la unificación de BOOMs
          </p>
        </div>

        <!-- Botón volver -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/tools/explosion-materiales/unificaciones-boom">
            <UButton
              icon="i-heroicons-arrow-left"
              color="gray"
              variant="outline"
              size="md"
            >
              Volver
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">
            Cargando unificación...
          </p>
        </div>
      </div>

      <!-- Detalle de la unificación -->
      <div v-else-if="unification" class="space-y-6">
        <!-- Card principal con información general -->
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20"
        >
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
            <h2 class="text-2xl font-bold text-white flex items-center">
              <UIcon name="i-heroicons-squares-plus" class="w-6 h-6 mr-3" />
              {{ unification.descripcion }}
            </h2>
          </div>

          <div class="p-6">
            <!-- Grid de información -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Usuario -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Creado por
                </div>
                <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <UIcon name="i-heroicons-user" class="w-4 h-4 mr-1" />
                  {{ unification.username }}
                </div>
              </div>

              <!-- Fecha de creación -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fecha de creación
                </div>
                <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
                  {{ formatDate(unification.createdAt) }}
                </div>
              </div>

              <!-- Estado -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Estado
                </div>
                <UBadge
                  color="cyan"
                  variant="soft"
                  size="sm"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-check-badge" class="w-3 h-3" />
                  </template>
                  {{ unification.status }}
                </UBadge>
              </div>

              <!-- Total BOOMs -->
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  BOOMs incluidos
                </div>
                <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {{ unification.boomsIncluidos?.length || 0 }}
                </div>
              </div>
            </div>

            <!-- Información adicional si existe -->
            <div v-if="unification.aditionalData" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Información Adicional
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="unification.aditionalData.versions">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Versiones incluidas
                  </div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    {{ unification.aditionalData.versions }}
                  </div>
                </div>
                <div v-if="unification.aditionalData.createdBy">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Creado por
                  </div>
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    {{ unification.aditionalData.createdBy }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de BOOMs incluidos -->
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20"
        >
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center">
              <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 mr-3" />
              BOOMs Incluidos ({{ unification.boomsIncluidos?.length || 0 }})
            </h2>
          </div>

          <div class="p-6">
            <div v-if="unification.boomsIncluidos && unification.boomsIncluidos.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead class="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">#</th>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">Versión</th>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">Descripción</th>
                    <th scope="col" class="px-4 py-3 text-left font-semibold tracking-wide">Fecha de creación</th>
                    <th scope="col" class="px-4 py-3 text-right font-semibold tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr
                    v-for="(boom, index) in unification.boomsIncluidos"
                    :key="boom.id"
                    class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                  >
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                      {{ index + 1 }}
                    </td>
                    <td class="px-4 py-3 text-cyan-600 dark:text-cyan-400 font-semibold flex items-center">
                      <UIcon name="i-heroicons-hashtag" class="w-4 h-4 mr-1" />
                      {{ boom.version }}
                    </td>
                    <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {{ boom.descripcion }}
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                      {{ formatDate(boom.createdAt) }}
                    </td>
                    <td class="px-4 py-3 text-right">
                      <NuxtLink :to="`/tools/explosion-materiales/view/${boom.id}`">
                        <UButton
                          icon="i-heroicons-arrow-top-right-on-square"
                          size="xs"
                          color="cyan"
                          variant="ghost"
                          class="transition-transform hover:scale-[1.02]"
                        >
                          Ver BOOM
                        </UButton>
                      </NuxtLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Estado vacío -->
            <div v-else class="text-center py-8">
              <p class="text-gray-600 dark:text-gray-400">
                No hay BOOMs incluidos en esta unificación
              </p>
            </div>
          </div>
        </div>

        <!-- Card de archivos generados -->
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20"
        >
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center">
              <UIcon name="i-heroicons-document-arrow-down" class="w-6 h-6 mr-3" />
              Archivos Generados
            </h2>
          </div>

          <div class="p-6">
            <!-- Estado de carga de archivos -->
            <div v-if="loadingFiles" class="flex justify-center items-center py-8">
              <div class="text-center">
                <div
                  class="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                ></div>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Cargando archivos...
                </p>
              </div>
            </div>

            <!-- Lista de archivos -->
            <div v-else-if="generatedFiles && generatedFiles.length > 0" class="space-y-3">
              <button
                v-for="file in generatedFiles"
                :key="file.fileType"
                type="button"
                :disabled="file.status !== 'success'"
                @click="file.status === 'success' ? downloadFile(file) : undefined"
                :class="[
                  'group w-full rounded-md p-4 border transition-all duration-300 text-left',
                  file.status === 'success'
                    ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border-cyan-200/30 dark:border-cyan-700/30 hover:shadow-xl hover:border-cyan-300/50 dark:hover:border-cyan-600/50 hover:-translate-y-1 cursor-pointer'
                    : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/40 dark:border-gray-700/40 cursor-not-allowed opacity-75',
                ]"
              >
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <!-- Información del archivo -->
                  <div class="flex items-center space-x-4 flex-1 min-w-0">
                    <!-- Icono del archivo con gradiente -->
                    <div
                      :class="[
                        'w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
                        file.gradient,
                        file.status === 'success' && 'group-hover:scale-110 transition-transform',
                      ]"
                    >
                      <UIcon
                        :name="getFileIcon(file.fileName)"
                        class="w-6 h-6 text-white"
                      />
                    </div>

                    <!-- Detalles del archivo -->
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {{ file.label }}
                      </h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ file.description }}
                      </p>
                      <div class="flex items-center gap-3 mt-1">
                        <span v-if="typeof file.recordCount === 'number'" class="text-xs text-gray-400 dark:text-gray-500">
                          Registros: {{ file.recordCount.toLocaleString() }}
                        </span>
                        <span v-if="file.updatedAt" class="text-xs text-gray-400 dark:text-gray-500">
                          {{ file.recordCount ? '•' : '' }} {{ formatDate(file.updatedAt) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Estado y botón de descarga -->
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <!-- Badge de estado -->
                    <span
                      :class="[
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold',
                        file.status === 'pending' && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                        file.status === 'processing' && 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300',
                        file.status === 'success' && 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300',
                        file.status === 'error' && 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
                      ]"
                    >
                      <UIcon
                        :name="
                          file.status === 'pending' ? 'i-heroicons-clock' :
                          file.status === 'processing' ? 'i-heroicons-arrow-path' :
                          file.status === 'success' ? 'i-heroicons-check-circle' :
                          'i-heroicons-exclamation-circle'
                        "
                        class="w-4 h-4"
                      />
                      {{
                        file.status === 'pending' ? 'Pendiente' :
                        file.status === 'processing' ? 'Procesando' :
                        file.status === 'success' ? 'Listo' :
                        'Error'
                      }}
                    </span>

                    <!-- Icono de descarga o spinner -->
                    <div v-if="downloadingFile === file.fileType" class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                    <UIcon
                      v-else
                      name="i-heroicons-arrow-down-tray"
                      :class="[
                        'w-5 h-5 transition-transform duration-200',
                        file.status === 'success' ? 'text-cyan-600 dark:text-cyan-400 group-hover:scale-110' : 'text-gray-400 opacity-40',
                      ]"
                    />
                  </div>
                </div>

                <!-- Mensaje de error si existe -->
                <p v-if="file.error" class="mt-3 text-xs text-red-600 dark:text-red-400">
                  {{ file.error }}
                </p>
              </button>
            </div>

            <!-- Estado vacío -->
            <div v-else class="text-center py-12">
              <div
                class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30 rounded-md flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-12 h-12 text-gray-400 dark:text-gray-600"
                />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No hay archivos disponibles
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Los archivos generados en la explosión de materiales aparecerán aquí cuando estén disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-16 h-16 text-red-600 dark:text-red-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Unificación no encontrada
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          La unificación solicitada no existe o no tienes permisos para verla
        </p>
        <NuxtLink to="/tools/explosion-materiales/unificaciones-boom">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
            Volver al listado
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: ["EXPLOSION", "ADMIN"],
});

// Route params
const route = useRoute();
const unificationId = route.params.id;

// Cliente de Amplify
const client = generateClient();

// Composables
const toast = useToast();
const { logAction } = useAudit();

// Meta tags para SEO
useSeoMeta({
  title: "Detalle de Unificación - Portal Diveco",
  description: "Información detallada de la unificación de explosiones",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Unificaciones", href: "/tools/explosion-materiales/unificaciones-boom" },
  { title: "Detalle" },
]);

// Estado reactivo
const unification = ref(null);
const loading = ref(false);
const loadingFiles = ref(false);
const generatedFiles = ref([]);
const downloadingFile = ref(null);

// Métodos
const fetchUnification = async () => {
  try {
    loading.value = true;

    const { data, errors } = await client.models.BoomUnificacion.get({
      id: unificationId,
      selectionSet: [
        'id',
        'descripcion',
        'username',
        'status',
        'boomsIncluidos',
        'createdAt',
        'updatedAt',
        'aditionalData'
      ]
    });

    if (errors || !data) {
      console.error("Error fetching unification:", errors);
      toast.add({
        title: "Error",
        description: "No se pudo cargar la unificación",
        color: "red",
      });
      return;
    }

    // Parsear JSON
    unification.value = {
      ...data,
      boomsIncluidos: typeof data.boomsIncluidos === 'string'
        ? JSON.parse(data.boomsIncluidos)
        : data.boomsIncluidos,
      aditionalData: data.aditionalData && typeof data.aditionalData === 'string'
        ? JSON.parse(data.aditionalData)
        : data.aditionalData
    };

    // Registrar auditoría
    await logAction(
      "READ",
      "boom-unificacion",
      "BoomUnificacion",
      unificationId,
      {
        after: {
          descripcion: unification.value.descripcion,
        },
      },
      { context: "detalle-unificacion" }
    );

    // Cargar archivos generados después de tener los datos de la unificación
    await fetchGeneratedFiles();

  } catch (error) {
    console.error("Error loading unification:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al cargar la unificación",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "No disponible";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Definición de archivos de explosión (igual que en ExplosionProcess.vue)
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

// Formatear tamaño de archivo
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "N/A";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Obtener icono según tipo de archivo
const getFileIcon = (fileName) => {
  if (!fileName) return "i-heroicons-document-text";
  
  const extension = fileName.split(".").pop()?.toLowerCase();
  
  switch (extension) {
    case "xlsx":
    case "xls":
      return "i-heroicons-table-cells";
    case "csv":
      return "i-heroicons-chart-bar";
    case "pdf":
      return "i-heroicons-document-text";
    case "zip":
    case "rar":
      return "i-heroicons-archive-box";
    case "txt":
      return "i-heroicons-document";
    default:
      return "i-heroicons-document-text";
  }
};

// Descargar archivo desde CloudFront
const downloadFile = async (file) => {
  try {
    downloadingFile.value = file.fileType;
    
    // Obtener el primer boomId de los BOOMs incluidos para construir la URL
    const firstBoomId = unification.value.boomsIncluidos?.[0]?.id;
    
    if (!firstBoomId) {
      toast.add({
        title: "Error",
        description: "No se encontró un BOOM válido para descargar el archivo",
        color: "red",
      });
      return;
    }

    // Construir la URL de CloudFront con el boom_id (igual que en ExplosionProcess.vue)
    const cloudfrontUrl = `https://d1p0twkya81b3k.cloudfront.net/${firstBoomId}/${file.fileName}?v=${new Date().getTime()}`;
    
    console.log(`📥 Descargando archivo: ${file.fileName} desde: ${cloudfrontUrl}`);
    
    // Abrir la URL en una nueva pestaña para iniciar la descarga
    window.open(cloudfrontUrl, '_blank');
    
    // Mostrar notificación de descarga iniciada
    toast.add({
      title: "Descarga iniciada",
      description: `Iniciando descarga de ${file.fileName}`,
      color: "green",
    });

    // Registrar auditoría
    await logAction(
      "DOWNLOAD",
      "boom-unificacion-file",
      "BoomUnificacion",
      unificationId,
      {
        after: {
          fileName: file.fileName,
          fileType: file.fileType,
          boomId: firstBoomId,
        },
      },
      { context: "descarga-archivo-explosion" }
    );

  } catch (error) {
    console.error("Error downloading file:", error);
    toast.add({
      title: "Error en descarga",
      description: `No se pudo descargar el archivo ${file.fileName}`,
      color: "red",
    });
  } finally {
    downloadingFile.value = null;
  }
};

// Cargar archivos generados desde S3 (usando el query getExplosionGenerationStatus)
const fetchGeneratedFiles = async () => {
  try {
    loadingFiles.value = true;

    // Necesitamos un boomId y pversion para consultar los archivos
    const firstBoom = unification.value?.boomsIncluidos?.[0];
    
    if (!firstBoom?.id || !firstBoom?.version) {
      console.log("No hay BOOMs con versión disponibles para consultar archivos");
      generatedFiles.value = [];
      return;
    }

    console.log(`🔄 Verificando archivos para boomId=${firstBoom.id}, pversion=${firstBoom.version}`);

    // Consultar el estado de generación de archivos
    const { data } = await client.queries.getExplosionGenerationStatus({
      boomId: firstBoom.id,
      pversion: firstBoom.version,
    });

    let response = data?.getExplosionGenerationStatus ?? data;

    if (typeof response === 'string') {
      response = JSON.parse(response);
    }

    console.log('📊 Estado de archivos recibido:', response);

    // Mapear los archivos con su estado
    if (response?.files && Array.isArray(response.files)) {
      generatedFiles.value = explosionFileDefinitions.map((definition) => {
        const fileStatus = response.files.find((f) => f.fileType === definition.fileType);
        
        return {
          ...definition,
          status: fileStatus?.status || 'pending',
          recordCount: fileStatus?.recordCount,
          s3Key: fileStatus?.s3Key,
          error: fileStatus?.error,
          updatedAt: fileStatus?.updatedAt,
        };
      });
    } else {
      // Si no hay respuesta, mostrar todos como pendientes
      generatedFiles.value = explosionFileDefinitions.map((definition) => ({
        ...definition,
        status: 'pending',
      }));
    }

  } catch (error) {
    console.error("Error loading files:", error);
    // En caso de error, mostrar la lista de archivos esperados
    generatedFiles.value = explosionFileDefinitions.map((definition) => ({
      ...definition,
      status: 'pending',
    }));
  } finally {
    loadingFiles.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchUnification();
});
</script>

