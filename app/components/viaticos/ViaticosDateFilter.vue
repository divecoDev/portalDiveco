<template>
  <div
    class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
  >
    <div class="flex flex-col sm:flex-row gap-3 items-end">
      <!-- Fecha desde -->
      <div class="flex-1 sm:flex-initial sm:w-48">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Desde
        </label>
        <UInput
          v-model="localStartDate"
          type="date"
          placeholder="Fecha inicial"
          size="md"
          class="w-full"
          @update:model-value="handleStartDateChange"
        />
      </div>

      <!-- Fecha hasta -->
      <div class="flex-1 sm:flex-initial sm:w-48">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Hasta
        </label>
        <UInput
          v-model="localEndDate"
          type="date"
          placeholder="Fecha final"
          size="md"
          class="w-full"
          :max="maxDate"
          @update:model-value="handleEndDateChange"
        />
      </div>

      <!-- Botón limpiar filtros -->
      <div>
        <UButton
          icon="i-heroicons-x-mark"
          size="md"
          color="gray"
          variant="outline"
          @click="resetToDefault"
        >
          Restablecer
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";

interface Props {
  startDate?: string;
  endDate?: string;
}

interface Emits {
  (e: "update:startDate", value: string): void;
  (e: "update:endDate", value: string): void;
  (e: "change", value: { startDate: string; endDate: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Función para obtener el primer día del mes actual
const getFirstDayOfMonth = (): string => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return firstDay.toISOString().split("T")[0];
};

// Función para obtener la fecha de hoy
const getToday = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Valores por defecto
const defaultStartDate = getFirstDayOfMonth();
const defaultEndDate = getToday();

// Estado local
const localStartDate = ref(props.startDate || defaultStartDate);
const localEndDate = ref(props.endDate || defaultEndDate);

// Fecha máxima permitida (hoy)
const maxDate = computed(() => getToday());

// Handlers
const handleStartDateChange = (value: string) => {
  localStartDate.value = value;
  emit("update:startDate", value);
  emit("change", {
    startDate: localStartDate.value,
    endDate: localEndDate.value,
  });
};

const handleEndDateChange = (value: string) => {
  localEndDate.value = value;
  emit("update:endDate", value);
  emit("change", {
    startDate: localStartDate.value,
    endDate: localEndDate.value,
  });
};

const resetToDefault = () => {
  localStartDate.value = defaultStartDate;
  localEndDate.value = defaultEndDate;
  emit("update:startDate", defaultStartDate);
  emit("update:endDate", defaultEndDate);
  emit("change", {
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });
};

// Sincronizar con props
watch(
  () => props.startDate,
  (newValue) => {
    if (newValue) {
      localStartDate.value = newValue;
    }
  }
);

watch(
  () => props.endDate,
  (newValue) => {
    if (newValue) {
      localEndDate.value = newValue;
    }
  }
);

// Emitir valores iniciales al montar
onMounted(() => {
  emit("update:startDate", localStartDate.value);
  emit("update:endDate", localEndDate.value);
  emit("change", {
    startDate: localStartDate.value,
    endDate: localEndDate.value,
  });
});
</script>

