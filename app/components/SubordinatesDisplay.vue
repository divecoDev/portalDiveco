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
              <span v-if="isLoadingReports">Cargando ciudadanos...</span>
              <span v-else-if="reportsError">Error al cargar ciudadanos</span>
              <span v-else>
                {{ directReports.length }} ciudadano{{
                  directReports.length !== 1 ? "s" : ""
                }}
                bajo tu supervisión
              </span>
            </p>
          </div>
        </div>
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

      <!-- Citizens Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="citizen in directReports"
          :key="citizen.id"
          :class="[
            'group relative rounded-xl p-6 border transition-all duration-300',
            citizen.hasSapUser
              ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-lg transform hover:-translate-y-1'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed',
          ]"
        >
          <!-- SAP Status Indicator -->
          <div class="absolute top-16 left-16 z-20">
            <div
              :class="[
                'flex items-center p-1 rounded-full text-xs font-medium',
                citizen.hasSapUser
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              ]"
            >
              <UIcon
                :name="
                  citizen.hasSapUser
                    ? 'i-heroicons-check-circle'
                    : 'i-heroicons-x-circle'
                "
                class="w-3 h-3"
              />
            </div>
          </div>

          <!-- Decorative gradient overlay (only for active users) -->
          <div
            v-if="citizen.hasSapUser"
            class="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>

          <!-- Content -->
          <div class="relative z-10">
            <!-- Employee Avatar and Basic Info -->
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex-shrink-0">
                <div class="relative w-14 h-14">
                  <!-- User Photo -->
                  <img
                    v-if="userPhotos.get(citizen.id)"
                    :src="userPhotos.get(citizen.id)"
                    :alt="citizen.displayName"
                    class="w-14 h-14 rounded-full object-cover shadow-lg transition-shadow duration-300 group-hover:shadow-xl"
                  />
                  <!-- Fallback to Initials -->
                  <div
                    v-else
                    :class="[
                      'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-shadow duration-300',
                      citizen.hasSapUser
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 group-hover:shadow-xl'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600',
                    ]"
                  >
                    <span
                      :class="[
                        'text-lg font-bold',
                        citizen.hasSapUser ? 'text-cyan-600' : 'text-gray-200',
                      ]"
                    >
                      {{ getInitials(citizen.displayName) }}
                    </span>
                  </div>
                  <!-- Loading indicator for photo -->
                  <div
                    v-if="loadingPhotos.has(citizen.id)"
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
                  :class="[
                    'text-base font-semibold truncate transition-colors duration-200',
                    citizen.hasSapUser
                      ? 'text-gray-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  {{ citizen.displayName }}
                </h3>
                <p
                  :class="[
                    'text-sm truncate flex items-center mt-1',
                    citizen.hasSapUser
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500',
                  ]"
                >
                  <UIcon
                    name="i-heroicons-envelope"
                    :class="[
                      'w-4 h-4 mr-2',
                      citizen.hasSapUser ? 'text-gray-400' : 'text-gray-500',
                    ]"
                  />
                  {{ citizen.mail }}
                </p>
              </div>
            </div>

            <!-- Job Title with Icon -->
            <div class="mb-6">
              <div
                :class="[
                  'flex items-center space-x-2 p-3 rounded-lg',
                  citizen.hasSapUser
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'bg-gray-200 dark:bg-gray-600',
                ]"
              >
                <UIcon
                  name="i-heroicons-briefcase"
                  :class="[
                    'w-4 h-4 flex-shrink-0',
                    citizen.hasSapUser
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                />
                <p
                  :class="[
                    'text-sm font-medium',
                    citizen.hasSapUser
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  {{ citizen.jobTitle || "Sin cargo definido" }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3">
              <UButton
                size="sm"
                variant="outline"
                color="cyan"
                :disabled="!citizen.hasSapUser"
                :class="[
                  'flex-1 justify-center transition-transform duration-200',
                  citizen.hasSapUser
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50',
                ]"
                @click="
                  citizen.hasSapUser
                    ? selectCitizenForAction(citizen, 'reset')
                    : null
                "
              >
                <UIcon name="i-heroicons-key" class="w-4 h-4 mr-2" />
                Reiniciar
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                color="orange"
                :disabled="!citizen.hasSapUser"
                :class="[
                  'flex-1 justify-center transition-transform duration-200',
                  citizen.hasSapUser
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50',
                ]"
                @click="
                  citizen.hasSapUser
                    ? selectCitizenForAction(citizen, 'unlock')
                    : null
                "
              >
                <UIcon name="i-heroicons-lock-open" class="w-4 h-4 mr-2" />
                Desbloquear
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentUser } from "aws-amplify/auth";

