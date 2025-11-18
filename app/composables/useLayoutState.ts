import { ref, computed, watch, readonly } from "vue";

// Estado global del layout
const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);
const sidebarCompact = ref(true);
const isDark = ref(false);
const searchQuery = ref("");
const mobileMenuOpen = ref(false);
const notifications = ref([]);
const breadcrumbs = ref([]);

// Estado de la aplicación
const appState = ref({
  loading: false,
  online: true,
  lastActivity: new Date(),
  activeUsers: 156,
  systemHealth: 95,
});

// Configuración del layout
const layoutConfig = ref({
  sidebarWidth: 264,
  sidebarCompactWidth: 64,
  collapsedSidebarWidth: 64,
  headerHeight: 64,
  footerHeight: 120,
});

// Elementos de navegación principales
const navigationItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: "i-heroicons-home",
  },
  {
    to: "/herramientas",
    label: "Herramientas",
    icon: "i-heroicons-wrench-screwdriver",
  },
  {
    to: "/reportes",
    label: "Reportes",
    icon: "i-heroicons-chart-bar",
  },
  {
    to: "/analiticas",
    label: "Analíticas",
    icon: "i-heroicons-chart-pie",
  },
  {
    to: "/usuarios",
    label: "Usuarios",
    icon: "i-heroicons-users",
  },
  {
    to: "/configuracion",
    label: "Configuración",
    icon: "i-heroicons-cog-6-tooth",
  },
];

// Función logout (definida antes para evitar errores de referencia)
const logout = async () => {
  try {
    appState.value.loading = true;
    // Implementar lógica de logout
    console.log("Cerrando sesión...");
    // Ejemplo: await $auth.logout()
    // await navigateTo('/login')

    // Limpiar estado local
    clearUserData();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  } finally {
    appState.value.loading = false;
  }
};

// Función para limpiar datos del usuario
const clearUserData = () => {
  searchQuery.value = "";
  notifications.value = [];
  breadcrumbs.value = [];
  if (typeof window !== "undefined") {
    localStorage.removeItem("userPreferences");
  }
};

// Función para crear el menú de usuario
const createUserMenuItems = () => [
  [
    {
      label: "Mi Perfil",
      icon: "i-heroicons-user",
      to: "/perfil",
    },
    {
      label: "Preferencias",
      icon: "i-heroicons-adjustments-horizontal",
      to: "/preferencias",
    },
  ],
  [
    {
      label: "Configuración",
      icon: "i-heroicons-cog-6-tooth",
      to: "/configuracion",
    },
    {
      label: "Ayuda",
      icon: "i-heroicons-question-mark-circle",
      to: "/ayuda",
    },
  ],
  [
    {
      label: "Cerrar Sesión",
      icon: "i-heroicons-arrow-right-on-rectangle",
      click: () => logout(),
    },
  ],
];

