<template>
  <div>
    <!-- Overlay para móvil -->
    <div
      v-if="isOpen && isMobile"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 h-screen bg-gradient-diveco border-r border-cyan-400/30 transform transition-all duration-500 ease-in-out lg:translate-x-0 shadow-xl',
        isCompact ? 'w-16' : 'w-56',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      :style="{
        transitionProperty: 'width, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }"
    >
      <!-- Header del sidebar -->
      <div
        class="flex items-center justify-center h-16 px-4 border-b border-cyan-400/30 relative"
      >
        <Transition name="logo-fade" mode="out-in">
          <div v-if="!isCompact" class="flex items-center space-x-2">
            <img
              class="w-12 transition-all duration-300"
              src="/DORMILON-FRESH.png"
              alt="Diveco Logo"
            />

            <h1 class="text-2xl font-bold text-white sm:text-lg">
              Portal <span style="color: #2dd0f8">DIVECO</span>
            </h1>
          </div>

          <img
            v-else
            key="compact-logo"
            class="w-8 h-8 transition-all duration-300 hover:scale-110"
            src="/DORMILON-FRESH.png"
            alt="Diveco"
          />
        </Transition>

        <!-- Botón cerrar (solo móvil) -->
        <UButton
          v-if="isMobile"
          icon="i-heroicons-x-mark"
          color="white"
          variant="ghost"
          size="sm"
          @click="closeSidebar"
          class="text-white hover:bg-blue-600 absolute right-2"
        />
      </div>

      <!-- Contenido del sidebar -->
      <div
        class="flex flex-col overflow-hidden animate-slide-in-left transition-all duration-500"
        style="height: calc(100vh - 4rem)"
      >
        <!-- Navegación principal -->
        <nav class="flex-1 px-3 py-4 space-y-2 overflow-y-auto min-h-0">
          <!-- Indicador de carga para permisos -->
          <div v-if="isLoadingGroups" class="mb-6 px-3">
            <div class="flex items-center space-x-3 text-cyan-200">
              <div
                class="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
              ></div>
              <span class="text-xs">Verificando permisos...</span>
            </div>
          </div>

          <!-- Secciones de navegación -->
          <div
            v-for="section in navigationSections"
            :key="section.title"
            class="mb-6"
          >
            <!-- Título de la sección -->
            <Transition name="section-fade" mode="out-in">
              <h3
                v-if="!isCompact"
                key="section-title"
                class="px-3 text-xs font-semibold text-cyan-200 uppercase tracking-wider mb-2 transition-all duration-300"
              >
                {{ section.title }}
              </h3>
              <!-- Separador en modo compacto -->
              <div
                v-else
                key="section-divider"
                class="mx-3 mb-2 border-t border-cyan-400/30 transition-all duration-300 transform scale-x-0 animate-scale-x"
              ></div>
            </Transition>

            <!-- Items de la sección -->
            <div class="space-y-1">
              <template v-for="item in section.items" :key="item.name">
                <!-- Item con submenú -->
                <div v-if="item.children">
                  <button
                    @click="toggleSubmenu(item.name)"
                    :class="[
                      'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                      hasActiveChild(item.children)
                        ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ]"
                  >
                    <div class="flex items-center space-x-3">
                      <UIcon :name="item.icon" class="h-5 w-5" />
                      <span>{{ item.name }}</span>
                    </div>
                    <UIcon
                      name="i-heroicons-chevron-right"
                      :class="[
                        'h-4 w-4 transition-transform duration-200',
                        openSubmenus.includes(item.name) ? 'rotate-90' : '',
                      ]"
                    />
                  </button>

                  <!-- Submenú -->
                  <div
                    v-if="openSubmenus.includes(item.name)"
                    class="ml-8 mt-1 space-y-1"
                  >
                    <NuxtLink
                      v-for="child in item.children"
                      :key="child.name"
                      :to="child.href"
                      :class="[
                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200',
                        isActiveRoute(child.href)
                          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-l-2 border-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                      ]"
                      @click="handleLinkClick"
                    >
                      <UIcon :name="child.icon" class="h-4 w-4" />
                      <span>{{ child.name }}</span>
                      <UBadge
                        v-if="child.badge"
                        :color="child.badgeColor || 'blue'"
                        variant="subtle"
                        size="xs"
                        class="ml-auto"
                      >
                        {{ child.badge }}
                      </UBadge>
                    </NuxtLink>
                  </div>
                </div>

                <!-- Item simple -->
                <NuxtLink
                  v-else
                  :to="item.href"
                  :class="[
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-500 interactive transform hover:scale-105',
                    isCompact ? 'justify-center' : 'space-x-3',
                    isActiveRoute(item.href)
                      ? 'bg-cyan-400 text-gray-900 border-r-2 border-cyan-300 shadow-lg font-semibold'
                      : 'text-cyan-100 hover:bg-cyan-400/20 hover:text-cyan-200 hover-lift',
                  ]"
                  @click="handleLinkClick"
                  :title="isCompact ? item.name : ''"
                >
                  <UIcon
                    :name="item.icon"
                    :class="[
                      'h-5 w-5 transition-all duration-300',
                      isCompact ? 'transform hover:rotate-12' : '',
                    ]"
                  />
                  <Transition name="text-slide" mode="out-in">
                    <span
                      v-if="!isCompact"
                      :key="item.name"
                      class="whitespace-nowrap"
                      >{{ item.name }}</span
                    >
                  </Transition>
                  <Transition name="badge-slide" mode="out-in">
                    <UBadge
                      v-if="item.badge && !isCompact"
                      :key="item.badge"
                      :color="item.badgeColor || 'blue'"
                      variant="subtle"
                      size="xs"
                      class="ml-auto transition-all duration-300"
                    >
                      {{ item.badge }}
                    </UBadge>
                  </Transition>
                </NuxtLink>
              </template>
            </div>
          </div>
        </nav>

        <!-- Footer del sidebar -->
        <div class="p-3 border-t border-cyan-400/30 space-y-3 flex-shrink-0">
          <!-- Perfil de usuario -->
          <div class="relative" data-user-menu>
            <div
              :class="[
                'cursor-pointer hover:bg-cyan-400/20 rounded-lg p-2 transition-all duration-300 hover-scale interactive group border border-transparent hover:border-cyan-400/30',
                isCompact
                  ? 'flex justify-center'
                  : 'flex items-center space-x-3',
              ]"
              :title="
                isCompact ? graphUserData?.displayName || userProfile.name : ''
              "
              role="button"
              tabindex="0"
              @click="toggleUserMenu"
              @keydown.enter="toggleUserMenu"
              @keydown.space="toggleUserMenu"
            >
              <!-- Avatar con foto de Microsoft Graph -->
              <div class="relative w-8 h-8">
                <!-- Foto del usuario desde Microsoft Graph -->
                <img
                  v-if="userPhoto"
                  :src="userPhoto"
                  :alt="userProfile.name"
                  class="w-8 h-8 rounded-full object-cover shadow-sm transition-opacity duration-200"
                  :class="{
                    'opacity-50': isLoadingGroups || loadingGraphUserData,
                  }"
                />
                <!-- Fallback a iniciales si no hay foto -->
                <div
                  v-else
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-opacity duration-200 bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500',
                    { 'opacity-50': isLoadingGroups || loadingGraphUserData },
                  ]"
                >
                  <span class="text-xs font-bold text-white">
                    {{ getInitials(userProfile.name) }}
                  </span>
                </div>
                <!-- Indicador de carga para foto -->
                <div
                  v-if="loadingGraphUserData"
                  class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full"
                >
                  <div
                    class="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"
                  ></div>
                </div>
                <!-- Indicador de carga para grupos -->
                <div
                  v-if="isLoadingGroups"
                  class="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"
                ></div>
              </div>
              <div v-if="!isCompact" class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                  {{ userProfile.name }}
                </p>
                <p class="text-xs text-cyan-200 truncate">
                  <span
                    v-if="isLoadingGroups || loadingGraphUserData"
                    class="animate-pulse"
                    >Cargando...</span
                  >
                  <span v-else>{{ userRole || "Ciudadano DIVECO" }}</span>
                </p>
              </div>
              <UIcon
                v-if="!isCompact"
                :name="
                  isUserMenuOpen
                    ? 'i-heroicons-chevron-up'
                    : 'i-heroicons-chevron-down'
                "
                class="h-4 w-4 text-cyan-200 flex-shrink-0 transition-transform duration-200"
              />
            </div>

            <!-- Menú desplegable -->
            <Transition
              name="user-menu"
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isUserMenuOpen"
                class="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 mx-2"
              >
                <!-- Mi Perfil -->
                <button
                  @click="navigateTo('/perfil')"
                  class="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-150"
                >
                  <UIcon
                    name="i-heroicons-user"
                    class="h-4 w-4 flex-shrink-0"
                  />
                  <span>Mi Perfil</span>
                </button>

                <button
                  @click="navigateTo('/preferencias')"
                  class="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-150"
                >
                  <UIcon
                    name="i-heroicons-adjustments-horizontal"
                    class="h-4 w-4 flex-shrink-0"
                  />
                  <span>Preferencias</span>
                </button>

                <!-- Separador -->
                <div
                  class="border-t border-gray-200 dark:border-gray-700 my-1.5 mx-3"
                ></div>

                <!-- Separador -->
                <div
                  class="border-t border-gray-200 dark:border-gray-700 my-1.5 mx-3"
                ></div>

                <!-- Cerrar Sesión -->
                <button
                  @click="navigateToLogout"
                  class="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors duration-150"
                >
                  <UIcon
                    name="i-heroicons-arrow-right-on-rectangle"
                    class="h-4 w-4 flex-shrink-0"
                  />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Debug: Estado de grupos (solo en desarrollo) -->
          <!-- Comentado temporalmente para evitar errores de variables de entorno -->
          <!--
          <div
            v-if="!isCompact && isDevelopment"
            class="mt-2 p-2 bg-gray-800/50 rounded text-xs text-gray-300"
          >
            <div class="space-y-1">
              <div class="flex justify-between">
                <span>Estado:</span>
                <span
                  :class="
                    isLoadingGroups ? 'text-yellow-400' : 'text-green-400'
                  "
                >
                  {{ isLoadingGroups ? "Cargando..." : "Listo" }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Es Admin:</span>
                <span
                  :class="hasGroup('ADMIN') ? 'text-green-400' : 'text-red-400'"
                >
                  {{ hasGroup("ADMIN") ? "Sí" : "No" }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Grupos:</span>
                <span class="text-cyan-400">{{ userGroups.length }}</span>
              </div>
            </div>
          </div>
          -->
        </div>
      </div>

      <!-- Botón flotante de toggle compacto (solo desktop) -->
      <div
        v-if="!isMobile"
        class="fixed z-50 transition-all duration-500 ease-in-out"
        :class="[
          'top-1/2 transform -translate-y-1/2',
          isCompact ? 'left-14' : 'left-52',
        ]"
        :style="{
          transitionProperty: 'left, transform',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }"
      >
        <UButton
          :icon="
            isCompact ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'
          "
          color="cyan"
          variant="solid"
          size="xs"
          @click="toggleSidebarCompact"
          class="shadow-lg hover:shadow-2xl transition-all duration-300 bg-cyan-500 hover:bg-cyan-600 transform hover:scale-110 active:scale-95 rounded-full"
          :class="{
            'animate-pulse': false,
            'hover:rotate-180': isCompact,
            'hover:-rotate-180': !isCompact,
          }"
          :title="isCompact ? 'Expandir sidebar' : 'Contraer sidebar'"
        />
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { signOut } from "aws-amplify/auth";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

