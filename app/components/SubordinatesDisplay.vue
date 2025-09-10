<template>
  <!-- Current User Section -->
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
  >
    <!-- User Content -->
    <div class="w-full">
      <!-- Loading State -->
      <div
        v-if="loadingGraphUserData || !graphUserData"
        class="text-center py-8"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-500 dark:text-gray-400">
          <span v-if="loadingGraphUserData"
            >Cargando información del usuario...</span
          >
          <span v-else-if="graphUserError">Error: {{ graphUserError }}</span>
          <span v-else>Preparando datos del usuario...</span>
        </p>
      </div>

      <!-- User Info -->
      <div v-else class="w-full">
        <div class="group relative p-6">
          <!-- SAP Status Indicator -->
          <div class="absolute top-4 right-4 z-20">
            <div
              :class="[
                'flex items-center p-2 rounded-full text-xs font-medium',
                currentUserHasSap
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              ]"
            >
              <UIcon
                :name="
                  currentUserHasSap
                    ? 'i-heroicons-check-circle'
                    : 'i-heroicons-x-circle'
                "
                class="w-3 h-3"
              />
            </div>
          </div>

          <!-- Decorative gradient overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>

          <!-- Content -->
          <div class="relative z-10">
            <!-- User Avatar and Basic Info -->
            <div class="flex items-center space-x-4 mb-6">
              <div class="flex-shrink-0">
                <div class="relative w-16 h-16">
                  <!-- User Photo -->
                  <img
                    v-if="currentUserPhoto"
                    :src="currentUserPhoto"
                    :alt="graphUserData.displayName"
                    class="w-16 h-16 rounded-full object-cover shadow-lg transition-shadow duration-300 group-hover:shadow-xl"
                  />
                  <!-- Fallback to Initials -->
                  <div
                    v-else
                    class="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 group-hover:shadow-xl"
                  >
                    <span class="text-xl font-bold text-cyan-600">
                      {{ getInitials(graphUserData.displayName || "Usuario") }}
                    </span>
                  </div>
                  <!-- Loading indicator for photo -->
                  <div
                    v-if="loadingCurrentUserPhoto"
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full"
                  >
                    <div
                      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200"
                >
                  {{ graphUserData.displayName || "Usuario" }}
                </h3>
                <p
                  class="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1"
                >
                  <UIcon
                    name="i-heroicons-envelope"
                    class="w-4 h-4 mr-2 text-gray-400"
                  />
                  {{ graphUserData.mail || graphUserData.userPrincipalName }}
                </p>
                <p
                  v-if="graphUserData.jobTitle"
                  class="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center"
                >
                  <UIcon
                    name="i-heroicons-briefcase"
                    class="w-3 h-3 mr-1 text-gray-400"
                  />
                  {{ graphUserData.jobTitle }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="currentUserHasSap" class="flex space-x-3">
              <UButton
                size="sm"
                variant="outline"
                :disabled="!currentUserHasSap || loadingCurrentUserSap"
                :class="[
                  'flex-1 justify-center transition-transform duration-200',
                  currentUserHasSap && !loadingCurrentUserSap
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50',
                ]"
                @click="
                  currentUserHasSap
                    ? selectCitizenForAction(
                        {
                          displayName: graphUserData.displayName || 'Usuario',
                          mail:
                            graphUserData.mail ||
                            graphUserData.userPrincipalName,
                          id: graphUserData.id,
                          hasSapUser: currentUserHasSap,
                        },
                        'reset'
                      )
                    : null
                "
              >
                <UIcon name="i-heroicons-key" class="w-4 h-4 mr-2" />
                <span v-if="loadingCurrentUserSap">Verificando...</span>
                <span v-else>Autoreinicio</span>
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                :disabled="!currentUserHasSap || loadingCurrentUserSap"
                :class="[
                  'flex-1 justify-center transition-transform duration-200',
                  currentUserHasSap && !loadingCurrentUserSap
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50',
                ]"
                @click="
                  currentUserHasSap
                    ? selectCitizenForAction(
                        {
                          displayName: graphUserData.displayName || 'Usuario',
                          mail:
                            graphUserData.mail ||
                            graphUserData.userPrincipalName,
                          id: graphUserData.id,
                          hasSapUser: currentUserHasSap,
                        },
                        'unlock'
                      )
                    : null
                "
              >
                <UIcon name="i-heroicons-lock-open" class="w-4 h-4 mr-2" />
                <span v-if="loadingCurrentUserSap">Verificando...</span>
                <span v-else>Autodesbloqueo</span>
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Subordinates Section -->
  <div
    v-if="directReports.length > 0"
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
  >
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-users"
            class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-3"
          />
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ciudadanos a Cargo
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <span v-if="isLoadingReports"
                >Cargando jerarquía de ciudadanos...</span
              >
              <span v-else-if="reportsError">Error al cargar ciudadanos</span>
              <span v-else>
                {{ directReports.length }} ciudadano{{
                  directReports.length !== 1 ? "s" : ""
                }}
                directo{{ directReports.length !== 1 ? "s" : "" }}
                <span v-if="getTotalSubordinatesCount() > 0">
                  ({{ getTotalPeopleInHierarchy() }} en total incluyendo
                  subordinados)
                </span>
              </span>
            </p>
          </div>
        </div>
        <div class="flex space-x-2">
          <!-- Botones para expandir/contraer jerarquía -->
          <div
            v-if="
              isExpanded &&
              directReports.length > 0 &&
              getAllCitizenIdsWithSubordinates(directReports).length > 0
            "
            class="flex space-x-1"
          >
            <UButton
              @click="expandAllHierarchy"
              variant="ghost"
              size="sm"
              icon="i-heroicons-plus-circle"
              :disabled="isAllHierarchyExpanded"
              class="text-xs"
            >
              Expandir Todo
            </UButton>
            <UButton
              @click="collapseAllHierarchy"
              variant="ghost"
              size="sm"
              icon="i-heroicons-minus-circle"
              :disabled="
                !isAllHierarchyExpanded && expandedSubordinates.size === 0
              "
              class="text-xs"
            >
              Contraer Todo
            </UButton>
          </div>

          <!-- Botón principal expandir/contraer sección -->
          <UButton
            @click="toggleExpanded"
            variant="ghost"
            size="sm"
            :icon="
              isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
            "
          >
            {{ isExpanded ? "Contraer" : "Expandir" }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="isExpanded" class="p-6">
      <!-- Loading State -->
      <div v-if="isLoadingReports" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-500 dark:text-gray-400">
          Cargando ciudadanos a cargo...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="reportsError" class="text-center py-8">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-12 h-12 text-red-400 mx-auto mb-4"
        />
        <p class="text-red-500 dark:text-red-400 mb-2">
          Error al cargar ciudadanos
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ reportsError }}
        </p>
      </div>

      <!-- Empty State -->
      <div v-else-if="directReports.length === 0" class="text-center py-8">
        <UIcon
          name="i-heroicons-user-group"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-500 dark:text-gray-400">
          No tienes ciudadanos a cargo asignados
        </p>
      </div>

      <!-- Hierarchical Citizens Display -->
      <div v-else class="space-y-3">
        <CitizenHierarchyItem
          v-for="citizen in directReports"
          :key="citizen.id"
          :citizen="citizen"
          :user-photos="userPhotos"
          :loading-photos="loadingPhotos"
          :expanded-subordinates="expandedSubordinates"
          :level="0"
          @citizen-selected="selectCitizenForAction"
          @toggle-subordinates="toggleSubordinateExpansion"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

