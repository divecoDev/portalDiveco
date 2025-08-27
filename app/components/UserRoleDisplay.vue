<template>
  <div class="user-role-display">
    <!-- Mostrar estado de carga -->
    <div v-if="isLoading" class="text-sm text-gray-500">
      Cargando grupos de usuario...
    </div>

    <!-- Mostrar error si existe -->
    <div v-else-if="error" class="text-sm text-red-500">Error: {{ error }}</div>

    <!-- Mostrar información del usuario -->
    <div v-else class="space-y-2">
      <!-- Rol principal -->
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700">Rol:</span>
        <UBadge :color="getRoleColor()" variant="solid" size="sm">
          {{ getUserRole() || "Sin rol asignado" }}
        </UBadge>
      </div>

      <!-- Todos los grupos -->
      <div v-if="userGroups.length > 0" class="space-y-1">
        <span class="text-sm font-medium text-gray-700">Grupos:</span>
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="group in userGroups"
            :key="group.GroupName"
            color="blue"
            variant="subtle"
            size="xs"
          >
            {{ group.GroupName }}
          </UBadge>
        </div>
      </div>

      <!-- Verificaciones de permisos -->
      <div class="space-y-1 pt-2 border-t border-gray-200">
        <span class="text-sm font-medium text-gray-700">Permisos:</span>
        <div class="space-y-1 text-xs text-gray-600">
          <div class="flex items-center space-x-2">
            <UIcon
              :name="
                hasGroup('Admin')
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
              :class="hasGroup('Admin') ? 'text-green-500' : 'text-red-500'"
              class="h-4 w-4"
            />
            <span>Es Administrador</span>
          </div>
          <div class="flex items-center space-x-2">
            <UIcon
              :name="
                hasGroup('User')
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
              :class="hasGroup('User') ? 'text-green-500' : 'text-red-500'"
              class="h-4 w-4"
            />
            <span>Es Usuario</span>
          </div>
          <div class="flex items-center space-x-2">
            <UIcon
              :name="
                hasAnyGroup(['Admin', 'Manager'])
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
              :class="
                hasAnyGroup(['Admin', 'Manager'])
                  ? 'text-green-500'
                  : 'text-red-500'
              "
              class="h-4 w-4"
            />
            <span>Tiene permisos de gestión</span>
          </div>
        </div>
      </div>

      <!-- Botón para recargar grupos -->
      <UButton
        @click="refreshGroups"
        size="xs"
        variant="outline"
        class="mt-2"
        :loading="isLoading"
      >
        Recargar Grupos
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { useUserGroups } from "~/composables/useUserGroups";

// Usar el composable
const {
  userGroups,
  isLoading,
  error,
  fetchUserGroups,
  getUserRole,
  hasGroup,
  hasAnyGroup,
  hasAllGroups,
} = useUserGroups();

// Métodos del componente
const getRoleColor = () => {
  const role = getUserRole();
  if (role === "Admin") return "red";
  if (role === "Manager") return "yellow";
  if (role === "User") return "blue";
  return "gray";
};

const refreshGroups = async () => {
  await fetchUserGroups();
};
</script>

<style scoped>
.user-role-display {
  @apply p-4 bg-white rounded-lg border border-gray-200 shadow-sm;
}
</style>