const userAttributes = await fetchUserAttributes();
// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isCompact: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["close", "toggle-compact"]);

// Composables
const route = useRoute();
const { toggleSidebarCompact } = useLayoutState();
const {
  userGroups,
  getUserRole,
  isLoading: isLoadingGroups,
  hasGroup,
} = useUserGroups();
const { getCompleteUserData, getInitials, isLoadingPhoto, getPhotoFromCache } =
  useMicrosoftGraph();

// Detectar si estamos en modo desarrollo
const isDevelopment = computed(() => {
  // Opción 1: Usar configuración de Nuxt si está disponible
  try {
    const config = useRuntimeConfig();
    if (config.public.environment) {
      return config.public.environment === "development";
    }
  } catch (e) {
    // Si no está disponible, usar detección por hostname
  }

  // Opción 2: Detectar por hostname (fallback)
  if (typeof window !== "undefined") {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("dev") ||
      window.location.hostname.includes("staging")
    );
  }

  return false;
});

// Estado reactivo
const openSubmenus = ref([]); // Sin submenús abiertos por defecto
const isMobile = ref(false);
const isUserMenuOpen = ref(false); // Control del menú de usuario

// Estado reactivo para Microsoft Graph API
const graphUserData = ref(null);
const loadingGraphUserData = ref(false);
const userPhoto = ref(null);

