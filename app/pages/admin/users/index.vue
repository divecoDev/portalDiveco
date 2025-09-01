<template>
  <div class="space-y-6">
    <!-- Header de la página -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Gestión de Usuarios
      </h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Administra los usuarios del sistema y sus permisos
      </p>
    </div>

    <!-- Filtros y búsqueda -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
    >
      <div
        class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4"
      >
        <!-- Búsqueda -->
        <div class="flex-1 max-w-md">
          <UInput
            v-model="searchQuery"
            placeholder="Buscar usuarios..."
            icon="i-heroicons-magnifying-glass"
            size="lg"
            class="w-full"
            @input="handleSearch"
          />
        </div>

        <!-- Filtros -->
        <div class="flex flex-wrap items-center space-x-4">
          <USelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Estado"
            size="lg"
            class="min-w-32"
            @change="handleFilterChange"
          />

          <USelect
            v-model="roleFilter"
            :options="roleOptions"
            placeholder="Rol"
            size="lg"
            class="min-w-32"
            @change="handleFilterChange"
          />

          <UButton
            icon="i-heroicons-funnel"
            variant="outline"
            color="gray"
            size="lg"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            Filtros
          </UButton>

          <UButton
            icon="i-heroicons-arrow-path"
            variant="outline"
            color="gray"
            size="lg"
            @click="resetFilters"
          >
            Limpiar
          </UButton>
        </div>
      </div>

      <!-- Filtros avanzados -->
      <div
        v-if="showAdvancedFilters"
        class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha de creación
            </label>
            <UInput v-model="dateFilter" type="date" size="lg" class="w-full" />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Último acceso
            </label>
            <USelect
              v-model="lastAccessFilter"
              :options="lastAccessOptions"
              placeholder="Seleccionar"
              size="lg"
              class="w-full"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Departamento
            </label>
            <USelect
              v-model="departmentFilter"
              :options="departmentOptions"
              placeholder="Seleccionar"
              size="lg"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Lista de Usuarios
          </h3>
          <div class="flex items-center space-x-2">
            <UButton
              icon="i-heroicons-arrow-down-tray"
              variant="outline"
              color="gray"
              size="sm"
              @click="exportUsers"
            >
              Exportar
            </UButton>
            <UButton
              icon="i-heroicons-arrow-path"
              variant="outline"
              color="gray"
              size="sm"
              @click="refreshUsers"
              :loading="isLoading"
            >
              Actualizar
            </UButton>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Rol
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Último acceso
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr v-if="isLoading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div
                    class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span class="text-gray-500 dark:text-gray-400"
                    >Cargando usuarios...</span
                  >
                </div>
              </td>
            </tr>

            <tr v-else-if="filteredUsers.length === 0" class="text-center">
              <td colspan="6" class="px-6 py-12">
                <div class="flex flex-col items-center space-y-3">
                  <UIcon
                    name="i-heroicons-users"
                    class="h-12 w-12 text-gray-400"
                  />
                  <div>
                    <h3
                      class="text-lg font-medium text-gray-900 dark:text-white"
                    >
                      No se encontraron usuarios
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </div>
                </div>
              </td>
            </tr>

            <tr
              v-else
              v-for="user in paginatedUsers"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ user.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    ID: {{ user.id }}
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ user.email }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="getRoleColor(user.role)"
                  variant="subtle"
                  size="sm"
                >
                  {{ user.role }}
                </UBadge>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="user.status === 'active' ? 'green' : 'red'"
                  variant="subtle"
                  size="sm"
                >
                  {{ user.status === "active" ? "Activo" : "Inactivo" }}
                </UBadge>
              </td>

              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ formatDate(user.lastAccess) }}
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <UButton
                    icon="i-heroicons-eye"
                    variant="ghost"
                    color="gray"
                    size="sm"
                    @click="viewUser(user)"
                    title="Ver detalles"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    variant="ghost"
                    color="blue"
                    size="sm"
                    @click="editUser(user)"
                    title="Editar usuario"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    variant="ghost"
                    color="red"
                    size="sm"
                    @click="deleteUser(user)"
                    title="Eliminar usuario"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div
        v-if="filteredUsers.length > 0"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} de
            {{ filteredUsers.length }} usuarios
          </div>

          <div class="flex items-center space-x-2">
            <UButton
              icon="i-heroicons-chevron-left"
              variant="outline"
              color="gray"
              size="sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            />

            <span class="text-sm text-gray-700 dark:text-gray-300">
              Página {{ currentPage }} de {{ totalPages }}
            </span>

            <UButton
              icon="i-heroicons-chevron-right"
              variant="outline"
              color="gray"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Definir el layout y middleware
