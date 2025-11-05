<template>
  <div
    class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 validacion-container"
  >
    <!-- Botón para iniciar tour específico -->
    <div class="flex justify-end mb-4">
      <UButton
        id="validacion-tour-trigger"
        icon="i-heroicons-information-circle"
        size="sm"
        color="cyan"
        variant="solid"
        class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        @click="startTour"
      >
        Tour: Validación de Aprovisionamiento
      </UButton>
    </div>
    <div class="text-center py-12">
      <!-- Contenido específico de validación -->
      <div class="space-y-6">
        <!-- Botón de descarga del plan de producción -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-md border border-blue-200 dark:border-blue-700/50 shadow-sm plan-download-section">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h4 class="text-xs font-semibold text-blue-800 dark:text-blue-200">Plan de Producción</h4>
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


        <!-- Análisis de Materiales sin tabs -->
        <div class="space-y-6 validation-section">
          <h4 class="text-xs font-semibold text-gray-900 dark:text-white">Análisis de Materiales:</h4>
          
          <!-- Estado: Cargando datos -->
          <div v-if="loadingQuery" class="text-center py-12">
            <div class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-xs text-gray-600 dark:text-gray-300">Consultando validación de materiales...</p>
          </div>

          <!-- Estado: Error -->
          <div v-else-if="queryError" class="text-center py-12">
            <div class="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-md flex items-center justify-center mx-auto mb-6 shadow-lg">
              <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h6 class="text-xs font-bold text-red-600 dark:text-red-400 mb-3">Error</h6>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-2">{{ queryError }}</p>
            <UButton
              icon="i-heroicons-arrow-path"
              size="sm"
              color="red"
              variant="outline"
              @click="loadMaterialesData"
              class="mt-4"
            >
              Reintentar
            </UButton>
          </div>

          <!-- Estado: Sin problemas - Todo está bien -->
          <div v-else-if="!materialesSinAprovisionamientoExists && !materialesSinCentroProduccionExists" class="text-center py-12">
            <div class="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-md flex items-center justify-center mx-auto mb-6 shadow-lg">
              <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h6 class="text-xs font-bold text-green-600 dark:text-green-400 mb-3">¡Excelente!</h6>
            <p class="text-xs text-gray-600 dark:text-gray-300 mb-2">Todos los materiales están correctamente configurados</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">No hay materiales sin aprovisionamiento ni sin centro de producción</p>
          </div>

          <!-- Estado: Hay datos para mostrar -->
          <div v-else class="space-y-6">
            <!-- Card: Materiales Sin Aprovisionamiento -->
            <div v-if="materialesSinAprovisionamientoExists" class="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 p-4 sm:p-6 rounded-md border border-orange-200 dark:border-orange-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <div class="flex items-center">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md flex items-center justify-center mr-4 shadow-lg">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h5 class="text-xs font-bold text-orange-800 dark:text-orange-200">Materiales Sin Aprovisionamiento</h5>
                    <p class="text-xs text-orange-700 dark:text-orange-300">{{ materialesSinAprovisionamiento.length }} registros encontrados</p>
                  </div>
                </div>
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  size="sm"
                  color="orange"
                  variant="solid"
                  @click="exportMaterialesSinAprovisionamiento"
                  class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Exportar CSV
                </UButton>
              </div>
              
              <!-- Tabla de resultados -->
              <div class="overflow-x-auto -mx-4 sm:mx-0">
                <div class="inline-block min-w-full align-middle">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Centro ID</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Material ID</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Descripción</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Marca</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Presentación</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Modelo</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Tamaño</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Color</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Segmento</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Línea</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-for="(item, index) in materialesSinAprovisionamiento" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.centroId || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ removeLeadingZeros(item.materialId) }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100">{{ item.descripcionMaterial || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.marca || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.presentacion || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.modelo || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.tamano || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.color || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.segmento || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.linea || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Card: Plan Ventas Sin Centro de Producción -->
            <div v-if="materialesSinCentroProduccionExists" class="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 p-4 sm:p-6 rounded-md border border-red-200 dark:border-red-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <div class="flex items-center">
                <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center mr-4 shadow-lg">
                  <UIcon name="i-heroicons-building-office" class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h5 class="text-xs font-bold text-red-800 dark:text-red-200">Plan Ventas Sin Centro de Producción</h5>
                    <p class="text-xs text-red-700 dark:text-red-300">{{ planVentasSinCentro.length }} registros encontrados</p>
                  </div>
                </div>
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  size="sm"
                  color="red"
                  variant="solid"
                  @click="exportPlanVentasSinCentro"
                  class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Exportar CSV
                </UButton>
              </div>
              
              <!-- Tabla de resultados -->
              <div class="overflow-x-auto -mx-4 sm:mx-0">
                <div class="inline-block min-w-full align-middle">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Año</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Mes</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Centro de Venta</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Material ID</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Descripción</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Cantidad Ventas</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Marca</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Presentación</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Modelo</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Línea</th>
                        <th scope="col" class="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Segmento</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-for="(item, index) in planVentasSinCentro" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.anio || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.mes || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.centroDeVenta || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ removeLeadingZeros(item.materialId) }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100">{{ item.descripcionMaterial || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.cantidadVentas || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.marca || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.presentacion || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.modelo || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.linea || '-' }}</td>
                        <td class="px-2 py-2 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ item.segmento || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón simple para continuar -->
        <div class="text-center py-6 continue-button-section">
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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";

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

