# Sistema de Autenticación y Middleware

Este documento describe el sistema de autenticación y control de acceso implementado en el Portal DIVECO.

## Arquitectura del Sistema

### 1. Middleware de Autenticación

#### `auth.ts` - Middleware Base

- **Propósito**: Verificar que el usuario esté autenticado
- **Uso**: Para páginas que requieren autenticación pero no roles específicos
- **Implementación**:

```typescript
definePageMeta({
  middleware: ["auth"],
});
```

#### `require-role.ts` - Middleware de Roles

- **Propósito**: Verificar que el usuario tenga un rol específico
- **Uso**: Para páginas que requieren permisos específicos
- **Implementación**:

```typescript
definePageMeta({
  middleware: ["require-role"],
  requiredRole: "ADMIN",
});
```

### 2. Configuración de Roles

#### Archivo: `app/config/roles.ts`

Define la jerarquía de roles y permisos:

```typescript
export const ROLES = {
  ADMIN: {
    name: "ADMIN",
    displayName: "Administrador",
    permissions: ["*"], // Todos los permisos
    color: "red",
    icon: "i-heroicons-shield-check",
  },
  MANAGER: {
    name: "MANAGER",
    displayName: "Gerente",
    permissions: ["view_reports", "manage_users", "view_analytics"],
    color: "blue",
    icon: "i-heroicons-user-group",
  },
  USER: {
    name: "USER",
    displayName: "Usuario",
    permissions: ["view_dashboard", "edit_profile"],
    color: "green",
    icon: "i-heroicons-user",
  },
};
```

### 3. Composable de Autenticación

#### `useAuth()` - Gestión Centralizada

Proporciona métodos para verificar autenticación y permisos:

```typescript
const {
  isAuthenticated,
  isAdmin,
  isManager,
  userRole,
  hasPermission,
  canAccess,
  requireRole,
} = useAuth();
```

## Implementación en Páginas

### Página Protegida por Rol

```vue
<script setup>
definePageMeta({
  layout: "default",
  middleware: ["require-role"],
  requiredRole: "ADMIN",
});
</script>
```

### Verificación de Permisos en Componentes

```vue
<template>
  <div v-if="isAdmin">
    <!-- Contenido solo para administradores -->
  </div>

  <div v-if="hasPermission('manage_sap_passwords')">
    <!-- Contenido para usuarios con permiso específico -->
  </div>
</template>

<script setup>
const { isAdmin, hasPermission } = useAuth();
</script>
```

## Flujo de Autenticación

1. **Inicio de Sesión**: Usuario se autentica con AWS Cognito
2. **Verificación de Grupos**: Se obtienen los grupos del usuario desde Cognito
3. **Asignación de Roles**: Se mapean los grupos a roles del sistema
4. **Verificación de Permisos**: Se determinan los permisos basados en el rol
5. **Control de Acceso**: Middleware verifica permisos antes de permitir acceso

## Manejo de Errores

### Error 403 - Acceso Denegado

- Se muestra cuando el usuario no tiene el rol requerido
- Página de error personalizada con opciones de navegación
- Logs detallados para debugging

### Error 500 - Error Interno

- Se muestra para errores del servidor o de autenticación
- Redirección automática al login si es necesario

## Seguridad

### Características de Seguridad

- **Verificación del Lado Cliente**: Middleware se ejecuta en cada navegación
- **Verificación del Lado Servidor**: Las APIs también verifican permisos
- **Logs de Auditoría**: Se registran todos los intentos de acceso
- **Manejo de Sesiones**: Verificación automática de validez de sesión

### Mejores Prácticas

1. **Principio de Menor Privilegio**: Usuarios solo tienen acceso a lo necesario
2. **Verificación en Múltiples Capas**: Frontend y backend
3. **Logs de Seguridad**: Registro de todas las acciones críticas
4. **Manejo Seguro de Errores**: No exponer información sensible

## Ejemplos de Uso

### Proteger Ruta Completa

```typescript
// app/pages/admin/users.vue
definePageMeta({
  middleware: ["require-role"],
  requiredRole: "ADMIN",
});
```

### Proteger Sección de Página

```vue
<template>
  <div>
    <h1>Dashboard</h1>

    <!-- Contenido público -->
    <div>Información general</div>

    <!-- Contenido solo para managers -->
    <div v-if="isManager || isAdmin">
      <h2>Reportes</h2>
      <!-- Contenido de reportes -->
    </div>

    <!-- Contenido solo para admins -->
    <div v-if="isAdmin">
      <h2>Administración</h2>
      <!-- Contenido de administración -->
    </div>
  </div>
</template>
```

### Verificar Permisos en Métodos

```typescript
const handleAction = () => {
  if (!hasPermission("manage_users")) {
    throw createError({
      statusCode: 403,
      statusMessage: "No tienes permisos para esta acción",
    });
  }

  // Ejecutar acción
};
```

## Testing

### Pruebas de Middleware

```typescript
// test/middleware/require-role.test.ts
describe("require-role middleware", () => {
  it("should allow access for users with required role", async () => {
    // Test implementation
  });

  it("should deny access for users without required role", async () => {
    // Test implementation
  });
});
```

### Pruebas de Permisos

```typescript
// test/composables/useAuth.test.ts
describe("useAuth composable", () => {
  it("should return correct permissions for admin role", () => {
    // Test implementation
  });
});
```

## Mantenimiento

### Agregar Nuevos Roles

1. Definir el rol en `app/config/roles.ts`
2. Agregar permisos específicos
3. Actualizar middleware si es necesario
4. Probar con usuarios de prueba

### Agregar Nuevos Permisos

1. Definir el permiso en `app/config/roles.ts`
2. Asignar a roles apropiados
3. Actualizar componentes que usen el permiso
4. Probar funcionalidad

### Monitoreo

- Revisar logs de autenticación regularmente
- Monitorear intentos de acceso denegado
- Verificar que los permisos estén correctamente configurados

## Troubleshooting

### Problemas Comunes

#### Usuario no puede acceder a página protegida

1. Verificar que el usuario esté autenticado
2. Verificar que el usuario tenga el rol correcto
3. Revisar logs del middleware
4. Verificar configuración de grupos en Cognito

#### Middleware no se ejecuta

1. Verificar que esté correctamente configurado en `definePageMeta`
2. Verificar que el archivo esté en la carpeta correcta
3. Revisar consola del navegador para errores

#### Permisos no se aplican correctamente

1. Verificar configuración en `roles.ts`
2. Verificar que el usuario tenga los grupos correctos
3. Revisar logs de autenticación
4. Verificar que el composable esté inicializado correctamente

## Recursos Adicionales

- [Documentación de Nuxt 3 Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)
- [AWS Cognito User Groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)



