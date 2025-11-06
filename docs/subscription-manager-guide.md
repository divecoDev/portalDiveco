# Guía de Uso del Gestor de Suscripciones

El `useSubscriptionManager` es un composable genérico y reutilizable para gestionar suscripciones de cualquier modelo de Amplify Gen 2.

## Características

- ✅ **Genérico**: Funciona con cualquier modelo de Amplify Gen 2
- ✅ **Automático**: Cierra todas las suscripciones al cerrar sesión
- ✅ **Reconexión**: Detecta cuando la ventana vuelve a estar visible
- ✅ **Centralizado**: Gestiona todas las suscripciones desde un solo lugar
- ✅ **Reutilizable**: Puede usarse en cualquier componente

## Uso Básico

### 1. Importar el composable

```typescript
import { useSubscriptionManager } from "~/composables/useSubscriptionManager";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "~/amplify/data/resource";
```

### 2. Registrar una suscripción

```typescript
const { registerSubscription, unregisterSubscription } = useSubscriptionManager();
const dataClient = generateClient<Schema>();

// Crear suscripción para cualquier modelo
const subscription = dataClient.models.MiModelo.onUpdate({
  filter: { id: { eq: 'mi-id' } }
}).subscribe({
  next: (data) => {
    console.log('Actualización recibida:', data);
    // Manejar actualización
  },
  error: (error) => {
    console.error('Error en suscripción:', error);
  }
});

// Registrar la suscripción (ID único, suscripción, nombre del componente)
const SUBSCRIPTION_ID = 'mi-modelo-mi-id';
registerSubscription(SUBSCRIPTION_ID, subscription, 'MiComponente');
```

### 3. Desregistrar al desmontar

```typescript
onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
    unregisterSubscription(SUBSCRIPTION_ID);
  }
});
```

## Ejemplos de Uso con Diferentes Modelos

### Ejemplo 1: Modelo SUIC (Ya implementado)

```typescript
// app/components/suic/EjecutarRPA.vue
const { registerSubscription, unregisterSubscription } = useSubscriptionManager();
const SUBSCRIPTION_ID = `rpa-${props.suicId}`;

const subscription = dataClient.models.SUIC.onUpdate({
  filter: { id: { eq: props.suicId } }
}).subscribe({
  next: (data) => {
    // Manejar actualización de rpaStatus
    if (data?.rpaStatus === 'completed') {
      // Proceso completado
    }
  }
});

registerSubscription(SUBSCRIPTION_ID, subscription, 'EjecutarRPA');
```

### Ejemplo 2: Modelo AuditLog

```typescript
// app/components/audit/AuditPanel.vue
const { registerSubscription, unregisterSubscription } = useSubscriptionManager();
const SUBSCRIPTION_ID = `audit-${userId}`;

// Suscripción a creación de logs de auditoría
const subscription = dataClient.models.AuditLog.onCreate({
  filter: { userId: { eq: userId } }
}).subscribe({
  next: (data) => {
    console.log('Nuevo log de auditoría:', data);
    // Actualizar lista de logs
    refreshAuditLogs();
  }
});

registerSubscription(SUBSCRIPTION_ID, subscription, 'AuditPanel');
```

### Ejemplo 3: Modelo CargaInsumos

```typescript
// app/components/carga/CargaInsumosView.vue
const { registerSubscription, unregisterSubscription } = useSubscriptionManager();
const SUBSCRIPTION_ID = `carga-${cargaId}`;

// Suscripción a actualizaciones de carga
const subscription = dataClient.models.CargaInsumos.onUpdate({
  filter: { id: { eq: cargaId } }
}).subscribe({
  next: (data) => {
    console.log('Carga actualizada:', data);
    // Actualizar estado de la carga
    if (data?.estado === 'completada') {
      showSuccessMessage();
    }
  }
});

registerSubscription(SUBSCRIPTION_ID, subscription, 'CargaInsumosView');
```

### Ejemplo 4: Modelo Boom (Explosión de Materiales)

```typescript
// app/components/boom/ExplosionProcess.vue
const { registerSubscription, unregisterSubscription } = useSubscriptionManager();
const SUBSCRIPTION_ID = `boom-${boomId}`;

// Suscripción a actualizaciones de explosión
const subscription = dataClient.models.Boom.onUpdate({
  filter: { id: { eq: boomId } }
}).subscribe({
  next: (data) => {
    console.log('Explosión actualizada:', data);
    // Actualizar estado del proceso
    if (data?.procesoEstado === 'finalizado') {
      updateProcessStatus('finalizado');
    }
  }
});

registerSubscription(SUBSCRIPTION_ID, subscription, 'ExplosionProcess');
```

## Tipos de Suscripciones Soportadas

El gestor funciona con todos los tipos de suscripciones de Amplify Gen 2:

- `onCreate()` - Cuando se crea un registro
- `onUpdate()` - Cuando se actualiza un registro
- `onDelete()` - Cuando se elimina un registro

```typescript
// onCreate
const createSub = dataClient.models.MiModelo.onCreate({
  filter: { campo: { eq: 'valor' } }
}).subscribe({ next: (data) => {} });

// onUpdate
const updateSub = dataClient.models.MiModelo.onUpdate({
  filter: { id: { eq: 'id' } }
}).subscribe({ next: (data) => {} });

// onDelete
const deleteSub = dataClient.models.MiModelo.onDelete({
  filter: { id: { eq: 'id' } }
}).subscribe({ next: (data) => {} });
```

