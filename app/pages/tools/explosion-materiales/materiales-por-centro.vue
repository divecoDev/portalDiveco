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
              <UIcon
                name="i-heroicons-building-office-2"
                class="w-7 h-7 text-white"
              />
            </div>
            Materiales por Centro
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Visualización de materiales por centro de producción
          </p>
        </div>

        <!-- Botón de regresar -->
        <div class="flex items-center space-x-3">
          <NuxtLink to="/tools/explosion-materiales">
            <UButton
              icon="i-heroicons-arrow-left"
              size="md"
              color="gray"
              variant="ghost"
              class="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Volver
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros y búsqueda -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Búsqueda -->
          <div class="flex-1">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar por material ID, descripción..."
              size="md"
              class="w-full"
              @keyup.enter="fetchMateriales"
            />
          </div>

          <!-- Botón de recargar -->
          <div>
            <UButton
              icon="i-heroicons-arrow-path"
              size="md"
              color="cyan"
              variant="ghost"
              :loading="loading"
              @click="fetchMateriales"
              class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            >
              Recargar
            </UButton>
          </div>
        </div>
      </div>

      <!-- Estado inicial - sin búsqueda -->
      <div v-if="!hasSearched && !loading" class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Busca materiales por centro
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Ingresa un material ID o descripción para comenzar a buscar en la base de datos
        </p>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">
            Buscando materiales...
          </p>
        </div>
      </div>

      <!-- Tabla de materiales -->
      <div v-else-if="filteredMateriales.length > 0">
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/20 dark:border-cyan-700/20 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead
                class="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white"
              >
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Centro
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Material ID
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    v-for="column in visibleColumns"
                    :key="column"
                  >
                    {{ formatColumnName(column) }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(material, index) in filteredMateriales"
                  :key="`${material.centroId}-${material.materialId}-${index}`"
                  class="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ material.centroId }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {{ formatMaterialId(material.materialId) }}
                  </td>
                  <td
                    v-for="column in visibleColumns"
                    :key="column"
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {{ formatValue(material[column]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div
            v-if="totalPages > 1"
            class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700"
          >
            <div class="flex-1 flex justify-between sm:hidden">
              <UButton
                :disabled="!paginationInfo.hasPreviousPage"
                @click="goToPreviousPage"
                size="sm"
                color="cyan"
                variant="ghost"
              >
                Anterior
              </UButton>
              <UButton
                :disabled="!paginationInfo.hasNextPage"
                @click="goToNextPage"
                size="sm"
                color="cyan"
                variant="ghost"
              >
                Siguiente
              </UButton>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando
                  <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                  a
                  <span class="font-medium">{{ Math.min(currentPage * pageSize, paginationInfo.total) }}</span>
                  de
                  <span class="font-medium">{{ paginationInfo.total }}</span>
                  resultados
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <UButton
                    :disabled="!paginationInfo.hasPreviousPage"
                    @click="goToPreviousPage"
                    size="sm"
                    color="cyan"
                    variant="ghost"
                    class="rounded-l-md"
                  >
                    Anterior
                  </UButton>
                  <span
                    v-for="page in visiblePages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="[
                      'px-4 py-2 text-sm font-semibold cursor-pointer transition-colors',
                      page === currentPage
                        ? 'bg-cyan-600 text-white'
                        : 'text-gray-900 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                    ]"
                  >
                    {{ page }}
                  </span>
                  <UButton
                    :disabled="!paginationInfo.hasNextPage"
                    @click="goToNextPage"
                    size="sm"
                    color="cyan"
                    variant="ghost"
                    class="rounded-r-md"
                  >
                    Siguiente
                  </UButton>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin Materiales -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-building-office-2"
            class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {{
            searchQuery
              ? "No se encontraron resultados en esta página"
              : paginationInfo.total === 0
              ? "No hay materiales disponibles"
              : "No hay materiales en esta página"
          }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {{
            searchQuery
              ? "Intenta ajustar la búsqueda o navegar a otra página"
              : paginationInfo.total === 0
              ? "No se encontraron materiales por centro en la base de datos"
              : "Intenta navegar a otra página o recargar los datos"
          }}
        </p>
        <div class="flex gap-3 justify-center">
          <UButton
            v-if="searchQuery"
            @click="clearFilters"
            color="cyan"
            variant="ghost"
          >
            Limpiar búsqueda
          </UButton>
          <UButton
            v-if="paginationInfo.total > 0 && currentPage > 1"
            @click="goToPage(1)"
            color="cyan"
            variant="ghost"
          >
            Ir a primera página
          </UButton>
        </div>
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

// Cliente de Amplify
const client = generateClient();

// Meta tags para SEO
useSeoMeta({
  title: "Materiales por Centro - Portal Diveco",
  description: "Visualización de materiales por centro de producción",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Materiales por Centro" },
]);

// Estado reactivo
const materiales = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const hasSearched = ref(false); // Indica si se ha realizado alguna búsqueda
const currentPage = ref(1);
const pageSize = ref(1000); // Tamaño de página del servidor
const paginationInfo = ref({
  total: 0,
  page: 1,
  limit: 1000,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

// Columnas específicas a mostrar en la tabla
const visibleColumns = computed(() => {
  // Solo mostrar estas columnas específicas en el orden deseado
  return [
    'Descripcion_Material',
    'Descripcion_Marca',
    'Descripcion_Presentacion',
    'Descripcion_Modelo',
    'Descripcion_Tamano',
    'Descripcion_Tipo_Material',
    'Descripcion_Linea',
  ];
});

// Usar directamente los materiales sin filtrado local (la búsqueda se hace en el servidor)
const filteredMateriales = computed(() => {
  return materiales.value;
});

// Computed para paginación del servidor
const totalPages = computed(() => {
  return paginationInfo.value.totalPages || 1;
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 7;
  const total = totalPages.value;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Métodos
const fetchMateriales = async () => {
  // Solo buscar si hay un término de búsqueda
  if (!searchQuery.value || !searchQuery.value.trim()) {
    materiales.value = [];
    paginationInfo.value = {
      total: 0,
      page: 1,
      limit: 1000,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    hasSearched.value = false;
    return;
  }

  try {
    loading.value = true;
    hasSearched.value = true;
    const response = await client.queries.getMaterialesPorCentro({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value.trim() || undefined,
    });
    
    console.log('📥 Respuesta completa:', response);
    console.log('📥 Tipo de data:', typeof response.data);
    console.log('📥 Data:', response.data);
    
    let data = response.data;
    
    // Si la data es un string JSON, parsearlo
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
        console.log('📥 Data parseada:', data);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
      }
    }
    
    if (data) {
      // Verificar si la estructura es correcta
      console.log('📊 Estructura de data:', Object.keys(data));
      console.log('📊 Materiales en data:', data.materiales);
      console.log('📊 Pagination en data:', data.pagination);
      
      materiales.value = data.materiales || [];
      paginationInfo.value = data.pagination || {
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      
      console.log('📊 Materiales cargados:', materiales.value.length);
      console.log('📊 Primer material:', materiales.value[0]);
      console.log('📋 Información de paginación:', paginationInfo.value);
      
      // Actualizar página actual si es diferente
      if (paginationInfo.value.page !== currentPage.value) {
        currentPage.value = paginationInfo.value.page;
      }
    } else {
      console.warn('⚠️ Data es null o undefined');
      materiales.value = [];
      paginationInfo.value = {
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  } catch (error) {
    console.error("Error al cargar materiales:", error);
    console.error("Error completo:", JSON.stringify(error, null, 2));
    materiales.value = [];
    paginationInfo.value = {
      total: 0,
      page: 1,
      limit: 1000,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    
    useToast().add({
      title: "Error",
      description: "No se pudieron cargar los materiales por centro",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
};

const formatColumnName = (columnName) => {
  // Convertir snake_case o camelCase a título legible
  return columnName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return value;
};

const formatMaterialId = (materialId) => {
  if (!materialId) return '-';
  // Convertir a string y eliminar ceros iniciales
  const idString = materialId.toString();
  // Eliminar ceros iniciales, pero mantener al menos un 0 si el ID es solo ceros
  const cleanedId = idString.replace(/^0+/, '') || '0';
  return cleanedId;
};

const clearFilters = () => {
  searchQuery.value = '';
  currentPage.value = 1;
  hasSearched.value = false;
  materiales.value = [];
  paginationInfo.value = {
    total: 0,
    page: 1,
    limit: 1000,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchMateriales();
  }
};

const goToNextPage = () => {
  if (paginationInfo.value.hasNextPage) {
    currentPage.value++;
    fetchMateriales();
  }
};

const goToPreviousPage = () => {
  if (paginationInfo.value.hasPreviousPage) {
    currentPage.value--;
    fetchMateriales();
  }
};

// Watch para resetear página y recargar cuando cambia la búsqueda
// Usar debounce para evitar múltiples búsquedas mientras el usuario escribe
let searchTimeout = null;
watch([searchQuery], () => {
  // Limpiar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Resetear página cuando cambia la búsqueda
  currentPage.value = 1;
  
  // Si el campo está vacío, limpiar resultados
  if (!searchQuery.value || !searchQuery.value.trim()) {
    hasSearched.value = false;
    materiales.value = [];
    paginationInfo.value = {
      total: 0,
      page: 1,
      limit: 1000,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    return;
  }
  
  // Debounce: esperar 500ms después de que el usuario deje de escribir
  searchTimeout = setTimeout(() => {
    fetchMateriales();
  }, 500);
});

// No cargar datos automáticamente al montar el componente
// onMounted(() => {
//   fetchMateriales();
// });
</script>

