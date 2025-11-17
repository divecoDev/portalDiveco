<template>
  <div class="min-h-screen">
    <!-- Header de la página -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h1
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon
                name="i-heroicons-plus-circle"
                class="w-7 h-7 text-white"
              />
            </div>
            Nueva Unificación de BOOMs
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Selecciona los BOOMs que deseas unificar
          </p>
        </div>

        <!-- Botón volver -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/tools/explosion-materiales/unificaciones-boom">
            <UButton
              icon="i-heroicons-arrow-left"
              color="gray"
              variant="outline"
              size="md"
            >
              Volver
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Formulario de descripción -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden mb-6"
      >
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div class="flex items-center">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-white mr-3" />
            <h2 class="text-xl font-semibold text-white">Información de la Unificación</h2>
          </div>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción de la Unificación *
              </label>
              <UInput
                v-model="descripcion"
                placeholder="Ej: Unificación Q1 2024 - Centros GT, SV, CR"
                size="lg"
                :error="errors.descripcion"
                class="w-full"
              />
              <p v-if="errors.descripcion" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.descripcion }}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Proporciona una descripción clara que identifique esta unificación
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-600 dark:text-gray-300">
            Cargando explosiones de materiales...
          </p>
        </div>
      </div>

      <!-- Layout de 2 columnas -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- COLUMNA IZQUIERDA: BOOMs Disponibles -->
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 text-white mr-3" />
                <h2 class="text-xl font-semibold text-white">BOOMs Disponibles</h2>
              </div>
              <UBadge color="white" variant="solid" size="sm">
                {{ availableBooms.length }}
              </UBadge>
            </div>
          </div>

          <!-- Búsqueda -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar por versión o descripción..."
              size="md"
              class="w-full"
            />
          </div>

          <!-- Lista de BOOMs disponibles -->
          <div class="h-[600px] overflow-y-auto">
            <div v-if="availableBooms.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="explosion in availableBooms"
                :key="explosion.id"
                class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                @click="addToUnification(explosion)"
              >
                  <div class="flex items-center gap-3">
                  <div class="flex-1">
                    <div class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center mb-1">
                      <UIcon name="i-heroicons-hashtag" class="w-4 h-4 mr-1" />
                      {{ explosion.version }}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {{ explosion.descripcion }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                      <UIcon name="i-heroicons-calendar" class="w-3 h-3 mr-1" />
                      {{ formatDate(explosion.createdAt) }}
                    </div>
                  </div>
                  <UButton
                    icon="i-heroicons-arrow-right"
                    size="xs"
                    color="cyan"
                    variant="soft"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="addToUnification(explosion)"
                    title="Agregar a unificación"
                  />
                </div>
              </div>
            </div>

            <!-- Estado vacío de disponibles -->
            <div v-else class="flex flex-col items-center justify-center h-full p-8 text-center">
              <div
                class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-md flex items-center justify-center mb-4"
              >
                <UIcon
                  name="i-heroicons-inbox"
                  class="w-10 h-10 text-gray-400"
                />
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ searchQuery ? "No se encontraron BOOMs" : "Todos los BOOMs han sido agregados" }}
              </p>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: BOOMs Seleccionados -->
        <div
          class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <UIcon name="i-heroicons-squares-plus" class="w-6 h-6 text-white mr-3" />
                <h2 class="text-xl font-semibold text-white">BOOMs a Unificar</h2>
              </div>
              <UBadge color="white" variant="solid" size="sm">
                {{ selectedBooms.length }}
              </UBadge>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div v-if="selectedBooms.length > 0" class="p-4 border-b border-cyan-200 dark:border-cyan-700 bg-cyan-50/50 dark:bg-cyan-900/20">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline mr-1" />
                {{ selectedBooms.length }} BOOM{{ selectedBooms.length !== 1 ? "s" : "" }} seleccionado{{ selectedBooms.length !== 1 ? "s" : "" }}
              </p>
              <UButton
                icon="i-heroicons-x-mark"
                size="xs"
                color="red"
                variant="ghost"
                @click="clearSelection"
              >
                Limpiar Todo
              </UButton>
            </div>
          </div>

          <!-- Lista de BOOMs seleccionados -->
          <div class="h-[600px] overflow-y-auto">
            <div v-if="selectedBooms.length > 0" class="divide-y divide-cyan-200 dark:divide-cyan-700">
              <div
                v-for="(explosion, index) in selectedExplosions"
                :key="explosion.id"
                class="p-4 bg-gradient-to-r from-cyan-50/50 to-transparent dark:from-cyan-900/10 hover:from-cyan-100/50 dark:hover:from-cyan-900/20 transition-colors group"
              >
                <div class="flex items-center gap-3">
                  <!-- Número de orden -->
                  <div
                    class="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  >
                    {{ index + 1 }}
                  </div>

                  <div class="flex-1">
                    <div class="text-sm font-bold text-cyan-700 dark:text-cyan-400 flex items-center mb-1">
                      <UIcon name="i-heroicons-hashtag" class="w-4 h-4 mr-1" />
                      {{ explosion.version }}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {{ explosion.descripcion }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                      <UIcon name="i-heroicons-calendar" class="w-3 h-3 mr-1" />
                      {{ formatDate(explosion.createdAt) }}
                    </div>
                  </div>

                  <UButton
                    icon="i-heroicons-x-mark"
                    size="xs"
                    color="red"
                    variant="ghost"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeFromUnification(explosion.id)"
                    title="Remover de unificación"
                  />
                </div>
              </div>
            </div>

            <!-- Estado vacío de seleccionados -->
            <div v-else class="flex flex-col items-center justify-center h-full p-8 text-center">
              <div
                class="w-24 h-24 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-md flex items-center justify-center mb-4"
              >
                <UIcon
                  name="i-heroicons-arrow-left"
                  class="w-12 h-12 text-cyan-600 dark:text-cyan-400"
                />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Selecciona BOOMs
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                Haz clic en los BOOMs de la columna izquierda para agregarlos a la unificación
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con botón de creación -->
      <div
        v-if="!loading"
        class="mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg border border-cyan-200/30 dark:border-cyan-700/30 p-6"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Información y mensaje de ayuda -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Crear Unificación
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <template v-if="!descripcion || descripcion.trim().length < 5">
                <UIcon
                  name="i-heroicons-information-circle"
                  class="w-4 h-4 inline mr-1"
                />
                <span v-if="!descripcion">Proporciona una descripción antes de continuar</span>
                <span v-else>La descripción debe tener al menos 5 caracteres ({{ descripcion.trim().length }}/5)</span>
              </template>
              <template v-else-if="selectedBooms.length < 2">
                <UIcon
                  name="i-heroicons-information-circle"
                  class="w-4 h-4 inline mr-1"
                />
                Debes seleccionar al menos 2 BOOMs para crear una unificación
              </template>
              <template v-else>
                <UIcon
                  name="i-heroicons-check-circle"
                  class="w-4 h-4 inline mr-1 text-cyan-600"
                />
                Listo para crear unificación con {{ selectedBooms.length }} BOOMs
              </template>
            </p>
          </div>

          <!-- Botón de creación -->
          <div>
            <button
              type="button"
              @click="createUnification"
              :disabled="!isFormValid || creating"
              class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              <div
                v-if="creating"
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              <UIcon v-else name="i-heroicons-plus-circle" class="w-5 h-5" />
              {{ creating ? "Creando..." : "Crear Unificación" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";

definePageMeta({
  middleware: ["require-role"],
  requiredRole: ["EXPLOSION", "ADMIN"],
});

// Cliente de Amplify
const client = generateClient();

// Composables
const toast = useToast();
const { logAction } = useAudit();
const { hasGroup } = useAuth();

// Meta tags para SEO
useSeoMeta({
  title: "Nueva Unificación - Portal Diveco",
  description: "Crea una nueva unificación de explosiones de materiales",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Explosión de Materiales", href: "/tools/explosion-materiales" },
  { title: "Unificaciones", href: "/tools/explosion-materiales/unificaciones-boom" },
  { title: "Nueva Unificación" },
]);

// Estado reactivo
const explosions = ref([]);
const selectedBooms = ref([]);
const loading = ref(false);
const creating = ref(false);
const searchQuery = ref("");
const descripcion = ref("");
const errors = ref({
  descripcion: "",
});

// Computed properties
const availableBooms = computed(() => {
  // Filtrar los que NO están seleccionados
  let available = explosions.value.filter(
    (exp) => !selectedBooms.value.includes(exp.id)
  );

  // Aplicar búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    available = available.filter((explosion) => {
      return (
        explosion.version?.toLowerCase().includes(query) ||
        explosion.descripcion?.toLowerCase().includes(query)
      );
    });
  }

  return available;
});

