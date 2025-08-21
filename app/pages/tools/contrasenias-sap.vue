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
          <PasswordResetForm
            :is-processing="isProcessing"
            @reset-success="handleResetSuccess"
            @reset-error="handleResetError"
          />
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

// Event handlers for PasswordResetForm component
const handleResetSuccess = (data) => {
  const toast = useToast();
  toast.add({
    title: "Contraseña reiniciada exitosamente",
    description: `${data.mensaje} - ${data.nombre} (${data.usuario})`,
    color: "green",
    timeout: 8000,
  });
};

const handleResetError = (data) => {
  const toast = useToast();
  toast.add({
    title: "Error en el reinicio de contraseña",
    description: data.mensaje,
    color: "red",
    timeout: 8000,
  });
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
