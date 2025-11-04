<template>
  <div
    class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-4 mb-6"
  >
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Búsqueda -->
      <div class="flex-1">
        <UInput
          v-model="localSearch"
          icon="i-heroicons-magnifying-glass"
          placeholder="Buscar por usuario, módulo, entidad..."
          size="md"
          class="w-full"
          @update:model-value="handleSearchChange"
        />
      </div>

      <!-- Filtro por módulo -->
      <div class="sm:w-48">
        <USelect
          v-model="localModule"
          :options="moduleOptions"
          placeholder="Filtrar por módulo"
          size="md"
          @update:model-value="handleModuleChange"
        />
      </div>

      <!-- Filtro por acción -->
      <div class="sm:w-48">
        <USelect
          v-model="localAction"
          :options="actionOptions"
          placeholder="Filtrar por acción"
          size="md"
          @update:model-value="handleActionChange"
        />
      </div>

      <!-- Filtro por fecha -->
      <div class="sm:w-48">
        <UInput
          v-model="localDate"
          type="date"
          placeholder="Filtrar por fecha"
          size="md"
          @update:model-value="handleDateChange"
        />
      </div>

      <!-- Botón limpiar filtros -->
      <div>
        <UButton
          icon="i-heroicons-x-mark"
          size="md"
          color="gray"
          variant="outline"
          @click="clearFilters"
        >
          Limpiar
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { getModuleDisplayName, formatAuditAction } from "~/utils/audit-helpers";
import type { AuditModule, AuditAction } from "~/domain/audit/types";

interface Props {
  search?: string;
  module?: AuditModule;
  action?: AuditAction;
  date?: string;
}

interface Emits {
  (e: "update:search", value: string): void;
  (e: "update:module", value: AuditModule | undefined): void;
  (e: "update:action", value: AuditAction | undefined): void;
  (e: "update:date", value: string | undefined): void;
  (e: "clear"): void;
}

const props = withDefaults(defineProps<Props>(), {
  search: "",
  module: undefined,
  action: undefined,
  date: undefined,
});

const emit = defineEmits<Emits>();

// Estado local
const localSearch = ref(props.search);
const localModule = ref(props.module);
const localAction = ref(props.action);
const localDate = ref(props.date);

// Opciones de módulos
const moduleOptions = [
  { value: undefined, label: "Todos los módulos" },
  { value: "boom", label: getModuleDisplayName("boom") },
  { value: "suic", label: getModuleDisplayName("suic") },
  { value: "admin-users", label: getModuleDisplayName("admin-users") },
  { value: "carga-insumos", label: getModuleDisplayName("carga-insumos") },
  { value: "aprovisionamiento", label: getModuleDisplayName("aprovisionamiento") },
  { value: "audit", label: getModuleDisplayName("audit") },
  { value: "system", label: getModuleDisplayName("system") },
];

// Opciones de acciones
const actionOptions = [
  { value: undefined, label: "Todas las acciones" },
  { value: "CREATE", label: formatAuditAction("CREATE").label },
  { value: "UPDATE", label: formatAuditAction("UPDATE").label },
  { value: "DELETE", label: formatAuditAction("DELETE").label },
  { value: "READ", label: formatAuditAction("READ").label },
  { value: "LOGIN", label: formatAuditAction("LOGIN").label },
  { value: "LOGOUT", label: formatAuditAction("LOGOUT").label },
  { value: "CONFIG_CHANGE", label: formatAuditAction("CONFIG_CHANGE").label },
];

// Handlers
const handleSearchChange = (value: string) => {
  emit("update:search", value);
};

const handleModuleChange = (value: AuditModule | undefined) => {
  emit("update:module", value);
};

const handleActionChange = (value: AuditAction | undefined) => {
  emit("update:action", value);
};

const handleDateChange = (value: string) => {
  emit("update:date", value);
};

const clearFilters = () => {
  localSearch.value = "";
  localModule.value = undefined;
  localAction.value = undefined;
  localDate.value = undefined;
  emit("clear");
};

// Sincronizar con props
watch(
  () => props.search,
  (newValue) => {
    localSearch.value = newValue;
  }
);

watch(
  () => props.module,
  (newValue) => {
    localModule.value = newValue;
  }
);

watch(
  () => props.action,
  (newValue) => {
    localAction.value = newValue;
  }
);

watch(
  () => props.date,
  (newValue) => {
    localDate.value = newValue;
  }
);
</script>

