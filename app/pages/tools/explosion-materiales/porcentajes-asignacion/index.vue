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
              lass="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              <UIcon
                name="i-heroicons-percent-badge"
                class="w-7 h-7 text-white"
              />
            </div>
            Aprovisionamiento
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Gestión de aprovisionamiento entre centros
          </p>
        </div>

        <!-- Botones de acciones -->
        <div class="flex gap-3">
          <!-- Botón para carga masiva -->
          <NuxtLink to="/tools/explosion-materiales/porcentajes-asignacion/carga-masiva">
            <button
              type="button"
              class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5" />
              Carga Masiva
            </button>
          </NuxtLink>

          <!-- Botón para crear nuevo aprovisionamiento -->
          <NuxtLink to="/tools/explosion-materiales/porcentajes-asignacion/new">
            <button
              type="button"
              class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              Nuevo Aprovisionamiento
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Filtros y búsqueda compactos -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Búsqueda -->
          <div class="flex-1">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar por centro origen, material o centro aprovisionamiento..."
              size="md"
              class="w-full"
              @input="debouncedSearch"
            />
          </div>

          <!-- Botón de refrescar -->
          <div class="sm:w-32">
            <UButton
              icon="i-heroicons-arrow-path"
              size="md"
              color="cyan"
              variant="outline"
              @click="refreshData"
              :loading="loading"
              class="w-full"
            >
              Refrescar
            </UButton>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">
            Cargando aprovisionamientos...
          </p>
        </div>
      </div>

      <!-- Tabla de aprovisionamientos -->
      <div v-else-if="porcentajes.length > 0" class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Centro Origen
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Material ID
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Centro Aprov
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Porcentaje
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="porcentaje in porcentajes" 
                :key="`${porcentaje.centroIdOrigen}-${porcentaje.materialId}-${porcentaje.centroIdAprov}`"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                  {{ porcentaje.centroIdOrigen }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                  {{ porcentaje.materialId }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                  {{ porcentaje.centroIdAprov }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-center">
                  <div v-if="editingRow !== `${porcentaje.centroIdOrigen}-${porcentaje.materialId}-${porcentaje.centroIdAprov}`" 
                       class="flex items-center justify-center space-x-2 cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-md p-2 transition-colors duration-200"
                       @click="startEditing(porcentaje)">
                    <UIcon name="i-heroicons-percent-badge" class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span class="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      {{ formatPorcentaje(porcentaje.porcentaje) }}%
                    </span>
                    <UIcon name="i-heroicons-pencil" class="w-3 h-3 text-gray-400 ml-1" />
                  </div>
                  
                  <div v-else class="flex items-center justify-center space-x-2">
                    <UInput
                      v-model="editingValue"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      size="sm"
                      class="w-20 text-center"
                      :disabled="updating"
                      @keyup.enter="saveEdit(porcentaje)"
                      @keyup.escape="cancelEdit"
                      autofocus
                    />
                    <span class="text-sm text-gray-500">%</span>
                    <div class="flex items-center space-x-1 ml-2">
                      <UButton
                        icon="i-heroicons-check"
                        size="xs"
                        color="green"
                        variant="ghost"
                        @click="saveEdit(porcentaje)"
                        :loading="updating"
                        class="hover:bg-green-50 dark:hover:bg-green-900/20"
                      />
                      <UButton
                        icon="i-heroicons-x-mark"
                        size="xs"
                        color="red"
                        variant="ghost"
                        @click="cancelEdit"
                        :disabled="updating"
                        class="hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center space-x-1">
                    <UButton
                      icon="i-heroicons-trash"
                      size="sm"
                      color="red"
                      variant="ghost"
                      @click="deletePorcentaje(porcentaje)"
                      class="hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sin Porcentajes -->
      <div v-else class="text-center py-16">
        <div
          class="w-32 h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <UIcon
            name="i-heroicons-percent-badge"
            class="w-16 h-16 text-cyan-600 dark:text-cyan-400"
          />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {{
            searchQuery
              ? "No se encontraron resultados"
              : "No hay aprovisionamientos"
          }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {{
            searchQuery
              ? "Intenta ajustar los términos de búsqueda para encontrar lo que necesitas"
              : "Crea tu primer aprovisionamiento para comenzar a gestionar la distribución entre centros"
          }}
        </p>
        <NuxtLink to="/tools/explosion-materiales/porcentajes-asignacion/new">
          <button
            type="button"
            class="rounded-md inline-flex items-center px-4 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            Nuevo Aprovisionamiento
          </button>
        </NuxtLink>
      </div>

      <!-- Paginación -->
      <div v-if="total > limit" class="flex justify-center items-center mt-8">
        <div class="flex items-center space-x-2">
          <UButton
            icon="i-heroicons-chevron-left"
            size="sm"
            color="gray"
            variant="outline"
            @click="previousPage"
            :disabled="offset === 0"
          />
          <span class="text-sm text-gray-600 dark:text-gray-300">
            Página {{ Math.floor(offset / limit) + 1 }} de {{ Math.ceil(total / limit) }}
          </span>
          <UButton
            icon="i-heroicons-chevron-right"
            size="sm"
            color="gray"
            variant="outline"
            @click="nextPage"
            :disabled="offset + limit >= total"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import { debounce } from "lodash-es";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: "EXPLOSION",
});

// Cliente de Amplify
const client = generateClient();

// Meta tags para SEO
useSeoMeta({
  title: "Aprovisionamiento - Portal Diveco",
  description: "Gestiona el aprovisionamiento entre centros de producción.",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/herramientas" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Aprovisionamiento" },
]);

// Estado reactivo
const porcentajes = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const total = ref(0);
const limit = ref(20);
const offset = ref(0);

// Estado para edición inline
const editingRow = ref(null);
const editingValue = ref("");
const updating = ref(false);


// Computed para búsqueda con debounce
const debouncedSearch = debounce(() => {
  offset.value = 0; // Reset paginación
  fetchPorcentajes();
  scrollToTop();
}, 500);

// Métodos
const fetchPorcentajes = async () => {
  try {
    loading.value = true;
    
    const { data } = await client.queries.aprovisionamiento({
      operation: "list",
      limit: limit.value,
      offset: offset.value,
      search: searchQuery.value && searchQuery.value.trim() ? searchQuery.value.trim() : undefined,
    });

    // Parsear la respuesta JSON que viene como string
    let responseData;
    try {
      responseData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Error al procesar la respuesta del servidor');
    }

    if (responseData?.success) {
      porcentajes.value = responseData.data.items || [];
      total.value = responseData.data.total || 0;
    } else {
      console.error("Error en respuesta:", responseData);
      porcentajes.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("Error al cargar porcentajes:", error);
    porcentajes.value = [];
    total.value = 0;
    
    useToast().add({
      title: "Error",
      description: "No se pudieron cargar los aprovisionamientos",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
};

const editPorcentaje = (porcentaje) => {
  // TODO: Implementar página de edición
  useToast().add({
    title: "Próximamente",
    description: "La funcionalidad de edición estará disponible pronto",
    color: "blue",
  });
};

const deletePorcentaje = async (porcentaje) => {
  if (
    confirm(
      `¿Estás seguro de que deseas eliminar el aprovisionamiento?\n\nCentro Origen: ${porcentaje.centroIdOrigen}\nMaterial: ${porcentaje.materialId}\nCentro Aprov: ${porcentaje.centroIdAprov}\nPorcentaje: ${porcentaje.porcentaje}%`
    )
  ) {
    try {
      const { data } = await client.queries.aprovisionamiento({
        operation: "delete",
        centroIdOrigen: porcentaje.centroIdOrigen,
        materialId: porcentaje.materialId,
        centroIdAprov: porcentaje.centroIdAprov,
      });

      // Parsear la respuesta JSON que viene como string
      let responseData;
      try {
        responseData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (responseData?.success) {
        await fetchPorcentajes();
        useToast().add({
        title: "Aprovisionamiento eliminado",
        description: "El aprovisionamiento se ha eliminado correctamente",
          color: "green",
        });
      } else {
        throw new Error(responseData?.message || "Error desconocido");
      }
    } catch (error) {
      console.error("Error al eliminar porcentaje:", error);
      useToast().add({
        title: "Error",
        description: "No se pudo eliminar el aprovisionamiento",
        color: "red",
      });
    }
  }
};

const formatPorcentaje = (porcentaje) => {
  if (porcentaje === null || porcentaje === undefined) return "0";
  return parseFloat(porcentaje).toFixed(2);
};

const nextPage = () => {
  if (offset.value + limit.value < total.value) {
    offset.value += limit.value;
    fetchPorcentajes();
    scrollToTop();
  }
};

const previousPage = () => {
  if (offset.value > 0) {
    offset.value = Math.max(0, offset.value - limit.value);
    fetchPorcentajes();
    scrollToTop();
  }
};

// Función para hacer scroll al inicio de la página
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Función para refrescar datos y hacer scroll al inicio
const refreshData = () => {
  fetchPorcentajes();
  scrollToTop();
};

// Funciones para edición inline
const startEditing = (porcentaje) => {
  const rowKey = `${porcentaje.centroIdOrigen}-${porcentaje.materialId}-${porcentaje.centroIdAprov}`;
  editingRow.value = rowKey;
  editingValue.value = formatPorcentaje(porcentaje.porcentaje);
};

const cancelEdit = () => {
  editingRow.value = null;
  editingValue.value = "";
};

const saveEdit = async (porcentaje) => {
  if (updating.value) return;
  
  const newValue = parseFloat(editingValue.value);
  
  // Validaciones
  if (isNaN(newValue) || newValue < 0 || newValue > 100) {
    useToast().add({
      title: "Error de validación",
      description: "El porcentaje debe estar entre 0.00 y 100.00",
      color: "red",
    });
    return;
  }
  
  // Si el valor no cambió, solo cancelar
  if (newValue === parseFloat(porcentaje.porcentaje)) {
    cancelEdit();
    return;
  }
  
  try {
    updating.value = true;
    
    const { data } = await client.queries.aprovisionamiento({
      operation: "update",
      centroIdOrigen: porcentaje.centroIdOrigen,
      materialId: porcentaje.materialId,
      centroIdAprov: porcentaje.centroIdAprov,
      porcentaje: newValue,
    });

    // Parsear la respuesta JSON que viene como string
    let responseData;
    try {
      responseData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Error al procesar la respuesta del servidor');
    }

    if (responseData?.success) {
      // Actualizar el valor en la lista local
      const index = porcentajes.value.findIndex(p => 
        p.centroIdOrigen === porcentaje.centroIdOrigen &&
        p.materialId === porcentaje.materialId &&
        p.centroIdAprov === porcentaje.centroIdAprov
      );
      
      if (index !== -1) {
        porcentajes.value[index].porcentaje = newValue;
      }
      
      useToast().add({
        title: "Porcentaje actualizado",
        description: `El porcentaje se ha actualizado a ${newValue}%`,
        color: "green",
      });
      
      cancelEdit();
    } else {
      throw new Error(responseData?.message || "Error desconocido");
    }
  } catch (error) {
    console.error("Error al actualizar porcentaje:", error);
    
    let errorMessage = "No se pudo actualizar el porcentaje. Intenta nuevamente.";
    if (error.message) {
      errorMessage = error.message;
    }
    
    useToast().add({
      title: "Error al actualizar",
      description: errorMessage,
      color: "red",
    });
  } finally {
    updating.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchPorcentajes();
});
</script>
