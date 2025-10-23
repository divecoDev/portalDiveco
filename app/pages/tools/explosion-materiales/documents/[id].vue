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
            <!-- Plan de Ventas -->
            <div class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-6 rounded-lg border border-cyan-200 dark:border-cyan-700/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Plan de Ventas
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Documento CSV con datos de ventas
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
                  class="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                  <span>Descargar Plan de Ventas</span>
                </button>
              </div>
            </div>

            <!-- Plan de Producción -->
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-700/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Plan de Producción
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Documento CSV con datos de producción
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
                  class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
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
  } catch (error) {
    console.error("Error al cargar explosión:", error);
    explosion.value = null;
  } finally {
    loading.value = false;
  }
};

// Función para descargar archivos desde CloudFront
const downloadFile = (fileName) => {
  try {
    // Construir la URL de CloudFront con el boom_id
    const cloudfrontUrl = `https://d1p0twkya81b3k.cloudfront.net/${explosionId}/${fileName}`;
    
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

// Cargar datos al montar el componente
onMounted(async () => {
  await fetchExplosion();
});
</script>
