/**
 * Composable para Microsoft Graph API
 *
 * Este composable proporciona funciones reutilizables para interactuar con Microsoft Graph API,
 * incluyendo autenticación, obtención de datos de usuario, fotos de perfil y reportes directos.
 *
 * Basado en la documentación: docs/microsoft-graph-integration.md
 */

import { ref, reactive } from "vue";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

export const useMicrosoftGraph = () => {
  const amplifyClient = generateClient();
  // Estado reactivo
  const accessToken = ref<string | null>(null);
  const isLoadingToken = ref(false);
  const tokenError = ref<string | null>(null);

  // Cache global para fotos de usuario
  const userPhotos = ref(new Map<string, string | null>());
  const loadingPhotos = ref(new Set<string>());

  // Cache global para datos de usuario
  const userDataCache = ref(new Map<string, any>());
  const loadingUserData = ref(new Set<string>());

  /**
   * Función utilitaria para determinar el tenant basándose en el email del usuario
   * @param email Email del usuario
   * @returns string Tenant a usar (nova/diveco)
   */
  const determineTenant = (email: string): string => {
    if (!email) return "external"; // default fallback

    if (email.includes("@novafinanzas.com")) {
      return "nova";
    } else if (email.includes("@camasolympia.com")) {
      return "diveco";
    }

    return "external"; // default fallback
  };

  /**
   * Obtiene un token de acceso OAuth 2.0 usando el flujo Client Credentials
   * @returns Promise<string> Token de acceso
   */
  const getAccessToken = async (): Promise<string> => {
    try {
      const currentUser = await getCurrentUser();
      // Obtener el email del usuario desde la estructura de Amplify Auth
      const userEmail = currentUser.username;

      const tenant = determineTenant(userEmail);

      const request = await (amplifyClient.queries as any).MicrosoftGraphToken({
        tenantName: tenant,
      });

      // Validar que la respuesta tenga datos válidos
      if (!request || !request.data) {
        console.warn("🔐 Respuesta vacía del servicio de Microsoft Graph Token");
        throw new Error("NO_GRAPH_ACCESS");
      }

      let response;
      try {
        response = JSON.parse(request.data);
      } catch (parseError) {
        console.warn("🔐 Error parsing respuesta de Microsoft Graph Token:", parseError);
        throw new Error("NO_GRAPH_ACCESS");
      }

      if (!response || !response.access_token) {
        console.warn("🔐 Token de acceso no disponible en la respuesta");
        throw new Error("NO_GRAPH_ACCESS");
      }

      return response.access_token;
    } catch (error) {
      // Manejo específico para usuarios sin acceso a Microsoft Graph
      if (error?.name === "UserUnAuthenticatedException" ||
          error?.message?.includes("User needs to be authenticated") ||
          error?.message === "NO_GRAPH_ACCESS") {
        console.warn("🔐 Usuario autenticado sin acceso a Microsoft Graph (probablemente autenticado con contraseña)");
        throw new Error("NO_GRAPH_ACCESS");
      }

      console.error("❌ Error inesperado obteniendo token de Microsoft Graph:", error);
      throw new Error("NO_GRAPH_ACCESS");
    }
  };

  /**
   * Obtiene información detallada de un usuario específico desde Microsoft Graph
   * @param userName Email o ID del usuario
   * @returns Promise<any> Datos del usuario
   */
  const getUserData = async (userName: string): Promise<any> => {
    if (!userName) {
      console.error(
        "userName es requerido para obtener datos de Microsoft Graph",
      );
      return null;
    }

    // Verificar cache
    if (userDataCache.value.has(userName)) {
      return userDataCache.value.get(userName);
    }

    // Evitar requests duplicados
    if (loadingUserData.value.has(userName)) {
      return null;
    }

    loadingUserData.value.add(userName);

    try {
      const data = await $fetch("/api/microsoft-graph/user-info", {
        method: "POST",
        body: {
          userName: userName,
        },
      });

      if (data.success) {
        userDataCache.value.set(userName, data.userData);
        return data.userData;
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error: any) {
      console.error("Error obteniendo datos de Microsoft Graph:", error);
      userDataCache.value.set(userName, null);
      return null;
    } finally {
      loadingUserData.value.delete(userName);
    }
  };

  /**
   * Obtiene la foto de perfil de un usuario y la convierte a base64
   * @param userId ID del usuario
   * @returns Promise<string | null> Data URI en formato base64 o null si no hay foto
   */
  const getUserPhoto = async (userId: string): Promise<string | null> => {
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
    } catch (error: any) {
      console.error(`Error obteniendo foto para usuario ${userId}:`, error);
      userPhotos.value.set(userId, null);
      return null;
    } finally {
      loadingPhotos.value.delete(userId);
    }
  };

  /**
   * Obtiene la lista de subordinados directos de un usuario
   * @param userName Email o ID del usuario
   * @returns Promise<any[]> Lista de subordinados directos
   */
  const getDirectReports = async (userName: string): Promise<any[]> => {
    if (!userName) {
      console.error("userName es requerido");
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
    } catch (error: any) {
      console.error(`Error consultando directReports para ${userName}:`, error);
      return [];
    }
  };

  /**
   * Obtiene datos completos de un usuario (información + foto)
   * @param userName Email del usuario
   * @returns Promise<{userData: any, photo: string | null}> Datos completos del usuario
   */
  const getCompleteUserData = async (userName: string) => {
    try {
      // Obtener token si no existe
      if (!accessToken.value) {
        await getAccessToken();
      }

      // Obtener datos del usuario
      const userData = await getUserData(userName);

      if (!userData) {
        return { userData: null, photo: null };
      }

      // Obtener foto del usuario
      const photo = await getUserPhoto(userName || "");

      return { userData, photo };
    } catch (error: any) {
      // Manejo específico para usuarios sin acceso a Microsoft Graph
      if (error?.message === "NO_GRAPH_ACCESS") {
        console.warn("🔐 Usuario sin acceso a Microsoft Graph - usando datos básicos de Cognito");
        return { userData: null, photo: null };
      }

      console.error("❌ Error obteniendo datos completos del usuario:", error);
      return { userData: null, photo: null };
    }
  };

  /**
   * Utilidad para generar iniciales desde un nombre
   * @param name Nombre completo
   * @returns string Iniciales (máximo 2 caracteres)
   */
  const getInitials = (name: string): string => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  /**
   * Limpia el cache de fotos y datos de usuario
   */
  const clearCache = () => {
    userPhotos.value.clear();
    userDataCache.value.clear();
    loadingPhotos.value.clear();
    loadingUserData.value.clear();
    accessToken.value = null;
  };

  /**
   * Verifica si hay una foto en cache para un usuario
   * @param userId ID del usuario
   * @returns boolean
   */
  const hasPhotoInCache = (userId: string): boolean => {
    return userPhotos.value.has(userId);
  };

  /**
   * Verifica si se está cargando la foto de un usuario
   * @param userId ID del usuario
   * @returns boolean
   */
  const isLoadingPhoto = (userId: string): boolean => {
    return loadingPhotos.value.has(userId);
  };

  /**
   * Obtiene una foto desde el cache (sin hacer request)
   * @param userId ID del usuario
   * @returns string | null | undefined
   */
  const getPhotoFromCache = (userId: string): string | null | undefined => {
    return userPhotos.value.get(userId);
  };

  return {
    // Estado reactivo
    accessToken: readonly(accessToken),
    isLoadingToken: readonly(isLoadingToken),
    tokenError: readonly(tokenError),
    userPhotos: readonly(userPhotos),
    loadingPhotos: readonly(loadingPhotos),

    // Funciones principales
    getAccessToken,
    getUserData,
    getUserPhoto,
    getDirectReports,
    getCompleteUserData,

    // Utilidades
    getInitials,
    clearCache,
    hasPhotoInCache,
    isLoadingPhoto,
    getPhotoFromCache,
  };
};

export type MicrosoftGraphComposable = ReturnType<typeof useMicrosoftGraph>;
