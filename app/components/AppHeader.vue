<template>
  <header
    :class="[
      'glass backdrop-blur-md bg-gradient-to-r from-white/90 via-cyan-50/20 to-white/90 dark:from-gray-800/90 dark:via-cyan-900/10 dark:to-gray-800/90 shadow-lg border-b border-cyan-200/30 dark:border-cyan-700/30 fixed top-0 right-0 left-0 z-40 h-12 transition-all duration-500 ease-in-out',
      sidebarCompact ? 'lg:left-16' : 'lg:left-56',
    ]"
    :style="{
      transitionProperty: 'left',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }"
  >
    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-12 animate-fade-in-up">
        <!-- Toggle sidebar para móvil -->
        <div class="flex items-center">
          <!-- Toggle Sidebar -->
          <UButton
            icon="i-heroicons-bars-3"
            color="cyan"
            variant="ghost"
            size="sm"
            @click="toggleSidebar"
            class="lg:hidden hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200"
          />
        </div>

        <!-- Área de acciones -->
        <div class="flex items-center space-x-2">
          <!-- Buscador -->
          <div class="hidden md:block relative group">
            <UInput
              v-model="searchQuery"
              placeholder="Buscar herramientas..."
              icon="i-heroicons-magnifying-glass"
              size="sm"
              class="w-48 transition-all duration-300 focus-within:ring-2 focus-within:ring-cyan-400/50 focus-within:border-cyan-400 hover:shadow-md"
              @keyup.enter="performSearch"
            />
            <div
              class="absolute inset-0 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
              style="
                box-shadow:
                  0 0 0 1px rgba(34, 211, 238, 0.3),
                  0 0 10px rgba(34, 211, 238, 0.1);
              "
            ></div>
          </div>

          <!-- Toggle búsqueda móvil -->
          <UButton
            icon="i-heroicons-magnifying-glass"
            color="cyan"
            variant="ghost"
            size="sm"
            class="md:hidden hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200"
            @click="toggleMobileSearch"
          />

          <!-- Toggle tema -->
          <UButton
            :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            color="cyan"
            variant="ghost"
            size="sm"
            @click="toggleDark"
            :title="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
            class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200"
          />

          <!-- Notificaciones -->
          <div class="relative">
            <UButton
              icon="i-heroicons-bell"
              color="cyan"
              variant="ghost"
              size="sm"
              :class="{ relative: hasUnreadNotifications }"
              class="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-200"
              @click="toggleNotifications"
            >
              <span
                v-if="hasUnreadNotifications"
                class="absolute -top-1 -right-1 h-2.5 w-2.5 bg-cyan-400 rounded-full animate-pulse-soft"
              ></span>
            </UButton>

            <!-- Dropdown manual -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              @click.stop
            >
              <div class="p-4">
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Notificaciones
                </h3>
                <div
                  v-if="notifications.length === 0"
                  class="text-sm text-gray-500 dark:text-gray-400"
                >
                  No hay notificaciones
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ notification.title }}
                        </p>
                        <p
                          class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                        >
                          {{ notification.message }}
                        </p>
                      </div>
                      <span
                        class="text-xs text-gray-400 dark:text-gray-500 ml-2"
                      >
                        {{ notification.time }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de búsqueda móvil -->
    <div
      v-if="mobileSearchOpen"
      class="border-t border-cyan-200/30 dark:border-cyan-700/30 px-4 py-3 md:hidden bg-gradient-to-r from-cyan-50/10 to-transparent dark:from-cyan-900/10 animate-fade-in-up"
    >
      <UInput
        v-model="searchQuery"
        placeholder="Buscar herramientas..."
        icon="i-heroicons-magnifying-glass"
        size="sm"
        class="w-full focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300"
        @keyup.enter="performSearch"
        autofocus
      />
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// Props y emits
const emit = defineEmits(["toggle-sidebar"]);

// Composables
const { isDark, sidebarCompact, toggleDark } = useLayoutState();

// Estado reactivo
const searchQuery = ref("");
const mobileSearchOpen = ref(false);
const showNotifications = ref(false);

// Notificaciones
const notifications = ref([
  {
    id: 1,
    title: "Proceso MRP completado",
    message: "El proceso de explosión MRP se ejecutó exitosamente",
    type: "success",
    time: "5 min",
    unread: true,
  },
  {
    id: 2,
    title: "Stock bajo detectado",
    message: "3 productos requieren reabastecimiento",
    type: "warning",
    time: "1 hora",
    unread: true,
  },
  {
    id: 3,
    title: "Reporte disponible",
    message: "Reporte financiero mensual generado",
    type: "info",
    time: "2 horas",
    unread: false,
  },
]);

// Computed
const hasUnreadNotifications = computed(() =>
  notifications.value.some((n) => n.unread),
);

const notificationMenuItems = computed(() => [
  [
    {
      label: "Notificaciones",
      slot: "header",
      disabled: true,
      class: "text-gradient font-semibold",
    },
  ],
  ...notifications.value.slice(0, 3).map((notification) => ({
    label: notification.title,
    description: notification.message,
    icon: getNotificationIcon(notification.type),
    iconClass: `text-${getNotificationColor(notification.type)}-500`,
    class: notification.unread
      ? "bg-cyan-50/50 dark:bg-cyan-900/10 border-l-2 border-cyan-400"
      : "",
    click: () => handleNotificationClick(notification.id),
  })),
  [
    {
      label: "Ver todas las notificaciones",
      icon: "i-heroicons-bell",
      iconClass: "text-cyan-500",
      class:
        "text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20",
      click: () => navigateTo("/notificaciones"),
    },
  ],
]);

// Métodos
const toggleSidebar = () => {
  emit("toggle-sidebar");
};

const toggleMobileSearch = () => {
  mobileSearchOpen.value = !mobileSearchOpen.value;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/buscar?q=${encodeURIComponent(searchQuery.value)}`);
    mobileSearchOpen.value = false;
  }
};

const getNotificationIcon = (type) => {
  const icons = {
    success: "i-heroicons-check-circle",
    warning: "i-heroicons-exclamation-triangle",
    info: "i-heroicons-information-circle",
    error: "i-heroicons-x-circle",
  };
  return icons[type] || "i-heroicons-bell";
};

const getNotificationColor = (type) => {
  const colors = {
    success: "emerald",
    warning: "amber",
    info: "cyan",
    error: "red",
  };
  return colors[type] || "cyan";
};

const handleNotificationClick = (notificationId) => {
  // Marcar como leída
  const notification = notifications.value.find((n) => n.id === notificationId);
  if (notification) {
    notification.unread = false;
  }
  // Navegar a la notificación específica
  navigateTo(`/notificaciones/${notificationId}`);
};

// Event listener para cerrar dropdown al hacer clic fuera
const handleClickOutside = (event) => {
  if (showNotifications.value) {
    showNotifications.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
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

/* Efectos de hover mejorados para el header */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.group:hover .group-hover\:text-cyan-500 {
  color: rgb(6 182 212);
}

/* Animación sutil para iconos */
.icon-hover {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-hover:hover {
  transform: rotate(15deg) scale(1.1);
}

/* Glow effect para elementos activos */
.glow-cyan {
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
}

/* Efecto de breathing para notificaciones */
@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.breathe {
  animation: breathe 2s ease-in-out infinite;
}
</style>