## Funciones Disponibles

### `registerSubscription(id, subscription, component)`

Registra una suscripción para gestión global.

**Parámetros:**
- `id` (string): ID único para la suscripción (ej: `'suic-123'`, `'audit-456'`)
- `subscription` (object): Objeto de suscripción con método `unsubscribe()`
- `component` (string): Nombre del componente que usa la suscripción

**Ejemplo:**
```typescript
registerSubscription('mi-modelo-123', subscription, 'MiComponente');
```

### `unregisterSubscription(id)`

Desregistra una suscripción del gestor global.

**Parámetros:**
- `id` (string): ID único de la suscripción

**Ejemplo:**
```typescript
unregisterSubscription('mi-modelo-123');
```

### `closeAllSubscriptions()`

Cierra todas las suscripciones registradas. Se llama automáticamente al cerrar sesión.

**Ejemplo:**
```typescript
closeAllSubscriptions(); // Cierra todas las suscripciones
```

### `getActiveSubscriptionsCount()`

Obtiene el número de suscripciones activas.

**Ejemplo:**
```typescript
const count = getActiveSubscriptionsCount();
console.log(`Hay ${count} suscripciones activas`);
```

## Reconexión Automática

El gestor detecta automáticamente cuando la ventana vuelve a estar visible después de horas y notifica a los componentes para que verifiquen sus suscripciones.

### Implementar Reconexión en tu Componente

```typescript
// Función para verificar y reconectar suscripción
const checkAndReconnectSubscription = async () => {
  if (necesitaSuscripcion && !subscription) {
    console.log('🔄 Suscripción perdida, reconectando...');
    
    // Verificar estado actual en BD
    const { data: record } = await dataClient.models.MiModelo.get({ id: miId });
    
    if (record && necesitaReconexion(record)) {
      // Reconectar suscripción
      startSubscription();
    }
  }
};

// Escuchar eventos de verificación
onMounted(() => {
  const handleSubscriptionsCheck = () => {
    checkAndReconnectSubscription();
  };

  window.addEventListener('subscriptions-check-needed', handleSubscriptionsCheck);

  return () => {
    window.removeEventListener('subscriptions-check-needed', handleSubscriptionsCheck);
  };
});
```

## Cierre Automático al Cerrar Sesión

Todas las suscripciones registradas se cierran automáticamente cuando el usuario cierra sesión. No necesitas hacer nada adicional.

## Mejores Prácticas

1. **ID único**: Usa un ID único para cada suscripción (ej: `'modelo-id'`)
2. **Desregistrar al desmontar**: Siempre desregistra la suscripción en `onUnmounted`
3. **Manejo de errores**: Implementa manejo de errores en el callback `error`
4. **Reconexión**: Implementa lógica de reconexión si es necesario
5. **Logging**: Usa logs descriptivos para debugging

## Ejemplo Completo

```typescript
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSubscriptionManager } from '~/composables/useSubscriptionManager';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '~/amplify/data/resource';

const props = defineProps({
  recordId: {
    type: String,
    required: true
  }
});

const { registerSubscription, unregisterSubscription } = useSubscriptionManager();
const dataClient = generateClient<Schema>();

let subscription: any = null;
const SUBSCRIPTION_ID = `mi-modelo-${props.recordId}`;

const startSubscription = () => {
  if (subscription) {
    console.log('⚠️ Suscripción ya está activa');
    return;
  }

  subscription = dataClient.models.MiModelo.onUpdate({
    filter: { id: { eq: props.recordId } }
  }).subscribe({
    next: (data) => {
      console.log('📨 Actualización recibida:', data);
      // Manejar actualización
    },
    error: (error) => {
      console.error('❌ Error en suscripción:', error);
    }
  });

  registerSubscription(SUBSCRIPTION_ID, subscription, 'MiComponente');
  console.log('✅ Suscripción iniciada');
};

const stopSubscription = () => {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
    unregisterSubscription(SUBSCRIPTION_ID);
    console.log('🔕 Suscripción cerrada');
  }
};

// Función para reconectar si es necesario
const checkAndReconnectSubscription = async () => {
  if (necesitaSuscripcion && !subscription) {
    console.log('🔄 Reconectando suscripción...');
    startSubscription();
  }
};

onMounted(() => {
  startSubscription();

  // Escuchar eventos de verificación
  const handleSubscriptionsCheck = () => {
    checkAndReconnectSubscription();
  };

  window.addEventListener('subscriptions-check-needed', handleSubscriptionsCheck);

  return () => {
    window.removeEventListener('subscriptions-check-needed', handleSubscriptionsCheck);
  };
});

onUnmounted(() => {
  stopSubscription();
});
</script>
```

## Conclusión

El `useSubscriptionManager` es completamente genérico y puede usarse con cualquier modelo de Amplify Gen 2. Solo necesitas:

1. Importar el composable
2. Registrar tu suscripción con un ID único
3. Desregistrar al desmontar

¡Y listo! Todas las suscripciones se gestionarán automáticamente.