// Datos del usuario (manteniendo compatibilidad)
const userProfile = ref({
  name: userAttributes.email,
  role: "",
  avatar: "/api/placeholder/32/32",
});

// Computed para el rol del usuario que se actualiza automáticamente
const userRole = computed(() => getUserRole());

// Watcher para mantener sincronizado el rol en el perfil
watch(userRole, (newRole) => {
  userProfile.value.role = newRole;
});

// Secciones de navegación
const navigationSections = computed(() => {
  const sections = [
    {
      title: "Principal",
      items: [
        {
          name: "Inicio",
          href: "/",
          icon: "i-heroicons-home",
        },
      ],
    },
  ];

  // Solo mostrar "Contraseñas SAP" si el usuario es ADMIN o SAP-USER-ADMIN
  if (hasGroup("ADMIN") || hasGroup("SAP-USER-ADMIN")) {
    sections.push({
      title: "Herramientas",
      items: [
        {
          name: "Contraseñas SAP",
          href: "/tools/contrasenias-sap",
          icon: "i-heroicons-key",
          badge: "Nuevo",
          badgeColor: "green",
        },
      ],
    });
  }

  // Agregar "Explosión de Materiales" y "SUIC" solo si pertenece al grupo EXPLOSION
  if (hasGroup("EXPLOSION")) {
    // Buscar si ya existe la sección Herramientas para añadir ahí los items
    const toolsSection = sections.find((s) => s.title === "Herramientas");
    const explosionItem = {
      name: "Explosión de Materiales",
      href: "/tools/explosion-materiales",
      icon: "i-heroicons-squares-2x2",
      badge: "Nuevo",
      badgeColor: "blue",
    };
    const suicItem = {
      name: "SUIC",
      href: "/tools/suic",
      icon: "i-heroicons-chart-bar",
      badge: "Nuevo",
      badgeColor: "green",
    };

    if (toolsSection) {
      toolsSection.items.push(explosionItem);
      toolsSection.items.push(suicItem);
    } else {
      sections.push({
        title: "Herramientas",
        items: [explosionItem, suicItem],
      });
    }
  }

  // Solo mostrar la sección de administración si el usuario es ADMIN
  if (hasGroup("ADMIN")) {
    sections.push({
      title: "Administración",
      items: [
        {
          name: "Gestión de Usuarios",
          href: "/admin/users",
          icon: "i-heroicons-user-group",
        },
      ],
    });
  }

  return sections;
});

