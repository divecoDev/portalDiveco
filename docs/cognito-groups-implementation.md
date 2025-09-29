# Implementación de Grupos de Cognito

Esta documentación describe la implementación para obtener y manejar grupos de AWS Cognito en el Portal Diveco.

## 🎯 Objetivo

Obtener los grupos a los que pertenece el usuario logueado en AWS Cognito y proporcionar una interfaz fácil de usar para verificar permisos basados en grupos.

## 🏗️ Arquitectura

### Composable `useCognitoGroups`

El composable principal que maneja toda la lógica de obtención de grupos:

```typescript
// app/composables/useCognitoGroups.ts
export const useCognitoGroups = () => {
  // Estado reactivo
  const userGroups = ref<string[]>([]);
  const isLoadingGroups = ref(false);
  const error = ref<string | null>(null);
  const userAttributes = ref<any>(null);

  // Funciones principales
  const fetchUserGroups = async () => {
    /* ... */
  };
  const hasGroup = (groupName: string) => {
    /* ... */
  };
  const hasAnyGroup = (groupNames: string[]) => {
    /* ... */
  };
  const hasAllGroups = (groupNames: string[]) => {
    /* ... */
  };

  return {
    /* ... */
  };
};
```

### Fuentes de Grupos

El composable intenta obtener grupos desde múltiples fuentes en orden de prioridad:

1. **Atributos personalizados**: `custom:groups`
2. **Atributo estándar**: `groups`
3. **Atributo Cognito**: `cognito:groups`
4. **Access Token JWT**: Payload del token de acceso
5. **ID Token JWT**: Payload del token de identidad

## 🚀 Uso Básico

### Importar el Composable

```typescript
import { useCognitoGroups } from "~/composables/useCognitoGroups";

const { userGroups, isLoadingGroups, error, hasGroup } = useCognitoGroups();
```

### Verificar Grupos

```typescript
// Verificar si pertenece a un grupo específico
if (hasGroup("admin")) {
  // Mostrar funcionalidad de administrador
}

// Verificar si pertenece a cualquiera de varios grupos
if (hasAnyGroup(["user", "moderator"])) {
  // Mostrar funcionalidad básica
}

// Verificar si pertenece a todos los grupos
if (hasAllGroups(["admin", "moderator"])) {
  // Mostrar funcionalidad avanzada
}
```

### Estado Reactivo

```vue
<template>
  <div>
    <!-- Estado de carga -->
    <div v-if="isLoadingGroups">
      <i class="i-heroicons-arrow-path animate-spin"></i>
      Cargando grupos...
    </div>

    <!-- Grupos encontrados -->
    <div v-else-if="userGroups.length > 0">
      <p>Grupos: {{ userGroups.join(", ") }}</p>
      <p>Total: {{ userGroups.length }} grupo(s)</p>
    </div>

    <!-- Sin grupos -->
    <div v-else>
      <p>No pertenece a ningún grupo</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-red-600">Error: {{ error }}</div>
  </div>
</template>
```

## 🔧 Integración en Componentes

### AppSidebar

El sidebar principal integra la funcionalidad de grupos:

- Muestra los grupos en el perfil del usuario
- Incluye un botón para refrescar grupos manualmente
- Muestra información de debug en modo expandido
- Actualiza automáticamente el perfil cuando cambian los grupos

### Componente de Prueba

Se incluye un componente de prueba (`CognitoGroupsTest.vue`) que permite:

- Ver el estado actual de los grupos
- Refrescar grupos manualmente
- Mostrar atributos del usuario
- Ver información detallada en consola

## 📊 Logs y Debug

### Emojis de Identificación

Los logs utilizan emojis para facilitar la identificación:

