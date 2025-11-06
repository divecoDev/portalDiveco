/**
 * Composable para gestionar suscripciones globalmente
 * Permite cerrar todas las suscripciones al cerrar sesión
 * y reconectar automáticamente cuando la ventana vuelve a estar activa
 * 
 * @example
 * // Uso básico en cualquier componente
 * const { registerSubscription, unregisterSubscription } = useSubscriptionManager();
 * 
 * // Registrar suscripción de cualquier modelo
 * const subscription = dataClient.models.MiModelo.onUpdate({
 *   filter: { id: { eq: 'mi-id' } }
 * }).subscribe({
 *   next: (data) => {
 *     // Manejar actualización
 *   }
 * });
 * 
 * registerSubscription('mi-modelo-mi-id', subscription, 'MiComponente');
 * 
 * // Al desmontar o cerrar
 * unregisterSubscription('mi-modelo-mi-id');
 * subscription.unsubscribe();
 * 
 * @example
 * // Uso con múltiples modelos
 * // Modelo SUIC
 * const suicSub = dataClient.models.SUIC.onUpdate({...}).subscribe({...});
 * registerSubscription('suic-123', suicSub, 'EjecutarRPA');
 * 
 * // Modelo AuditLog
 * const auditSub = dataClient.models.AuditLog.onCreate({...}).subscribe({...});
 * registerSubscription('audit-456', auditSub, 'AuditPanel');
 * 
 * // Modelo CargaInsumos
 * const cargaSub = dataClient.models.CargaInsumos.onUpdate({...}).subscribe({...});
 * registerSubscription('carga-789', cargaSub, 'CargaInsumosView');
 * 
 * // Todas se cerrarán automáticamente al cerrar sesión
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { Hub } from 'aws-amplify/utils';

type Subscription = {
  unsubscribe: () => void;
  id: string;
  component: string;
};

const subscriptions = ref<Map<string, Subscription>>(new Map());
let hubListener: any = null;

/**
 * Registra una suscripción para gestión global
 */
export const registerSubscription = (id: string, subscription: { unsubscribe: () => void }, component: string) => {
  subscriptions.value.set(id, {
    unsubscribe: subscription.unsubscribe,
    id,
    component
  });
  console.log(`📝 Suscripción registrada: ${id} (${component})`);
};

/**
 * Desregistra una suscripción
 */
export const unregisterSubscription = (id: string) => {
  if (subscriptions.value.has(id)) {
    subscriptions.value.delete(id);
    console.log(`🗑️ Suscripción desregistrada: ${id}`);
  }
};

/**
 * Cierra todas las suscripciones registradas
 */
export const closeAllSubscriptions = () => {
  console.log(`🔕 Cerrando ${subscriptions.value.size} suscripciones...`);
  
  subscriptions.value.forEach((subscription, id) => {
    try {
      subscription.unsubscribe();
      console.log(`✅ Suscripción cerrada: ${id} (${subscription.component})`);
    } catch (error) {
      console.error(`❌ Error cerrando suscripción ${id}:`, error);
    }
  });
  
  subscriptions.value.clear();
  console.log('✅ Todas las suscripciones cerradas');
};

/**
 * Obtiene el número de suscripciones activas
 */
export const getActiveSubscriptionsCount = () => {
  return subscriptions.value.size;
};

/**
 * Composable para gestionar suscripciones
 */
export const useSubscriptionManager = () => {
  // Escuchar eventos de autenticación para cerrar suscripciones al logout
  onMounted(() => {
    if (!hubListener) {
      hubListener = Hub.listen('auth', (data) => {
        if (data.payload.event === 'signedOut') {
          console.log('🚪 Usuario cerró sesión, cerrando todas las suscripciones...');
          closeAllSubscriptions();
        }
      });
    }
  });

  // Detectar cuando la ventana vuelve a estar visible después de horas
  onMounted(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Ventana visible nuevamente, verificando suscripciones...');
        
        // Verificar si hay suscripciones registradas pero posiblemente desconectadas
        if (subscriptions.value.size > 0) {
          console.log(`⚠️ Hay ${subscriptions.value.size} suscripciones registradas. Verifica si necesitan reconexión.`);
          // Notificar a los componentes que deben verificar sus suscripciones
          window.dispatchEvent(new CustomEvent('subscriptions-check-needed'));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // También detectar cuando la ventana vuelve a tener foco
    window.addEventListener('focus', () => {
      console.log('🎯 Ventana con foco, verificando suscripciones...');
      if (subscriptions.value.size > 0) {
        window.dispatchEvent(new CustomEvent('subscriptions-check-needed'));
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  });

  onUnmounted(() => {
    if (hubListener) {
      Hub.remove('auth', hubListener);
      hubListener = null;
    }
  });

  return {
    registerSubscription,
    unregisterSubscription,
    closeAllSubscriptions,
    getActiveSubscriptionsCount
  };
};

