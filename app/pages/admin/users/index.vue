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
        <div class="flex flex-wrap items-center space-x-4"></div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Fecha de Creación
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
              <td colspan="4" class="px-6 py-12 text-center">
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
              <td colspan="4" class="px-6 py-12">
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
              :key="user.Username"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ user.email }}
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge variant="subtle" size="sm">
                  {{ user.Enabled ? "Activo" : "Inactivo" }}
                </UBadge>
              </td>

              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{ formatDate(user.UserCreateDate) }}
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <UButton
                    icon="i-heroicons-users"
                    variant="ghost"
                    color="cyan"
                    size="sm"
                    @click="openGroupsModal(user)"
                    title="Ver grupos"
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

    <!-- Modal de Grupos -->
    <UserGroupsModal
      :is-open="isGroupsModalOpen"
      :user="selectedUser"
      @close="closeGroupsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { generateClient } from "aws-amplify/api";
import UserGroupsModal from "~/components/UserGroupsModal.vue";

const client = generateClient();

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
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Estado del modal de grupos
const isGroupsModalOpen = ref(false);
const selectedUser = ref(null);

// Datos de usuarios de Cognito
const users = ref([]);

// Opciones para filtros
const statusOptions = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
];

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.Username.toLowerCase().includes(query)
    );
  }

  // Filtro de estado
  if (statusFilter.value) {
    const isActive = statusFilter.value === "active";
    filtered = filtered.filter((user) => user.Enabled === isActive);
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
  currentPage.value = 1;
};

const refreshUsers = async () => {
  isLoading.value = true;
  try {
    const listUsers = await getUsers();
    users.value = listUsers;
    console.log("Usuarios actualizados:", listUsers);
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

const openGroupsModal = (user) => {
  selectedUser.value = user;
  isGroupsModalOpen.value = true;
};

const closeGroupsModal = () => {
  isGroupsModalOpen.value = false;
  selectedUser.value = null;
};

const exportUsers = () => {
  // Implementar exportación
  console.log("Exportar usuarios");
};

// Lifecycle
onMounted(async () => {
  isLoading.value = true;
  try {
    const listUsers = await getUsers();
    users.value = listUsers;
    console.log("Usuarios cargados:", listUsers);
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  } finally {
    isLoading.value = false;
  }
});

const getUsers = async () => {
  const request = await client.queries.ListUsers({});
  const response = JSON.parse(request.data);

  console.log("Respuesta completa del handler:", response);

  // Verificar si la respuesta tiene la estructura esperada
  const users = response.users || response;

  // Si es un array directamente, usarlo; si no, intentar acceder a la propiedad users
  const usersArray = Array.isArray(users) ? users : users.users || [];

  // Procesar los usuarios de Cognito para extraer el email
  const processedUsers = usersArray.map((user) => {
    const emailAttribute = user.Attributes.find(
      (attr) => attr.Name === "email"
    );
    return {
      ...user,
      email: emailAttribute ? emailAttribute.Value : "Sin email",
    };
  });

  return processedUsers;
};
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
