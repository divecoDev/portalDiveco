<template>
  <div
    class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <div class="text-center py-12">
      <!-- Contenido específico de validación -->
      <div class="space-y-6">
        <!-- Botón de descarga del plan de producción -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-md border border-blue-200 dark:border-blue-700/50 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200">Plan de Producción</h4>
                <p class="text-xs text-blue-700 dark:text-blue-300">Descarga el archivo CSV con el plan generado</p>
              </div>
            </div>
            <UButton
              icon="i-heroicons-arrow-down-tray"
              size="sm"
              color="blue"
              variant="outline"
              :loading="isDownloading"
              @click="downloadPlanProduccion"
              class="hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {{ isDownloading ? 'Descargando...' : 'Descargar Plan' }}
            </UButton>
          </div>
        </div>


        <!-- Pestañas de validación -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Análisis de Materiales:</h4>
          
          <UTabs v-model="activeTab" :items="tabItems" class="w-full">
            <template #materiales-no-aprovisionados>
              <div class="p-4 space-y-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-orange-500 mr-2" />
                    <h5 class="text-sm font-semibold text-gray-900 dark:text-white">Materiales No Aprovisionados</h5>
                  </div>
                  <UBadge color="orange" variant="soft" size="sm">
                    {{ materialesNoAprovisionados.length }} items
                  </UBadge>
                </div>
                
                <div v-if="materialesNoAprovisionados.length === 0" class="text-center py-8">
                  <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-md flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h6 class="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">¡Excelente!</h6>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Todos los materiales están aprovisionados correctamente</p>
                </div>
                
                <div v-else class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Centro ID</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material ID</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marca</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Presentación</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modelo</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tamaño</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Segmento</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Línea</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr 
                        v-for="material in materialesNoAprovisionados" 
                        :key="material.material_id"
                        class="hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors duration-200"
                      >
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {{ material.centro_id }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.material_id }}
                        </td>
                        <td class="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {{ material.Descripcion_Material }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.marca }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.presentacion }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.modelo }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.tamano }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.color }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.segmento }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.linea }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <template #materiales-sin-centro>
              <div class="p-4 space-y-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-building-office" class="w-5 h-5 text-red-500 mr-2" />
                    <h5 class="text-sm font-semibold text-gray-900 dark:text-white">Materiales Sin Centro de Producción</h5>
                  </div>
                  <UBadge color="red" variant="soft" size="sm">
                    {{ materialesSinCentro.length }} items
                  </UBadge>
                </div>
                
                <div v-if="materialesSinCentro.length === 0" class="text-center py-8">
                  <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-md flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h6 class="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">¡Perfecto!</h6>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Todos los materiales tienen centro de producción asignado</p>
                </div>
                
                <div v-else class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Año</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mes</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Centro de Venta</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material ID</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad Ventas</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marca</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Presentación</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modelo</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Línea</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Segmento</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr 
                        v-for="material in materialesSinCentro" 
                        :key="material.Material_Id"
                        class="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
                      >
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {{ material.Anio }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.Mes }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.centro_de_venta }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {{ material.Material_Id }}
                        </td>
                        <td class="px-3 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {{ material.Descripcion_Material }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {{ material.Cantidad_Ventas }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.marca }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.presentacion }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.modelo }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.linea }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {{ material.segmento }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
          </UTabs>
        </div>

        <!-- Botón simple para continuar -->
        <div class="text-center py-6">
          <UButton
            icon="i-heroicons-arrow-right"
            size="sm"
            color="cyan"
            :loading="isValidating"
            class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold"
            @click="proceedWithExplosion"
          >
            {{ isValidating ? 'Procesando...' : 'Siguiente Paso' }}
          </UButton>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false
  },
  explosionId: {
    type: String,
    required: true
  },
  boomId: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['validation-completed']);

// Estado reactivo
const isValidating = ref(false);
const isDownloading = ref(false);
const activeTab = ref(0);