const user = ref(null);

// Generar cliente de Amplify
const client = generateClient();

const props = defineProps({
  subordinates: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["citizen-selected"]);

// Reactive data
const isExpanded = ref(true);

// Estado reactivo para Microsoft Graph API
const directReports = ref([]);
const isLoadingReports = ref(false);
const reportsError = ref(null);
const userPhotos = ref(new Map()); // Cache de fotos de usuario
const loadingPhotos = ref(new Set()); // IDs de usuarios cuyas fotos se están cargando
const sapUsersCache = ref(new Map()); // Cache de usuarios SAP
const loadingSapUsers = ref(new Set()); // IDs de usuarios cuyas verificaciones SAP se están cargando
const expandedSubordinates = ref(new Set()); // IDs de subordinados expandidos

// Estado reactivo para el usuario actual
const currentUserHasSap = ref(false);
const loadingCurrentUserSap = ref(false);
const currentUserPhoto = ref(null);
const loadingCurrentUserPhoto = ref(false);
const graphUserData = ref(null);
const loadingGraphUserData = ref(false);
const graphUserError = ref(null);

// Función para obtener la foto de perfil de un usuario
const getUserPhoto = async (userId) => {
  if (!userId) {
    console.error("userId es requerido para obtener la foto");
    return null;
  }

  // Si ya está en cache, devolverla
  if (userPhotos.value.has(userId)) {
    return userPhotos.value.get(userId);
  }

  // Si ya se está cargando, no hacer otra petición
  if (loadingPhotos.value.has(userId)) {
    return null;
  }

  loadingPhotos.value.add(userId);

  try {
    const data = await $fetch("/api/microsoft-graph/user-photo", {
      method: "POST",
      body: {
        userId: userId,
      },
    });

    if (data.success) {
      const photoData = data.hasPhoto ? data.photoData : null;
      userPhotos.value.set(userId, photoData);

      return photoData;
    } else {
      console.error("Error en la respuesta del servidor para foto");
      userPhotos.value.set(userId, null);
      return null;
    }
  } catch (error) {
    console.error(`Error obteniendo foto para usuario ${userId}:`, error);
    userPhotos.value.set(userId, null);
    return null;
  } finally {
    loadingPhotos.value.delete(userId);
  }
};

// Función para verificar si un usuario existe en SAP
const checkSapUser = async (email) => {
  if (!email) {
    console.error("Email es requerido para verificar usuario SAP");
    return false;
  }

  // Si ya está en cache, devolverlo
  if (sapUsersCache.value.has(email)) {
    return sapUsersCache.value.get(email);
  }

  // Si ya se está cargando, no hacer otra petición
  if (loadingSapUsers.value.has(email)) {
    return false;
  }

  loadingSapUsers.value.add(email);

  try {
    const data = await $fetch("/api/sap/existUserAndIsActive", {
      query: {
        email: email,
      },
    });

    if (data.status === 200) {
      const hasSapUser = data.sapUser !== false;
      sapUsersCache.value.set(email, hasSapUser);

      return hasSapUser;
    } else {
      console.error("Error en la respuesta del servidor para usuario SAP");
      sapUsersCache.value.set(email, false);
      return false;
    }
  } catch (error) {
    console.error(`Error verificando usuario SAP para ${email}:`, error);
    sapUsersCache.value.set(email, false);
    return false;
  } finally {
    loadingSapUsers.value.delete(email);
  }
};

// Función para cargar fotos de todos los ciudadanos
const loadAllUserPhotos = async (citizens) => {
  if (!citizens || citizens.length === 0) return;

  // Cargar fotos en paralelo para mejor rendimiento
  const photoPromises = citizens.map((citizen) => getUserPhoto(citizen.id));
  await Promise.all(photoPromises);
};

// Función para verificar usuarios SAP de todos los ciudadanos
const checkAllSapUsers = async (citizens) => {
  if (!citizens || citizens.length === 0) return;

  // Verificar usuarios SAP en paralelo para mejor rendimiento
  const sapPromises = citizens.map((citizen) => checkSapUser(citizen.mail));
  const sapResults = await Promise.all(sapPromises);

  // Actualizar el estado hasSapUser de cada ciudadano
  citizens.forEach((citizen, index) => {
    citizen.hasSapUser = sapResults[index];
  });
};

// Función para verificar si el usuario actual existe en SAP
const checkCurrentUserSap = async () => {
  // Usar email de Microsoft Graph si está disponible, sino usar datos de Amplify
  const email =
    graphUserData.value?.mail ||
    graphUserData.value?.userPrincipalName ||
    user.value?.signInDetails?.loginId ||
    user.value?.username;

  if (!email) {
    console.error("No se puede verificar usuario SAP: email no disponible");
    return;
  }

  loadingCurrentUserSap.value = true;

  try {
    const hasSap = await checkSapUser(email);
    currentUserHasSap.value = hasSap;
  } catch (error) {
    console.error("Error verificando usuario SAP actual:", error);
    currentUserHasSap.value = false;
  } finally {
    loadingCurrentUserSap.value = false;
  }
};

// Función para obtener datos del usuario desde Microsoft Graph
const getGraphUserData = async (userName) => {
  if (!userName) {
    console.error(
      "userName es requerido para obtener datos de Microsoft Graph"
    );
    return null;
  }

  loadingGraphUserData.value = true;
  graphUserError.value = null;

  try {
    const data = await $fetch("/api/microsoft-graph/user-info", {
      method: "POST",
      body: {
        userName: userName,
      },
    });

    if (data.success) {
      graphUserData.value = data.userData;

      return data.userData;
    } else {
      throw new Error("Error en la respuesta del servidor");
    }
  } catch (error) {
    graphUserError.value =
      error.message || "Error desconocido al obtener datos del usuario";
    console.error("Error obteniendo datos de Microsoft Graph:", error);
    graphUserData.value = null;
    return null;
  } finally {
    loadingGraphUserData.value = false;
  }
};

// Función para cargar la foto del usuario actual
const loadCurrentUserPhoto = async () => {
  // Usar el ID real de Microsoft Graph si está disponible
  const userId = user.value?.email;

  if (!userId) {
    console.error("No se puede cargar foto: userId no disponible");
    return;
  }

  loadingCurrentUserPhoto.value = true;

  try {
    const photo = await getUserPhoto(userId);
    currentUserPhoto.value = photo;
  } catch (error) {
    console.error("Error cargando foto del usuario actual:", error);
    currentUserPhoto.value = null;
  } finally {
    loadingCurrentUserPhoto.value = false;
  }
};

// Lista de usuarios problemáticos conocidos que pueden causar errores
const problematicUsers = new Set([
  "pruebas@camasolympia.onmicrosoft.com",
  // Agregar otros usuarios problemáticos aquí si se identifican
]);

// Función para consultar directReports de un usuario específico (sin cambiar el estado global)
const getDirectReportsForUser = async (userName) => {
  if (!userName) {
    console.error("userName es requerido");
    return [];
  }

  // Verificar si es un usuario problemático conocido
  if (problematicUsers.has(userName)) {
    console.warn(
      `⚠️ Saltando consulta para usuario problemático conocido: ${userName}`
    );
    return [];
  }

  try {
    const data = await $fetch("/api/microsoft-graph/direct-reports", {
      method: "POST",
      body: {
        userName: userName,
      },
    });

    if (data.success && data.directReports.value) {
      return data.directReports.value;
    } else {
      return [];
    }
  } catch (error) {
    // Manejo más específico de errores
    if (
      error.status === 404 ||
      error.message.includes("Request_ResourceNotFound")
    ) {
      console.warn(`⚠️ Usuario no encontrado en Microsoft Graph: ${userName}`);
      // Agregar automáticamente a la lista de usuarios problemáticos
      problematicUsers.add(userName);
    } else if (error.status === 500) {
      console.warn(
        `⚠️ Error del servidor para usuario: ${userName} - Continuando con otros usuarios`
      );
      // Agregar automáticamente a la lista de usuarios problemáticos
      problematicUsers.add(userName);
    } else {
      console.error(
        `❌ Error consultando directReports para ${userName}:`,
        error.message
      );
    }
    return []; // Devolver array vacío para continuar con otros usuarios
  }
};

// Función recursiva para obtener toda la jerarquía de subordinados
const getDirectReportsRecursive = async (
  userName,
  maxDepth = 3,
  currentDepth = 0
) => {
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const reports = await getDirectReportsForUser(userName);

    if (!reports || reports.length === 0) {
      return [];
    }

    // Procesar cada reporte y obtener sus subordinados recursivamente
    const processedReports = await Promise.all(
      reports.map(async (report) => {
        const processedReport = {
          ...report,
          hasSapUser: false, // Se actualizará después
          subordinates: [], // Inicializar array de subordinados
          subordinatesCount: 0, // Contador total de subordinados (incluyendo niveles profundos)
          hasSubordinates: false, // Indicador si tiene subordinados directos
        };

        // Obtener subordinados de este reporte recursivamente
        const subordinates = await getDirectReportsRecursive(
          report.mail || report.userPrincipalName,
          maxDepth,
          currentDepth + 1
        );

        processedReport.subordinates = subordinates;
        processedReport.hasSubordinates = subordinates.length > 0;

        // Calcular el total de subordinados (incluyendo niveles profundos)
        processedReport.subordinatesCount =
          subordinates.length +
          subordinates.reduce((total, sub) => total + sub.subordinatesCount, 0);

        return processedReport;
      })
    );

    return processedReports;
  } catch (error) {
    console.error(
      `Error en getDirectReportsRecursive para ${userName}:`,
      error
    );
    return [];
  }
};

