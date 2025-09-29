<template>
  <div
    :class="[
      'relative',
      level > 0
        ? 'ml-4 border-l border-gray-300 dark:border-gray-600 pl-3'
        : '',
    ]"
  >
    <!-- Status Message Global -->
    <StatusMessage
      :show="statusMessage.show"
      :message="statusMessage.message"
      :type="statusMessage.type"
      @close="closeStatusMessage"
    />

    <!-- Citizen Card - Diseño Compacto -->
    <div
      :class="[
        'group relative rounded-lg p-4 border transition-all duration-200',
        citizen.hasSapUser
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-md'
          : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-70',
      ]"
    >
      <!-- Main Content Row -->
      <div class="flex items-center space-x-3">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="relative w-10 h-10">
            <!-- User Photo -->
            <img
              v-if="userPhotos.get(citizen.id)"
              :src="userPhotos.get(citizen.id)"
              :alt="citizen.displayName"
              class="w-10 h-10 rounded-full object-cover shadow-sm"
            />
            <!-- Fallback to Initials -->
            <div
              v-else
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center shadow-sm',
                citizen.hasSapUser
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600',
              ]"
            >
              <span
                :class="[
                  'text-sm font-bold',
                  citizen.hasSapUser ? 'text-white' : 'text-gray-200',
                ]"
              >
                {{ getInitials(citizen.displayName) }}
              </span>
            </div>
            <!-- Loading indicator for photo -->
            <div
              v-if="loadingPhotos.has(citizen.id)"
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full"
            >
              <div
                class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="flex-1 min-w-0">
          <!-- Name with Badges -->
          <div class="flex items-center space-x-2 mb-1">
            <h4
              :class="[
                'text-sm font-semibold truncate',
                citizen.hasSapUser
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ citizen.displayName }}
            </h4>

            <!-- SAP Status Badge -->
            <div
              :class="[
                'flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                citizen.hasSapUser
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
              ]"
            >
              <UIcon
                :name="
                  citizen.hasSapUser
                    ? 'i-heroicons-check-circle'
                    : 'i-heroicons-x-circle'
                "
                class="w-3 h-3"
              />
            </div>

            <!-- Subordinates Count Badge -->
            <span
              v-if="citizen.hasSubordinates"
              class="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 px-1.5 py-0.5 rounded text-xs font-medium flex items-center"
            >
              <UIcon name="i-heroicons-users" class="w-3 h-3 mr-1" />
              {{ citizen.subordinatesCount }}
            </span>
          </div>

          <!-- Job Title and Actions Row -->
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'text-xs truncate',
                  citizen.hasSapUser
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-gray-400 dark:text-gray-500',
                ]"
              >
                {{ citizen.jobTitle || "Sin cargo definido" }}
              </p>

              <!-- Email - Siempre visible pero más sutil -->
              <div
                :class="[
                  'flex items-center mt-0.5 text-xs',
                  citizen.hasSapUser
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-400 dark:text-gray-500',
                ]"
              >
                <UIcon
                  name="i-heroicons-envelope"
                  class="w-3 h-3 mr-1 flex-shrink-0"
                />
                <span class="truncate">{{ citizen.mail }}</span>
              </div>
            </div>

            <!-- Actions Row -->
            <div class="flex items-center space-x-1 ml-3">
              <!-- Action Buttons -->
              <template v-if="citizen.hasSapUser">
                <UButton
                  size="xs"
                  variant="outline"
                  color="cyan"
                  :loading="isResetting"
                  :disabled="isResetting || isUnlocking"
                  @click="handleCitizenAction('reset')"
                  class="px-2 py-1 transition-all duration-200"
                  :class="{ 'animate-pulse': isResetting }"
                >
                  <UIcon
                    v-if="!isResetting"
                    name="i-heroicons-key"
                    class="w-3 h-3"
                  />
                </UButton>
                <UButton
                  size="xs"
                  variant="outline"
                  color="orange"
                  :loading="isUnlocking"
                  :disabled="isResetting || isUnlocking"
                  @click="handleCitizenAction('unlock')"
                  class="px-2 py-1 transition-all duration-200"
                  :class="{ 'animate-pulse': isUnlocking }"
                >
                  <UIcon
                    v-if="!isUnlocking"
                    name="i-heroicons-lock-open"
                    class="w-3 h-3"
                  />
                </UButton>
              </template>

              <!-- Expand/Collapse Button -->
              <UButton
                v-if="citizen.hasSubordinates"
                @click="handleToggleSubordinates"
                variant="ghost"
                size="xs"
                :disabled="isResetting || isUnlocking"
                :icon="
                  isExpanded
                    ? 'i-heroicons-chevron-up'
                    : 'i-heroicons-chevron-down'
                "
                class="transition-transform duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subordinates (Recursive) -->
    <div v-if="citizen.hasSubordinates && isExpanded" class="mt-3 space-y-2">
      <CitizenHierarchyItem
        v-for="subordinate in citizen.subordinates"
        :key="subordinate.id"
        :citizen="subordinate"
        :user-photos="userPhotos"
        :loading-photos="loadingPhotos"
        :expanded-subordinates="expandedSubordinates"
        :level="level + 1"
        @citizen-selected="
          (citizen, action) => $emit('citizen-selected', citizen, action)
        "
        @toggle-subordinates="(id) => $emit('toggle-subordinates', id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { useToast } from "#imports";