export const useLayoutState = () => {
  // Computed
  const currentYear = computed(() => new Date().getFullYear());

  const hasUnreadNotifications = computed(() =>
    notifications.value.some((n) => n.unread),
  );

  const isOnline = computed(() => appState.value.online);

  const systemStatus = computed(() => ({
    health: appState.value.systemHealth,
    users: appState.value.activeUsers,
    lastActivity: appState.value.lastActivity,
  }));

  // Métodos principales
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
    updateActivity();
  };

  const closeSidebar = () => {
    sidebarOpen.value = false;
  };

  const toggleSidebarCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    updateActivity();
  };

  const toggleSidebarCompact = () => {
    sidebarCompact.value = !sidebarCompact.value;
    updateActivity();
  };

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  };

  const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
  };

  const toggleDark = () => {
    isDark.value = !isDark.value;
    // Persistir preferencia en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", isDark.value ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark.value);
    }
    updateActivity();
  };

  // Gestión de notificaciones
  const addNotification = (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      timestamp: new Date(),
      unread: true,
      ...notification,
    });
  };

  const markNotificationAsRead = (id) => {
    const notification = notifications.value.find((n) => n.id === id);
    if (notification) {
      notification.unread = false;
    }
  };

  const clearAllNotifications = () => {
    notifications.value = [];
  };

  // Gestión de breadcrumbs
  const setBreadcrumbs = (crumbs) => {
    breadcrumbs.value = crumbs;
  };

  const addBreadcrumb = (crumb) => {
    breadcrumbs.value.push(crumb);
  };

  const clearBreadcrumbs = () => {
    breadcrumbs.value = [];
  };

  // Utilidades
  const getCurrentPageTitle = () => {
    try {
      const route = useRoute();
      const currentItem = navigationItems.find(
        (item) => item.to === route.path,
      );
      return currentItem?.label || "Página";
    } catch (error) {
      // Fallback si useRoute no está disponible
      return "Portal Diveco";
    }
  };

  const updateActivity = () => {
    appState.value.lastActivity = new Date();
  };

  const setLoading = (loading) => {
    appState.value.loading = loading;
  };

  const updateSystemHealth = (health) => {
    appState.value.systemHealth = Math.max(0, Math.min(100, health));
  };

  const updateActiveUsers = (count) => {
    appState.value.activeUsers = count;
  };

  // Inicialización del tema
  const initializeTheme = () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        isDark.value = savedTheme === "dark";
      } else {
        isDark.value = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
      }
      document.documentElement.classList.toggle("dark", isDark.value);
    }
  };

  // Inicialización de preferencias
  const initializePreferences = () => {
    if (typeof window !== "undefined") {
      const preferences = localStorage.getItem("userPreferences");
      if (preferences) {
        try {
          const parsed = JSON.parse(preferences);
          sidebarCollapsed.value = parsed.sidebarCollapsed || false;
          sidebarCompact.value = parsed.sidebarCompact !== undefined ? parsed.sidebarCompact : true;
        } catch (error) {
          console.warn("Error parsing user preferences:", error);
        }
      }
    }
  };

  // Guardar preferencias
  const savePreferences = () => {
    if (typeof window !== "undefined") {
      const preferences = {
        sidebarCollapsed: sidebarCollapsed.value,
        sidebarCompact: sidebarCompact.value,
        theme: isDark.value ? "dark" : "light",
      };
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
    }
  };

  // Watcher para cerrar sidebar al cambiar de ruta
  const setupRouteWatcher = () => {
    try {
      const route = useRoute();
      watch(
        () => route.path,
        () => {
          closeSidebar();
          closeMobileMenu();
          updateActivity();
        },
      );
    } catch (error) {
      // Si useRoute no está disponible, no configuramos el watcher
      console.warn("useRoute no disponible para el watcher");
    }
  };

  // Watchers para persistir preferencias
  watch([sidebarCollapsed, sidebarCompact, isDark], () => {
    savePreferences();
  });

  return {
    // Estado principal
    sidebarOpen: readonly(sidebarOpen),
    sidebarCollapsed: readonly(sidebarCollapsed),
    sidebarCompact: readonly(sidebarCompact),
    isDark: readonly(isDark),
    mobileMenuOpen: readonly(mobileMenuOpen),
    searchQuery,
    notifications: readonly(notifications),
    breadcrumbs: readonly(breadcrumbs),
    appState: readonly(appState),
    layoutConfig: readonly(layoutConfig),
    navigationItems,
    userMenuItems: createUserMenuItems(),

    // Computed
    currentYear,
    hasUnreadNotifications,
    isOnline,
    systemStatus,

    // Métodos principales
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapse,
    toggleSidebarCompact,
    toggleMobileMenu,
    closeMobileMenu,
    toggleDark,

    // Gestión de notificaciones
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,

    // Gestión de breadcrumbs
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,

    // Utilidades
    getCurrentPageTitle,
    updateActivity,
    setLoading,
    updateSystemHealth,
    updateActiveUsers,
    logout,
    initializeTheme,
    initializePreferences,
    setupRouteWatcher,
  };
};
