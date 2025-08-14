<template>
  <UCard
    class="animate-fade-in-up border border-green-200 dark:border-green-700 shadow-lg"
    :style="'box-shadow: var(--diveco-shadow);'"
  >
    <template #header>
      <div
        class="flex items-center bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 -m-6 mb-6 p-6 rounded-t-lg"
      >
        <div
          class="flex-shrink-0 p-2 bg-green-600 dark:bg-green-500 rounded-lg"
        >
          <UIcon name="i-heroicons-lock-open" class="w-6 h-6 text-white" />
        </div>
        <div class="ml-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            Desbloqueo de Usuario SAP
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Solicita el desbloqueo de tu usuario SAP
          </p>
        </div>
      </div>
    </template>

    <!-- Mensaje de Status -->
    <StatusMessage
      :show="statusMessage.show"
      :message="statusMessage.message"
      :type="statusMessage.type"
      @close="closeStatusMessage"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label
          for="sapUser"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Usuario SAP
        </label>
        <UInput
          id="sapUser"
          v-model="form.sapUser"
          placeholder="Ej: JRODAS"
          icon="i-heroicons-user"
          size="xl"
          color="green"
          variant="outline"
          :disabled="isProcessing"
          class="focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div class="space-y-2">
        <label
          for="email"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email Corporativo
        </label>
        <UInput
          id="email"
          v-model="form.email"
          placeholder="usuario@diveco.com"
          icon="i-heroicons-envelope"
          type="email"
          size="xl"
          color="green"
          variant="outline"
          :disabled="isProcessing"
          class="focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>

    <template #footer>
      <div
        class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-gray-50 dark:bg-gray-800/50 -m-6 mt-6 p-6 rounded-b-lg"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-4 h-4 inline mr-1"
          />
          El desbloqueo se procesará inmediatamente
        </div>

        <div class="flex space-x-3">
          <UButton
            variant="outline"
            color="gray"
            @click="clearForm"
            :disabled="isProcessing"
            size="lg"
            class="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 bg-white hover:bg-gray-50 font-medium transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-2" />
            Limpiar
          </UButton>
          <UButton
            color="cyan"
            @click="submitUserUnlock"
            :loading="isSubmitting"
            :disabled="!isFormValid || isSubmitting"
            size="lg"
            class="shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon name="i-heroicons-lock-open" class="w-5 h-5 mr-2" />
            Solicitar Desbloqueo
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  unlockUser,
  validateUnlockUserRequest,
} from "~/services/sap-user-service";

// Importar el componente StatusMessage
import StatusMessage from "./StatusMessage.vue";