// Menú de usuario
const userMenuItems = ref([
  [
    {
      label: "Mi Perfil",
      icon: "i-heroicons-user",
      click: () => navigateTo("/perfil"),
    },
  ],

  [
    {
      label: "Cerrar Sesión",
      icon: "i-heroicons-arrow-right-on-rectangle",
      click: () => logout(),
      class:
        "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20",
    },
  ],
]);

// Computed
const isActiveRoute = (href) => {
  if (href === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(href);
};

const hasActiveChild = (children) => {
  return children.some((child) => isActiveRoute(child.href));
};

// Función para cargar datos completos del usuario usando el composable
const loadCompleteUserData = async (userEmail) => {
  if (!userEmail) {
    console.error("Email de usuario requerido");
    return;
  }

  loadingGraphUserData.value = true;

  try {
    const { userData, photo } = await getCompleteUserData(userEmail);

    if (userData) {
      graphUserData.value = userData;
      userProfile.value.name = userData.displayName || userAttributes.email;
    } else {
      // Fallback para usuarios sin acceso a Microsoft Graph
      console.info("🔐 Usando datos básicos de Cognito para usuario sin Microsoft Graph");
      userProfile.value.name = userAttributes.email || "Usuario";
    }

    if (photo) {
      userPhoto.value = photo;
      userProfile.value.avatar = photo;
    } else {
      // Generar iniciales como fallback
      const initials = userProfile.value.name
        .split(" ")
        .map(n => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
      userProfile.value.initials = initials || "??";
    }
  } catch (error) {
    // Manejo específico para usuarios sin Microsoft Graph
    if (error?.message === "NO_GRAPH_ACCESS" ||
        error?.message?.includes("Cannot read properties of null")) {
      console.info("🔐 Usuario sin acceso a Microsoft Graph - usando datos básicos de Cognito");
      userProfile.value.name = userAttributes.email || "Usuario";
      const initials = userProfile.value.name
        .split("@")[0] // Usar parte antes del @ para iniciales
        .split(".")
        .map(n => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
      userProfile.value.initials = initials || "??";
    } else {
      console.error("❌ Error cargando datos completos del usuario:", error);
    }
  } finally {
    loadingGraphUserData.value = false;
  }
};

// Métodos
const toggleSubmenu = (itemName) => {
  const index = openSubmenus.value.indexOf(itemName);
  if (index > -1) {
    openSubmenus.value.splice(index, 1);
  } else {
    openSubmenus.value.push(itemName);
  }
};

const closeSidebar = () => {
  emit("close");
};

const handleLinkClick = () => {
  if (isMobile.value) {
    closeSidebar();
  }
};

const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 1024;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const navigateToLogout = () => {
  // Cerrar el menú de usuario
  closeUserMenu();

  // Redirigir a la página de logout
  navigateTo("/logout");
};

const logout = async () => {
  // Cerrar el menú de usuario
  closeUserMenu();

  try {
    // Cerrar sesión usando Amplify Auth
    await signOut();
    // Redireccionar a la raíz después del cierre de sesión
    await window.location.reload();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    // Si hay un error, mostrar mensaje y redireccionar de todas formas
    await navigateTo("/");
  }
};

// Lifecycle
onMounted(async () => {
  checkIsMobile();
  window.addEventListener("resize", checkIsMobile);

  // Cerrar menú de usuario al hacer clic fuera
  document.addEventListener("click", (event) => {
    const userMenu = document.querySelector("[data-user-menu]");
    if (userMenu && !userMenu.contains(event.target)) {
      closeUserMenu();
    }
  });

  // Inicializar Microsoft Graph API
  try {
    const userEmail = userAttributes.email;

    if (userEmail) {
      // Cargar datos completos del usuario usando el composable
      await loadCompleteUserData(userEmail);
    }
  } catch (error) {
    console.error("Error inicializando Microsoft Graph en sidebar:", error);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
  document.removeEventListener("click", closeUserMenu);
});
</script>

<style scoped>
/* Animaciones personalizadas */
.rotate-90 {
  transform: rotate(90deg);
}

/* Transiciones de Vue */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-10deg);
}

.logo-fade-leave-to {
  opacity: 0;
  transform: scale(1.2) rotate(10deg);
}

.text-slide-enter-active,
.text-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.text-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.section-fade-enter-active,
.section-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-fade-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.section-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.badge-slide-enter-active,
.badge-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.badge-slide-enter-from {
  opacity: 0;
  transform: translateX(10px) scale(0.8);
}

.badge-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(1.2);
}

/* Animación de escala para separadores */
@keyframes scale-x {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.animate-scale-x {
  animation: scale-x 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Efectos hover mejorados */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 211, 238, 0.15);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.interactive {
  position: relative;
  overflow: hidden;
}

.interactive::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 211, 238, 0.1),
    transparent
  );
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive:hover::before {
  left: 100%;
}

/* Scrollbar personalizado */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
  transition: background 0.3s ease;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.dark nav::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.3);
}

.dark nav::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.5);
}

/* Animaciones de entrada para el sidebar */
@keyframes slide-in-left {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-left {
  animation: slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efectos de profundidad */
.shadow-depth {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.shadow-depth:hover {
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.25),
    0 10px 10px rgba(0, 0, 0, 0.22);
}

/* Transiciones del menú de usuario */
.user-menu-enter-active,
.user-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.user-menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
