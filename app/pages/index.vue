<template>
  <div>
    <!-- Hero Section -->
    <div
      class="relative overflow-hidden bg-gradient-diveco rounded-lg shadow-lg mb-8 animate-fade-in-up"
      style="box-shadow: var(--diveco-shadow)"
    >
      <!-- Decorative background element -->
      <div class="absolute inset-0 opacity-10">
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl animate-pulse-soft"
        ></div>
      </div>

      <!-- Content -->
      <div class="relative px-6 py-4 sm:px-8 sm:py-6">
        <div class="flex items-center justify-between">
          <!-- Logo and Welcome -->
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img
                src="/2-hijo-dormilon-sobre-medidor-de-confort.png"
                alt="Diveco"
                class="w-20 h-20 object-contain"
              />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white sm:text-3xl">
                Bienvenido al Portal
                <span class="text-cyan-300">DIVECO</span>
              </h1>
              <p class="text-cyan-100 text-sm sm:text-base mt-1">
                Accede a tus herramientas empresariales
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Herramientas Principales -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Herramientas Principales
        </h2>
        <NuxtLink
          to="/herramientas"
          class="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium transition-colors duration-200 hover-scale interactive"
        >
          Ver todas →
        </NuxtLink>
      </div>

      <!-- Indicador de carga -->
      <div v-if="isLoadingGroups" class="flex justify-center py-12">
        <div class="flex items-center space-x-3 text-gray-500">
          <div
            class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-lg">Verificando permisos...</span>
        </div>
      </div>

      <!-- Herramientas disponibles -->
      <div
        v-else-if="mainTools.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="(tool, index) in mainTools"
          :key="tool.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer hover-lift interactive border border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-700 animate-fade-in-up"
          :style="`box-shadow: var(--diveco-shadow); transition: box-shadow 0.3s ease, transform 0.3s ease; animation-delay: ${
            index * 0.1
          }s;`"
          @click="navigateToTool(tool.route)"
        >
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div
                class="flex-shrink-0 p-2 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg"
              >
                <UIcon
                  :name="getModuleIcon(tool.name)"
                  class="h-12 w-12 text-cyan-600 dark:text-cyan-400 transition-transform duration-200 hover:scale-110"
                />
              </div>
              <div class="ml-5">
                <h3
                  class="text-xl font-bold text-gray-900 dark:text-white mb-1"
                >
                  {{ tool.name }}
                </h3>
                <p class="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                  {{ tool.category }}
                </p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              {{ tool.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay herramientas disponibles -->
      <div v-else class="text-center py-12">
        <div
          class="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
        >
          <UIcon
            name="i-heroicons-information-circle"
            class="h-16 w-16 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay herramientas disponibles
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Contacta a tu administrador para obtener acceso a las herramientas
            del sistema.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Definir el layout
definePageMeta({
  layout: "default",
});

// Composables
const { hasGroup, isLoading: isLoadingGroups } = useUserGroups();

// Datos reactivos
// Herramientas principales con control de acceso
const mainTools = computed(() => {
  const tools = [];

  // Mostrar herramienta de contraseñas si es ADMIN o SAP-USER-ADMIN
  if (hasGroup("ADMIN") || hasGroup("SAP-USER-ADMIN")) {
    tools.push({
      id: 1,
      name: "Gestión de Contraseñas SAP",
      category: "Auto Gestión",
      description:
        "Reinicia contraseñas y desbloquea usuarios SAP de forma autogestionada.",
      icon: "i-heroicons-key",
      iconColor: "text-cyan-600",
      route: "/tools/contrasenias-sap",
      lastUpdate: "Hoy",
      status: "active",
    });

  }

  // Mostrar herramienta de Explosión si es EXPLOSION, REVISAR-EXPLOSION o ADMIN
  if (hasGroup("EXPLOSION") || hasGroup("REVISAR-EXPLOSION") || hasGroup("ADMIN")) {
    tools.push({
      id: 2,
      name: "Explosión de Materiales",
      category: "Producción",
      description: (hasGroup("REVISAR-EXPLOSION") && !hasGroup("EXPLOSION") && !hasGroup("ADMIN"))
        ? "Visualización de documentos de explosión de materiales" 
        : "Gestión de explosión de materiales",
      icon: "i-heroicons-squares-2x2",
      iconColor: "text-cyan-600",
      route: "/tools/explosion-materiales",
      lastUpdate: "Hoy",
      status: "active",
    });

    // Solo mostrar SUIC para EXPLOSION o ADMIN
    if (hasGroup("EXPLOSION") || hasGroup("ADMIN")) {
      tools.push({
        id: 3,
        name: "SUIC",
        category: "Procesos",
        description: "Gestión de cargas SUIC para el sistema",
        icon: "i-heroicons-chart-bar",
        iconColor: "text-cyan-600",
        route: "/tools/suic",
        lastUpdate: "Hoy",
        status: "active",
      });
    }
  }

  return tools;
});

// Métodos
const navigateToTool = (route) => {
  navigateTo(route);
};

const getModuleIcon = (toolName) => {
  const iconMap = {
    "Gestión de Contraseñas SAP": "i-heroicons-key",
    "Explosión de Materiales": "i-heroicons-squares-2x2",
    "SUIC": "i-heroicons-chart-bar",
    "Gestión de Inventario": "i-heroicons-cube",
    "Reportes Financieros": "i-heroicons-chart-pie",
    "Control de Calidad": "i-heroicons-shield-check",
    "Gestión de Personal": "i-heroicons-user-group",
    "Planificación MRP": "i-heroicons-cog-6-tooth",
    "Dashboard Ejecutivo": "i-heroicons-presentation-chart-line",
    "Sistema de Ventas": "i-heroicons-shopping-cart",
    Contabilidad: "i-heroicons-calculator",
    "Recursos Humanos": "i-heroicons-users",
    Producción: "i-heroicons-wrench-screwdriver",
    Compras: "i-heroicons-shopping-bag",
    Logística: "i-heroicons-truck",
    CRM: "i-heroicons-phone",
    "BI Analytics": "i-heroicons-chart-bar-square",
  };

  return iconMap[toolName] || "i-heroicons-squares-2x2";
};

// Meta tags
useSeoMeta({
  title: "Portal Diveco - Inicio",
  description:
    "Portal interno de Diveco para acceso a herramientas corporativas",
});
</script>
