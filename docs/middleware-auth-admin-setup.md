# Configuración del Middleware de Autenticación para Administradores

## Problema Identificado

El middleware `auth-admin.ts` original estaba intentando usar AWS Cognito UserPool que no está configurado en este proyecto. El proyecto usa AWS Amplify con autenticación SAML de Microsoft Entra ID.

## Soluciones Implementadas

### 1. Middleware Corregido (`auth-admin.ts`)

El middleware ha sido actualizado para usar el composable `useAuth` que maneja correctamente la autenticación SAML:

```typescript
// Usa el composable useAuth en lugar de AWS Amplify Auth directamente
const { useAuth } = await import("~/composables/useAuth");
const { isAuthenticated, isAdmin, checkAuth } = useAuth();
```

### 2. Middleware de Desarrollo (`auth-admin-dev.ts`)

Para desarrollo y pruebas, se ha creado un middleware temporal que permite el acceso sin verificación de autenticación:

```typescript
// Middleware temporal para desarrollo
// En producción, esto debe ser reemplazado por la autenticación real
console.log("🔧 Middleware auth-admin-dev: Permitiendo acceso para desarrollo");
return;
```

## Cómo Usar

### Para Desarrollo

```typescript
definePageMeta({
  layout: "default",
  middleware: ["auth-admin-dev"], // Temporal para desarrollo
});
```

### Para Producción

```typescript
definePageMeta({
  layout: "default",
  middleware: ["auth-admin"], // Autenticación real
});
```

## Configuración de Amplify

El proyecto está configurado con:

- **Autenticación**: SAML con Microsoft Entra ID
- **Configuración**: `amplify/auth/resource.ts`
- **Composable**: `useUserGroups` para obtener grupos del usuario
- **Composable**: `useAuth` para verificación de autenticación

## Próximos Pasos

1. **Configurar Amplify correctamente** en el cliente
2. **Probar la autenticación SAML** con Microsoft Entra ID
3. **Cambiar a `auth-admin`** cuando la autenticación esté funcionando
4. **Eliminar `auth-admin-dev`** en producción

## Archivos Relacionados

- `app/middleware/auth-admin.ts` - Middleware de producción
- `app/middleware/auth-admin-dev.ts` - Middleware de desarrollo
- `app/composables/useAuth.ts` - Composable de autenticación
- `app/composables/useUserGroups.ts` - Composable de grupos de usuario
- `amplify/auth/resource.ts` - Configuración de autenticación Amplify

## Notas de Seguridad

⚠️ **IMPORTANTE**: El middleware `auth-admin-dev` NO debe usarse en producción ya que permite acceso sin verificación de autenticación.

✅ **RECOMENDADO**: Usar `auth-admin` en producción para garantizar la seguridad del sistema.
