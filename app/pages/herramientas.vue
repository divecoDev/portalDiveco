<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-cyan-950"
  >
    <!-- Header de la página -->
    <div
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              🔧 Herramientas
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              Accede a todas las herramientas y utilidades disponibles
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Grid de herramientas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Herramienta: Contraseñas SAP -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-key" class="w-6 h-6 text-white" />
                </div>
                <div class="ml-3">
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    Contraseñas SAP
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Gestión de usuarios
                  </p>
                </div>
              </div>
            </div>

            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Reinicia contraseñas y desbloquea usuarios del sistema SAP
            </p>

            <div class="flex items-center justify-between">
              <div
                class="flex items-center text-sm text-gray-500 dark:text-gray-400"
              >
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4 mr-1" />
                <span>Requiere permisos</span>
              </div>

              <NuxtLink
                to="/tools/contrasenias-sap"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Acceder
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Herramienta: Explosión de Materiales -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-squares-2x2"
                    class="w-6 h-6 text-white"
                  />
                </div>
                <div class="ml-3">
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    Explosión de Materiales
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Gestión de BOM
                  </p>
                </div>
              </div>
            </div>

            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Gestión de explosión de materiales
            </p>

            <div class="flex items-center justify-between">
              <div
                class="flex items-center text-sm text-gray-500 dark:text-gray-400"
              >
                <UIcon name="i-heroicons-squares-plus" class="w-4 h-4 mr-1" />
                <span>Producción</span>
              </div>

              <NuxtLink
                to="/tools/explosion-materiales"
                class="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
              >
                Acceder
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Herramienta: Test Reset Password -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-beaker" class="w-6 h-6 text-white" />
                </div>
                <div class="ml-3">
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    Test Reset Password
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Herramienta de pruebas
                  </p>
                </div>
              </div>
            </div>

            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Página de pruebas para debugging del sistema de reinicio de
              contraseñas
            </p>

            <div class="flex items-center justify-between">
              <div
                class="flex items-center text-sm text-gray-500 dark:text-gray-400"
              >
                <UIcon name="i-heroicons-bug-ant" class="w-4 h-4 mr-1" />
                <span>Desarrollo</span>
              </div>

              <NuxtLink
                to="/test-reset-password"
                class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Acceder
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Placeholder para más herramientas -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300"
        >
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <UIcon name="i-heroicons-plus" class="w-6 h-6 text-gray-400" />
            </div>
            <h3
              class="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              Más herramientas próximamente
            </h3>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Nuevas funcionalidades estarán disponibles pronto
            </p>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div
        class="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-6 h-6 text-blue-600 dark:text-blue-400"
            />
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100">
              Información sobre las herramientas
            </h3>
            <div class="mt-2 text-blue-700 dark:text-blue-200">
              <ul class="list-disc list-inside space-y-1 text-sm">
                <li>Todas las herramientas requieren autenticación</li>
                <li>Algunas funcionalidades requieren permisos específicos</li>
                <li>Los logs de actividad se registran para auditoría</li>
                <li>En caso de problemas, contacta al equipo de TI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta tags para SEO
useSeoMeta({
  title: "Herramientas - Portal Diveco",
  description:
    "Accede a todas las herramientas y utilidades disponibles en el Portal Diveco",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();

setBreadcrumbs([{ title: "Inicio", href: "/" }, { title: "Herramientas" }]);
</script>
