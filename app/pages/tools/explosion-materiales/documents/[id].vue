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
              <UIcon name="i-heroicons-document-text" class="w-7 h-7 text-white" />
            </div>
            Documentos de Explosión
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            {{ explosion?.version || "" }} - {{ explosion?.descripcion || "" }}
          </p>
          
          <!-- Badge de estado de documentos -->
          <div class="mt-2 ml-16">
            <UBadge 
              :class="explosion?.enableShowDocuments ? 'bg-cyan-500 text-white' : 'bg-gray-500 text-white'"
              variant="subtle"
              size="md"
            >
              <template #leading>
                <UIcon 
                  :name="explosion?.enableShowDocuments ? 'i-heroicons-document-check' : 'i-heroicons-document-minus'" 
                  class="w-4 h-4" 
                />
              </template>
              {{ explosion?.enableShowDocuments ? 'Documentos Habilitados' : 'Documentos No Habilitados' }}
            </UBadge>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center space-x-3">
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

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">
            Cargando documentos...
          </p>
        </div>
      </div>

      <!-- Estado sin documentos habilitados -->
      <div v-else-if="!explosion?.enableShowDocuments" class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-document-minus"
            class="w-16 h-16 text-gray-600 dark:text-gray-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Documentos No Habilitados
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Los documentos de esta explosión no están habilitados para visualización pública.
        </p>
        <NuxtLink to="/tools/explosion-materiales">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
            Volver al Listado
          </button>
        </NuxtLink>
      </div>

      <!-- Lista de documentos disponibles -->
      <div v-else class="space-y-6">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-6">
          <h2 class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-6 flex items-center">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 mr-3" />
            Documentos Generados
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Plan por modelo con semielaborados -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <UIcon name="i-heroicons-cube" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Plan por modelo con semielaborados
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Detalle de producción por modelo considerando semielaborados
                  </p>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Archivo:</span>
                  <span class="text-sm font-mono text-gray-800 dark:text-gray-200 text-xs">PlanModeloConSemielaborados.csv</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Registros:</span>
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">374,575</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Estado:</span>
                  <UBadge color="green" variant="soft" size="sm">
                    Disponible
                  </UBadge>
                </div>
              </div>
              
              <div class="mt-4">
                <button
                  @click="downloadFile('PlanModeloConSemielaborados.csv')"
                  class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                  <span>Descargar Documento</span>
                </button>
              </div>
            </div>

            <!-- Plan por materia prima con semielaborados -->
            <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <UIcon name="i-heroicons-beaker" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Plan por materia prima con semielaborados
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Necesidades de materias primas asociadas a semielaborados
                  </p>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Archivo:</span>
                  <span class="text-sm font-mono text-gray-800 dark:text-gray-200 text-xs">PlanModeloMateriasPrimaConSemielaborados.csv</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Estado:</span>
                  <UBadge color="green" variant="soft" size="sm">
                    Disponible
                  </UBadge>
                </div>
              </div>
              
              <div class="mt-4">
                <button
                  @click="downloadFile('PlanModeloMateriasPrimaConSemielaborados.csv')"
                  class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                  <span>Descargar Documento</span>
                </button>
              </div>
            </div>

            <!-- Plan de Ventas -->
            <div class="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg border border-red-200 dark:border-red-700/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Plan de Ventas
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Proyección de ventas por periodo y modelo
                  </p>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Archivo:</span>
                  <span class="text-sm font-mono text-gray-800 dark:text-gray-200">PlanVentas.csv</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Estado:</span>
                  <UBadge color="green" variant="soft" size="sm">
                    Disponible
                  </UBadge>
                </div>
              </div>
              
              <div class="mt-4">
                <button
                  @click="downloadFile('PlanVentas.csv')"
                  class="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                  <span>Descargar Plan de Ventas</span>
                </button>
              </div>
            </div>

            <!-- Plan de Producción -->
            <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Plan de Producción
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Resumen final del plan de producción consolidado
                  </p>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Archivo:</span>
                  <span class="text-sm font-mono text-gray-800 dark:text-gray-200">PlanProduccion.csv</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Estado:</span>
                  <UBadge color="green" variant="soft" size="sm">
                    Disponible
                  </UBadge>
                </div>
              </div>
              
              <div class="mt-4">
                <button
                  @click="downloadFile('PlanProduccion.csv')"
                  class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                  <span>Descargar Plan de Producción</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: "REVISAR-EXPLOSION", // Solo REVISAR-EXPLOSION puede ver documentos
});

// Cliente de Amplify
const client = generateClient();

// Composables
const { logRead, logAction } = useAudit();

// Obtener ID de la ruta
const route = useRoute();
const explosionId = route.params.id;

// Meta tags para SEO
useSeoMeta({
  title: "Documentos de Explosión - Portal Diveco",
  description: "Visualizar y descargar documentos de explosión de materiales",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Documentos" },
]);

// Estado reactivo
const loading = ref(true);
const explosion = ref(null);

// Métodos
const fetchExplosion = async () => {
  try {
    loading.value = true;
    const { data } = await client.models.Boom.get({ id: explosionId });
    explosion.value = data;

    // Registrar auditoría READ al acceder a documentos con datos del registro
    if (data) {
      try {
        await logAction(
          "READ",
          "boom",
          "Boom",
          explosionId,
          {
            after: {
              id: data.id,
              version: data.version,
              descripcion: data.descripcion,
              status: data.status,
              enableShowDocuments: data.enableShowDocuments,
            },
          },
          {
            version: data.version,
            descripcion: data.descripcion,
            action: "VIEW_DOCUMENTS",
            enableShowDocuments: data.enableShowDocuments,
          }
        );
      } catch (auditError) {
        console.warn("Error al registrar auditoría READ documentos:", auditError);
        // No bloquear la carga si falla la auditoría
      }
    }
  } catch (error) {
    console.error("Error al cargar explosión:", error);
    explosion.value = null;
  } finally {
    loading.value = false;
  }
};

// Función para obtener el tipo de documento basado en el nombre del archivo
const getDocumentType = (fileName) => {
  if (fileName.includes("PlanModeloConSemielaborados.csv")) {
    return "PlanModeloConSemielaborados";
  } else if (fileName.includes("PlanModeloMateriasPrimaConSemielaborados.csv")) {
    return "PlanMateriaPrimaSemielaborados";
  } else if (fileName.includes("PlanVentas.csv")) {
    return "PlanVentas";
  } else if (fileName.includes("PlanProduccion.csv")) {
    return "PlanProduccion";
  }
  return "Unknown";
};

// Función para descargar archivos desde CloudFront
const downloadFile = async (fileName) => {
  try {
    // Construir la URL de CloudFront con el boom_id
    const cloudfrontUrl = `https://d1p0twkya81b3k.cloudfront.net/${explosionId}/${fileName}`;
    
    console.log(`📥 Descargando archivo: ${fileName} desde: ${cloudfrontUrl}`);
    
    // Registrar auditoría DOWNLOAD
    try {
      await logAction(
        "DOWNLOAD",
        "boom",
        "Boom",
        explosionId,
        undefined,
        {
          fileName: fileName,
          documentType: getDocumentType(fileName),
          explosionId: explosionId,
          downloadSource: "cloudfront",
          version: explosion.value?.version,
          descripcion: explosion.value?.descripcion,
        }
      );
    } catch (auditError) {
      console.warn("Error al registrar auditoría DOWNLOAD:", auditError);
      // No bloquear la descarga si falla la auditoría
    }
    
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

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchExplosion();
});
</script>