// Importar el componente StatusMessage
import StatusMessage from "./StatusMessage.vue";

// Generar cliente de Amplify
const client = generateClient();
const toast = useToast();

const props = defineProps({
  citizen: {
    type: Object,
    required: true,
  },
  userPhotos: {
    type: Map,
    required: true,
  },
  loadingPhotos: {
    type: Set,
    required: true,
  },
  expandedSubordinates: {
    type: Set,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["citizen-selected", "toggle-subordinates"]);

// Estados reactivos para las acciones
const isResetting = ref(false);
const isUnlocking = ref(false);

// Estado para notificaciones locales
const statusMessage = ref({
  show: false,
  message: "",
  type: "info",
});

// Función para mostrar mensaje de estado
const showStatusMessage = (message, type = "info") => {
  // Cerrar mensaje anterior
  statusMessage.value.show = false;

  // Mostrar nuevo mensaje después de un pequeño delay
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

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const isExpanded = computed(() => {
  return props.expandedSubordinates.has(props.citizen.id);
});

// Función para obtener el usuario SAP basado en el email
const getSapUserFromEmail = async (email) => {
  try {
    const response = await $fetch("/api/sap/users");
    const users = response.data;

    // Buscar el usuario SAP que coincida con el email
    const sapUser = users.find(
      (user) => user.correo?.toLowerCase() === email?.toLowerCase(),
    );

    return sapUser;
  } catch (error) {
    console.error("Error obteniendo usuarios SAP:", error);
    return null;
  }
};

// Función para guardar historial de acciones (éxito o error)
const saveActionHistory = async (action, response, isSuccess = true) => {
  try {
    const currentUser = await getCurrentUser();
    const loggedUserEmail =
      currentUser?.signInDetails?.loginId ||
      currentUser?.username ||
      "usuario-desconocido";

    const historyData = {
      sapUser: props.citizen.sapUserData?.usuario || props.citizen.mail,
      emailOwner: loggedUserEmail,
      accion: action === "reset" ? "RESET_PASSWORD" : "UNLOCK_USER",
      status: isSuccess ? "Completado" : "Error",
      logs: JSON.stringify(response),
      date: new Date().toISOString(),
    };

    const { errors, data: historyResponse } =
      await client.models.SapUserActionHistory.create(historyData);

    if (errors) {
      return null;
    } else {
      return historyResponse;
    }
  } catch (error) {
    console.error("❌ Error al guardar historial:", error);
    // No lanzamos el error para que no afecte el flujo principal
    return null;
  }
};

// Función para reiniciar contraseña
const handlePasswordReset = async () => {
  if (!props.citizen.hasSapUser || isResetting.value) return;

  isResetting.value = true;

  try {
    console.log(
      `🚀 Iniciando reinicio de contraseña para: ${props.citizen.displayName}`,
    );

    // Obtener datos del usuario SAP
    const sapUserData = await getSapUserFromEmail(props.citizen.mail);

    if (!sapUserData) {
      throw new Error("No se encontró el usuario SAP correspondiente");
    }

    // Almacenar datos SAP en el ciudadano para referencia
    props.citizen.sapUserData = sapUserData;

    // Mostrar mensaje de procesando
    showStatusMessage(
      `Iniciando proceso de reinicio para ${props.citizen.displayName} (${sapUserData.usuario})`,
      "info",
    );

    const response = await client.queries.ResetPassword({
      sapUser: sapUserData.usuario,
      email: props.citizen.mail,
      accion: "R",
    });

    console.log("📡 Respuesta de reinicio:", response);

    // Parsear la respuesta
    let parsedData = null;
    if (response.data && typeof response.data === "string") {
      parsedData = JSON.parse(response.data);
    }

    if (parsedData && parsedData.success && parsedData.data) {
      const resetData = parsedData.data;

      // Mostrar mensaje de éxito
      const successMessage = `${props.citizen.displayName}: ${resetData.mensaje || "Contraseña reiniciada exitosamente"}`;
      showStatusMessage(successMessage, "success");

      // Guardar historial de éxito
      await saveActionHistory("reset", resetData, true);

      console.log(`✅ Reinicio exitoso para ${props.citizen.displayName}`);
    } else {
      // Error del servicio SAP
      const errorMessage =
        parsedData?.mensaje || "Error en el servicio de reinicio";

      // Guardar historial de error del servicio SAP
      console.log("💾 Guardando historial de error del servicio SAP...");
      await saveActionHistory("reset", parsedData, false);

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(
      `❌ Error en reinicio para ${props.citizen.displayName}:`,
      error,
    );

    // Mostrar mensaje de error
    const errorMessage = `${props.citizen.displayName}: ${error.message}`;
    showStatusMessage(errorMessage, "error");

    // Guardar historial de error crítico
    console.log("💾 Guardando historial de error crítico...");
    await saveActionHistory(
      "reset",
      {
        error: error.message,
        stack: error.stack,
        citizen: props.citizen.displayName,
        email: props.citizen.mail,
      },
      false,
    );
  } finally {
    isResetting.value = false;
  }
};

// Función para desbloquear usuario
const handleUserUnlock = async () => {
  if (!props.citizen.hasSapUser || isUnlocking.value) return;

  isUnlocking.value = true;

  try {
    console.log(`🚀 Iniciando desbloqueo para: ${props.citizen.displayName}`);

    // Obtener datos del usuario SAP
    const sapUserData = await getSapUserFromEmail(props.citizen.mail);

    if (!sapUserData) {
      throw new Error("No se encontró el usuario SAP correspondiente");
    }

    // Almacenar datos SAP en el ciudadano para referencia
    props.citizen.sapUserData = sapUserData;

    // Mostrar mensaje de procesando
    showStatusMessage(
      `Iniciando proceso de desbloqueo para ${props.citizen.displayName} (${sapUserData.usuario})`,
      "info",
    );

    const response = await client.queries.ResetPassword({
      sapUser: sapUserData.usuario,
      email: props.citizen.mail,
      accion: "D", // Acción de desbloqueo
    });

    console.log("📡 Respuesta de desbloqueo:", response);

    // Parsear la respuesta
    let parsedData = null;
    if (response.data && typeof response.data === "string") {
      parsedData = JSON.parse(response.data);
    }

    if (parsedData && parsedData.success && parsedData.data) {
      const unlockData = parsedData.data;

      // Mostrar mensaje de éxito
      const successMessage = `${props.citizen.displayName}: ${unlockData.mensaje || "Usuario desbloqueado exitosamente"}`;
      showStatusMessage(successMessage, "success");

      // Guardar historial de éxito
      await saveActionHistory("unlock", unlockData, true);

      console.log(`✅ Desbloqueo exitoso para ${props.citizen.displayName}`);
    } else {
      // Error del servicio SAP
      const errorMessage =
        parsedData?.mensaje || "Error en el servicio de desbloqueo";

      // Guardar historial de error del servicio SAP
      console.log("💾 Guardando historial de error del servicio SAP...");
      await saveActionHistory("unlock", parsedData, false);

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(
      `❌ Error en desbloqueo para ${props.citizen.displayName}:`,
      error,
    );

    // Mostrar mensaje de error
    const errorMessage = `${props.citizen.displayName}: ${error.message}`;
    showStatusMessage(errorMessage, "error");

    // Guardar historial de error crítico
    console.log("💾 Guardando historial de error crítico...");
    await saveActionHistory(
      "unlock",
      {
        error: error.message,
        stack: error.stack,
        citizen: props.citizen.displayName,
        email: props.citizen.mail,
      },
      false,
    );
  } finally {
    isUnlocking.value = false;
  }
};

const handleCitizenAction = (action) => {
  if (action === "reset") {
    handlePasswordReset();
  } else if (action === "unlock") {
    handleUserUnlock();
  }

  // Mantener compatibilidad con el evento original
  emit("citizen-selected", props.citizen, action);
};

const handleToggleSubordinates = () => {
  emit("toggle-subordinates", props.citizen.id);
};
</script>

<style scoped>
/* Animaciones suaves para el diseño compacto */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Hover effects compactos */
.hover\:shadow-md:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Mejoras para el modo oscuro */
@media (prefers-color-scheme: dark) {
  .hover\:shadow-md:hover {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.3),
      0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }
}

/* Líneas de jerarquía más sutiles */
.border-l {
  border-left-width: 1px;
}

/* Efectos de hover para los botones */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* Animaciones para estados de carga */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Estilos para botones en estado de carga */
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

button[loading="true"] {
  cursor: wait;
}

/* Efectos para botones de acción */
button[color="cyan"]:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(6, 182, 212, 0.3);
}

button[color="orange"]:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
}
</style>
