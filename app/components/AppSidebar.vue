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
          <img
            v-if="!isCompact"
            key="full-logo"
            class="w-full transition-all duration-300"
            src="/logo.png"
            alt="Diveco Logo"
          />
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
          <!-- Sección Dashboard -->
          <div class="mb-6">
            <NuxtLink
              to="/"
              :class="[
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-500 interactive transform hover:scale-105',
                isCompact ? 'justify-center' : 'space-x-3',
                isActiveRoute('/')
                  ? 'bg-cyan-400 text-gray-900 border-r-2 border-cyan-300 shadow-lg font-semibold'
                  : 'text-cyan-100 hover:bg-cyan-400/20 hover:text-cyan-200 hover-lift',
              ]"
              @click="handleLinkClick"
              :title="isCompact ? 'Dashboard' : ''"
            >
              <UIcon
                name="i-heroicons-home"
                :class="[
                  'h-5 w-5 transition-all duration-300',
                  isCompact ? 'transform hover:rotate-12' : '',
                ]"
              />
              <Transition name="text-slide" mode="out-in">
                <span
                  v-if="!isCompact"
                  key="dashboard-text"
                  class="whitespace-nowrap"
                  >Dashboard</span
                >
              </Transition>
            </NuxtLink>
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
          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'top-start' }"
          >
            <div
              :class="[
                'cursor-pointer hover:bg-cyan-400/20 rounded-lg p-2 transition-all duration-300 hover-scale interactive',
                isCompact
                  ? 'flex justify-center'
                  : 'flex items-center space-x-3',
              ]"
              :title="isCompact ? userProfile.name : ''"
            >
              <UAvatar
                :src="userProfile.avatar"
                :alt="userProfile.name"
                size="sm"
              />
              <div v-if="!isCompact" class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                  {{ userProfile.name }}
                </p>
                <p class="text-xs text-cyan-200 truncate">
                  {{ userProfile.role }}
                </p>
              </div>
              <UIcon
                v-if="!isCompact"
                name="i-heroicons-chevron-up"
                class="h-4 w-4 text-cyan-200 flex-shrink-0"
              />
            </div>
          </UDropdown>

          <!-- Acceso rápido a configuración -->
          <UButton
            icon="i-heroicons-cog-6-tooth"
            :label="isCompact ? '' : 'Configuración'"
            color="white"
            variant="outline"
            size="sm"
            :block="!isCompact"
            :square="isCompact"
            class="text-white border-cyan-400/50 hover:bg-cyan-400/20 hover:border-cyan-300"
            :class="{ 'w-full': !isCompact, 'mx-auto': isCompact }"
            :title="isCompact ? 'Configuración' : ''"
            @click="navigateTo('/configuracion')"
          />
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
import { ref, computed, onMounted, onUnmounted } from "vue";

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

// Estado reactivo
const openSubmenus = ref([]); // Sin submenús abiertos por defecto
const isMobile = ref(false);

// Datos del usuario
const userProfile = ref({
  name: "Juan Pérez",
  role: "Administrador",
  avatar: "/api/placeholder/32/32",
});

// Secciones de navegación
const navigationSections = ref([
  {
    title: "Principal",
    items: [
      {
        name: "Contraseñas SAP",
        href: "/sap/passwords",
        icon: "i-heroicons-key",
      },
    ],
  },
]);

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
      label: "Configuración",
      icon: "i-heroicons-cog-6-tooth",
      click: () => navigateTo("/configuracion"),
    },
    {
      label: "Preferencias",
      icon: "i-heroicons-adjustments-horizontal",
      click: () => navigateTo("/preferencias"),
    },
  ],
  [
    {
      label: "Ayuda y Soporte",
      icon: "i-heroicons-question-mark-circle",
      click: () => navigateTo("/ayuda"),
    },
  ],
  [
    {
      label: "Cerrar Sesión",
      icon: "i-heroicons-arrow-right-on-rectangle",
      click: () => logout(),
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

const logout = () => {
  // Implementar lógica de logout
  console.log("Cerrando sesión...");
  // Ejemplo: await $auth.logout()
  // navigateTo('/login')
};

// Lifecycle
onMounted(() => {
  checkIsMobile();
  window.addEventListener("resize", checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.shadow-depth:hover {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
}
</style>
