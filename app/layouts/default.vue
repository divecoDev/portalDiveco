<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Indicador de progreso superior -->
    <div
      class="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 animate-pulse-soft"
    ></div>

    <!-- Sidebar fijo -->
    <AppSidebar
      :is-open="sidebarOpen"
      :is-compact="sidebarCompact"
      @close="closeSidebar"
    />

    <!-- Contenedor principal -->
    <div
      class=""
      :class="[
        'flex flex-col min-h-screen transition-all duration-500 ease-in-out',
        sidebarCompact ? 'lg:ml-16' : 'lg:ml-56',
      ]"
      :style="{
        transitionProperty: 'margin-left',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }"
    >
      <!-- Header fijo -->
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <!-- Contenedor de contenido -->
      <main class="flex-1 pt-12 overflow-auto">
        <!-- Breadcrumbs (si existen) - Ancho completo -->
        <div
          v-if="breadcrumbs.length > 0"
          class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 flex-shrink-0 w-full"
          style="box-shadow: var(--diveco-shadow)"
        >
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li v-for="(crumb, index) in breadcrumbs" :key="index">
                <div class="flex items-center">
                  <UIcon
                    v-if="index > 0"
                    name="i-heroicons-chevron-right"
                    class="h-4 w-4 text-blue-400 mr-2 animate-pulse-soft"
                  />
                  <NuxtLink
                    v-if="crumb.href && index < breadcrumbs.length - 1"
                    :to="crumb.href"
                    class="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover-scale interactive"
                  >
                    {{ crumb.title }}
                  </NuxtLink>
                  <span v-else class="text-sm font-semibold text-gradient">
                    {{ crumb.title }}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <!-- Área de contenido principal -->
        <div class="flex-1 p-6 animate-fade-in-up">
          <!-- Loading overlay -->
          <div
            v-if="appState.loading"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <div
              class="bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center space-y-4 shadow-2xl animate-fade-in-up"
              style="box-shadow: var(--diveco-shadow-lg)"
            >
              <div class="relative">
                <div
                  class="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"
                ></div>
                <div
                  class="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"
                ></div>
              </div>
              <div class="text-center">
                <p class="text-lg font-semibold text-gradient">Cargando...</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Portal Diveco
                </p>
              </div>
            </div>
          </div>
          <slot />
        </div>
      </main>

      <div class="fixed z-50 bottom-0 left-0 right-0 flex justify-center">
        <img src="/logo-uts.png" alt="Diveco" class="w-64 h-64" />
      </div>
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

// Composable para gestión del estado del layout
const {
  sidebarOpen,
  sidebarCompact,
  breadcrumbs,
  appState,
  toggleSidebar,
  closeSidebar,
  initializeTheme,
  initializePreferences,
  setupRouteWatcher,
} = useLayoutState();

// Meta tags
useSeoMeta({
  title: "Portal Diveco - Herramientas Internas",
  description:
    "Portal interno de Diveco para acceso a herramientas y recursos corporativos",
});

// Inicialización
onMounted(() => {
  initializeTheme();
  initializePreferences();
  setupRouteWatcher();
});
</script>
