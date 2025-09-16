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
        <div class="bg-cyan-500 px-6 py-4 border-b border-cyan-600">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Grupos</h3>
            <button
              @click="closeModal"
              class="rounded-lg p-1.5 text-white hover:bg-cyan-600 hover:text-white transition-colors"
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

                <!-- Botones de acción -->
                <div class="flex items-center space-x-2">
                  <button
                    v-if="!isGroupAssignedToUser(group.GroupName)"
                    @click="assignUserToGroup(group.GroupName)"
                    :disabled="isGroupLoading(group.GroupName)"
                    class="inline-flex items-center justify-center w-8 h-8 text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 rounded-lg transition-colors"
                    title="Asignar grupo al usuario"
                  >
                    <svg
                      v-if="!isGroupLoading(group.GroupName)"
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <div
                      v-else
                      class="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"
                    ></div>
                  </button>

                  <button
                    v-else
                    @click="removeUserFromGroup(group.GroupName)"
                    :disabled="isGroupLoading(group.GroupName)"
                    class="inline-flex items-center justify-center w-8 h-8 text-white bg-red-300 hover:bg-red-400 disabled:bg-red-200 rounded-lg transition-colors"
                    title="Quitar grupo del usuario"
                  >
                    <svg
                      v-if="!isGroupLoading(group.GroupName)"
                      class="w-4 h-4"
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
                    <div
                      v-else
                      class="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"
                    ></div>
                  </button>
                </div>
              </div>
            </div>
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
const loadingGroups = ref(new Set());
const selectedUserGroups = ref([]);

const loadAllGroups = async () => {
  try {
    // Cargar todos los grupos disponibles
    const request = await client.queries.AllGroups({});
    const response = JSON.parse(request.data);
    // Filtrar grupos que NO contengan "MicrosoftEntra" en el nombre
    const filteredGroups = response.groups.filter(
      (group) => !group.GroupName.includes("MicrosoftEntra"),
    );

    groups.value = filteredGroups;
  } catch (error) {
    console.error("Error al cargar grupos:", error);
    groups.value = [];
  }
};

const loadSelectedUserGroups = async () => {
  if (!props.user) {
    selectedUserGroups.value = [];
    return;
  }

  try {
    isLoading.value = true;
    const request = await client.queries.Group({
      username: props.user.Username,
    });
    const response = JSON.parse(request.data);
    // Filtrar grupos que NO contengan "MicrosoftEntra" en el nombre
    const filteredUserGroups = response.groups.filter(
      (group) => !group.GroupName.includes("MicrosoftEntra"),
    );

    selectedUserGroups.value = filteredUserGroups;
  } catch (error) {
    console.error("Error al cargar grupos del usuario seleccionado:", error);
    selectedUserGroups.value = [];
  } finally {
    isLoading.value = false;
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
  return selectedUserGroups.value.some(
    (userGroup) => userGroup.GroupName === groupName,
  );
};

const isGroupLoading = (groupName) => {
  return loadingGroups.value.has(groupName);
};

const assignUserToGroup = async (groupName) => {
  if (!props.user) return;

  try {
    loadingGroups.value.add(groupName);
    const request = await client.queries.AssignUserToGroup({
      userId: props.user.Username,
      groupName: groupName,
    });

    const response = JSON.parse(request.data);
    // Recargar grupos del usuario seleccionado para actualizar la UI
    await loadSelectedUserGroups();
  } catch (error) {
    console.error("Error al asignar usuario al grupo:", error);
  } finally {
    loadingGroups.value.delete(groupName);
  }
};

const removeUserFromGroup = async (groupName) => {
  if (!props.user) return;

  try {
    loadingGroups.value.add(groupName);
    const request = await client.queries.RemoveUserFromGroup({
      userId: props.user.Username,
      groupName: groupName,
    });

    const response = JSON.parse(request.data);

    // Recargar grupos del usuario seleccionado para actualizar la UI
    await loadSelectedUserGroups();

    // Mostrar mensaje de éxito (opcional)
  } catch (error) {
    console.error("Error al remover usuario del grupo:", error);
  } finally {
    loadingGroups.value.delete(groupName);
  }
};

// Watchers
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      // Cargar grupos del usuario seleccionado cuando se abre el modal
      loadSelectedUserGroups();
    }
  },
);

// Watcher para cuando cambie el usuario seleccionado
watch(
  () => props.user,
  (newUser) => {
    if (newUser && props.isOpen) {
      // Recargar grupos si el usuario cambia y el modal está abierto
      loadSelectedUserGroups();
    }
  },
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