// Función para consultar directReports de un usuario (función principal)
const getDirectReports = async (userName) => {
  if (!userName) {
    console.error("userName es requerido");
    return;
  }

  isLoadingReports.value = true;
  reportsError.value = null;

  try {
    // Obtener toda la jerarquía de subordinados recursivamente
    const hierarchicalReports = await getDirectReportsRecursive(userName);

    if (hierarchicalReports.length > 0) {
      // Calcular totales correctamente
      const totalSubordinatesOnly = hierarchicalReports.reduce(
        (total, report) => total + report.subordinatesCount,
        0
      );
      const totalPeopleInHierarchy =
        hierarchicalReports.length + totalSubordinatesOnly;

      directReports.value = hierarchicalReports;
      // Verificar usuarios SAP para todos los ciudadanos (incluyendo subordinados)
      const allCitizens = getAllCitizensFlat(hierarchicalReports);
      await checkAllSapUsers(allCitizens);

      // Cargar fotos de todos los ciudadanos (incluyendo subordinados)
      await loadAllUserPhotos(allCitizens);
    } else {
      directReports.value = [];
    }
  } catch (error) {
    reportsError.value =
      error.message || "Error desconocido al consultar directReports";
    console.error("Error consultando directReports:", error);
    directReports.value = [];
  } finally {
    isLoadingReports.value = false;
  }
};

