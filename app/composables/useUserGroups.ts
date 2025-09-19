import { ref, onMounted, readonly, computed } from "vue";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

export interface UserGroup {
  GroupName: string;
  GroupDescription?: string;
  Precedence?: number;
  LastModifiedDate?: string;
  CreationDate?: string;
}

export const useUserGroups = () => {
  const userGroups = ref<UserGroup[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed property para filtrar grupos excluyendo MicrosoftEntra
  const filteredUserGroups = computed(() => {
    return userGroups.value.filter(
      (group: UserGroup) => !group.GroupName.includes("MicrosoftEntra"),
    );
  });

  const getGroups = async (): Promise<UserGroup[]> => {
    try {
      isLoading.value = true;
      error.value = null;

      const client = generateClient();
      const user = await getCurrentUser();

      const { data } = await client.queries.Group({
        username: user.username,
      });

      const response = JSON.parse(data);
      const allGroups = response.groups || [];

      // Filtrar grupos excluyendo MicrosoftEntra
      return allGroups.filter(
        (group: UserGroup) =>
          !group.GroupName.includes("MicrosoftEntra") &&
          !group.GroupName.includes("Diveco") &&
          !group.GroupName.includes("Nova"),
      );
    } catch (err) {
      // Manejo específico para usuarios sin grupos (autenticados con contraseña)
      if (err?.name === "UserUnAuthenticatedException" ||
          err?.message?.includes("User needs to be authenticated")) {
        console.warn("🔐 Usuario autenticado sin grupos de Cognito (probablemente autenticado con contraseña)");
        error.value = null; // No tratamos esto como un error
        return [];
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al obtener grupos";
      error.value = errorMessage;
      console.error("❌ Error al obtener grupos del usuario:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUserGroups = async () => {
    const groups = await getGroups();
    userGroups.value = groups;
    return groups;
  };

  const getUserRole = (): string => {
    const filteredGroups = filteredUserGroups.value;
    if (filteredGroups.length > 0 && filteredGroups[0]) {
      return filteredGroups[0].GroupName;
    }
    return "";
  };

  const hasGroup = (groupName: string): boolean => {
    // Verificar que el grupo solicitado no contenga MicrosoftEntra
    if (groupName.includes("MicrosoftEntra")) {
      return false;
    }

    if (groupName.includes("Nova")) {
      return false;
    }

    return filteredUserGroups.value.some(
      (group: UserGroup) => group.GroupName === groupName,
    );
  };

  const hasAnyGroup = (groupNames: string[]): boolean => {
    // Filtrar nombres de grupos que contengan MicrosoftEntra
    const validGroupNames = groupNames.filter(
      (name: string) =>
        !name.includes("MicrosoftEntra") &&
        !name.includes("Nova") &&
        !name.includes("Diveco"),
    );
    if (validGroupNames.length === 0) {
      return false;
    }
    return validGroupNames.some((groupName: string) => hasGroup(groupName));
  };

  const hasAllGroups = (groupNames: string[]): boolean => {
    // Filtrar nombres de grupos que contengan MicrosoftEntra
    const validGroupNames = groupNames.filter(
      (name: string) =>
        !name.includes("MicrosoftEntra") &&
        !name.includes("Nova") &&
        !name.includes("Diveco"),
    );
    if (validGroupNames.length === 0) {
      return false;
    }
    return validGroupNames.every((groupName: string) => hasGroup(groupName));
  };

  // Cargar grupos automáticamente al montar el composable
  onMounted(() => {
    fetchUserGroups();
  });

  return {
    // Estado
    userGroups: readonly(filteredUserGroups),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Métodos
    getGroups,
    fetchUserGroups,
    getUserRole,
    hasGroup,
    hasAnyGroup,
    hasAllGroups,
  };
};
