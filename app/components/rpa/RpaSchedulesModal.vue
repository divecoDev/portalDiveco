<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 rounded-t-lg" style="margin: -1.5rem -1.5rem 0; width: calc(100% + 3rem);">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Horarios de Ejecución RPA</h3>
            <p class="text-sm text-cyan-100">Ventanas de bloqueo configuradas</p>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-gray-600 dark:text-gray-300 text-sm">Cargando horarios...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-red-800 dark:text-red-200">Error al cargar horarios</p>
            <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!activeWindows.length" class="text-center py-8">
        <div class="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-clock" class="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">No hay horarios activos</h4>
        <p class="text-sm text-gray-600 dark:text-gray-300">No se encontraron ventanas de ejecución RPA configuradas</p>
      </div>

      <!-- List of schedules -->
      <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        <div
          v-for="window in activeWindows"
          :key="window.id"
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-cyan-200/30 dark:border-cyan-700/30 hover:border-cyan-300/50 dark:hover:border-cyan-600/50 transition-all duration-300 p-4"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h4 class="text-base font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                {{ window.name }}
              </h4>
              <p
                v-if="window.description"
                class="text-xs text-gray-600 dark:text-gray-300"
              >
                {{ window.description }}
              </p>
            </div>
            <div class="ml-3">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              >
                Activo
              </span>
            </div>
          </div>

          <!-- Schedule details -->
          <div class="space-y-2">
            <!-- Time range -->
            <div class="flex items-center space-x-2 text-sm">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ window.startTime }} - {{ window.endTime }}
              </span>
            </div>

            <!-- Timezone -->
            <div class="flex items-center space-x-2 text-sm">
              <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span class="text-gray-600 dark:text-gray-300">
                {{ window.timezone }}
              </span>
            </div>

            <!-- Days of week -->
            <div class="flex items-start space-x-2 text-sm">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="day in getSortedDays(window.daysOfWeek)"
                  :key="day"
                  class="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded text-xs font-medium"
                >
                  {{ getDayName(day) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <button
          type="button"
          @click="closeModal"
          class="rounded-md inline-flex items-center px-4 py-2 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { generateClient } from 'aws-amplify/data';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:open']);

const client = generateClient();

// Estado reactivo
const loading = ref(false);
const error = ref(null);
const windows = ref([]);

// Computed
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

const activeWindows = computed(() => {
  // Filtrar solo ventanas activas y ordenar por hora de inicio
  return windows.value
    .filter(w => w.isActive)
    .sort((a, b) => {
      const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const minutesA = timeToMinutes(a.startTime || '00:00');
      const minutesB = timeToMinutes(b.startTime || '00:00');
      
      // Si tienen la misma hora, ordenar por nombre
      if (minutesA === minutesB) {
        return (a.name || '').localeCompare(b.name || '');
      }
      
      return minutesA - minutesB;
    });
});

// Mapeo de días de la semana
const dayNames = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
};

// Orden de días para sorting
const dayOrder = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
};

// Métodos
const getDayName = (day) => {
  return dayNames[day] || day;
};

const getSortedDays = (days) => {
  if (!days || !Array.isArray(days)) return [];
  
  return [...days].sort((a, b) => {
    return (dayOrder[a] || 0) - (dayOrder[b] || 0);
  });
};

const fetchWindows = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('🔍 Consultando ventanas de ejecución RPA');
    
    const { data, errors } = await client.models.RpaExecutionWindow.list();
    
    if (errors) {
      console.error('Error fetching windows:', errors);
      error.value = 'No se pudieron cargar las ventanas de ejecución';
      return;
    }
    
    windows.value = data || [];
    console.log(`✅ ${windows.value.length} ventanas cargadas`);
  } catch (err) {
    console.error('Error fetching windows:', err);
    error.value = err instanceof Error ? err.message : 'Error desconocido al cargar ventanas';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  isOpen.value = false;
};

// Watch para cargar datos cuando se abre el modal
watch(() => props.open, (newValue) => {
  if (newValue) {
    fetchWindows();
  }
});
</script>