- 🔍 **Búsqueda**: Inicio de procesos de búsqueda
- 👤 **Usuario**: Información del usuario
- 📋 **Atributos**: Atributos del usuario
- 🎯 **Grupos**: Grupos encontrados
- 🔐 **Tokens**: Información de tokens JWT
- ✅ **Éxito**: Operaciones completadas
- ❌ **Error**: Errores encontrados
- ⚠️ **Advertencia**: Advertencias
- 🔄 **Actualización**: Procesos de actualización

### Información en Consola

Al abrir la consola del navegador (F12), verás información detallada sobre:

1. **Proceso de autenticación**
2. **Atributos obtenidos**
3. **Búsqueda de grupos**
4. **Tokens decodificados**
5. **Estado de carga**
6. **Errores y advertencias**

## 🎨 Personalización

### Agregar Nuevos Campos de Grupos

Para agregar nuevos campos donde buscar grupos, modifica el array `possibleGroupFields` en `setupUserProfile`:

```typescript
const possibleGroupFields = [
  "groups",
  "custom:groups",
  "cognito:groups",
  "userGroups",
  "roles",
  "permissions", // Nuevo campo
  "access_level", // Nuevo campo
];
```

### Personalizar Verificación de Permisos

Puedes crear funciones personalizadas de verificación:

```typescript
// Verificar permisos basados en roles
const hasRole = (roleName: string) => {
  return userGroups.value.some((group) =>
    group.toLowerCase().includes(roleName.toLowerCase()),
  );
};

// Verificar nivel de acceso
const hasAccessLevel = (level: string) => {
  const accessLevels = ["basic", "standard", "premium", "admin"];
  const userLevel = userGroups.value.find((group) =>
    accessLevels.includes(group.toLowerCase()),
  );
  return accessLevels.indexOf(userLevel) >= accessLevels.indexOf(level);
};
```

## 🧪 Testing

### Página de Prueba

Accede a `/test-cognito-groups` para probar la funcionalidad:

- Ver grupos en tiempo real
- Refrescar grupos manualmente
- Ver atributos del usuario
- Revisar logs en consola

### Verificación Manual

1. Abre la consola del navegador
2. Navega a la página de prueba
3. Revisa los logs para ver el proceso completo
4. Usa el botón "Refrescar Grupos" para probar la actualización
5. Verifica que los grupos se muestren en el sidebar

## 🔒 Consideraciones de Seguridad

### Tokens JWT

- Los tokens se decodifican solo para obtener información de grupos
- No se almacenan tokens completos en el estado
- La información sensible se maneja de forma segura

### Atributos del Usuario

- Solo se muestran atributos no sensibles
- Los grupos se filtran y normalizan antes de mostrar
- Se eliminan duplicados y valores vacíos

## 🚨 Troubleshooting

### Problemas Comunes

1. **No se muestran grupos**
   - Verifica que el usuario esté autenticado
   - Revisa la consola para errores
   - Confirma que los grupos estén configurados en Cognito

2. **Error al obtener atributos**
   - Verifica la configuración de SAML
   - Confirma que los atributos estén mapeados correctamente
   - Revisa los permisos de la aplicación

3. **Grupos no se actualizan**
   - Usa el botón "Refrescar Grupos"
   - Verifica la conexión a internet
   - Revisa los logs de consola para errores

### Debug Avanzado

Para debug avanzado, agrega logs adicionales:

```typescript
// En el composable
console.log("🔍 Debug detallado:", {
  user: currentUser,
  attributes: attributes,
  tokens: {
    access: accessPayload,
    id: idPayload,
  },
});
```

## 📚 Referencias

- [AWS Amplify Auth Documentation](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [Cognito User Pool Attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)
- [JWT Token Structure](https://jwt.io/introduction)
- [SAML Attribute Mapping](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-saml-attribute-mapping.html)

## 🤝 Contribución

Para contribuir a esta implementación:

1. Revisa el código existente
2. Prueba la funcionalidad actual
3. Propone mejoras o correcciones
4. Mantén la consistencia con el estilo del proyecto
5. Documenta los cambios realizados
