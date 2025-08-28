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

      <!-- Subordinates Display
      <SubordinatesDisplay
        :subordinates="subordinatesData"
        @employee-selected="handleEmployeeSelected"
      />
      -->

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

        <!-- History Tab -->
        <div v-if="activeTab === 'history'" class="space-y-6">
          <PasswordResetHistory />
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
  requiredRole: "ADMIN",
});

useSeoMeta({
  title: "Gestión de Contraseñas SAP - Portal Diveco",
  description:
    "Herramienta de autogestión para reinicio de contraseñas y desbloqueo de usuarios SAP",
});

// Reactive data
const activeTab = ref("reset");
const isProcessing = ref(false);

// Mock data for subordinates (Microsoft Graph API format)
const subordinatesData = ref([
  {
    "@odata.type": "#microsoft.graph.user",
    id: "328a9ead-5e24-4bab-a077-460869365232",
    businessPhones: [],
    displayName: "Ismael Pinzon Garcia",
    givenName: "Ismael",
    jobTitle: "Desarollador RPA",
    mail: "ismael.pinzon.gt@camasolympia.com",
    mobilePhone: null,
    officeLocation: "Guatemala UTS",
    preferredLanguage: null,
    surname: "Pinzon Garcia",
    userPrincipalName: "ismael.pinzon.gt@camasolympia.com",
    hasSapUser: true, // Usuario con acceso SAP
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "0b65a3c0-b48c-4762-940b-5bd62d6462fd",
    businessPhones: [],
    displayName: "Practicante",
    givenName: "Practicante",
    jobTitle: "Temporal Practicante",
    mail: "practicante@camasolympia.com",
    mobilePhone: null,
    officeLocation: "UTS",
    preferredLanguage: null,
    surname: null,
    userPrincipalName: "practicante@camasolympia.com",
    hasSapUser: false, // Usuario SIN acceso SAP
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "f190cd4a-7198-42be-9d69-7ceca0324785",
    businessPhones: [],
    displayName: "Proveedor Externo",
    givenName: "Proveedor",
    jobTitle: "Arquitectura de Aplicaciones",
    mail: "proveedor.externo.gt@camasolympia.com",
    mobilePhone: null,
    officeLocation: "Hector Merida",
    preferredLanguage: null,
    surname: "Externo",
    userPrincipalName: "proveedor.externo.gt@camasolympia.com",
    hasSapUser: false, // Usuario SIN acceso SAP
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "6aefa98e-77f1-45d6-9b2b-393f407b31ab",
    businessPhones: [],
    displayName: "Dorian Gladiador",
    givenName: "Dorian",
    jobTitle: "Gladiador IA",
    mail: "dorian@camasolympia.com",
    mobilePhone: null,
    officeLocation: "Diveco Guatemala",
    preferredLanguage: null,
    surname: "Gladiador",
    userPrincipalName: "dorian@camasolympia.com",
    hasSapUser: true, // Usuario con acceso SAP
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "d0d2b870-465b-489f-8a3e-ff84389a3ec1",
    businessPhones: [],
    displayName: "Gerson Ortiz",
    givenName: "Gerson",
    jobTitle: "Especialista en Desarrollo de Software y Business Intelligence",
    mail: "gerson.ortiz.gt@camasolympia.com",
    mobilePhone: null,
    officeLocation: "Diveco",
    preferredLanguage: null,
    surname: "Ortiz",
    userPrincipalName: "gerson.ortiz.gt@camasolympia.com",
    hasSapUser: true, // Usuario con acceso SAP
  },
  {
    "@odata.type": "#microsoft.graph.user",
    id: "07c38237-9901-448d-b297-95d6f2385b72",
    businessPhones: [],
    displayName: "Jonhathan Rolando Rodas Lopez",
    givenName: "Jonhathan Rolando",
    jobTitle: "Desarrollador de Soluciones Digitales",
    mail: "jonhathan.rodas.gt@camasolympia.com",
    mobilePhone: null,
    officeLocation: "Diveco Guatemala",
    preferredLanguage: null,
    surname: "Rodas Lopez",
    userPrincipalName: "jonhathan.rodas.gt@camasolympia.com",
    hasSapUser: false, // Usuario SIN acceso SAP
  },
]);

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

// Handler for employee selection from SubordinatesDisplay component
const handleEmployeeSelected = ({ employee, action }) => {
  const toast = useToast();

  // Check if employee has SAP access
  if (!employee.hasSapUser) {
    toast.add({
      title: "Acción no disponible",
      description: `${employee.displayName} no tiene acceso a SAP`,
      color: "red",
      timeout: 5000,
    });
    return;
  }

  // Switch to the appropriate tab
  if (action === "reset") {
    activeTab.value = "reset";
    toast.add({
      title: "Empleado seleccionado para reinicio",
      description: `${employee.displayName} - ${employee.mail}`,
      color: "blue",
      timeout: 5000,
    });
  } else if (action === "unlock") {
    activeTab.value = "unlock";
    toast.add({
      title: "Empleado seleccionado para desbloqueo",
      description: `${employee.displayName} - ${employee.mail}`,
      color: "orange",
      timeout: 5000,
    });
  }

  // TODO: Pre-fill the form with employee data
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