const user = ref(null);

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
const accessToken = ref(null);
const tokenError = ref(null);
const isLoadingToken = ref(false);
const directReports = ref([]);
const isLoadingReports = ref(false);
const reportsError = ref(null);
const userPhotos = ref(new Map()); // Cache de fotos de usuario
const loadingPhotos = ref(new Set()); // IDs de usuarios cuyas fotos se están cargando
const sapUsersCache = ref(new Map()); // Cache de usuarios SAP
const loadingSapUsers = ref(new Set()); // IDs de usuarios cuyas verificaciones SAP se están cargando

// Estado reactivo para el usuario actual
const currentUserHasSap = ref(false);
const loadingCurrentUserSap = ref(false);
const currentUserPhoto = ref(null);
const loadingCurrentUserPhoto = ref(false);
const graphUserData = ref(null);
const loadingGraphUserData = ref(false);
const graphUserError = ref(null);

// Función para obtener el token de acceso desde el backend
const getAccessToken = async () => {
  isLoadingToken.value = true;
  tokenError.value = null;

  try {
    const data = await $fetch("/api/microsoft-graph/token", {
      method: "POST",
    });

    if (data.success) {
      accessToken.value = data.access_token;
      console.log("Token obtenido exitosamente desde el backend");
      return data.access_token;
    } else {
      throw new Error("Error en la respuesta del servidor");
    }
  } catch (error) {
    tokenError.value = error.message || "Error desconocido al obtener el token";
    console.error("Error obteniendo token:", error);
    throw error;
  } finally {
    isLoadingToken.value = false;
  }
};

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
    console.log(`Obteniendo foto para usuario: ${userId}`);

    const data = await $fetch("/api/microsoft-graph/user-photo", {
      method: "POST",
      body: {
        userId: userId,
      },
    });

    if (data.success) {
      const photoData = data.hasPhoto ? data.photoData : null;
      userPhotos.value.set(userId, photoData);
      console.log(
        `Foto obtenida para ${userId}:`,
        data.hasPhoto ? "✅ Disponible" : "❌ No disponible"
      );
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
    console.log(`Verificando usuario SAP para email: ${email}`);

    const data = await $fetch("/api/sap/existUserAndIsActive", {
      query: {
        email: email,
      },
    });

    if (data.status === 200) {
      const hasSapUser = data.sapUser !== false;
      sapUsersCache.value.set(email, hasSapUser);
      console.log(
        `Usuario SAP para ${email}:`,
        hasSapUser ? "✅ Existe" : "❌ No existe"
      );
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

  console.log(`Cargando fotos para ${citizens.length} ciudadanos...`);

  // Cargar fotos en paralelo para mejor rendimiento
  const photoPromises = citizens.map((citizen) => getUserPhoto(citizen.id));
  await Promise.all(photoPromises);

  console.log("Todas las fotos han sido procesadas");
};

// Función para verificar usuarios SAP de todos los ciudadanos
const checkAllSapUsers = async (citizens) => {
  if (!citizens || citizens.length === 0) return;

  console.log(`Verificando usuarios SAP para ${citizens.length} ciudadanos...`);

  // Verificar usuarios SAP en paralelo para mejor rendimiento
  const sapPromises = citizens.map((citizen) => checkSapUser(citizen.mail));
  const sapResults = await Promise.all(sapPromises);

  // Actualizar el estado hasSapUser de cada ciudadano
  citizens.forEach((citizen, index) => {
    citizen.hasSapUser = sapResults[index];
  });

  console.log("Todas las verificaciones SAP han sido procesadas");
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
    console.log(`Verificando usuario SAP actual para email: ${email}`);

    const hasSap = await checkSapUser(email);
    currentUserHasSap.value = hasSap;

    console.log(`Usuario actual ${hasSap ? "TIENE" : "NO TIENE"} acceso SAP`);
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
    console.log(
      `Obteniendo datos de Microsoft Graph para usuario: ${userName}`
    );

    const data = await $fetch("/api/microsoft-graph/user-info", {
      method: "POST",
      body: {
        userName: userName,
      },
    });

    if (data.success) {
      graphUserData.value = data.userData;
      console.log("Datos de Microsoft Graph obtenidos:", data.userData);
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
  const userId = graphUserData.value?.id || user.value?.userId;

  if (!userId) {
    console.error("No se puede cargar foto: userId no disponible");
    return;
  }

  loadingCurrentUserPhoto.value = true;

  try {
    const photo = await getUserPhoto(userId);
    currentUserPhoto.value = photo;
    console.log(
      `Foto del usuario actual: ${photo ? "Cargada" : "No disponible"}`
    );
  } catch (error) {
    console.error("Error cargando foto del usuario actual:", error);
    currentUserPhoto.value = null;
  } finally {
    loadingCurrentUserPhoto.value = false;
  }
};

// Función para consultar directReports de un usuario
const getDirectReports = async (userName) => {
  if (!userName) {
    console.error("userName es requerido");
    return;
  }

  isLoadingReports.value = true;
  reportsError.value = null;

  try {
    console.log(`Consultando directReports para usuario: ${userName}`);

    const data = await $fetch("/api/microsoft-graph/direct-reports", {
      method: "POST",
      body: {
        userName: userName,
      },
    });

    if (data.success) {
      console.log("=== DIRECT REPORTS RESULTADO ===");
      console.log(`Usuario: ${data.userName}`);
      console.log("DirectReports data:", data.directReports);
      console.log(
        "Número de reportes directos:",
        data.directReports.value?.length || 0
      );

      if (data.directReports.value && data.directReports.value.length > 0) {
        console.log("Lista de reportes directos:");
        data.directReports.value.forEach((report, index) => {
          console.log(
            `${index + 1}. ${report.displayName} (${report.userPrincipalName})`
          );
        });

        // Procesar los datos para inicializar el campo hasSapUser
        const processedReports = data.directReports.value.map((report) => ({
          ...report,
          hasSapUser: false, // Inicialmente false, se actualizará después de verificar con SAP
        }));

        directReports.value = processedReports;

        // Verificar usuarios SAP para todos los ciudadanos
        await checkAllSapUsers(processedReports);

        // Cargar fotos de todos los ciudadanos
        await loadAllUserPhotos(processedReports);
      } else {
        console.log("No se encontraron reportes directos para este usuario");
        directReports.value = [];
      }

      return data.directReports;
    } else {
      throw new Error("Error en la respuesta del servidor");
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

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    // Obtener información del usuario actual de Amplify
    user.value = await getCurrentUser();
    console.log("Usuario actual obtenido:", user.value);

    // TEMPORAL: Usar email específico para pruebas
    const testEmail = "hector.merida.gt@camasolympia.com";

    // Obtener token de acceso para Microsoft Graph
    await getAccessToken();

    // Obtener datos completos del usuario desde Microsoft Graph
    console.log(`Obteniendo datos de Microsoft Graph para: ${testEmail}`);
    await getGraphUserData(testEmail);

    // Verificar si el usuario actual tiene acceso SAP (usando datos de Microsoft Graph)
    await checkCurrentUserSap();

    // Cargar foto del usuario actual (usando ID real de Microsoft Graph)
    await loadCurrentUserPhoto();

    // Consultar directReports usando el email del usuario
    console.log(`Realizando consulta de directReports para: ${testEmail}`);
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

const selectCitizenForAction = (citizen, action) => {
  emit("citizen-selected", { citizen, action });
};
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