// Cliente Amplify
const client = generateClient<Schema>();

// Tipos de datos
interface MaterialSinAprovisionamiento {
  centroId: string;
  materialId: string;
  descripcionMaterial: string;
  marca: string;
  presentacion: string;
  modelo: string;
  tamano: string;
  color: string;
  segmento: string;
  linea: string;
}

interface PlanVentasSinCentro {
  anio: number;
  mes: number;
  centroDeVenta: string;
  materialId: string;
  descripcionMaterial: string;
  cantidadVentas: number;
  marca: string;
  presentacion: string;
  modelo: string;
  linea: string;
  segmento: string;
}

// Estado reactivo
const isValidating = ref(false);
const isDownloading = ref(false);
const loadingQuery = ref(false);
const materialesSinAprovisionamiento = ref<MaterialSinAprovisionamiento[]>([]);
const planVentasSinCentro = ref<PlanVentasSinCentro[]>([]);
const queryError = ref<string | null>(null);

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

const materialesSinAprovisionamientoExists = computed(() => {
  return materialesSinAprovisionamiento.value.length > 0;
});

const materialesSinCentroProduccionExists = computed(() => {
  return planVentasSinCentro.value.length > 0;
});

// Función helper para eliminar ceros iniciales de un string
const removeLeadingZeros = (value: string | number | null | undefined): string => {
  if (!value) return '-';
  const str = String(value).trim();
  if (str === '') return '-';
  // Eliminar todos los ceros iniciales
  const withoutZeros = str.replace(/^0+/, '');
  // Si solo había ceros, retornar '0', si no retornar el string sin ceros
  return withoutZeros === '' ? '0' : withoutZeros;
};

// Función helper para exportar CSV
const downloadCsvFromRows = (filename: string, columns: string[], rows: any[]) => {
  try {
    // Crear headers CSV
    const headers = columns.join(',');
    
    // Crear filas CSV
    const csvRows = rows.map(row => {
      return columns.map(col => {
        let value = row[col] || '';
        // Si es materialId, eliminar ceros iniciales
        if (col === 'materialId') {
          value = removeLeadingZeros(value);
        }
        // Escapar comillas y agregar comillas si contiene comas
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      }).join(',');
    });
    
    // Combinar headers y filas
    const csvContent = [headers, ...csvRows].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    const toast = useToast();
    toast.add({
      title: "Descarga completada",
      description: `El archivo ${filename} se ha descargado exitosamente`,
      color: "success",
      timeout: 3000
    });
  } catch (error) {
    console.error('Error exportando CSV:', error);
    const toast = useToast();
    toast.add({
      title: "Error en exportación",
      description: "No se pudo exportar el archivo CSV",
      color: "error",
      timeout: 3000
    });
  }
};

