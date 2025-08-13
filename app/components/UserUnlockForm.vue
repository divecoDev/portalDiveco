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

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UFormGroup label="Usuario SAP" name="unlockUser" required>
        <UInput
          v-model="form.sapUser"
          placeholder="Ej: JRODAS"
          icon="i-heroicons-user"
          size="xl"
          color="green"
          variant="outline"
          :disabled="isProcessing"
          class="focus:ring-green-500 focus:border-green-500"
        />
      </UFormGroup>

      <UFormGroup label="Email Corporativo" name="email" required>
        <UInput
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
      </UFormGroup>
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
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
            Limpiar
          </UButton>
          <UButton
            color="green"
            @click="submitUserUnlock"
            :loading="isSubmitting"
            :disabled="!isFormValid || isSubmitting"
            size="lg"
            class="shadow-lg"
          >
            <UIcon name="i-heroicons-lock-open" class="w-4 h-4 mr-2" />
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

// Methods
const submitUserUnlock = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  console.log("🚀 Iniciando proceso de desbloqueo...");
  console.log("👤 Usuario:", form.value.sapUser);
  console.log("📧 Email:", form.value.email);

  try {
    // Validar campos antes de enviar
    const validation = validateUnlockUserRequest(form.value);
    if (!validation.isValid) {
      throw new Error(`Errores de validación: ${validation.errors.join(", ")}`);
    }

    console.log("📤 Enviando petición al endpoint de Nuxt...");
    const response = await unlockUser({
      sapUser: form.value.sapUser,
      email: form.value.email,
    });

    if (response.success && response.data) {
      console.log("✅ Desbloqueo exitoso:", response.data);
      // Éxito
      emit("unlock-success", response.data);
      clearForm();
    } else if (response.error) {
      console.log("⚠️ Error del servicio:", response.error);
      // Error del servicio
      emit("unlock-error", response.error);
    } else {
      throw new Error("Respuesta inválida del servidor");
    }
  } catch (error) {
    console.error("💥 Error en el proceso de desbloqueo:", error);

    let errorMessage = "Error interno del servidor";
    let codigo = -1;

    if (error.message) {
      if (error.message.includes("Errores de validación")) {
        errorMessage = error.message;
        codigo = 400;
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "No se pudo conectar al servidor";
        codigo = 503;
      } else {
        errorMessage = error.message;
      }
    }

    emit("unlock-error", {
      mensaje: errorMessage,
      codigo,
    });
  } finally {
    isSubmitting.value = false;
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
</style>
