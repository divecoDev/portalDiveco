<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </h1>
      </div>

      <!-- Loading State -->
      <div v-if="loadingProfile" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-500 dark:text-gray-400">
          Cargando información del perfil...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="profileError" class="text-center py-8">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-12 h-12 text-red-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
          Error al cargar el perfil
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ profileError }}</p>
        <UButton
          @click="loadUserProfile"
          variant="outline"
          color="red"
          size="sm"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
          Reintentar
        </UButton>
      </div>

      <!-- Profile Content -->
      <div v-else class="space-y-6">
        <!-- Profile Header Card -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center space-x-4">
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <!-- User Photo -->
              <img
                v-if="userPhoto"
                :src="userPhoto"
                :alt="displayName"
                class="w-16 h-16 rounded-full object-cover shadow-sm"
              />
              <!-- Fallback to Initials -->
              <div
                v-else
                class="w-16 h-16 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500"
              >
                <span class="text-lg font-bold text-white">
                  {{ getInitials(displayName) }}
                </span>
              </div>
              <!-- Loading indicator for photo -->
              <div
                v-if="loadingProfile"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full"
              >
                <div
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <h2
                class="text-xl font-semibold text-gray-900 dark:text-white truncate"
              >
                {{ displayName }}
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                {{ userData?.mail || userData?.userPrincipalName }}
              </p>
              <p
                v-if="userData?.jobTitle"
                class="text-sm text-gray-500 dark:text-gray-400 truncate"
              >
                {{ userData.jobTitle }}
                <span v-if="userData?.department">
                  • {{ userData.department }}</span
                >
              </p>
            </div>

            <!-- Status Badges -->
            <div class="flex flex-col space-y-2">
              <UBadge
                :color="hasGroup('ADMIN') ? 'green' : 'blue'"
                variant="subtle"
                size="xs"
              >
                {{ userRole || "Ciudadano DIVECO" }}
              </UBadge>
              <UBadge
                :color="hasSapUser ? 'green' : 'red'"
                variant="subtle"
                size="xs"
              >
                {{ hasSapUser ? "SAP Activo" : "SAP Inactivo" }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Contact Info -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <h3
              class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center"
            >
              <UIcon
                name="i-heroicons-envelope"
                class="w-4 h-4 mr-2 text-cyan-500"
              />
              Información de Contacto
            </h3>
            <div class="space-y-2 text-sm">
              <div v-if="userData?.mail">
                <span class="text-gray-500 dark:text-gray-400">Email:</span>
                <span class="ml-2 text-gray-900 dark:text-white">{{
                  userData.mail
                }}</span>
              </div>
              <div
                v-if="
                  userData?.businessPhones && userData.businessPhones.length > 0
                "
              >
                <span class="text-gray-500 dark:text-gray-400">Teléfono:</span>
                <span class="ml-2 text-gray-900 dark:text-white">{{
                  userData.businessPhones[0]
                }}</span>
              </div>
              <div v-if="userData?.officeLocation">
                <span class="text-gray-500 dark:text-gray-400">Oficina:</span>
                <span class="ml-2 text-gray-900 dark:text-white">{{
                  userData.officeLocation
                }}</span>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <h3
              class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center"
            >
              <UIcon
                name="i-heroicons-cog-6-tooth"
                class="w-4 h-4 mr-2 text-cyan-500"
              />
              Estado del Sistema
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400"
                  >Acceso SAP:</span
                >
                <UBadge
                  :color="hasSapUser ? 'green' : 'red'"
                  variant="subtle"
                  size="xs"
                >
                  {{ hasSapUser ? "Activo" : "Inactivo" }}
                </UBadge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 dark:text-gray-400">Rol:</span>
                <UBadge
                  :color="hasGroup('ADMIN') ? 'green' : 'blue'"
                  variant="subtle"
                  size="xs"
                >
                  {{ userRole || "Ciudadano" }}
                </UBadge>
              </div>
              <div
                v-if="userGroups.length > 0"
                class="flex items-start justify-between"
              >
                <span class="text-gray-500 dark:text-gray-400">Grupos:</span>
                <div class="flex flex-wrap gap-1 ml-2">
                  <UBadge
                    v-for="group in userGroups.slice(0, 2)"
                    :key="group"
                    variant="outline"
                    size="xs"
                  >
                    {{ group.GroupName }}
                  </UBadge>
                  <span
                    v-if="userGroups.length > 2"
                    class="text-xs text-gray-400"
                  >
                    +{{ userGroups.length - 2 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Message for Actions -->
    <StatusMessage
      :show="statusMessage.show"
      :message="statusMessage.message"
      :type="statusMessage.type"
      @close="closeStatusMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { useToast } from "#imports";
import StatusMessage from "~/components/StatusMessage.vue";

// Page metadata
definePageMeta({
  middleware: "auth",
  title: "Mi Perfil",
});

// Composables
const { getCompleteUserData, getInitials, clearCache } = useMicrosoftGraph();

const {
  userGroups,
  getUserRole,
  isLoading: isLoadingGroups,
  hasGroup,
} = useUserGroups();

const toast = useToast();
const client = generateClient();

// Reactive state
const loadingProfile = ref(false);
const profileError = ref(null);
const userData = ref(null);
const userPhoto = ref(null);
const loadingPhoto = ref(false);
const hasSapUser = ref(false);
const loadingSapUser = ref(false);
const isResettingPassword = ref(false);
const isUnlockingUser = ref(false);

// Status message for actions
const statusMessage = ref({
  show: false,
  message: "",
  type: "info",
});

// Computed
const displayName = computed(() => {
  return userData.value?.displayName || "Usuario";
});

const userRole = computed(() => getUserRole());

// Functions
const showStatusMessage = (message, type = "info") => {
  statusMessage.value.show = false;
  setTimeout(() => {
    statusMessage.value = {
      show: true,
      message,
      type,
    };
  }, 100);
};

const closeStatusMessage = () => {
  statusMessage.value.show = false;
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const checkSapUser = async (email) => {
  if (!email) return false;

  loadingSapUser.value = true;

  try {
    const data = await $fetch("/api/sap/existUserAndIsActive", {
      query: { email },
    });

    if (data.status === 200) {
      return data.sapUser !== false;
    }
    return false;
  } catch (error) {
    console.error("Error verificando usuario SAP:", error);
    return false;
  } finally {
    loadingSapUser.value = false;
  }
};

const loadUserProfile = async () => {
  loadingProfile.value = true;
  profileError.value = null;

  try {
    // Get user attributes from Amplify
    const userAttributes = await fetchUserAttributes();
    const userEmail = userAttributes.email;

    if (!userEmail) {
      throw new Error("No se pudo obtener el email del usuario");
    }

    // Get complete user data from Microsoft Graph
    const { userData: graphData, photo } = await getCompleteUserData(userEmail);

    if (graphData) {
      userData.value = graphData;
      userPhoto.value = photo;
    } else {
      // Fallback to Amplify data if Microsoft Graph fails
      userData.value = {
        displayName: userAttributes.email,
        mail: userAttributes.email,
        userPrincipalName: userAttributes.email,
      };
    }

    // Check SAP user status
    hasSapUser.value = await checkSapUser(userEmail);
  } catch (error) {
    console.error("Error loading user profile:", error);
    profileError.value =
      error.message || "Error desconocido al cargar el perfil";
  } finally {
    loadingProfile.value = false;
  }
};

const refreshProfile = async () => {
  // Clear cache before refreshing
  clearCache();
  await loadUserProfile();
  showStatusMessage("Perfil actualizado exitosamente", "success");
};

const getSapUserFromEmail = async (email) => {
  try {
    const response = await $fetch("/api/sap/users");
    const users = response.data;

    const sapUser = users.find(
      (user) => user.correo?.toLowerCase() === email?.toLowerCase()
    );

    return sapUser;
  } catch (error) {
    console.error("Error obteniendo usuarios SAP:", error);
    return null;
  }
};

const saveActionHistory = async (action, response) => {
  try {
    const currentUser = await getCurrentUser();
    const loggedUserEmail =
      currentUser?.signInDetails?.loginId ||
      currentUser?.username ||
      "usuario-desconocido";

    const historyData = {
      sapUser: userData.value?.mail || "unknown",
      emailOwner: loggedUserEmail,
      accion: action === "reset" ? "RESET_PASSWORD" : "UNLOCK_USER",
      status: "Completado",
      logs: JSON.stringify(response),
      date: new Date().toISOString(),
    };

    const { errors, data: historyResponse } =
      await client.models.SapUserActionHistory.create(historyData);

    if (errors) {
      console.error("❌ Errores al guardar historial:", errors);
    } else {
      console.log("✅ Historial guardado exitosamente:", historyResponse);
    }
  } catch (error) {
    console.error("❌ Error al guardar historial:", error);
  }
};

const handleSelfPasswordReset = async () => {
  if (!hasSapUser.value || isResettingPassword.value) return;

  isResettingPassword.value = true;

  try {
    const userEmail = userData.value?.mail || userData.value?.userPrincipalName;
    const sapUserData = await getSapUserFromEmail(userEmail);

    if (!sapUserData) {
      throw new Error("No se encontró el usuario SAP correspondiente");
    }

    showStatusMessage(
      `Iniciando reinicio de contraseña para ${displayName.value}...`,
      "info"
    );

    const response = await client.queries.ResetPassword({
      sapUser: sapUserData.usuario,
      email: userEmail,
      accion: "R",
    });

    let parsedData = null;
    if (response.data && typeof response.data === "string") {
      parsedData = JSON.parse(response.data);
    }

    if (parsedData && parsedData.success && parsedData.data) {
      const resetData = parsedData.data;
      showStatusMessage(
        `Contraseña reiniciada exitosamente: ${resetData.mensaje || "Operación completada"}`,
        "success"
      );
      await saveActionHistory("reset", resetData);
    } else {
      throw new Error(
        parsedData?.mensaje || "Error en el servicio de reinicio"
      );
    }
  } catch (error) {
    console.error("Error en reinicio de contraseña:", error);
    showStatusMessage(`Error: ${error.message}`, "error");
  } finally {
    isResettingPassword.value = false;
  }
};

const handleSelfUnlock = async () => {
  if (!hasSapUser.value || isUnlockingUser.value) return;

  isUnlockingUser.value = true;

  try {
    const userEmail = userData.value?.mail || userData.value?.userPrincipalName;
    const sapUserData = await getSapUserFromEmail(userEmail);

    if (!sapUserData) {
      throw new Error("No se encontró el usuario SAP correspondiente");
    }

    showStatusMessage(
      `Iniciando desbloqueo de usuario para ${displayName.value}...`,
      "info"
    );

    const response = await client.queries.ResetPassword({
      sapUser: sapUserData.usuario,
      email: userEmail,
      accion: "D",
    });

    let parsedData = null;
    if (response.data && typeof response.data === "string") {
      parsedData = JSON.parse(response.data);
    }

    if (parsedData && parsedData.success && parsedData.data) {
      const unlockData = parsedData.data;
      showStatusMessage(
        `Usuario desbloqueado exitosamente: ${unlockData.mensaje || "Operación completada"}`,
        "success"
      );
      await saveActionHistory("unlock", unlockData);
    } else {
      throw new Error(
        parsedData?.mensaje || "Error en el servicio de desbloqueo"
      );
    }
  } catch (error) {
    console.error("Error en desbloqueo de usuario:", error);
    showStatusMessage(`Error: ${error.message}`, "error");
  } finally {
    isUnlockingUser.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadUserProfile();
});
</script>

<style scoped>
/* Animaciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Hover effects */
.hover\:shadow-xl:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .hover\:shadow-xl:hover {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.25),
      0 10px 10px -5px rgba(0, 0, 0, 0.1);
  }
}

/* Custom scrollbar for long content */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
