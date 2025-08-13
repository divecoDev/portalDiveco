<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Contraseñas SAP
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
              Reinicia contraseñas y desbloquea usuario SAP de forma
              autogestionada
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="mb-8">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              ]"
            >
              <UIcon :name="tab.icon" class="w-5 h-5 mr-2" />
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-6xl mx-auto">
        <!-- Main Content -->
        <!-- Password Reset Tab -->
        <div v-if="activeTab === 'reset'" class="space-y-6">
          <UCard
            class="animate-fade-in-up border border-cyan-200 dark:border-cyan-700 shadow-lg"
            :style="'box-shadow: var(--diveco-shadow);'"
          >
            <template #header>
              <div
                class="flex items-center bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 -m-6 mb-6 p-6 rounded-t-lg"
              >
                <div
                  class="flex-shrink-0 p-2 bg-cyan-600 dark:bg-cyan-500 rounded-lg"
                >
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormGroup label="Usuario SAP" name="sapUser" required>
                <UInput
                  v-model="resetForm.sapUser"
                  placeholder="Ej: JRODAS"
                  icon="i-heroicons-user"
                  size="xl"
                  color="cyan"
                  variant="outline"
                  :disabled="isProcessing"
                  class="focus:ring-cyan-500 focus:border-cyan-500"
                />
              </UFormGroup>

              <UFormGroup label="Email Corporativo" name="email" required>
                <UInput
                  v-model="resetForm.email"
                  placeholder="usuario@diveco.com"
                  icon="i-heroicons-envelope"
                  type="email"
                  size="xl"
                  color="cyan"
                  variant="outline"
                  :disabled="isProcessing"
                  class="focus:ring-cyan-500 focus:border-cyan-500"
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
                  La nueva contraseña se enviará a tu email corporativo
                </div>
                <div class="flex space-x-3">
                  <UButton
                    variant="outline"
                    color="gray"
                    @click="clearResetForm"
                    :disabled="isProcessing"
                    size="lg"
                  >
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
                    Limpiar
                  </UButton>
                  <UButton
                    color="cyan"
                    @click="submitPasswordReset"
                    :loading="isProcessing"
                    :disabled="!isResetFormValid"
                    size="lg"
                    class="shadow-lg"
                  >
                    <UIcon
                      name="i-heroicons-paper-airplane"
                      class="w-4 h-4 mr-2"
                    />
                    Solicitar Reinicio
                  </UButton>
                </div>
              </div>
            </template>
          </UCard>
        </div>

        <!-- User Unlock Tab -->
        <div v-if="activeTab === 'unlock'" class="space-y-6">
          <UserUnlockForm
            :is-processing="isProcessing"
            @unlock-success="handleUnlockSuccess"
            @unlock-error="handleUnlockError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Meta
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Gestión de Contraseñas SAP - Portal Diveco",
  description:
    "Herramienta de autogestión para reinicio de contraseñas y desbloqueo de usuarios SAP",
});

// Reactive data
const activeTab = ref("reset");
const isProcessing = ref(false);

// Tabs configuration
const tabs = ref([
  { id: "reset", name: "Reinicio de Contraseña", icon: "i-heroicons-key" },
  {
    id: "unlock",
    name: "Desbloqueo de Usuario",
    icon: "i-heroicons-lock-open",
  },
]);

// Forms
const resetForm = ref({
  sapUser: "",
  email: "",
});

// Computed properties
const isResetFormValid = computed(() => {
  return resetForm.value.sapUser && resetForm.value.email;
});

// Methods
const submitPasswordReset = async () => {
  if (!isResetFormValid.value) return;

  isProcessing.value = true;

  try {
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mostrar notificación de éxito
    const toast = useToast();
    toast.add({
      title: "Solicitud enviada",
      description:
        "Tu solicitud de reinicio de contraseña ha sido procesada exitosamente.",
      color: "green",
      timeout: 5000,
    });

    // Limpiar formulario
    clearResetForm();
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: "Error",
      description:
        "Hubo un problema al procesar tu solicitud. Inténtalo nuevamente.",
      color: "red",
      timeout: 5000,
    });
  } finally {
    isProcessing.value = false;
  }
};

// Event handlers for UserUnlockForm component
const handleUnlockSuccess = (data) => {
  const toast = useToast();
  toast.add({
    title: "Usuario desbloqueado exitosamente",
    description: `${data.mensaje} - ${data.nombre} (${data.usuario})`,
    color: "green",
    timeout: 8000,
  });
};

const handleUnlockError = (data) => {
  const toast = useToast();
  toast.add({
    title: "Error en el desbloqueo",
    description: data.mensaje,
    color: "red",
    timeout: 8000,
  });
};

const clearResetForm = () => {
  resetForm.value = {
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

/* Transiciones suaves para tabs */
.tab-content {
  transition: all 0.3s ease-in-out;
}
</style>
