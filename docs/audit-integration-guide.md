# Guía Completa de Integración del Módulo de Auditoría

Esta guía te ayudará a integrar el módulo de auditoría en tus módulos nuevos y existentes de forma sencilla y efectiva.

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Métodos de Integración](#métodos-de-integración)
3. [Integración Manual Simple](#1-integración-manual-simple)
4. [Integración con Hooks de Vue](#2-integración-con-hooks-de-vue)
5. [Integración con Helpers](#3-integración-con-helpers)
6. [Integración con Decoradores](#4-integración-con-decoradores)
7. [Integración con Middleware](#5-integración-con-middleware)
8. [Integración Automática con Plugin](#6-integración-automática-con-plugin)
9. [Ejemplos Reales](#ejemplos-reales)
10. [Mejores Prácticas](#mejores-prácticas)
11. [Consideraciones Técnicas Importantes](#consideraciones-técnicas-importantes)
12. [Troubleshooting](#troubleshooting)

---

## Introducción

El módulo de auditoría proporciona múltiples formas de integrar el registro de acciones en tu código, desde la más simple (una línea de código) hasta la completamente automática (sin código adicional).

### ¿Qué se registra automáticamente?

- **Usuario**: Quién realizó la acción (extraído automáticamente)
- **IP Address**: Dirección IP del usuario
- **User Agent**: Navegador y dispositivo
- **Device Fingerprint**: Identificador único del dispositivo
- **Timestamp**: Fecha y hora exacta
- **Cambios**: Estado antes/después (si aplica)

---

## Métodos de Integración

Hay 6 métodos principales, ordenados de más simple a más automático:

1. **Manual Simple**: Usar composable directamente
2. **Hooks de Vue**: Hooks reactivos para componentes Vue
3. **Helpers**: Funciones utilitarias para envolver código existente
4. **Decoradores**: Decoradores TypeScript para clases/métodos
5. **Middleware**: Middleware automático para rutas
6. **Plugin Automático**: Configuración automática para modelos Amplify

---

## 1. Integración Manual Simple

### Uso del Composable `useAudit`

La forma más directa de registrar auditoría es usando el composable `useAudit`:

```typescript
import { useAudit } from "~/composables/useAudit";

// En tu componente o composable
const { logCreate, logUpdate, logDelete, logRead } = useAudit();

// Registrar CREATE
await logCreate("boom", "Boom", boomId, newData, {
  version: "1.0",
  description: "Nueva explosión",
});

// Registrar UPDATE
await logUpdate("boom", "Boom", boomId, oldData, newData, {
  version: newData.version,
});

// Registrar DELETE
await logDelete("boom", "Boom", boomId, oldData, {
  reason: "Eliminado por usuario",
});

// Registrar READ (opcional)
await logRead("boom", "Boom", boomId, {
  viewType: "detail",
});
```

### Ejemplo Completo en un Componente

```vue
<template>
  <div>
    <button @click="createBoom">Crear Explosión</button>
    <button @click="updateBoom">Actualizar Explosión</button>
    <button @click="deleteBoom">Eliminar Explosión</button>
  </div>
</template>

<script setup lang="ts">
import { useAudit } from "~/composables/useAudit";
import { generateClient } from "aws-amplify/data";

const client = generateClient();
const { logCreate, logUpdate, logDelete } = useAudit();

const createBoom = async () => {
  try {
    // Crear en la base de datos
    const result = await client.models.Boom.create({
      version: "1.0",
      descripcion: "Nueva explosión",
      // ... otros campos
    });

    // Registrar auditoría
    await logCreate(
      "boom",
      "Boom",
      result.data?.id || "unknown",
      result.data,
      {
        version: result.data?.version,
      }
    );

    console.log("✅ Boom creado y auditado");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

const updateBoom = async (boomId: string, oldData: any, newData: any) => {
  try {
    // Actualizar en la base de datos
    const result = await client.models.Boom.update({
      id: boomId,
      ...newData,
    });

    // Registrar auditoría
    await logUpdate("boom", "Boom", boomId, oldData, result.data, {
      version: result.data?.version,
    });

    console.log("✅ Boom actualizado y auditado");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

const deleteBoom = async (boomId: string, oldData: any) => {
  try {
    // Eliminar de la base de datos
    await client.models.Boom.delete({ id: boomId });

    // Registrar auditoría
    await logDelete("boom", "Boom", boomId, oldData, {
      reason: "Eliminado por usuario",
    });

    console.log("✅ Boom eliminado y auditado");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
</script>
```

---

## 2. Integración con Hooks de Vue

Los hooks de Vue permiten registrar auditoría automáticamente cuando cambian los datos reactivos.

### Hook `useAuditOnCreate`

Registra automáticamente cuando se crea una nueva entidad:

```typescript
import { useAuditOnCreate } from "~/composables/useAuditHooks";
import { ref } from "vue";

const result = ref(null);
const loading = ref(false);

// Configurar hook
useAuditOnCreate(
  result,
  "boom",
  "Boom",
  (data) => data?.id, // Extraer ID
  (data) => data // Extraer datos
);

// Cuando result cambia de null a un valor, se registra automáticamente
const createBoom = async () => {
  loading.value = true;
  const response = await client.models.Boom.create(boomData);
  result.value = response.data; // Esto dispara la auditoría automáticamente
  loading.value = false;
};
```

### Hook `useAuditOnUpdate`

Registra automáticamente cuando se actualiza una entidad:

```typescript
import { useAuditOnUpdate } from "~/composables/useAuditHooks";

const result = ref(null);
const oldData = ref(null);

// Configurar hook
useAuditOnUpdate(
  result,
  oldData,
  "boom",
  "Boom",
  (data) => data?.id,
  (old) => old,
  (newData) => newData
);

const updateBoom = async (id: string, newData: any) => {
  // Guardar datos antiguos
  const current = await client.models.Boom.get({ id });
  oldData.value = current.data;

  // Actualizar
  const response = await client.models.Boom.update({ id, ...newData });
  result.value = response.data; // Esto dispara la auditoría automáticamente
};
```

### Hook `useAuditOnDelete`

Registra automáticamente cuando se elimina una entidad:

```typescript
import { useAuditOnDelete } from "~/composables/useAuditHooks";

const deletedId = ref<string | undefined>(undefined);
const deletedData = ref(null);

// Configurar hook
useAuditOnDelete(deletedId, deletedData, "boom", "Boom");

const deleteBoom = async (id: string) => {
  // Obtener datos antes de eliminar
  const current = await client.models.Boom.get({ id });
  deletedData.value = current.data;

  // Eliminar
  await client.models.Boom.delete({ id });

  // Esto dispara la auditoría automáticamente
  deletedId.value = id;
};
```

### Hook Combinado `useAuditCRUD`

Para operaciones CRUD completas:

```typescript
import { useAuditCRUD } from "~/composables/useAuditHooks";

const result = ref(null);
const oldData = ref(null);
const deletedId = ref<string | undefined>(undefined);
const deletedData = ref(null);

// Configurar todos los hooks
useAuditCRUD({
  result,
  oldData,
  deletedId,
  deletedData,
  module: "boom",
  entityType: "Boom",
  extractEntityId: (data) => data?.id,
  extractData: (data) => data,
});
```

---

## 3. Integración con Helpers

### Helper Simple `createSimpleAuditHelper`

Útil cuando necesitas múltiples operaciones de auditoría:

```typescript
import { createSimpleAuditHelper } from "~/utils/audit-integration-helpers";

// Crear helper
const boomAudit = createSimpleAuditHelper({
  module: "boom",
  entityType: "Boom",
  extractId: (data) => data?.id,
});

// Uso
async function createBoom(data: any) {
  const result = await client.models.Boom.create(data);
  await boomAudit.create(result.data, { version: result.data.version });
  return result;
}

async function updateBoom(id: string, oldData: any, newData: any) {
  const result = await client.models.Boom.update({ id, ...newData });
  await boomAudit.update(oldData, result.data);
  return result;
}

async function deleteBoom(id: string, data: any) {
  await client.models.Boom.delete({ id });
  await boomAudit.delete(data);
}
```

### Helper `wrapWithAudit`

Envuelve funciones existentes con auditoría automática:

```typescript
import { wrapWithAudit } from "~/utils/audit-integration-helpers";

// Función original
async function createUser(userData: any) {
  const result = await client.models.User.create(userData);
  return result.data;
}

// Envolver con auditoría
const createUserWithAudit = wrapWithAudit(createUser, {
  action: "CREATE",
  module: "admin-users",
  entityType: "User",
  extractEntityId: (args, result) => result?.id,
  extractData: (args, result) => ({ after: result }),
  metadata: (args, result) => ({
    email: result?.email,
    role: result?.role,
  }),
});

// Usar (la auditoría se registra automáticamente)
const newUser = await createUserWithAudit({ email: "user@example.com" });
```

### Helper `createAuditWrapper`

Crea un wrapper personalizado para múltiples funciones:

```typescript
import { createAuditWrapper } from "~/utils/audit-integration-helpers";

// Crear wrapper
const boomAuditWrapper = createAuditWrapper({
  module: "boom",
  entityType: "Boom",
  extractEntityId: (args, result) => result?.id || args[0]?.id,
});

// Envolver funciones
const createBoom = boomAuditWrapper("CREATE", async (data) => {
  return await client.models.Boom.create(data);
});

const updateBoom = boomAuditWrapper("UPDATE", async (id, data, oldData) => {
  return await client.models.Boom.update({ id, ...data });
});

const deleteBoom = boomAuditWrapper("DELETE", async (id, data) => {
  return await client.models.Boom.delete({ id });
});
```

---

## 4. Integración con Decoradores

Los decoradores TypeScript permiten agregar auditoría automática a métodos y clases.

### Decorador `@AuditAction`

Para métodos individuales:

```typescript
import { AuditAction } from "~/utils/audit-decorators";
import { extractIdFromResult, extractDataFromResult } from "~/utils/audit-decorators";

class BoomService {
  @AuditAction({
    action: "CREATE",
    module: "boom",
    entityType: "Boom",
    extractEntityId: extractIdFromResult,
    extractData: (args, result) => ({ after: result }),
    metadata: (args, result) => ({
      version: result?.version,
    }),
  })
  async createBoom(data: any) {
    const client = generateClient();
    const result = await client.models.Boom.create(data);
    return result.data;
  }

  @AuditAction({
    action: "UPDATE",
    module: "boom",
    entityType: "Boom",
    extractEntityId: (args) => args[0]?.id,
    extractData: (args, result) => ({
      before: args[1], // oldData como segundo argumento
      after: result,
    }),
  })
  async updateBoom(id: string, oldData: any, newData: any) {
    const client = generateClient();
    const result = await client.models.Boom.update({ id, ...newData });
    return result.data;
  }
}
```

### Decorador `@AuditModel`

Para clases completas:

```typescript
import { AuditModel } from "~/utils/audit-decorators";

@AuditModel({
  module: "boom",
  entityType: "Boom",
  autoAudit: {
    create: true,
    update: true,
    delete: true,
  },
})
class BoomModel {
  async create(data: any) {
    // ... lógica de creación
  }

  async update(id: string, data: any) {
    // ... lógica de actualización
  }

  async delete(id: string) {
    // ... lógica de eliminación
  }
}
```

**Nota**: Los decoradores requieren habilitar experimental decorators en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## 5. Integración con Middleware

El middleware de rutas registra automáticamente accesos a rutas específicas.

### Configuración de Rutas

```typescript
// app/middleware/audit-route.ts (ya configurado)
import { registerAuditRoute } from "~/middleware/audit-route";

// Registrar una ruta específica
registerAuditRoute("/tools/explosion-materiales/new", {
  module: "boom",
  action: "READ",
  entityType: "BoomForm",
});

// Registrar con patrón de ruta
registerAuditRoute(/^\/tools\/boom\/\d+$/, {
  module: "boom",
  action: "READ",
  entityType: "Boom",
  extractEntityId: (route) => route.params.id as string,
});
```

### Usar en una Página

```vue
<!-- app/pages/tools/explosion-materiales/new.vue -->
<script setup>
// El middleware se ejecuta automáticamente
// No necesitas código adicional
</script>
```

### Configuración en `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  // ... otras configuraciones
});
```

---

## 6. Integración Automática con Plugin

El plugin proporciona utilidades globales para auditoría.

### Usar Helper del Plugin

```typescript
// En cualquier componente
const { $audit } = useNuxtApp();

// Crear helper
const boomAudit = $audit.helper("boom", "Boom");

// Usar
await boomAudit.create(newBoom);
await boomAudit.update(oldBoom, newBoom);
await boomAudit.delete(deletedBoom);
```

### Usar Wrapper del Plugin

```typescript
const { $audit } = useNuxtApp();

const createBoom = $audit.wrap(
  async (data: any) => {
    const client = generateClient();
    return await client.models.Boom.create(data);
  },
  {
    action: "CREATE",
    module: "boom",
    entityType: "Boom",
    extractEntityId: (args, result) => result?.id,
  }
);
```

---

## Ejemplos Reales

### Ejemplo 1: Integración en Módulo Boom

```typescript
// app/composables/useBoomProcess.ts
import { useAudit } from "~/composables/useAudit";

export const useBoomProcess = () => {
  const { logCreate, logUpdate, logDelete } = useAudit();
  const client = generateClient();

  const createBoom = async (data: any) => {
    try {
      const result = await client.models.Boom.create(data);

      // Registrar auditoría
      await logCreate(
        "boom",
        "Boom",
        result.data?.id || "unknown",
        result.data,
        {
          version: result.data?.version,
          username: result.data?.username,
        }
      );

      return result;
    } catch (error) {
      console.error("Error al crear boom:", error);
      throw error;
    }
  };

  const updateBoom = async (id: string, oldData: any, newData: any) => {
    try {
      const result = await client.models.Boom.update({ id, ...newData });

      // Registrar auditoría
      await logUpdate("boom", "Boom", id, oldData, result.data, {
        version: result.data?.version,
      });

      return result;
    } catch (error) {
      console.error("Error al actualizar boom:", error);
      throw error;
    }
  };

  return {
    createBoom,
    updateBoom,
  };
};
```

### Ejemplo 2: Integración con Helper Simple

```typescript
// app/services/boom.service.ts
import { createSimpleAuditHelper } from "~/utils/audit-integration-helpers";
import { generateClient } from "aws-amplify/data";

const client = generateClient();
const boomAudit = createSimpleAuditHelper({
  module: "boom",
  entityType: "Boom",
});

export class BoomService {
  async create(data: any) {
    const result = await client.models.Boom.create(data);
    await boomAudit.create(result.data, { version: data.version });
    return result;
  }

  async update(id: string, oldData: any, newData: any) {
    const result = await client.models.Boom.update({ id, ...newData });
    await boomAudit.update(oldData, result.data);
    return result;
  }

  async delete(id: string, data: any) {
    await client.models.Boom.delete({ id });
    await boomAudit.delete(data);
  }
}
```

### Ejemplo 3: Integración con Decorador

```typescript
// app/services/boom.service.ts
import { AuditAction, extractIdFromResult } from "~/utils/audit-decorators";
import { generateClient } from "aws-amplify/data";

const client = generateClient();

export class BoomService {
  @AuditAction({
    action: "CREATE",
    module: "boom",
    entityType: "Boom",
    extractEntityId: extractIdFromResult,
    extractData: (args, result) => ({ after: result }),
    metadata: (args, result) => ({
      version: result?.version,
    }),
  })
  async create(data: any) {
    return await client.models.Boom.create(data);
  }

  @AuditAction({
    action: "UPDATE",
    module: "boom",
    entityType: "Boom",
    extractEntityId: (args) => args[0]?.id,
    extractData: (args, result) => ({
      before: args[1],
      after: result,
    }),
  })
  async update(id: string, oldData: any, newData: any) {
    return await client.models.Boom.update({ id, ...newData });
  }
}
```

---

## Mejores Prácticas

### 1. **Usa el método más simple que funcione**

- **Manual**: Para casos únicos o especiales
- **Hooks**: Para componentes Vue reactivos
- **Helpers**: Para servicios y funciones reutilizables
- **Decoradores**: Para clases y servicios complejos
- **Middleware**: Para auditoría de rutas
- **Plugin**: Para configuración global

### 1.1. **Manejo de campos JSON en Amplify Gen 2**

**IMPORTANTE**: Amplify Gen 2 requiere que los campos definidos como `a.json()` en el schema se envíen como **strings JSON**, no como objetos JavaScript.

El servicio de auditoría (`AuditService`) maneja esto automáticamente, pero es importante saberlo si estás creando tus propios logs:

```typescript
// ✅ Correcto - El servicio serializa automáticamente
await logCreate("boom", "Boom", id, data, {
  version: "1.0",
  customField: "value",
});

// ✅ También correcto - Si creas logs directamente
await client.models.AuditLog.create({
  // ... otros campos
  metadata: JSON.stringify({ version: "1.0" }), // Serializar a string
  changes: JSON.stringify({ before: {}, after: {} }), // Serializar a string
});

// ❌ Incorrecto - Enviar objetos JavaScript directamente
await client.models.AuditLog.create({
  metadata: { version: "1.0" }, // Error: Variable 'metadata' has an invalid value
});
```

**Campos JSON en el modelo AuditLog**:
- `changes`: Estado antes/después (se serializa automáticamente)
- `metadata`: Información adicional (se serializa automáticamente)

**Omitir campos opcionales**: Si un campo JSON no tiene valor, omítelo completamente del objeto en lugar de enviarlo como `null` o `undefined`:
```typescript
const auditLogData: any = {
  userId: context.userId,
  // ... otros campos requeridos
  // metadata solo se incluye si tiene valor
  ...(preparedMetadata ? { metadata: JSON.stringify(preparedMetadata) } : {}),
};
```

### 2. **Registra auditoría después de operaciones exitosas**

```typescript
// ✅ Correcto
const result = await createBoom(data);
await logCreate("boom", "Boom", result.id, result);

// ❌ Incorrecto (puede registrar incluso si falla)
await logCreate("boom", "Boom", data.id, data);
await createBoom(data);
```

### 3. **Incluye metadata útil**

```typescript
await logUpdate("boom", "Boom", id, oldData, newData, {
  version: newData.version,
  changedBy: user.id,
  reason: "Actualización de plan de producción",
  fieldsChanged: ["status", "descripcion"],
});
```

**Nota importante**: El servicio de auditoría serializa automáticamente el `metadata` a string JSON antes de enviarlo a Amplify. No necesitas hacer nada especial, solo pasar un objeto JavaScript normal.

### 4. **Maneja errores de auditoría sin bloquear operaciones**

```typescript
try {
  await logCreate("boom", "Boom", id, data);
} catch (auditError) {
  // No bloquear la operación principal si falla la auditoría
  console.warn("⚠️ Error al registrar auditoría:", auditError);
}
```

### 5. **Usa extractores consistentes**

```typescript
// Crear extractores reutilizables
const extractBoomId = (data: any) => data?.id || data?.data?.id;

// Usar en múltiples lugares
await logCreate("boom", "Boom", extractBoomId(result), result);
```

### 6. **No registres auditoría para operaciones internas**

```typescript
// ✅ Registrar operaciones del usuario
await logCreate("boom", "Boom", id, data);

// ❌ No registrar operaciones automáticas del sistema
// (a menos que sea necesario para auditoría)
```

---

## Troubleshooting

### Error: "Variable 'metadata' has an invalid value"

**Problema**: Este error ocurre cuando se intenta enviar un campo `a.json()` con un valor inválido.

**Causa**: Amplify Gen 2 requiere que los campos definidos como `a.json()` en el schema se envíen como **strings JSON**, no como objetos JavaScript.

**Solución**: El servicio de auditoría ya maneja esto automáticamente, pero si estás creando tus propios logs, asegúrate de:

1. **Serializar campos JSON a strings antes de enviar**:
```typescript
// ❌ Incorrecto - Enviar objeto JavaScript directamente
await client.models.AuditLog.create({
  metadata: { key: "value" }, // Error: Variable 'metadata' has an invalid value
});

// ✅ Correcto - Serializar a string JSON
await client.models.AuditLog.create({
  metadata: JSON.stringify({ key: "value" }), // Funciona correctamente
});

// ✅ También correcto - Omitir el campo si no tiene valor
await client.models.AuditLog.create({
  // metadata no se incluye si es undefined
});
```

2. **Omitir campos opcionales cuando no tienen valor**:
```typescript
const auditLogData: any = {
  userId: context.userId,
  userEmail: context.userEmail,
  action: "LOGIN",
  // metadata solo se incluye si tiene valor válido
  ...(preparedMetadata ? { metadata: JSON.stringify(preparedMetadata) } : {}),
};
```

3. **Limpiar objetos antes de serializar**:
```typescript
// Eliminar valores undefined antes de serializar
const cleanMetadata: Record<string, any> = {};
for (const [key, value] of Object.entries(metadata)) {
  if (value !== undefined) {
    cleanMetadata[key] = value;
  }
}

// Solo serializar si tiene propiedades válidas
const serializedMetadata = Object.keys(cleanMetadata).length > 0
  ? JSON.stringify(cleanMetadata)
  : undefined;
```

**Nota importante**: El servicio `AuditService` en `app/services/audit.service.ts` ya maneja esto automáticamente para los campos `changes` y `metadata`. No necesitas hacer nada especial al usar `useAudit()` o los helpers.

### Error: "Modelo no configurado para auditoría automática"

**Solución**: Agrega el modelo a `AUTO_AUDIT_MODELS` en `app/plugins/audit.client.ts`:

```typescript
const AUTO_AUDIT_MODELS: Record<string, AuditModule> = {
  TuModelo: "tu-modulo",
};
```

### Error: Decoradores no funcionan

**Solución**: Asegúrate de tener habilitados los decoradores en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Auditoría no se registra en el backend

**Verifica**:
1. Que el backend esté desplegado correctamente
2. Que el modelo `AuditLog` esté creado en Amplify
3. Revisa los logs de la consola del navegador
4. Verifica que Amplify esté configurado correctamente antes de usar el servicio

**Nota**: El servicio de auditoría usa **acceso directo a modelos Amplify Gen 2**, no requiere Lambdas. Si ves errores de "Client could not be generated", asegúrate de que `Amplify.configure()` se ejecute antes de usar el servicio.

### Los hooks no disparan auditoría

**Solución**: Asegúrate de que los refs cambien correctamente:

```typescript
// ✅ Correcto - el ref cambia
result.value = newData;

// ❌ Incorrecto - mutar el objeto no dispara el watch
result.value.status = "new";
```

### Middleware no registra accesos

**Solución**: Verifica que la ruta esté registrada:

```typescript
// En app/middleware/audit-route.ts o en tu componente
registerAuditRoute("/tu/ruta", {
  module: "tu-modulo",
  action: "READ",
  entityType: "TuEntidad",
});
```

### Login/Logout no se registra automáticamente

**Solución**: Verifica que:

1. **El plugin `auth-check.client.ts` esté ejecutándose**: Deberías ver `🔍 Plugin auth-check iniciado...` en la consola al cargar la página.

2. **El componente `AuthenticatedContent` en `app.vue` esté montándose**: Deberías ver `🔐 AuthenticatedContent montado, ejecutando checkAuth()...` cuando el usuario está autenticado.

3. **El middleware `auth.ts` esté ejecutándose**: Deberías ver `Usuario autenticado correctamente` cuando navegas a rutas protegidas.

4. **El logout se registre antes de cerrar sesión**: El logout se registra en `AppSidebar.vue` antes de navegar a `/logout`.

**Nota**: El login se registra automáticamente cuando:
- La aplicación se carga con un usuario autenticado (plugin `auth-check.client.ts`)
- El usuario se autentica a través del componente `Authenticator` (componente `AuthenticatedContent`)
- El middleware `auth.ts` detecta un usuario autenticado

El logout se registra automáticamente cuando:
- El usuario hace clic en "Cerrar sesión" en el sidebar (`AppSidebar.vue`)

### Error: "onMounted is called when there is no active component instance"

**Problema**: Este error ocurre cuando se llama a `useAuth()` o cualquier composable que use lifecycle hooks fuera del contexto de `setup()`.

**Solución**: Asegúrate de inicializar los composables en el `setup()` del componente, no dentro de funciones asíncronas:

```typescript
// ✅ Correcto - Inicializar en setup()
<script setup lang="ts">
const { currentUser, logout } = useAuth();

const navigateToLogout = async () => {
  // Usar currentUser y logout directamente
  if (currentUser.value) {
    await logout();
  }
};
</script>

// ❌ Incorrecto - Llamar dentro de función asíncrona
const navigateToLogout = async () => {
  const { useAuth } = await import("~/composables/useAuth");
  const { currentUser } = useAuth(); // Error: lifecycle hooks no disponibles
};
```

---

## Consideraciones Técnicas Importantes

### Manejo de Campos JSON en Amplify Gen 2

**Regla crítica**: Los campos definidos como `a.json()` en el schema de Amplify Gen 2 deben enviarse como **strings JSON**, no como objetos JavaScript.

#### ¿Por qué es importante?

Amplify Gen 2 valida los tipos de datos en el cliente antes de enviarlos al backend. Si envías un objeto JavaScript directamente a un campo `a.json()`, obtendrás el error:

```
Variable 'metadata' has an invalid value.
```

#### ¿Cómo lo maneja el servicio de auditoría?

El servicio `AuditService` en `app/services/audit.service.ts` maneja esto automáticamente:

1. **Limpia el metadata**: Elimina valores `undefined` y propiedades no serializables
2. **Serializa a string JSON**: Convierte el objeto a string JSON antes de enviarlo
3. **Omite campos vacíos**: Si el metadata está vacío o no tiene valor, omite el campo completamente

#### Ejemplo de implementación interna

```typescript
// En app/services/audit.service.ts (implementación interna)
// Preparar metadata
let preparedMetadata: string | undefined = undefined;
if (metadata && typeof metadata === "object") {
  // Limpiar y validar
  const cleanMetadata: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined) {
      cleanMetadata[key] = JSON.parse(JSON.stringify(value));
    }
  }
  
  // Serializar a string JSON
  if (Object.keys(cleanMetadata).length > 0) {
    preparedMetadata = JSON.stringify(cleanMetadata);
  }
}

// Construir objeto de datos
const auditLogData: any = {
  userId: context.userId,
  // ... otros campos
  // Solo incluir metadata si tiene valor (como string JSON)
  ...(preparedMetadata ? { metadata: preparedMetadata } : {}),
};
```

#### ¿Qué significa para ti como desarrollador?

**No necesitas hacer nada especial** al usar `useAudit()` o los helpers. El servicio maneja todo automáticamente:

```typescript
// ✅ Funciona correctamente - El servicio serializa automáticamente
await logCreate("boom", "Boom", id, data, {
  version: "1.0",
  customField: "value",
  nestedObject: { key: "value" },
});

// ✅ También funciona con objetos complejos
await logUpdate("boom", "Boom", id, oldData, newData, {
  changes: {
    fields: ["status", "description"],
    user: currentUser,
    timestamp: new Date(),
  },
});
```

**Solo si estás creando logs directamente** (sin usar el servicio), necesitas serializar manualmente:

```typescript
// ❌ Incorrecto - Error: Variable 'metadata' has an invalid value
await client.models.AuditLog.create({
  metadata: { key: "value" },
});

// ✅ Correcto - Serializar a string JSON
await client.models.AuditLog.create({
  metadata: JSON.stringify({ key: "value" }),
});
```

### Registro Automático de Login/Logout

El módulo de auditoría registra automáticamente los eventos de login y logout:

#### Login

Se registra automáticamente cuando:
1. **Plugin `auth-check.client.ts`**: Se ejecuta al cargar la aplicación y detecta un usuario autenticado
2. **Componente `AuthenticatedContent` en `app.vue`**: Se ejecuta cuando el usuario se autentica a través del componente `Authenticator`
3. **Middleware `auth.ts`**: Se ejecuta cuando el usuario navega a rutas protegidas

**Flujo**:
```
Usuario autenticado → Plugin/Middleware detecta → checkAuth() → logLogin() → Registro en base de datos
```

#### Logout

Se registra automáticamente cuando:
1. **Usuario hace clic en "Cerrar sesión"** en el sidebar (`AppSidebar.vue`)
2. **Se ejecuta `navigateToLogout()`** que llama a `logLogout()` antes de navegar a `/logout`

**Flujo**:
```
Usuario hace clic en logout → navigateToLogout() → logLogout() → Registro en base de datos → Navegar a /logout
```

**Nota importante**: El logout se registra **antes** de cerrar la sesión para asegurar que el usuario esté autenticado cuando se realiza el registro.

### Prevención de Duplicados

El sistema previene registros duplicados de login usando `sessionStorage`:

```typescript
// En app/composables/useAuth.ts
const storedLastLoggedUserId = sessionStorage.getItem("lastLoggedUserId");
const shouldLogLogin = !storedLastLoggedUserId || storedLastLoggedUserId !== user.userId;

if (shouldLogLogin) {
  // Registrar login
  await logLogin(user.userId, { ... });
  sessionStorage.setItem("lastLoggedUserId", user.userId);
}
```

Esto asegura que:
- Solo se registre un login por sesión de navegador
- No se creen logs duplicados al recargar la página
- Se registre un nuevo login si el usuario cambia (otro usuario inicia sesión)

### Acceso Directo a Modelos Amplify Gen 2

**Importante**: El servicio de auditoría usa **acceso directo a modelos Amplify Gen 2**, no requiere Lambdas.

**Ventajas**:
- Más rápido y eficiente
- Menor latencia
- Menos recursos (no necesita ejecutar Lambdas)
- Más simple de mantener

**Cómo funciona**:
```typescript
// En app/services/audit.service.ts
const client = generateClient<Schema>();
const response = await client.models.AuditLog.create(auditLogData);
```

**Requisitos**:
- Amplify debe estar configurado antes de usar el servicio
- El cliente se inicializa de forma lazy (solo cuando se necesita)
- Se verifica que Amplify esté configurado antes de generar el cliente

---

## Recursos Adicionales

- **Código fuente**: `app/composables/useAudit.ts`
- **Servicio**: `app/services/audit.service.ts`
- **Helpers**: `app/utils/audit-integration-helpers.ts`
- **Hooks**: `app/composables/useAuditHooks.ts`
- **Decoradores**: `app/utils/audit-decorators.ts`
- **Middleware**: `app/middleware/audit-route.ts`
- **Plugin**: `app/plugins/audit.client.ts`
- **Plugin de autenticación**: `app/plugins/auth-check.client.ts`

---

## Soporte

Si tienes problemas o preguntas sobre la integración:

1. Revisa esta guía completa
2. Consulta los ejemplos en el código
3. Revisa los logs de la consola del navegador (busca los emojis 🔍, 🔐, 🚪, ✅, ❌)
4. Verifica que Amplify esté configurado correctamente
5. Asegúrate de que el modelo `AuditLog` esté creado en Amplify

---

**Última actualización**: 2024