// Props
const props = defineProps({
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

// Estado interno de carga
const isSubmitting = ref(false);

// Emits
const emit = defineEmits(["unlock-success", "unlock-error"]);

// Reactive data
const form = ref({
  sapUser: "",
  email: "",
});

// Computed properties
const isFormValid = computed(() => {
  return form.value.sapUser && form.value.email;
});

// Logs
const statusMessage = ref({
  show: false,
  message: "",
  type: "info",
});

// Methods
const showStatusMessage = (message, type = "info") => {
  statusMessage.value = {
    show: true,
    message,
    type,
  };
};

const closeStatusMessage = () => {
  statusMessage.value.show = false;
};

const submitUserUnlock = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;

  // Limpiar logs anteriores
  // clearLogs(); // Eliminado

  // Logs más visibles y detallados
  console.log("🚀 ===== INICIO DEL PROCESO DE DESBLOQUEO =====");
  console.log("👤 Usuario SAP:", form.value.sapUser);
  console.log("📧 Email:", form.value.email);
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("🔍 Validando formulario...");

  // Logs visuales
  // addLog( // Eliminado
  //   `🚀 Iniciando proceso de desbloqueo para usuario ${form.value.sapUser}`,
  //   "info"
  // );
  // addLog(`📧 Email: ${form.value.email}`, "info");
  // addLog(`⏰ Timestamp: ${new Date().toISOString()}`, "info");

  // Mostrar mensaje de inicio
  showStatusMessage(
    `Iniciando proceso de desbloqueo para usuario ${form.value.sapUser}`,
    "info"
  );

  try {
    // Validar campos antes de enviar
    console.log("🔍 Validando campos del formulario...");
    // addLog("🔍 Validando campos del formulario...", "info"); // Eliminado

    const validation = validateUnlockUserRequest(form.value);
    if (!validation.isValid) {
      console.error("❌ Validación fallida:", validation.errors);
      // addLog(`❌ Validación fallida: ${validation.errors.join(", ")}`, "error"); // Eliminado
      throw new Error(`Errores de validación: ${validation.errors.join(", ")}`);
    }
    console.log("✅ Validación exitosa");
    // addLog("✅ Validación exitosa", "success"); // Eliminado

    console.log("📤 Enviando petición al endpoint de Nuxt...");
    console.log(" Endpoint: /api/sap/unlock-user");
    // addLog("📤 Enviando petición al endpoint de Nuxt...", "info"); // Eliminado
    // addLog("📍 Endpoint: /api/sap/unlock-user", "info"); // Eliminado

    const response = await unlockUser({
      sapUser: form.value.sapUser,
      email: form.value.email,
    });

    console.log("📡 Respuesta recibida:", response);
    // addLog("📡 Respuesta recibida del servicio", "info"); // Eliminado

    if (response.success && response.data) {
      console.log("✅ ===== DESBLOQUEO EXITOSO =====");
      console.log("📊 Datos de respuesta:", response.data);
      console.log("🎯 Usuario desbloqueado:", response.data.usuario);
      console.log("📝 Mensaje:", response.data.mensaje);
      console.log("👤 Nombre:", response.data.nombre);

      // Mostrar mensaje de éxito
      const successMessage =
        response.data.mensaje || "Usuario desbloqueado exitosamente";
      showStatusMessage(successMessage, "success");

      // Éxito
      emit("unlock-success", response.data);
      clearForm();
    } else if (response.error) {
      console.log("⚠️ ===== ERROR DEL SERVICIO =====");
      console.log("🚨 Código de error:", response.error.codigo);
      console.log("💬 Mensaje de error:", response.error.mensaje);

      // Determinar el tipo de mensaje basado en el código de error
      let messageType = "error";
      if (response.error.codigo === 1) {
        // Código 1: Usuario inexistente - mostrar como warning
        messageType = "warning";
        console.log(
          "🔍 Usuario inexistente detectado - mostrando como warning"
        );
        console.log("🎯 Cambiando tipo de mensaje a 'warning' para mejor UX");
      } else if (response.error.codigo === 0) {
        // Código 0: Éxito (no debería llegar aquí)
        messageType = "success";
        console.log("🔍 Código 0 detectado - mostrando como success");
      } else {
        // Otros códigos de error
        messageType = "error";
        console.log(
          `🔍 Código ${response.error.codigo} - mostrando como error`
        );
      }

      // Mostrar mensaje de error con el tipo apropiado
      const errorMessage = response.error.mensaje || "Error en el servicio SAP";
      console.log(`📤 Mostrando mensaje como ${messageType}:`, errorMessage);
      showStatusMessage(errorMessage, messageType);

      // Error del servicio
      emit("unlock-error", response.error);
    } else {
      console.error("❌ Respuesta inválida del servidor:", response);
      throw new Error("Respuesta inválida del servidor");
    }
  } catch (error) {
    console.error("💥 ===== ERROR CRÍTICO =====");
    console.error("🚨 Tipo de error:", error.constructor.name);
    console.error("💬 Mensaje:", error.message);
    console.error("📚 Stack trace:", error.stack);
    console.error("🔍 Error completo:", error);

    // Logs visuales de error crítico
    // addLog("💥 ===== ERROR CRÍTICO =====", "error"); // Eliminado
    // addLog(`🚨 Tipo: ${error.constructor.name}`, "error"); // Eliminado
    // addLog(`💬 Mensaje: ${error.message}`, "error"); // Eliminado

    let errorMessage = "Error interno del servidor";
    let codigo = -1;
    let messageType = "error";

    if (error.message) {
      if (error.message.includes("Errores de validación")) {
        errorMessage =
          "Por favor, verifica que todos los campos estén completos y sean válidos";
        codigo = 400;
        messageType = "warning";
        console.log("🔍 Error de validación detectado");
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "No se pudo conectar al servidor. Verifica tu conexión a internet e inténtalo nuevamente";
        codigo = 503;
        messageType = "error";
        console.log("🔍 Error de conectividad detectado");
      } else if (error.message.includes("Usuario inexistente")) {
        errorMessage = "El usuario SAP ingresado no existe en el sistema";
        codigo = 404;
        messageType = "warning";
        console.log("🔍 Usuario inexistente detectado");
      } else {
        errorMessage =
          "Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente";
        messageType = "error";
        console.log("🔍 Error genérico detectado");
      }
    }

    // Mostrar mensaje de error claro para el usuario
    showStatusMessage(errorMessage, messageType);

    emit("unlock-error", {
      mensaje: errorMessage,
      codigo,
    });
  } finally {
    isSubmitting.value = false;
    console.log("🏁 ===== FIN DEL PROCESO =====");
    console.log("⏰ Timestamp final:", new Date().toISOString());
    // addLog("🏁 ===== FIN DEL PROCESO =====", "info"); // Eliminado
    // addLog(`⏰ Timestamp final: ${new Date().toISOString()}`, "info"); // Eliminado
  }
};

const clearForm = () => {
  form.value = {
    sapUser: "",
    email: "",
  };
};
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

/* Estilos para los labels */
label {
  transition: color 0.2s ease-in-out;
}

label:hover {
  color: #059669; /* green-600 */
}

/* Estilos para inputs con focus */
input:focus + label,
input:focus-within + label {
  color: #059669; /* green-600 */
}

/* Responsive adjustments para labels */
@media (max-width: 640px) {
  label {
    font-size: 0.875rem; /* text-sm */
  }
}

/* Mejora de accesibilidad */
label:focus-within {
  outline: 2px solid #059669;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Estilos personalizados para botones */
button {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Efectos especiales para el botón de desbloqueo */
button[color="cyan"] {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

button[color="cyan"]:hover {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
}

button[color="cyan"]:active {
  transform: translateY(0) scale(0.98);
}

/* Efectos para el botón de limpiar */
button[variant="outline"] {
  border: 2px solid #d1d5db;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button[variant="outline"]:hover {
  border-color: #9ca3af;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

/* Cursor personalizado para botones */
button:not(:disabled) {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Animaciones de entrada para botones */
@keyframes button-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

button:focus {
  animation: button-pulse 0.3s ease-in-out;
}
</style>
