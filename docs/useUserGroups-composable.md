# Composable useUserGroups

Este composable proporciona una interfaz reutilizable para manejar los grupos de usuario autenticado en el sistema.

## Características

- **Gestión automática de estado**: Los grupos se cargan automáticamente al montar el composable
- **Manejo de errores**: Incluye manejo robusto de errores con mensajes descriptivos
- **Estado de carga**: Proporciona indicadores de estado de carga para mejorar la UX
- **Métodos de utilidad**: Incluye métodos para verificar permisos y roles
- **Reactividad**: Utiliza Vue 3 Composition API para máxima reactividad

## Uso Básico

```vue
<script setup>
import { useUserGroups } from "~/composables/useUserGroups";

const { userGroups, isLoading, error, getUserRole, hasGroup } = useUserGroups();
</script>

<template>
  <div>
    <div v-if="isLoading">Cargando...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <p>Rol: {{ getUserRole() }}</p>
      <p>Es Admin: {{ hasGroup("Admin") }}</p>
    </div>
  </div>
</template>
```

## API del Composable

### Estado Reactivo

- `userGroups`: Array de grupos del usuario (readonly)
- `isLoading`: Boolean que indica si se están cargando los grupos
- `error`: String con el mensaje de error, si existe

### Métodos

#### `getGroups(): Promise<UserGroup[]>`

Obtiene los grupos del usuario actual desde la API.

#### `fetchUserGroups(): Promise<UserGroup[]>`

Carga los grupos y actualiza el estado interno.

#### `getUserRole(): string`

Retorna el nombre del primer grupo (rol principal) o string vacío.

#### `hasGroup(groupName: string): boolean`

Verifica si el usuario pertenece a un grupo específico.

#### `hasAnyGroup(groupNames: string[]): boolean`

Verifica si el usuario pertenece a al menos uno de los grupos especificados.

#### `hasAllGroups(groupNames: string[]): boolean`

Verifica si el usuario pertenece a todos los grupos especificados.

## Interfaz UserGroup

```typescript
interface UserGroup {
  GroupName: string;
  GroupDescription?: string;
  Precedence?: number;
  LastModifiedDate?: string;
  CreationDate?: string;
}
```

## Ejemplos de Uso

### Verificación de Permisos

```vue
<script setup>
const { hasGroup, hasAnyGroup } = useUserGroups();

// Verificar si es administrador
const isAdmin = computed(() => hasGroup("Admin"));

// Verificar si tiene permisos de gestión
const hasManagementAccess = computed(() =>
  hasAnyGroup(["Admin", "Manager", "Supervisor"])
);

// Verificar si tiene todos los permisos necesarios
const hasFullAccess = computed(() =>
  hasAllGroups(["Admin", "User", "Premium"])
);
</script>
```

### Control de Acceso Condicional

```vue
<template>
  <div>
    <!-- Solo mostrar para administradores -->
    <div v-if="hasGroup('Admin')" class="admin-panel">
      <h2>Panel de Administración</h2>
      <!-- Contenido del panel -->
    </div>

    <!-- Mostrar para usuarios con permisos específicos -->
    <div v-if="hasAnyGroup(['User', 'Premium'])" class="user-features">
      <h2>Características de Usuario</h2>
      <!-- Contenido para usuarios -->
    </div>
  </div>
</template>
```

### Recarga Manual de Grupos

```vue
<script setup>
const { fetchUserGroups, isLoading } = useUserGroups();

const refreshUserGroups = async () => {
  try {
    await fetchUserGroups();
    // Los grupos se han actualizado
  } catch (error) {
    console.error("Error al recargar grupos:", error);
  }
};
</script>

<template>
  <UButton @click="refreshUserGroups" :loading="isLoading">
    Actualizar Grupos
  </UButton>
</template>
```

## Integración con Amplify

El composable está diseñado para trabajar con AWS Amplify y utiliza:

- `generateClient()` para las consultas GraphQL
- `getCurrentUser()` para obtener el usuario autenticado
- La query `Group` para obtener los grupos del usuario

## Consideraciones de Rendimiento

- Los grupos se cargan automáticamente al montar el composable
- El estado se mantiene reactivo y se puede reutilizar entre componentes
- Los métodos de verificación son computados eficientemente
- Se incluye manejo de errores para evitar fallos en cascada

## Migración desde AppSidebar.vue

Si estás migrando desde el código anterior en `AppSidebar.vue`:

**Antes:**

```typescript
const userGroups = ref([]);

const getGroups = async () => {
  const client = generateClient();
  const user = await getCurrentUser();
  const { data } = await client.queries.Group({
    username: user.username,
  });
  const response = JSON.parse(data);
  return response.groups;
};

onMounted(async () => {
  userGroups.value = await getGroups();
  userProfile.value.role = userGroups.value[0].GroupName;
});
```

**Después:**

```typescript
const { userGroups, getUserRole } = useUserGroups();

onMounted(() => {
  userProfile.value.role = getUserRole();
});
```

## Solución de Problemas

### Error: "Cannot redeclare block-scoped variable 'userGroups'"

Este error ocurre si tienes una variable `userGroups` declarada localmente. Elimina la declaración local y usa solo la del composable:

```typescript
// ❌ Incorrecto
const userGroups = ref([]);
const { userGroups } = useUserGroups(); // Conflicto

// ✅ Correcto
const { userGroups } = useUserGroups(); // Solo usar la del composable
```

### Los grupos no se cargan

Verifica que:

1. El usuario esté autenticado
2. La query GraphQL `Group` esté configurada correctamente
3. No haya errores en la consola del navegador
4. El composable se esté usando en un componente montado
