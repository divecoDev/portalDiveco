<template>
  <UCard
    class="animate-fade-in-up border border-cyan-200 dark:border-cyan-700 shadow-lg"
    :style="'box-shadow: var(--diveco-shadow);'"
  >
    <template #header>
      <div
        class="flex items-center bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 -m-6 mb-6 p-6 rounded-t-lg"
      >
        <div class="flex-shrink-0 p-2 bg-cyan-600 dark:bg-cyan-500 rounded-lg">
          <UIcon name="i-heroicons-key" class="w-6 h-6 text-white" />
        </div>
        <div class="ml-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            Reinicio de Contraseña SAP
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Solicita el reinicio de tu contraseña SAP
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

    <!-- Indicador de Reintentos -->
    <div
      v-if="retryState.isRetrying"
      class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg"
    >
      <div class="flex items-center space-x-3">
        <div class="flex">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-6 h-6 text-amber-600 dark:text-amber-400 animate-spin"
          />
        </div>
        <div class="">
          <h4 class="text-sm font-medium text-amber-800 dark:text-amber-200">
            Reintentando conexión con SAP...
          </h4>
          <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Intento {{ retryState.currentAttempt }} de
            {{ retryState.maxAttempts }}
          </p>
          <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">
            {{ retryState.message }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex space-x-4 gap-6">
      <div class="w-1/3 space-y-2">
        <label
          for="sapUser"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Usuario SAP
        </label>

        <USelectMenu
          v-model="form.sapUser"
          :items="sapUsers"
          placeholder="Selecciona un usuario"
          icon="i-heroicons-user"
          size="xl"
          color="cyan"
          :disabled="isProcessing"
          @change="changeSapUserSelected"
          class="w-full"
        />
      </div>

      <div class="flex-1 space-y-2">
        <label
          for="email"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Codigo Empleado
        </label>
        <UInput
          id="cod_personal"
          v-model="sapUserSelected.cod_personal"
          placeholder="0000000000"
          icon="i-heroicons-identification"
          size="xl"
          color="cyan"
          variant="outline"
          disabled
          class="focus:ring-cyan-500 focus:border-cyan-500 w-full"
        />
      </div>

      <div class="flex-1 space-y-2">
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
          type="email"
          icon="i-heroicons-envelope"
          size="xl"
          color="cyan"
          variant="outline"
          disabled
          class="focus:ring-cyan-500 focus:border-cyan-500 w-full"
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
          La nueva contraseña se enviará a tu email corporativo
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
            @click="submitPasswordReset"
            :loading="isSubmitting"
            :disabled="!isFormValid || isSubmitting"
            size="lg"
            class="shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon
              v-if="!isSubmitting"
              name="i-heroicons-paper-airplane"
              class="w-5 h-5 mr-2"
            />
            <UIcon
              v-else
              name="i-heroicons-arrow-path"
              class="w-5 h-5 mr-2 animate-spin"
            />
            {{ isSubmitting ? "Procesando..." : "Solicitar Reinicio" }}
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { generateClient } from "aws-amplify/api";
import { useToast } from "#imports";

// Importar el componente StatusMessage
import StatusMessage from "./StatusMessage.vue";

// Generar cliente de Amplify
const client = generateClient();

// Props
const props = defineProps({
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const users = ref([]);
const sapUsers = ref([]);
const sapUserSelected = ref([]);

// Estado interno de carga
const isSubmitting = ref(false);

// Emits
const emit = defineEmits(["reset-success", "reset-error"]);

// Reactive data
const form = ref({
  sapUser: "",
  email: "",
});

const getUsers = async () => {
  const response = await $fetch("/api/sap/users");
  users.value = response.data;
  sapUsers.value = users.value.map((user) => user.usuario);
};

onMounted(() => {
  getUsers();
});

const changeSapUserSelected = () => {
  const searchUser = users.value.find(
    (user) => user.usuario === form.value.sapUser
  );
  sapUserSelected.value = searchUser;
  form.value.email = searchUser.correo;
};

// Computed properties
const isFormValid = computed(() => {
  return form.value.sapUser && form.value.email;
});

// Estado del mensaje de status
const statusMessage = ref({
  show: false,
  message: "",
  type: "info",
});

// Estado para reintentos
const retryState = ref({
  isRetrying: false,
  currentAttempt: 0,
  maxAttempts: 5,
  message: "",
});

// Methods
const showStatusMessage = (message, type = "info") => {
  console.log("🔔 ===== SHOW STATUS MESSAGE =====");
  console.log("📝 Mensaje:", message);
  console.log("🎨 Tipo:", type);
  console.log("📊 Estado anterior:", JSON.stringify(statusMessage.value));

  // Cerrar notificación anterior si existe
  statusMessage.value.show = false;

  // Pequeño delay para asegurar que se cierre antes de mostrar la nueva
  setTimeout(() => {
    statusMessage.value = {
      show: true,
      message,
      type,
    };

    console.log("✅ Estado actualizado:", JSON.stringify(statusMessage.value));

    // Forzar re-render del componente
    nextTick(() => {
      console.log("🔄 Componente re-renderizado");
    });
  }, 100);
};

const closeStatusMessage = () => {
  statusMessage.value.show = false;
};

const submitPasswordReset = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  retryState.value.isRetrying = false;
  retryState.value.currentAttempt = 0;

  // Logs más visibles y detallados
  console.log("🚀 ===== INICIO DEL PROCESO DE REINICIO =====");
  console.log("👤 Usuario SAP:", form.value.sapUser);
  console.log("📧 Email:", form.value.email);
  console.log("⏰ Timestamp:", new Date().toISOString());

  // Mostrar mensaje de inicio
  showStatusMessage(
    `Iniciando proceso de reinicio para usuario ${form.value.sapUser}`,
    "info"
  );

  try {
    console.log("📤 Enviando petición a través de Amplify...");
    console.log("📍 Usando cliente de Amplify para ResetPassword");

    const response = await client.queries.ResetPassword({
      sapUser: form.value.sapUser,
      email: form.value.email,
      accion: "R",
    });

    console.log("📡 Respuesta recibida:", response);

    // Parsear la respuesta JSON que viene como string en response.data
    let parsedData = null;
    try {
      if (response.data && typeof response.data === "string") {
        parsedData = JSON.parse(response.data);
        console.log("🔍 Datos parseados:", parsedData);
      }
    } catch (parseError) {
      console.error("❌ Error al parsear JSON:", parseError);
      throw new Error("Respuesta inválida del servicio - JSON malformado");
    }

    if (parsedData && parsedData.success && parsedData.data) {
      const resetData = parsedData.data;
      console.log("✅ ===== REINICIO EXITOSO =====");
      console.log("📊 Datos de respuesta:", resetData);

      // Mostrar mensaje de éxito
      const successMessage =
        resetData.mensaje || "Contraseña reiniciada exitosamente";

      console.log("🔔 ===== MOSTRANDO NOTIFICACIÓN =====");
      console.log("📝 Mensaje a mostrar:", successMessage);
      console.log("🎨 Tipo de notificación: success");

      showStatusMessage(successMessage, "success");

      console.log(
        "✅ Notificación mostrada, verificando estado:",
        statusMessage.value
      );

      // Fallback con useToast para verificar que funciona
      const toast = useToast();
      toast.add({
        title: "✅ Contraseña Reiniciada",
        description: successMessage,
        color: "green",
        timeout: 8000,
      });

      // Éxito - emitir los datos correctos
      emit("reset-success", {
        codigo: 0,
        mensaje: resetData.mensaje,
        usuario: resetData.usuario,
        nombre: resetData.nombre,
        emailEnviado: resetData.emailEnviado,
      });
      clearForm();
    } else if (parsedData && !parsedData.success) {
      // Manejar errores del servicio SAP
      console.log("⚠️ ===== ERROR DEL SERVICIO SAP =====");
      console.log("🚨 Respuesta de error:", parsedData);

      const errorMessage =
        parsedData.mensaje || "Error en el servicio de reinicio de contraseña";

      showStatusMessage(errorMessage, "error");

      // Fallback con useToast
      const toast = useToast();
      toast.add({
        title: "❌ Error en el Servicio SAP",
        description: errorMessage,
        color: "red",
        timeout: 8000,
      });

      // Error del servicio
      emit("reset-error", {
        codigo: parsedData.codigo || -1,
        mensaje: errorMessage,
      });
    } else if (response.errors && response.errors.length > 0) {
      console.log("⚠️ ===== ERROR DE AMPLIFY =====");
      console.log("🚨 Errores:", response.errors);

      const error = response.errors[0];
      const errorMessage =
        error.message || "Error en el servicio de reinicio de contraseña";

      showStatusMessage(errorMessage, "error");

      // Fallback con useToast para verificar que funciona
      const toast = useToast();
      toast.add({
        title: "❌ Error en el Servicio",
        description: errorMessage,
        color: "red",
        timeout: 8000,
      });

      // Error del servicio
      emit("reset-error", {
        codigo: -1,
        mensaje: errorMessage,
      });
    } else {
      console.error("❌ Respuesta inválida de Amplify:", response);
      throw new Error("Respuesta inválida del servicio");
    }
  } catch (error) {
    console.error("💥 ===== ERROR CRÍTICO =====");
    console.error("🚨 Tipo de error:", error.constructor.name);
    console.error("💬 Mensaje:", error.message);
    console.error("📚 Stack trace:", error.stack);
    console.error("🔍 Error completo:", error);

    let errorMessage = "Error interno del servidor";
    let codigo = -1;

    if (error.message) {
      if (error.message.includes("Respuesta inválida")) {
        errorMessage = "Error en la comunicación con el servicio";
        codigo = 500;
      } else {
        errorMessage = error.message;
        codigo = -1;
      }
    }

    console.log("🎯 ===== RESUMEN DEL ERROR =====");
    console.log("💬 Mensaje final:", errorMessage);
    console.log("🚨 Código final:", codigo);

    // Mostrar mensaje de error
    showStatusMessage(errorMessage, "error");

    // Emitir error
    emit("reset-error", {
      codigo,
      mensaje: errorMessage,
    });
  } finally {
    isSubmitting.value = false;
    retryState.value.isRetrying = false;
    retryState.value.currentAttempt = 0;
  }
};

const clearForm = () => {
  form.value = {
    sapUser: "",
    email: "",
    cod_personal: "",
  };
  sapUserSelected.value = [];

  closeStatusMessage();
};
</script>

<style scoped>
/* Estilos para los labels */
label {
  transition: color 0.2s ease-in-out;
}

label:hover {
  color: #0891b2; /* cyan-600 */
}

/* Estilos para inputs con focus */
input:focus + label,
input:focus-within + label {
  color: #0891b2; /* cyan-600 */
}

/* Responsive adjustments para labels */
@media (max-width: 640px) {
  label {
    font-size: 0.875rem; /* text-sm */
  }
}

/* Mejora de accesibilidad */
label:focus-within {
  outline: 2px solid #0891b2;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Estilos personalizados para botones */
button {
  cursor: pointer;
  user-select: none;
}

button[color="cyan"] {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

button[color="cyan"]:hover {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
}

button[variant="outline"] {
  border: 2px solid #d1d5db;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button[variant="outline"]:hover {
  border-color: #9ca3af;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

button:not(:disabled) {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@keyframes button-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(6, 182, 212, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
  }
}

button:focus {
  animation: button-pulse 0.3s ease-in-out;
}
</style>
