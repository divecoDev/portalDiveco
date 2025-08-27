<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🧪 Página de Pruebas - Reinicio de Contraseñas
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Prueba y debuggea ambas implementaciones del reinicio de contraseñas
          SAP
        </p>
        <div class="mt-4 flex justify-center space-x-4">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            <UIcon name="i-heroicons-server" class="w-4 h-4 mr-2" />
            Nuxt API
          </span>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            <UIcon name="i-heroicons-cloud" class="w-4 h-4 mr-2" />
            Amplify Lambda
          </span>
        </div>
      </div>

      <!-- Componente de Comparación -->
      <PasswordResetComparison
        :is-processing="false"
        @reset-success="handleResetSuccess"
        @reset-error="handleResetError"
      />

      <!-- Panel de Debugging -->
      <div class="mt-8">
        <UCard class="border border-orange-200 dark:border-orange-700">
          <template #header>
            <div
              class="flex items-center bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 -m-6 mb-6 p-6 rounded-t-lg"
            >
              <div
                class="flex-shrink-0 p-2 bg-orange-600 dark:bg-orange-500 rounded-lg"
              >
                <UIcon name="i-heroicons-bug-ant" class="w-6 h-6 text-white" />
              </div>
              <div class="ml-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  Panel de Debugging
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Logs en tiempo real y herramientas de debugging
                </p>
              </div>
            </div>
          </template>

          <!-- Controles de Debugging -->
          <div class="flex flex-wrap gap-4 mb-6">
            <UButton
              @click="clearAllLogs"
              variant="outline"
              color="gray"
              size="sm"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4 mr-2" />
              Limpiar Logs
            </UButton>

            <UButton
              @click="exportLogs"
              variant="outline"
              color="green"
              size="sm"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-2" />
              Exportar Logs
            </UButton>

            <UButton
              @click="testConnection"
              variant="outline"
              color="blue"
              size="sm"
            >
              <UIcon name="i-heroicons-signal" class="w-4 h-4 mr-2" />
              Probar Conexión
            </UButton>

            <UButton
              @click="showSystemInfo"
              variant="outline"
              color="purple"
              size="sm"
            >
              <UIcon
                name="i-heroicons-information-circle"
                class="w-4 h-4 mr-2"
              />
              Info del Sistema
            </UButton>
          </div>

          <!-- Logs en Tiempo Real -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                📊 Logs en Tiempo Real
              </h4>
              <div class="flex items-center space-x-2">
                <label
                  class="flex items-center text-sm text-gray-600 dark:text-gray-400"
                >
                  <input
                    v-model="autoScroll"
                    type="checkbox"
                    class="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  Auto-scroll
                </label>
                <UButton
                  @click="scrollToBottom"
                  variant="outline"
                  color="orange"
                  size="xs"
                >
                  <UIcon name="i-heroicons-arrow-down" class="w-4 h-4" />
                </UButton>
              </div>
            </div>

            <!-- Filtros de Log -->
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="level in logLevels"
                :key="level.value"
                @click="toggleLogLevel(level.value)"
                :variant="
                  activeLogLevels.includes(level.value) ? 'solid' : 'outline'
                "
                :color="level.color"
                size="xs"
              >
                {{ level.label }}
                <span class="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {{ getLogCountByLevel(level.value) }}
                </span>
              </UButton>
            </div>

            <!-- Área de Logs -->
            <div
              ref="logsContainer"
              class="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto border border-gray-700"
            >
              <div
                v-if="filteredLogs.length === 0"
                class="text-gray-500 text-center py-8"
              >
                No hay logs para mostrar. Ejecuta una prueba para ver los logs
                en tiempo real.
              </div>

              <div
                v-for="(log, index) in filteredLogs"
                :key="index"
                class="log-entry mb-1"
                :class="getLogLevelClass(log.level)"
              >
                <span class="text-gray-400"
                  >[{{ formatTimestamp(log.timestamp) }}]</span
                >
                <span
                  :class="getLogLevelBadgeClass(log.level)"
                  class="ml-2 px-2 py-0.5 rounded text-xs font-bold"
                >
                  {{ log.level.toUpperCase() }}
                </span>
                <span class="ml-2">{{ log.message }}</span>
                <span v-if="log.source" class="ml-2 text-blue-400"
                  >({{ log.source }})</span
                >
              </div>
            </div>
          </div>

          <!-- Métricas de Rendimiento -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                📈 Total de Pruebas
              </h5>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ metrics.totalTests }}
              </div>
              <div class="text-sm text-gray-500">
                Nuxt: {{ metrics.nuxtTests }} | Amplify:
                {{ metrics.amplifyTests }}
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                ⚡ Tiempo Promedio
              </h5>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ metrics.averageTime }}ms
              </div>
              <div class="text-sm text-gray-500">
                Nuxt: {{ metrics.nuxtAvgTime }}ms | Amplify:
                {{ metrics.amplifyAvgTime }}ms
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                🎯 Tasa de Éxito
              </h5>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ metrics.successRate }}%
              </div>
              <div class="text-sm text-gray-500">
                Éxitos: {{ metrics.successCount }} | Errores:
                {{ metrics.errorCount }}
              </div>
            </div>
          </div>

          <!-- Estado del Sistema -->
          <div class="mt-6">
            <h5
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              🔧 Estado del Sistema
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span>Servidor Nuxt:</span>
                  <span
                    :class="
                      systemStatus.nuxt ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ systemStatus.nuxt ? "🟢 Activo" : "🔴 Inactivo" }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>Amplify Backend:</span>
                  <span
                    :class="
                      systemStatus.amplify ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ systemStatus.amplify ? "🟢 Activo" : "🔴 Inactivo" }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>SAP Web Service:</span>
                  <span
                    :class="
                      systemStatus.sap ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ systemStatus.sap ? "🟢 Conectado" : "🔴 Desconectado" }}
                  </span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span>Última Prueba:</span>
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ systemStatus.lastTest || "Nunca" }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>Logs en Memoria:</span>
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ allLogs.length }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>Memoria Usada:</span>
                  <span class="text-gray-600 dark:text-gray-400">
                    {{ systemStatus.memoryUsage || "N/A" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Información del Sistema Modal -->
      <UModal v-model="showSystemInfoModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Información del Sistema</h3>
          </template>

          <div class="space-y-4">
            <div>
              <h4 class="font-medium mb-2">Configuración SAP</h4>
              <div
                class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono"
              >
                <div>URL: {{ sapConfig.url }}</div>
                <div>Username: {{ sapConfig.username }}</div>
                <div>
                  Password: {{ sapConfig.password ? "***" : "No configurado" }}
                </div>
                <div>Actions: {{ JSON.stringify(sapConfig.actions) }}</div>
              </div>
            </div>

            <div>
              <h4 class="font-medium mb-2">Variables de Entorno</h4>
              <div
                class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono"
              >
                <div>NODE_ENV: {{ envInfo.NODE_ENV }}</div>
                <div>NUXT_APP_ENV: {{ envInfo.NUXT_APP_ENV }}</div>
                <div>AMPLIFY_ENV: {{ envInfo.AMPLIFY_ENV }}</div>
              </div>
            </div>

            <div>
              <h4 class="font-medium mb-2">Información del Navegador</h4>
              <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
                <div>User Agent: {{ browserInfo.userAgent }}</div>
                <div>Platform: {{ browserInfo.platform }}</div>
                <div>
                  Cookies:
                  {{
                    browserInfo.cookiesEnabled
                      ? "Habilitados"
                      : "Deshabilitados"
                  }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import PasswordResetComparison from "~/components/PasswordResetComparison.vue";

// Estado de la página
const logsContainer = ref(null);
const autoScroll = ref(true);
const showSystemInfoModal = ref(false);

// Logs y métricas
const allLogs = ref([]);
const activeLogLevels = ref(["info", "warn", "error", "debug"]);

// Métricas de rendimiento
const metrics = ref({
  totalTests: 0,
  nuxtTests: 0,
  amplifyTests: 0,
  successCount: 0,
  errorCount: 0,
  averageTime: 0,
  nuxtAvgTime: 0,
  amplifyAvgTime: 0,
  successRate: 0,
});

// Estado del sistema
const systemStatus = ref({
  nuxt: false,
  amplify: false,
  sap: false,
  lastTest: null,
  memoryUsage: null,
});

// Configuración SAP
const sapConfig = ref({
  url: "No disponible",
  username: "No disponible",
  password: "No disponible",
  actions: {},
});

// Información del entorno
const envInfo = ref({
  NODE_ENV: "No disponible",
  NUXT_APP_ENV: "No disponible",
  AMPLIFY_ENV: "No disponible",
});

// Información del navegador
const browserInfo = ref({
  userAgent: "No disponible",
  platform: "No disponible",
  cookiesEnabled: false,
});

// Niveles de log disponibles
const logLevels = [
  { value: "info", label: "Info", color: "blue" },
  { value: "warn", label: "Warn", color: "yellow" },
  { value: "error", label: "Error", color: "red" },
  { value: "debug", label: "Debug", color: "gray" },
];

// Logs filtrados
const filteredLogs = computed(() => {
  return allLogs.value.filter((log) =>
    activeLogLevels.value.includes(log.level)
  );
});

// Métodos
const addLog = (level, message, source = "System") => {
  const log = {
    timestamp: new Date(),
    level,
    message,
    source,
  };

  allLogs.value.push(log);

  // Auto-scroll si está habilitado
  if (autoScroll.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }

  // Limitar logs a 1000 para evitar problemas de memoria
  if (allLogs.value.length > 1000) {
    allLogs.value = allLogs.value.slice(-500);
  }
};

const clearAllLogs = () => {
  allLogs.value = [];
  addLog("info", "Logs limpiados manualmente");
};

const exportLogs = () => {
  const logText = allLogs.value
    .map(
      (log) =>
        `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message} (${log.source})`
    )
    .join("\n");

  const blob = new Blob([logText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reset-password-logs-${new Date().toISOString().split("T")[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  addLog("info", "Logs exportados a archivo");
};

const scrollToBottom = () => {
  if (logsContainer.value) {
    logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
  }
};

const toggleLogLevel = (level) => {
  const index = activeLogLevels.value.indexOf(level);
  if (index > -1) {
    activeLogLevels.value.splice(index, 1);
  } else {
    activeLogLevels.value.push(level);
  }
};

const getLogCountByLevel = (level) => {
  return allLogs.value.filter((log) => log.level === level).length;
};

const getLogLevelClass = (level) => {
  switch (level) {
    case "info":
      return "text-blue-400";
    case "warn":
      return "text-yellow-400";
    case "error":
      return "text-red-400";
    case "debug":
      return "text-gray-400";
    default:
      return "text-green-400";
  }
};

const getLogLevelBadgeClass = (level) => {
  switch (level) {
    case "info":
      return "bg-blue-600 text-white";
    case "warn":
      return "bg-yellow-600 text-white";
    case "error":
      return "bg-red-600 text-white";
    case "debug":
      return "bg-gray-600 text-white";
    default:
      return "bg-green-600 text-white";
  }
};

const formatTimestamp = (timestamp) => {
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString("es-ES", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  }
  return timestamp;
};

const testConnection = async () => {
  addLog("info", "Iniciando prueba de conexión...", "System");

  try {
    // Probar conexión Nuxt
    const nuxtResponse = await $fetch("/api/sap/users");
    systemStatus.value.nuxt = true;
    addLog("info", "✅ Servidor Nuxt: Conectado", "System");
  } catch (error) {
    systemStatus.value.nuxt = false;
    addLog("error", `❌ Servidor Nuxt: ${error.message}`, "System");
  }

  try {
    // Probar conexión SAP (simulada)
    systemStatus.value.sap = true;
    addLog("info", "✅ SAP Web Service: Conectado (simulado)", "System");
  } catch (error) {
    systemStatus.value.sap = false;
    addLog("error", `❌ SAP Web Service: ${error.message}`, "System");
  }

  // Simular estado de Amplify
  systemStatus.value.amplify = true;
  addLog("info", "✅ Amplify Backend: Activo (simulado)", "System");

  addLog("info", "Prueba de conexión completada", "System");
};

const showSystemInfo = () => {
  // Recopilar información del sistema
  envInfo.value = {
    NODE_ENV: "development",
    NUXT_APP_ENV: "local",
    AMPLIFY_ENV: "dev",
  };

  browserInfo.value = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    cookiesEnabled: navigator.cookieEnabled,
  };

  // Configuración SAP hardcodeada (temporal)
  sapConfig.value = {
    url: "http://QASAP.diveco.intranet:8000/sap/bc/srt/wsdl/flv_10002A111AD1B132B9C0A8E3F3CC0A79?services=ZGLFU_WS_SRVUSERSAP",
    username: "JOB_USER",
    password: "Configurado",
    actions: {
      RESET_PASSWORD: "R",
    },
  };

  showSystemInfoModal.value = true;
};

const updateMetrics = (testResult) => {
  metrics.value.totalTests++;

  if (testResult.source === "Nuxt") {
    metrics.value.nuxtTests++;
  } else if (testResult.source === "Amplify") {
    metrics.value.amplifyTests++;
  }

  if (testResult.success) {
    metrics.value.successCount++;
  } else {
    metrics.value.errorCount++;
  }

  // Calcular tasa de éxito
  metrics.value.successRate = Math.round(
    (metrics.value.successCount / metrics.value.totalTests) * 100
  );

  // Actualizar tiempo promedio (simulado)
  const randomTime = Math.floor(Math.random() * 5000) + 1000;
  metrics.value.averageTime = Math.round(
    (metrics.value.averageTime + randomTime) / 2
  );

  if (testResult.source === "Nuxt") {
    metrics.value.nuxtAvgTime = Math.round(
      (metrics.value.nuxtAvgTime + randomTime) / 2
    );
  } else if (testResult.source === "Amplify") {
    metrics.value.amplifyAvgTime = Math.round(
      (metrics.value.amplifyAvgTime + randomTime) / 2
    );
  }
};

const handleResetSuccess = (data) => {
  addLog("info", `✅ Reinicio exitoso: ${data.usuario}`, "Test");
  updateMetrics({ success: true, source: "Test" });
  systemStatus.value.lastTest = new Date().toLocaleString("es-ES");
};

const handleResetError = (error) => {
  addLog(
    "error",
    `❌ Error en reinicio: ${error.mensaje} (Código: ${error.codigo})`,
    "Test"
  );
  updateMetrics({ success: false, source: "Test" });
  systemStatus.value.lastTest = new Date().toLocaleString("es-ES");
};

// Monitorear logs del componente de comparación
const monitorComponentLogs = () => {
  // Interceptar console.log para capturar logs del componente
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    originalLog.apply(console, args);
    const message = args.join(" ");
    if (message.includes("=====")) {
      addLog("info", message, "Component");
    }
  };

  console.error = (...args) => {
    originalError.apply(console, args);
    const message = args.join(" ");
    addLog("error", message, "Component");
  };

  console.warn = (...args) => {
    originalWarn.apply(console, args);
    const message = args.join(" ");
    addLog("warn", message, "Component");
  };
};

// Lifecycle
onMounted(() => {
  addLog("info", "Página de pruebas inicializada", "System");
  addLog("info", "Componente de comparación cargado", "System");

  // Inicializar estado del sistema
  testConnection();

  // Monitorear logs del componente
  monitorComponentLogs();

  // Actualizar información del sistema periódicamente
  setInterval(() => {
    if (typeof performance !== "undefined" && performance.memory) {
      const memory = performance.memory;
      systemStatus.value.memoryUsage = `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`;
    }
  }, 5000);

  addLog("debug", "Monitoreo del sistema iniciado", "System");
});

// Limpiar logs automáticamente cada hora
setInterval(() => {
  if (allLogs.value.length > 500) {
    allLogs.value = allLogs.value.slice(-250);
    addLog(
      "info",
      "Logs limpiados automáticamente (más de 500 entradas)",
      "System"
    );
  }
}, 3600000);
</script>

<style scoped>
.log-entry {
  word-break: break-word;
  line-height: 1.4;
}

.log-entry:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 2px 4px;
}

/* Scrollbar personalizado */
.logs-container::-webkit-scrollbar {
  width: 8px;
}

.logs-container::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

.logs-container::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.logs-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.log-entry {
  animation: fadeIn 0.2s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }
}
</style>