// Función auxiliar para obtener todos los ciudadanos en una lista plana (para verificaciones SAP y fotos)
const getAllCitizensFlat = (reports) => {
  const allCitizens = [];

  const addCitizensRecursively = (citizensList) => {
    citizensList.forEach((citizen) => {
      allCitizens.push(citizen);
      if (citizen.subordinates && citizen.subordinates.length > 0) {
        addCitizensRecursively(citizen.subordinates);
      }
    });
  };

  addCitizensRecursively(reports);
  return allCitizens;
};

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    // Obtener información del usuario actual de Amplify
    user.value = await fetchUserAttributes();

    // TEMPORAL: Usar email específico para pruebas
    const testEmail = user.value.email;

    // Obtener datos completos del usuario desde Microsoft Graph
    await getGraphUserData(testEmail);

    // Verificar si el usuario actual tiene acceso SAP (usando datos de Microsoft Graph)
    await checkCurrentUserSap();

    // Cargar foto del usuario actual (usando ID real de Microsoft Graph)
    await loadCurrentUserPhoto();

    // Consultar directReports usando el email del usuario
    await getDirectReports(testEmail);
  } catch (error) {
    console.error("Error inicial obteniendo datos:", error);
  }
});

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Función para guardar historial de operaciones (éxito o error)
const saveActionHistory = async (
  sapUser,
  response,
  action,
  isSuccess = true
) => {
  try {
    console.log("📝 ===== GUARDANDO HISTORIAL DE OPERACIÓN =====");

    // Obtener el usuario logueado
    const currentUser = await getCurrentUser();
    const loggedUserEmail =
      currentUser?.signInDetails?.loginId ||
      currentUser?.username ||
      "usuario-desconocido";

    console.log("👤 Usuario logueado:", loggedUserEmail);
    console.log("🎯 Usuario SAP:", sapUser);
    console.log("📊 Respuesta a guardar:", response);
    console.log("🎯 Acción:", action);
    console.log("✅ Es éxito:", isSuccess);

    // Preparar los datos del historial
    const historyData = {
      sapUser: sapUser,
      emailOwner: loggedUserEmail,
      accion: action === "reset" ? "RESET_PASSWORD" : "UNLOCK_USER",
      status: isSuccess ? "Completado" : "Error",
      logs: JSON.stringify(response),
      date: new Date().toISOString(),
    };

    console.log("💾 Datos del historial:", historyData);

    // Guardar en la base de datos usando Amplify
    const { errors, data: historyResponse } =
      await client.models.SapUserActionHistory.create(historyData);

    if (errors) {
      console.error("❌ Errores al guardar historial:", errors);
      return null;
    }

    console.log("✅ Historial guardado exitosamente:", historyResponse);

    return historyResponse;
  } catch (error) {
    console.error("❌ Error al guardar historial:", error);
    // No lanzamos el error para que no afecte el flujo principal
    return null;
  }
};