// Métodos
const loadMaterialesData = async () => {
  if (!props.boomId) {
    return;
  }

  try {
    loadingQuery.value = true;
    queryError.value = null;
    
    console.log('🔍 Cargando datos de validación de materiales para boom:', props.boomId);
    
    // Primero obtener el Boom para extraer el campo version
    const { data: boomData } = await client.models.Boom.get({ id: props.boomId });
    
    if (!boomData || !boomData.version) {
      throw new Error('No se pudo obtener la versión del Boom. Verifique que el Boom existe y tiene el campo version definido.');
    }
    
    const version = boomData.version;
    console.log(`📋 Versión del Boom obtenida: ${version}`);
    
    // Invocar el query de Amplify con la versión
    const response = await client.queries.getValidacionMateriales({
      version: version
    });
    
    console.log('📊 Respuesta del query:', response);
    
    // Parsear respuesta (puede venir como string JSON o como objeto)
    let data: any;
    if (typeof response.data === 'string') {
      data = JSON.parse(response.data);
    } else if (response.data?.getValidacionMateriales) {
      if (typeof response.data.getValidacionMateriales === 'string') {
        data = JSON.parse(response.data.getValidacionMateriales);
      } else {
        data = response.data.getValidacionMateriales;
      }
    } else {
      data = response.data;
    }
    
    // Mapear datos a los tipos esperados
    if (data && data.materialesSinAprovisionamiento) {
      materialesSinAprovisionamiento.value = data.materialesSinAprovisionamiento || [];
    }
    
    if (data && data.planVentasSinCentro) {
      planVentasSinCentro.value = data.planVentasSinCentro || [];
    }
    
    console.log(`✅ Datos cargados: ${materialesSinAprovisionamiento.value.length} materiales sin aprovisionamiento, ${planVentasSinCentro.value.length} planes sin centro`);
    
  } catch (error) {
    console.error('❌ Error cargando datos de materiales:', error);
    queryError.value = error instanceof Error ? error.message : 'Error desconocido';
    
    const toast = useToast();
    toast.add({
      title: "Error cargando datos",
      description: "No se pudieron cargar los datos de validación de materiales",
      color: "error",
      timeout: 3000
    });
  } finally {
    loadingQuery.value = false;
  }
};

const exportMaterialesSinAprovisionamiento = () => {
  const columns = ['centroId', 'materialId', 'descripcionMaterial', 'marca', 'presentacion', 'modelo', 'tamano', 'color', 'segmento', 'linea'];
  downloadCsvFromRows('materialesSinAprovisionamiento.csv', columns, materialesSinAprovisionamiento.value);
};

const exportPlanVentasSinCentro = () => {
  const columns = ['anio', 'mes', 'centroDeVenta', 'materialId', 'descripcionMaterial', 'cantidadVentas', 'marca', 'presentacion', 'modelo', 'linea', 'segmento'];
  downloadCsvFromRows('planVentasSinCentroProduccion.csv', columns, planVentasSinCentro.value);
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
    const toast = useToast();
    toast.add({
      title: "Descarga iniciada",
      description: `El archivo ${fileName} se está descargando`,
      color: "info",
      timeout: 3000
    });
    
  } catch (error) {
    console.error('Error al descargar el plan de producción:', error);
    
    const toast = useToast();
    toast.add({
      title: "Error en descarga",
      description: "No se pudo descargar el plan de producción",
      color: "error",
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
    const toast = useToast();
    toast.add({
      title: "Continuando",
      description: "Avanzando al siguiente paso",
      color: "success",
      timeout: 2000
    });

  } catch (error) {
    console.error('Error al continuar:', error);
    
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "No se pudo continuar al siguiente paso",
      color: "error",
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
  // Cargar datos de materiales
  loadMaterialesData();
});

// Configuración del tour específico para Validación de Aprovisionamiento
const driverObj = ref<any>(null);

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
        element: '#validacion-tour-trigger',
        popover: {
          title: '✅ Tour: Validación de Aprovisionamiento',
          description: 'Este tour te mostrará cómo validar los materiales aprovisionados y descargar el plan de producción antes de la explosión.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.validacion-container',
        popover: {
          title: '📋 Proceso de Validación',
          description: 'Aquí puedes validar la demanda de producción previa y realizar ajustes a los insumos si es necesario antes de la explosión.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.plan-download-section',
        popover: {
          title: '📥 Descarga del Plan de Producción',
          description: 'Descarga el archivo CSV con el plan de producción generado para revisar la demanda previa a la explosión.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.validation-section',
        popover: {
          title: '🔍 Análisis de Materiales',
          description: 'Esta sección muestra si hay materiales con problemas de aprovisionamiento o sin centro de producción. Si todo está correcto, verás un mensaje de éxito. Si hay problemas, podrás descargar los archivos CSV con los detalles.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.continue-button-section',
        popover: {
          title: '⚡ Continuar al Siguiente Paso',
          description: 'Una vez validados los materiales y revisado el plan, puedes continuar al paso final de explosión.',
          side: 'top',
          align: 'center'
        }
      },
      {
        popover: {
          title: '🎉 ¡Tour Completado!',
          description: 'Ya conoces cómo validar los materiales y revisar el plan de producción. Asegúrate de revisar todos los materiales antes de continuar.'
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

// Expose methods for parent component
defineExpose({
  resetValidations,
  executeValidation,
  proceedWithExplosion,
  loadMaterialesData,
  exportMaterialesSinAprovisionamiento,
  exportPlanVentasSinCentro
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
