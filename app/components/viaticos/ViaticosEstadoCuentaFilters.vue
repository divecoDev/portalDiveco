<template>
  <div
    class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
  >
    <div class="flex flex-col sm:flex-row gap-4 items-end">
      <!-- Filtro por Empleado -->
      <div class="flex-1 sm:flex-initial sm:w-64">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Empleado
        </label>
        <USelect
          v-model="localEmployee"
          :options="employeeOptions"
          placeholder="Seleccionar empleado"
          size="md"
          class="w-full"
          @update:model-value="handleEmployeeChange"
        />
      </div>

      <!-- Filtro por Año -->
      <div class="sm:w-32">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Año
        </label>
        <USelect
          v-model="localYear"
          :options="yearOptions"
          placeholder="Año"
          size="md"
          class="w-full"
          @update:model-value="handleYearChange"
        />
      </div>

      <!-- Filtro por Mes -->
      <div class="sm:w-32">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Mes
        </label>
        <USelect
          v-model="localMonth"
          :options="monthOptions"
          placeholder="Mes"
          size="md"
          class="w-full"
          @update:model-value="handleMonthChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";

interface Props {
  employeeId?: number;
  year?: number;
  month?: number;
}

interface Emits {
  (e: "update:employeeId", value: number | undefined): void;
  (e: "update:year", value: number): void;
  (e: "update:month", value: number): void;
  (e: "change", value: { employeeId?: number; year: number; month: number }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Empleados mock (en producción vendría de una API)
const employees = [
  { id: 103292, nombre: "MK CHRISTIAN OMAR GARCIA GARCIA", codigo: "103292" },
  { id: 103539, nombre: "OSCAR ADRIAN VASQUEZ VASQUEZ", codigo: "103539" },
  { id: 103307, nombre: "MK JORGE MARIO SANTOS GODOY", codigo: "103307" },
  { id: 1, nombre: "Juan Pérez", codigo: "EMP001" },
  { id: 2, nombre: "María González", codigo: "EMP002" },
  { id: 3, nombre: "Carlos Rodríguez", codigo: "EMP003" },
  { id: 4, nombre: "Ana Martínez", codigo: "EMP004" },
  { id: 5, nombre: "Luis Sánchez", codigo: "EMP005" },
];

const employeeOptions = computed(() =>
  employees.map((e) => ({
    value: e.id,
    label: `${e.nombre} (${e.codigo})`,
  }))
);

// Opciones de año (últimos 3 años y el actual)
const currentYear = new Date().getFullYear();
const yearOptions = computed(() => {
  const years = [];
  for (let i = 0; i < 4; i++) {
    years.push({
      value: currentYear - i,
      label: String(currentYear - i),
    });
  }
  return years;
});

// Opciones de mes
const monthOptions = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

// Estado local (con valores por defecto)
const defaultEmployeeId = 103292; // Empleado mock por defecto
const localEmployee = ref(props.employeeId ?? defaultEmployeeId);
const localYear = ref(props.year || currentYear);
const localMonth = ref(props.month || new Date().getMonth() + 1);

// Handlers
const handleEmployeeChange = (value: number | undefined) => {
  localEmployee.value = value;
  emit("update:employeeId", value);
  emitChange();
};

const handleYearChange = (value: number) => {
  localYear.value = value;
  emit("update:year", value);
  emitChange();
};

const handleMonthChange = (value: number) => {
  localMonth.value = value;
  emit("update:month", value);
  emitChange();
};

const emitChange = () => {
  emit("change", {
    employeeId: localEmployee.value,
    year: localYear.value,
    month: localMonth.value,
  });
};

// Sincronizar con props
watch(
  () => props.employeeId,
  (newValue) => {
    localEmployee.value = newValue;
  }
);

watch(
  () => props.year,
  (newValue) => {
    if (newValue) localYear.value = newValue;
  }
);

watch(
  () => props.month,
  (newValue) => {
    if (newValue) localMonth.value = newValue;
  }
);

// Emitir valores iniciales al montar
onMounted(() => {
  // Si no hay empleado seleccionado, usar el por defecto
  if (!localEmployee.value) {
    localEmployee.value = defaultEmployeeId;
    emit("update:employeeId", defaultEmployeeId);
  }
  emit("update:year", localYear.value);
  emit("update:month", localMonth.value);
  emitChange();
});
</script>