const selectCitizenForAction = (citizen, action) => {
  emit("citizen-selected", { citizen, action });
};

// Funciones para manejar la expansión de subordinados
const toggleSubordinateExpansion = (citizenId) => {
  if (expandedSubordinates.value.has(citizenId)) {
    expandedSubordinates.value.delete(citizenId);
  } else {
    expandedSubordinates.value.add(citizenId);
  }
};

const isSubordinateExpanded = (citizenId) => {
  return expandedSubordinates.value.has(citizenId);
};

// Función para calcular el total de subordinados en toda la jerarquía
const getTotalSubordinatesCount = () => {
  return directReports.value.reduce((total, citizen) => {
    return total + citizen.subordinatesCount; // Solo los subordinados, no contar el ciudadano directo
  }, 0);
};

// Función para obtener el total de personas en la jerarquía (directos + subordinados)
const getTotalPeopleInHierarchy = () => {
  return directReports.value.length + getTotalSubordinatesCount();
};

// Función para obtener todos los IDs de ciudadanos con subordinados
const getAllCitizenIdsWithSubordinates = (citizens) => {
  const ids = [];

  const collectIds = (citizensList) => {
    citizensList.forEach((citizen) => {
      if (citizen.hasSubordinates) {
        ids.push(citizen.id);
        collectIds(citizen.subordinates);
      }
    });
  };

  collectIds(citizens);
  return ids;
};