const selectedExplosions = computed(() => {
  // Obtener los objetos completos de los BOOMs seleccionados en orden
  return selectedBooms.value
    .map((id) => explosions.value.find((exp) => exp.id === id))
    .filter((exp) => exp !== undefined);
});

const isFormValid = computed(() => {
  return descripcion.value.trim().length >= 5 && selectedBooms.value.length >= 2;
});

// Métodos
const fetchExplosions = async () => {
  try {
    loading.value = true;
    
    // Solo traer los campos necesarios para optimizar la carga
    const { data, errors } = await client.models.Boom.list({
      selectionSet: [
        'id',
        'version',
        'descripcion',
        'createdAt',
        'deletedAt'
      ]
    });

    if (errors) {
      console.error("Error fetching Boom explosions:", errors);
      toast.add({
        title: "Error",
        description: "No se pudieron cargar los registros de explosiones",
        color: "red",
      });
      return;
    }

    // Filtrar registros eliminados (soft delete)
    const activeExplosions = (data || []).filter(
      (explosion) =>
        !explosion.deletedAt ||
        explosion.deletedAt === null ||
        explosion.deletedAt === undefined
    );

    explosions.value = activeExplosions;

    // Registrar auditoría
    try {
      await logAction(
        "READ",
        "boom",
        "Boom",
        undefined,
        {
          after: {
            totalRecords: activeExplosions.length,
            records: activeExplosions.map((exp) => ({
              id: exp.id,
              version: exp.version,
              descripcion: exp.descripcion,
            })),
          },
        },
        {
          totalExplosions: activeExplosions.length,
          context: "nueva-unificacion-page",
        }
      );
    } catch (auditError) {
      console.warn("Error al registrar auditoría LIST:", auditError);
    }
  } catch (error) {
    console.error("Error al cargar explosiones:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al cargar las explosiones",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
};

const addToUnification = (explosion) => {
  if (!selectedBooms.value.includes(explosion.id)) {
    selectedBooms.value.push(explosion.id);
    toast.add({
      title: "BOOM agregado",
      description: `Versión ${explosion.version} agregada a la unificación`,
      color: "cyan",
      timeout: 2000,
    });
  }
};

const removeFromUnification = (boomId) => {
  const index = selectedBooms.value.indexOf(boomId);
  if (index > -1) {
    const explosion = explosions.value.find((exp) => exp.id === boomId);
    selectedBooms.value.splice(index, 1);
    toast.add({
      title: "BOOM removido",
      description: `Versión ${explosion?.version} removida de la unificación`,
      color: "orange",
      timeout: 2000,
    });
  }
};

const clearSelection = () => {
  selectedBooms.value = [];
  toast.add({
    title: "Selección limpiada",
    description: "Se ha limpiado la selección de BOOMs",
    color: "cyan",
  });
};

const validateForm = () => {
  errors.value = {
    descripcion: "",
  };

  let isValid = true;

  if (!descripcion.value.trim()) {
    errors.value.descripcion = "La descripción es requerida";
    isValid = false;
  } else if (descripcion.value.trim().length < 5) {
    errors.value.descripcion = "La descripción debe tener al menos 5 caracteres";
    isValid = false;
  }

  if (selectedBooms.value.length < 2) {
    toast.add({
      title: "Selección insuficiente",
      description: "Debes seleccionar al menos 2 BOOMs para crear una unificación",
      color: "orange",
    });
    isValid = false;
  }

  return isValid;
};

const createUnification = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    creating.value = true;

    // Obtener usuario actual de Cognito
    const session = await fetchAuthSession();
    const userEmail = session.tokens?.idToken?.payload?.email || 'unknown';

    // Preparar snapshot de BOOMs incluidos
    const boomsIncluidos = selectedExplosions.value.map(exp => ({
      id: exp.id,
      version: exp.version,
      descripcion: exp.descripcion,
      createdAt: exp.createdAt,
    }));

    // Crear unificación usando el cliente de Amplify
    const { data, errors } = await client.models.BoomUnificacion.create({
      descripcion: descripcion.value.trim(),
      username: userEmail,
      status: "CREADA",
      boomsIncluidos: JSON.stringify(boomsIncluidos),
      aditionalData: JSON.stringify({
        totalBooms: selectedBooms.value.length,
        versions: selectedExplosions.value.map(e => e.version).join(", "),
        createdBy: userEmail,
      })
    });

    if (errors) {
      console.error("Error creating unification:", errors);
      toast.add({
        title: "Error",
        description: "No se pudo crear la unificación",
        color: "red",
      });
      return;
    }

    // Registrar auditoría
    await logAction(
      "CREATE",
      "boom-unificacion",
      "BoomUnificacion",
      data.id,
      {
        after: {
          descripcion: data.descripcion,
          totalBooms: boomsIncluidos.length,
          versions: boomsIncluidos.map(b => b.version),
        }
      }
    );

    toast.add({
      title: "¡Unificación creada!",
      description: `Se ha creado la unificación "${descripcion.value}"`,
      color: "cyan",
      timeout: 4000,
    });

    // Redirigir al listado
    await navigateTo("/tools/explosion-materiales/unificaciones-boom");

  } catch (error) {
    console.error("Error al crear unificación:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al crear la unificación",
      color: "red",
    });
  } finally {
    creating.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "No disponible";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Watch para limpiar errores
watch(descripcion, () => {
  if (errors.value.descripcion && descripcion.value.trim().length >= 5) {
    errors.value.descripcion = "";
  }
});

// Cargar datos al montar el componente
onMounted(() => {
  fetchExplosions();
});
</script>
