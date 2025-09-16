import { ref, computed, onMounted } from "vue";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";

export const useCognitoGroups = () => {
  const userGroups = ref<string[]>([]);
  const isLoadingGroups = ref(false);
  const error = ref<string | null>(null);
  const userAttributes = ref<any>(null);

  // Función para obtener grupos del usuario
  const fetchUserGroups = async () => {
    try {
      isLoadingGroups.value = true;
      error.value = null;

      console.log("🔍 Iniciando obtención de grupos de Cognito...");

      // Obtener usuario actual
      const currentUser = await getCurrentUser();
      console.log("👤 Usuario actual:", currentUser);

      // Obtener atributos del usuario
      const attributes = await fetchUserAttributes();
      userAttributes.value = attributes;
      console.log("📋 Atributos del usuario:", attributes);

      // Intentar obtener grupos desde diferentes fuentes
      let groups: string[] = [];

      // Método 1: Desde atributos personalizados
      if (attributes["custom:groups"]) {
        console.log(
          "🎯 Grupos encontrados en custom:groups:",
          attributes["custom:groups"],
        );
        groups = Array.isArray(attributes["custom:groups"])
          ? attributes["custom:groups"]
          : attributes["custom:groups"].split(",");
      }

      // Método 2: Desde atributo groups
      if (groups.length === 0 && attributes.groups) {
        console.log("🎯 Grupos encontrados en groups:", attributes.groups);
        groups = Array.isArray(attributes.groups)
          ? attributes.groups
          : attributes.groups.split(",");
      }

      // Método 3: Desde cognito:groups
      if (groups.length === 0 && attributes["cognito:groups"]) {
        console.log(
          "🎯 Grupos encontrados en cognito:groups:",
          attributes["cognito:groups"],
        );
        groups = Array.isArray(attributes["cognito:groups"])
          ? attributes["cognito:groups"]
          : attributes["cognito:groups"].split(",");
      }

      // Método 4: Intentar obtener desde el token JWT
      if (groups.length === 0) {
        try {
          console.log("🔐 Intentando obtener grupos desde token JWT...");
          const session = await currentUser.getSignInUserSession();

          if (session) {
            // Intentar desde Access Token
            const accessToken = session.getAccessToken();
            const accessPayload = accessToken.decodePayload();
            console.log("🔑 Payload del Access Token:", accessPayload);

            const accessTokenGroups =
              accessPayload["cognito:groups"] ||
              accessPayload.groups ||
              accessPayload["custom:groups"];

            if (accessTokenGroups) {
              console.log(
                "🎯 Grupos encontrados en Access Token:",
                accessTokenGroups,
              );
              groups = Array.isArray(accessTokenGroups)
                ? accessTokenGroups
                : accessTokenGroups.split(",");
            }

            // Si no hay grupos en Access Token, intentar desde ID Token
            if (groups.length === 0) {
              const idToken = session.getIdToken();
              const idPayload = idToken.decodePayload();
              console.log("🆔 Payload del ID Token:", idPayload);

              const idTokenGroups =
                idPayload["cognito:groups"] ||
                idPayload.groups ||
                idPayload["custom:groups"];

              if (idTokenGroups) {
                console.log(
                  "🎯 Grupos encontrados en ID Token:",
                  idTokenGroups,
                );
                groups = Array.isArray(idTokenGroups)
                  ? idTokenGroups
                  : idTokenGroups.split(",");
              }
            }
          }
        } catch (tokenError) {
          console.warn("⚠️ Error al obtener grupos desde tokens:", tokenError);
        }
      }

      // Limpiar y normalizar grupos
      userGroups.value = groups
        .map((group) => group.trim())
        .filter((group) => group.length > 0)
        .filter((group, index, arr) => arr.indexOf(group) === index); // Eliminar duplicados

      console.log("✅ Grupos finales del usuario:", userGroups.value);
    } catch (err) {
      console.error("❌ Error al obtener grupos de Cognito:", err);
      error.value = err instanceof Error ? err.message : "Error desconocido";
      userGroups.value = [];
    } finally {
      isLoadingGroups.value = false;
    }
  };

  // Función para verificar si el usuario pertenece a un grupo específico
  const hasGroup = (groupName: string) => {
    return userGroups.value.includes(groupName);
  };

  // Función para verificar si el usuario pertenece a cualquiera de los grupos especificados
  const hasAnyGroup = (groupNames: string[]) => {
    return groupNames.some((group) => userGroups.value.includes(group));
  };

  // Función para verificar si el usuario pertenece a todos los grupos especificados
  const hasAllGroups = (groupNames: string[]) => {
    return groupNames.every((group) => userGroups.value.includes(group));
  };

  // Función para limpiar el estado
  const clearGroups = () => {
    userGroups.value = [];
    error.value = null;
    userAttributes.value = null;
  };

  // Obtener grupos al montar el composable
  onMounted(() => {
    fetchUserGroups();
  });

  return {
    // Estado
    userGroups: computed(() => userGroups.value),
    isLoadingGroups: computed(() => isLoadingGroups.value),
    error: computed(() => error.value),
    userAttributes: computed(() => userAttributes.value),

    // Métodos
    fetchUserGroups,
    hasGroup,
    hasAnyGroup,
    hasAllGroups,
    clearGroups,
  };
};