// Función para expandir toda la jerarquía
const expandAllHierarchy = () => {
  const allIds = getAllCitizenIdsWithSubordinates(directReports.value);
  allIds.forEach((id) => expandedSubordinates.value.add(id));
};

// Función para contraer toda la jerarquía
const collapseAllHierarchy = () => {
  expandedSubordinates.value.clear();
};

// Función para verificar si toda la jerarquía está expandida
const isAllHierarchyExpanded = computed(() => {
  const allIds = getAllCitizenIdsWithSubordinates(directReports.value);
  return (
    allIds.length > 0 &&
    allIds.every((id) => expandedSubordinates.value.has(id))
  );
});

// Exponer funciones para uso externo
defineExpose({
  saveActionHistory,
});
</script>

<style scoped>
/* Animaciones suaves y efectos mejorados */
.transition-colors {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Hover effects */
.group:hover .group-hover\:shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:-translate-y-1:hover {
  transform: translateY(-0.25rem);
}

/* Custom gradient backgrounds */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Improved card shadow on hover */
.hover\:shadow-lg:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .group:hover .group-hover\:shadow-xl {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.25),
      0 10px 10px -5px rgba(0, 0, 0, 0.1);
  }

  .hover\:shadow-lg:hover {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.3),
      0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }
}
</style>
