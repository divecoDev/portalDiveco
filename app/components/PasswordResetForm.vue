<template>
  <UCard
    class="animate-fade-in-up border border-cyan-200 dark:border-cyan-700 shadow-lg"
    :style="'box-shadow: var(--diveco-shadow);'"
  >
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
      <div class="flex justify-center items-center space-x-3">
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

    <div
      class="flex justify-center items-center flex-col sm:flex-row space-x-4 space-y-4 gap-6"
    >
      <div class="w-full sm:w-1/3 space-y-2">
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

      <div class="w-full sm:w-1/3 space-y-2">
        <label
          for="email"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Codigo Ciudadano
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

      <div class="w-full sm:w-1/3 space-y-2">
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
        class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-gray-50 dark:bg-gray-800/50 -m-6 p-6 rounded-b-lg"
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
            color="cyan"
            @click="submitPasswordReset"
            :loading="isSubmitting"
            :disabled="!isFormValid || isSubmitting"
            size="lg"
            class="shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
          >
            <UIcon
              v-if="!isSubmitting"
              name="i-heroicons-key"
              class="w-5 h-5 mr-2"
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
import { getCurrentUser } from "aws-amplify/auth";
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
  maxAttempts: 15,
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

// Función para guardar el historial de reinicio (éxito o error)
const saveResetPasswordHistory = async (
  sapUser,
  response,
  isSuccess = true
) => {
  try {
    console.log("📝 ===== GUARDANDO HISTORIAL DE REINICIO =====");

    // Obtener el usuario logueado
    const currentUser = await getCurrentUser();
    const loggedUserEmail =
      currentUser?.signInDetails?.loginId ||
      currentUser?.username ||
      "usuario-desconocido";

    console.log("👤 Usuario logueado:", loggedUserEmail);
    console.log("🎯 Usuario SAP:", sapUser);
    console.log("📊 Respuesta a guardar:", response);
    console.log("✅ Es éxito:", isSuccess);

    // Preparar los datos del historial
    const historyData = {
      sapUser: sapUser,
      emailOwner: loggedUserEmail,
      accion: "RESET_PASSWORD",
      status: isSuccess ? "Completado" : "Error",
      logs: JSON.stringify(response),
      date: new Date().toISOString(),
    };

    console.log("💾 Datos del historial:", historyData);

    // Guardar en la base de datos usando Amplify
    const { errors, data: historyResponse } =
      await client.models.SapUserActionHistory.create(historyData);

    if (errors) {
      console.error("❌ Errores al guardar historial:", errors);
      return null;
    }

    console.log("✅ Historial guardado exitosamente:", historyResponse);

    return historyResponse;
  } catch (error) {
    console.error("❌ Error al guardar historial:", error);
    // No lanzamos el error para que no afecte el flujo principal
    return null;
  }
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
        timeout: 20000,
      });

      // Guardar historial de reinicio exitoso
      console.log("💾 Guardando historial de reinicio...");
      await saveResetPasswordHistory(form.value.sapUser, resetData, true);

      // Éxito - emitir los datos correctos
      emit("reset-success", {
        codigo: 0,
        mensaje: resetData.mensaje,
        usuario: resetData.usuario,
        nombre: resetData.nombre,
        emailEnviado: resetData.emailEnviado,
      });

      // Limpiar formulario después de un delay para que se vea el mensaje
      setTimeout(() => {
        clearForm(true); // Mantener mensaje de éxito visible
      }, 5000); // 5 segundos para ver el mensaje de éxito
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

      // Guardar historial de error del servicio SAP
      console.log("💾 Guardando historial de error del servicio SAP...");
      await saveResetPasswordHistory(form.value.sapUser, parsedData, false);

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

      // Guardar historial de error de Amplify
      console.log("💾 Guardando historial de error de Amplify...");
      await saveResetPasswordHistory(
        form.value.sapUser,
        response.errors,
        false
      );

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

    // Guardar historial de error crítico
    console.log("💾 Guardando historial de error crítico...");
    await saveResetPasswordHistory(
      form.value.sapUser,
      {
        error: error.message,
        stack: error.stack,
        codigo: codigo,
        mensaje: errorMessage,
      },
      false
    );

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

const clearForm = (keepSuccessMessage = false) => {
  form.value = {
    sapUser: "",
    email: "",
    cod_personal: "",
  };
  sapUserSelected.value = [];

  // Solo cerrar mensaje si no es de éxito o si explícitamente se pide cerrar
  if (!keepSuccessMessage || statusMessage.value.type !== "success") {
    closeStatusMessage();
  }
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
