<template>
  <footer
    class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Contenido principal del footer -->
      <div class="py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Información de la empresa -->
          <div class="md:col-span-2">
            <div class="flex items-center space-x-3 mb-4">
              <img class="h-10 w-10" src="/logo.png" alt="Diveco Logo" />
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Diveco
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Portal de Herramientas Internas
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              Plataforma integral para la gestión de procesos internos,
              optimización de recursos y análisis de datos empresariales.
            </p>
            <div class="flex space-x-4">
              <a
                href="#"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Documentación"
              >
                <UIcon name="i-heroicons-document-text" class="h-5 w-5" />
              </a>
              <a
                href="#"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Soporte"
              >
                <UIcon
                  name="i-heroicons-question-mark-circle"
                  class="h-5 w-5"
                />
              </a>
              <a
                href="#"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Feedback"
              >
                <UIcon
                  name="i-heroicons-chat-bubble-left-ellipsis"
                  class="h-5 w-5"
                />
              </a>
            </div>
          </div>

          <!-- Enlaces rápidos -->
          <div>
            <h4
              class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider"
            >
              Acceso Rápido
            </h4>
            <ul class="space-y-2">
              <li v-for="link in quickLinks" :key="link.name">
                <NuxtLink
                  :to="link.href"
                  class="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Recursos -->
          <div>
            <h4
              class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider"
            >
              Recursos
            </h4>
            <ul class="space-y-2">
              <li v-for="resource in resources" :key="resource.name">
                <a
                  :href="resource.href"
                  class="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  :target="resource.external ? '_blank' : '_self'"
                  :rel="resource.external ? 'noopener noreferrer' : ''"
                >
                  <span class="flex items-center space-x-1">
                    <span>{{ resource.name }}</span>
                    <UIcon
                      v-if="resource.external"
                      name="i-heroicons-arrow-top-right-on-square"
                      class="h-3 w-3"
                    />
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Barra inferior -->
      <div class="py-4 border-t border-gray-200 dark:border-gray-700">
        <div
          class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0"
        >
          <!-- Copyright y versión -->
          <div
            class="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 dark:text-gray-400"
          >
            <span
              >© {{ currentYear }} Diveco. Todos los derechos reservados.</span
            >
            <span class="hidden sm:block">•</span>
            <span class="flex items-center space-x-1">
              <span>Portal v{{ appVersion }}</span>
              <UBadge
                :color="buildInfo.status === 'stable' ? 'green' : 'yellow'"
                variant="subtle"
                size="xs"
              >
                {{ buildInfo.status }}
              </UBadge>
            </span>
          </div>

          <!-- Estado y estadísticas -->
          <div
            class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400"
          >
            <!-- Estado del servidor -->
            <div class="flex items-center space-x-1">
              <div
                :class="[
                  'h-2 w-2 rounded-full',
                  serverStatus.online
                    ? 'bg-green-400 animate-pulse'
                    : 'bg-red-400',
                ]"
              ></div>
              <span>
                {{
                  serverStatus.online ? "Sistema Operativo" : "Sistema Offline"
                }}
              </span>
            </div>

            <!-- Tiempo de actividad -->
            <span class="hidden sm:block">•</span>
            <span class="hidden sm:block">
              Uptime: {{ formatUptime(serverStatus.uptime) }}
            </span>

            <!-- Usuarios activos -->
            <span class="hidden md:block">•</span>
            <span class="hidden md:block flex items-center space-x-1">
              <UIcon name="i-heroicons-users" class="h-3 w-3" />
              <span>{{ activeUsers }} usuarios activos</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Información adicional (solo desarrollo) -->
      <div
        v-if="isDevelopment"
        class="py-2 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex justify-center">
          <div class="flex items-center space-x-4 text-xs text-gray-400">
            <span>Modo: Desarrollo</span>
            <span>•</span>
            <span>Build: {{ buildInfo.hash }}</span>
            <span>•</span>
            <span>{{ buildInfo.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Estado reactivo
const activeUsers = ref(156);
const serverStatus = ref({
  online: true,
  uptime: 2847200, // segundos
});

const buildInfo = ref({
  status: "stable",
  hash: "a1b2c3d",
  date: "2024-01-15",
});

const appVersion = ref("1.2.3");

// Computed
const currentYear = computed(() => new Date().getFullYear());
const isDevelopment = computed(() => process.env.NODE_ENV === "development");

// Enlaces rápidos
const quickLinks = ref([
  { name: "Dashboard", href: "/" },
  { name: "Herramientas", href: "/herramientas" },
  { name: "Reportes", href: "/reportes" },
  { name: "Configuración", href: "/configuracion" },
  { name: "Mi Perfil", href: "/perfil" },
]);

// Recursos
const resources = ref([
  { name: "Manual de Usuario", href: "/docs/manual", external: false },
  { name: "API Documentation", href: "/docs/api", external: false },
  { name: "Centro de Ayuda", href: "/ayuda", external: false },
  {
    name: "Reportar Bug",
    href: "https://github.com/diveco/portal/issues",
    external: true,
  },
  {
    name: "Solicitar Feature",
    href: "https://github.com/diveco/portal/discussions",
    external: true,
  },
  { name: "Contactar Soporte", href: "/soporte", external: false },
]);

// Métodos
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const updateServerStatus = () => {
  // Simular actualización del estado del servidor
  serverStatus.value.uptime += 60; // Incrementar 1 minuto

  // Simular variación en usuarios activos
  const variation = Math.floor(Math.random() * 10) - 5;
  activeUsers.value = Math.max(
    100,
    Math.min(200, activeUsers.value + variation)
  );
};

// Lifecycle
onMounted(() => {
  // Actualizar estado cada minuto
  const interval = setInterval(updateServerStatus, 60000);

  // Cleanup
  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
