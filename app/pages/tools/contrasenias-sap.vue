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
              <span v-if="hasGroup('ADMIN')">
                Reinicia contraseñas y desbloquea usuario SAP de forma
                autogestionada
              </span>
              <span v-else>
                Gestiona las contraseñas de tus subordinados SAP
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Subordinates Display -->
      <SubordinatesDisplay @citizen-selected="handleCitizenSelected" />

      <!-- Gestión Global - Solo para ADMIN -->
      <div v-if="hasGroup('ADMIN')" class="mb-6">
        <h2
          class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3"
        >
          <span>Gestion Global</span>
          <span
            class="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 ml-3"
          >
            Solo Administradores
          </span>
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Gestiona las contraseñas y desbloquea usuarios SAP de forma global
        </p>
      </div>

      <div
        v-if="hasGroup('ADMIN')"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 px-6 py-4"
      >
        <!-- Tabs Navigation -->
        <div class="mb-6">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav
              class="-mb-px flex space-x-8 overflow-x-auto"
              aria-label="Tabs"
            >
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

          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="space-y-6">
            <PasswordResetHistory />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta
definePageMeta({
  layout: "default",
  middleware: ["require-role"],
  requiredRole: ["ADMIN", "SAP-USER-ADMIN"],
});

useSeoMeta({
  title: "Gestión de Contraseñas SAP - Portal Diveco",
  description:
    "Herramienta de autogestión para reinicio de contraseñas y desbloqueo de usuarios SAP",
});

// Composables
const { hasGroup } = useUserGroups();

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
  {
    id: "history",
    name: "Historial",
    icon: "i-heroicons-clock",
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

// Handler for citizen selection from SubordinatesDisplay component
const handleCitizenSelected = ({ citizen, action }) => {
  const toast = useToast();

  // Check if citizen has SAP access
  if (!citizen.hasSapUser) {
    toast.add({
      title: "Acción no disponible",
      description: `${citizen.displayName} no tiene acceso a SAP`,
      color: "red",
      timeout: 5000,
    });
    return;
  }

  // Switch to the appropriate tab
  if (action === "reset") {
    activeTab.value = "reset";
    toast.add({
      title: "Ciudadano seleccionado para reinicio",
      description: `${citizen.displayName} - ${citizen.mail}`,
      color: "blue",
      timeout: 5000,
    });
  } else if (action === "unlock") {
    activeTab.value = "unlock";
    toast.add({
      title: "Ciudadano seleccionado para desbloqueo",
      description: `${citizen.displayName} - ${citizen.mail}`,
      color: "orange",
      timeout: 5000,
    });
  }

  // TODO: Pre-fill the form with citizen data
  // This could be implemented by emitting events to the form components
  // or by using a shared state/store
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