// Datos de las pestañas
const tabItems = ref([
  {
    slot: 'materiales-no-aprovisionados',
    label: 'Materiales No Aprovisionados',
    icon: 'i-heroicons-exclamation-triangle'
  },
  {
    slot: 'materiales-sin-centro',
    label: 'Materiales Sin Centro',
    icon: 'i-heroicons-building-office'
  }
]);

// Datos de materiales
const materialesNoAprovisionados = ref([]);

const materialesSinCentro = ref([]);

const validations = ref([
  {
    id: 'material-availability',
    name: 'Disponibilidad de Materiales',
    completed: false
  },
  {
    id: 'supplier-verification',
    name: 'Verificación de Proveedores',
    completed: false
  },
  {
    id: 'lead-time-validation',
    name: 'Validación de Tiempos de Entrega',
    completed: false
  },
  {
    id: 'cost-verification',
    name: 'Verificación de Costos',
    completed: false
  },
  {
    id: 'quality-standards',
    name: 'Estándares de Calidad',
    completed: false
  }
]);

// Computed
const canValidate = computed(() => {
  return !isValidating.value;
});


// Métodos
const loadMaterialesData = async () => {
  try {
    // En producción, aquí se haría una llamada a la API
    // Por ahora usamos datos de ejemplo
    console.log('Cargando datos de materiales para boom:', props.boomId);
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aquí se actualizarían los arrays con datos reales
    // materialesNoAprovisionados.value = await fetchMaterialesNoAprovisionados();
    // materialesSinCentro.value = await fetchMaterialesSinCentro();
    
  } catch (error) {
    console.error('Error cargando datos de materiales:', error);
    
    useToast().add({
      title: "Error cargando datos",
      description: "No se pudieron cargar los datos de materiales",
      color: "red",
      timeout: 3000
    });
  }
};

const downloadPlanProduccion = async () => {
  if (isDownloading.value || !props.boomId) return;

  try {
    isDownloading.value = true;
    
    // Construir la URL del archivo
    const fileName = `plan-produccion-${props.boomId}.csv`;
    const fileUrl = `https://d1p0twkya81b3k.cloudfront.net/${fileName}`;
    
    // Crear un enlace temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar notificación de éxito
    useToast().add({
      title: "Descarga iniciada",
      description: `El archivo ${fileName} se está descargando`,
      color: "blue",
      timeout: 3000
    });
    
  } catch (error) {
    console.error('Error al descargar el plan de producción:', error);
    
    useToast().add({
      title: "Error en descarga",
      description: "No se pudo descargar el plan de producción",
      color: "red",
      timeout: 3000
    });
  } finally {
    isDownloading.value = false;
  }
};

const proceedWithExplosion = async () => {
  if (isValidating.value) return;

  try {
    isValidating.value = true;

    // Simular delay mínimo
    await new Promise(resolve => setTimeout(resolve, 500));

    // Emitir evento de completado
    emit('validation-completed');

    // Mostrar notificación simple
    useToast().add({
      title: "Continuando",
      description: "Avanzando al siguiente paso",
      color: "green",
      timeout: 2000
    });

  } catch (error) {
    console.error('Error al continuar:', error);
    
    useToast().add({
      title: "Error",
      description: "No se pudo continuar al siguiente paso",
      color: "red",
      timeout: 3000
    });
  } finally {
    isValidating.value = false;
  }
};

// Método legacy para compatibilidad
const executeValidation = proceedWithExplosion;

// Reset validations when component is reset
const resetValidations = () => {
  validations.value.forEach(validation => {
    validation.completed = false;
  });
};

// Watch for completion status changes
watch(() => props.isCompleted, (newValue) => {
  if (!newValue) {
    resetValidations();
  }
});

// Lifecycle
onMounted(() => {
  loadMaterialesData();
});

// Expose methods for parent component
defineExpose({
  resetValidations,
  executeValidation,
  proceedWithExplosion,
  loadMaterialesData
});
</script>