definePageMeta({
  layout: "default",
  middleware: ["auth-admin"], // Temporal para desarrollo
});

// Meta tags
useSeoMeta({
  title: "Gestión de Usuarios - Portal Diveco",
  description: "Administra los usuarios del sistema y sus permisos",
});

// Estado reactivo
const isLoading = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const roleFilter = ref("");
const dateFilter = ref("");
const lastAccessFilter = ref("");
const departmentFilter = ref("");
const showAdvancedFilters = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Datos de ejemplo (esto se reemplazará con datos reales)
const users = ref([
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@diveco.com",
    role: "ADMIN",
    status: "active",
    department: "IT",
    lastAccess: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "María García",
    email: "maria.garcia@diveco.com",
    role: "USER",
    status: "active",
    department: "HR",
    lastAccess: "2024-01-14T15:45:00Z",
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos.lopez@diveco.com",
    role: "SAP-USER-ADMIN",
    status: "inactive",
    department: "Finance",
    lastAccess: "2024-01-10T09:20:00Z",
    createdAt: "2024-01-03T00:00:00Z",
  },
]);

// Opciones para filtros
const statusOptions = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
];

const roleOptions = [
  { label: "Administrador", value: "ADMIN" },
  { label: "Usuario", value: "USER" },
  { label: "Admin SAP", value: "SAP-USER-ADMIN" },
];

const lastAccessOptions = [
  { label: "Última semana", value: "week" },
  { label: "Último mes", value: "month" },
  { label: "Últimos 3 meses", value: "quarter" },
  { label: "Último año", value: "year" },
];

const departmentOptions = [
  { label: "IT", value: "IT" },
  { label: "Recursos Humanos", value: "HR" },
  { label: "Finanzas", value: "Finance" },
  { label: "Ventas", value: "Sales" },
  { label: "Marketing", value: "Marketing" },
];

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }

  // Filtro de estado
  if (statusFilter.value) {
    filtered = filtered.filter((user) => user.status === statusFilter.value);
  }

  // Filtro de rol
  if (roleFilter.value) {
    filtered = filtered.filter((user) => user.role === roleFilter.value);
  }

  // Filtro de departamento
  if (departmentFilter.value) {
    filtered = filtered.filter(
      (user) => user.department === departmentFilter.value
    );
  }

  return filtered;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

// Métodos

const getRoleColor = (role) => {
  const colors = {
    ADMIN: "red",
    "SAP-USER-ADMIN": "purple",
    USER: "blue",
  };
  return colors[role] || "gray";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  roleFilter.value = "";
  dateFilter.value = "";
  lastAccessFilter.value = "";
  departmentFilter.value = "";
  currentPage.value = 1;
};

const refreshUsers = async () => {
  isLoading.value = true;
  try {
    // Aquí se haría la llamada a la API real
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  } finally {
    isLoading.value = false;
  }
};

const viewUser = (user) => {
  // Implementar vista de usuario
  console.log("Ver usuario:", user);
};

const editUser = (user) => {
  // Implementar edición de usuario
  console.log("Editar usuario:", user);
};

const deleteUser = (user) => {
  // Implementar confirmación y eliminación
  console.log("Eliminar usuario:", user);
};

const exportUsers = () => {
  // Implementar exportación
  console.log("Exportar usuarios");
};

// Lifecycle
onMounted(() => {
  // Inicialización si es necesaria
});
</script>

<style scoped>
/* Animaciones personalizadas */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efectos hover mejorados */
.hover\:shadow-lg:hover {
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:shadow-xl:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Transiciones suaves */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efectos de profundidad */
.shadow-md {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Estilos para modo oscuro */
.dark .shadow-md {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2);
}
</style>
