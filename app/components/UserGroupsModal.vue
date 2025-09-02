<template>
  <!-- Modal Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0"></div>

    <!-- Modal Container -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl transition-all"
        @click.stop
      >
        <!-- Modal Header -->
        <div
          class="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Grupos
            </h3>
            <button
              @click="closeModal"
              class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-4">
          <div class="space-y-3">
            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center py-8">
              <div class="flex items-center space-x-3">
                <div
                  class="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
                ></div>
                <span class="text-gray-500 dark:text-gray-400"
                  >Cargando grupos...</span
                >
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="groups.length === 0" class="text-center py-8">
              <div class="flex flex-col items-center space-y-3">
                <svg
                  class="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <div>
                  <h4 class="text-lg font-medium text-gray-900 dark:text-white">
                    Sin grupos asignados
                  </h4>
                  <p class="text-gray-500 dark:text-gray-400">
                    Este usuario no pertenece a ningún grupo
                  </p>
                </div>
              </div>
            </div>

            <!-- Groups List -->
            <div v-else class="space-y-2">
              <div
                v-for="group in groups"
                :key="group.GroupName"
                class="flex items-center justify-between p-3 rounded-lg border transition-all duration-200"
                :class="
                  isGroupAssignedToUser(group.GroupName)
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                "
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="
                      isGroupAssignedToUser(group.GroupName)
                        ? 'bg-green-100 dark:bg-green-800'
                        : 'bg-cyan-100 dark:bg-cyan-900'
                    "
                  >
                    <svg
                      v-if="isGroupAssignedToUser(group.GroupName)"
                      class="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4 text-cyan-600 dark:text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <h4
                        class="text-sm font-medium"
                        :class="
                          isGroupAssignedToUser(group.GroupName)
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-gray-900 dark:text-white'
                        "
                      >
                        {{ group.GroupName }}
                      </h4>
                      <span
                        v-if="isGroupAssignedToUser(group.GroupName)"
                        class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      >
                        Asignado
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ group.Description || "Sin descripción" }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500">
                      Creado: {{ formatDate(group.CreationDate) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600"
        >
          <div class="flex justify-end space-x-3">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { generateClient } from "aws-amplify/api";
import { useUserGroups } from "~/composables/useUserGroups";

const client = generateClient();
const { userGroups: currentUserGroups, fetchUserGroups } = useUserGroups();

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(["close"]);

// Estado reactivo
const isLoading = ref(false);
const groups = ref([]);

const loadAllGroups = async () => {
  try {
    // Cargar todos los grupos disponibles
    const request = await client.queries.AllGroups({});
    const response = JSON.parse(request.data);
    console.log("Grupos cargados:", response);

    // Filtrar grupos que NO contengan "MicrosoftEntra" en el nombre
    const filteredGroups = response.groups.filter(
      (group) => !group.GroupName.includes("MicrosoftEntra")
    );

    // Cargar grupos del usuario actual para comparar
    await fetchUserGroups();
    console.log("Grupos del usuario actual:", currentUserGroups.value);

    groups.value = filteredGroups;
    console.log("Grupos filtrados (sin MicrosoftEntra):", filteredGroups);
  } catch (error) {
    console.error("Error al cargar grupos:", error);
    groups.value = [];
  }
};

onMounted(() => {
  loadAllGroups();
});

// Métodos
const closeModal = () => {
  emit("close");
};

const getGroupBadgeClass = (groupName) => {
  const classes = {
    ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "SAP-USER-ADMIN":
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };
  return classes[groupName] || classes.default;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isGroupAssignedToUser = (groupName) => {
  return currentUserGroups.value.some(
    (userGroup) => userGroup.GroupName === groupName
  );
};

const loadUserGroups = async () => {
  if (!props.user) return;

  isLoading.value = true;
  try {
    // TODO: Implementar llamada a la API para obtener grupos del usuario
    // Por ahora usamos datos de ejemplo
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Datos de ejemplo - esto se reemplazará con la API real
    groups.value = [
      {
        id: 1,
        name: "Administradores",
        description: "Grupo de administradores del sistema",
        role: "ADMIN",
      },
      {
        id: 2,
        name: "Usuarios SAP",
        description: "Usuarios con acceso a funcionalidades SAP",
        role: "SAP-USER-ADMIN",
      },
    ];
  } catch (error) {
    console.error("Error al cargar grupos del usuario:", error);
    groups.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Watchers
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      // Los grupos ya se cargan en onMounted, no necesitamos recargarlos
      console.log("Modal abierto, mostrando grupos disponibles");
    }
  }
);
</script>

<style scoped>
/* Animaciones personalizadas */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transiciones suaves */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition:
    color 0.2s ease-in-out,
    background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.3s ease-in-out;
}
</style>
