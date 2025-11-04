<template>
  <div
    class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
  >
    <!-- Header con gradiente -->
    <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon :name="actionIcon(log?.action)" class="w-6 h-6 text-white mr-3" />
          <h2 class="text-xl font-semibold text-white">
            Detalle de Log de Auditoría
          </h2>
        </div>
        <UButton
          icon="i-heroicons-arrow-left"
          size="sm"
          color="white"
          variant="ghost"
          @click="$emit('close')"
          class="text-white hover:bg-white/20"
        >
          Volver
        </UButton>
      </div>
    </div>

    <!-- Contenido -->
    <div v-if="log" class="p-6 space-y-6">
      <!-- Información básica -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Usuario
          </label>
          <p class="text-lg text-gray-900 dark:text-white">
            {{ log.userName || log.userEmail }}
          </p>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Acción
          </label>
          <UBadge :color="actionColor(log.action)" variant="soft" size="md">
            {{ formatAction(log.action) }}
          </UBadge>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Módulo
          </label>
          <p class="text-lg text-gray-900 dark:text-white">
            {{ getModuleDisplayName(log.module) }}
          </p>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Fecha y Hora
          </label>
          <p class="text-lg text-gray-900 dark:text-white">
            {{ formatTimestamp(log.timestamp).full }}
          </p>
        </div>

        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tipo de Entidad
          </label>
          <p class="text-lg text-gray-900 dark:text-white">
            {{ log.entityType }}
          </p>
        </div>

        <div v-if="log.entityId">
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            ID de Entidad
          </label>
          <p class="text-lg text-gray-900 dark:text-white">
            {{ log.entityId }}
          </p>
        </div>
      </div>

            <!-- Cambios (Diff) -->
      <div v-if="parsedChanges" class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm">                                          
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">   
          Cambios Realizados
        </h3>

        <div v-if="parsedChanges.diff" class="space-y-3">
          <div
            v-for="(change, field) in parsedChanges.diff"
            :key="field"
            class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700"                                                           
          >
            <div class="font-semibold text-gray-900 dark:text-white mb-2">      
              {{ field }}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-red-600 dark:text-red-400 font-semibold mb-2 block">                                                                            
                  Antes
                </label>
                <div class="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                  <VueJsonPretty 
                    :data="change.before" 
                    :deep="3"
                    :show-length="true"
                    class="text-xs"
                  />
                </div>
              </div>
              <div>
                <label class="text-xs text-green-600 dark:text-green-400 font-semibold mb-2 block">                                                                        
                  Después
                </label>
                <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                  <VueJsonPretty 
                    :data="change.after" 
                    :deep="3"
                    :show-length="true"
                    class="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="parsedChanges.before && !parsedChanges.after" class="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">                                             
          <p class="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">      
            Entidad eliminada
          </p>
          <div class="bg-white dark:bg-gray-800 p-2 rounded">
            <VueJsonPretty 
              :data="parsedChanges.before" 
              :deep="3"
              :show-length="true"
              class="text-xs"
            />
          </div>
        </div>

        <div v-else-if="parsedChanges.after && !parsedChanges.before" class="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">                                         
          <p class="text-sm text-green-600 dark:text-green-400 font-semibold mb-2">  
            Entidad creada
          </p>
          <div class="bg-white dark:bg-gray-800 p-2 rounded">
            <VueJsonPretty 
              :data="parsedChanges.after" 
              :deep="3"
              :show-length="true"
              class="text-xs"
            />
          </div>
        </div>
      </div>

      <!-- Información de contexto (solo para admins) -->
      <div v-if="isAdmin" class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Información de Contexto
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="log.ipAddress">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Dirección IP
            </label>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatIpAddress(log.ipAddress) }}
            </p>
          </div>

          <div v-if="log.userAgent">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              User Agent
            </label>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatUserAgent(log.userAgent) }}
            </p>
          </div>

          <div v-if="log.deviceFingerprint">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Device Fingerprint
            </label>
            <p class="text-sm text-gray-900 dark:text-white font-mono">
              {{ formatDeviceFingerprint(log.deviceFingerprint) }}
            </p>
          </div>
        </div>
      </div>

            <!-- Metadata adicional -->
      <div v-if="log.metadata" class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">                               
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">   
          Metadata Adicional
        </h3>
        <div class="bg-white dark:bg-gray-800 p-3 rounded overflow-auto border border-gray-200 dark:border-gray-700">
          <VueJsonPretty 
            :data="parsedMetadata" 
            :deep="3"
            :show-length="true"
            :highlight-mouseover-node="true"
            class="text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-else-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div
          class="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-300">Cargando detalle...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { formatAuditAction, getModuleDisplayName, formatTimestamp, formatIpAddress, formatUserAgent, formatDeviceFingerprint } from "~/utils/audit-helpers";    
import { useAuth } from "~/composables/useAuth";
import type { AuditLog } from "~/domain/audit/types";
import type { AuditAction } from "~/domain/audit/types";

interface Props {
  log: AuditLog | null;
  loading?: boolean;
}

interface Emits {
  (e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  log: null,
  loading: false,
});

const emit = defineEmits<Emits>();

const { isAdmin } = useAuth();

const formatAction = (action: AuditAction): string => {
  return formatAuditAction(action).label;
};

const actionColor = (action: AuditAction): string => {
  return formatAuditAction(action).color;
};

const actionIcon = (action: AuditAction): string => {
  return formatAuditAction(action).icon;
};

// Parsear metadata si viene como string JSON
const parsedMetadata = computed(() => {
  if (!props.log?.metadata) {
    return null;
  }
  
  // Si metadata es un string, parsearlo
  if (typeof props.log.metadata === 'string') {
    try {
      return JSON.parse(props.log.metadata);
    } catch (error) {
      console.error("Error al parsear metadata:", error);
      return props.log.metadata;
    }
  }
  
  // Si ya es un objeto, retornarlo directamente
  return props.log.metadata;
});

// Parsear changes si viene como string JSON
const parsedChanges = computed(() => {
  if (!props.log?.changes) {
    return null;
  }
  
  // Si changes es un string, parsearlo
  if (typeof props.log.changes === 'string') {
    try {
      return JSON.parse(props.log.changes);
    } catch (error) {
      console.error("Error al parsear changes:", error);
      return props.log.changes;
    }
  }
  
  // Si ya es un objeto, retornarlo directamente
  return props.log.changes;
});
</script>

<style scoped>
/* Estilos personalizados para vue-json-pretty */
:deep(.vjs-tree) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 13px;
  line-height: 1.5;
}

/* Modo claro */
:deep(.vjs-tree .vjs-tree-node) {
  color: #1f2937;
}

:deep(.vjs-tree .vjs-key) {
  color: #7c3aed;
  font-weight: 600;
}

:deep(.vjs-tree .vjs-value-string) {
  color: #059669;
}

:deep(.vjs-tree .vjs-value-number) {
  color: #2563eb;
}

:deep(.vjs-tree .vjs-value-boolean) {
  color: #dc2626;
}

:deep(.vjs-tree .vjs-value-null) {
  color: #6b7280;
}

/* Modo oscuro */
.dark :deep(.vjs-tree .vjs-tree-node) {
  color: #e5e7eb;
}

.dark :deep(.vjs-tree .vjs-key) {
  color: #a78bfa;
  font-weight: 600;
}

.dark :deep(.vjs-tree .vjs-value-string) {
  color: #34d399;
}

.dark :deep(.vjs-tree .vjs-value-number) {
  color: #60a5fa;
}

.dark :deep(.vjs-tree .vjs-value-boolean) {
  color: #f87171;
}

.dark :deep(.vjs-tree .vjs-value-null) {
  color: #9ca3af;
}

/* Hover effect */
:deep(.vjs-tree .vjs-tree-node:hover) {
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 3px;
}

.dark :deep(.vjs-tree .vjs-tree-node:hover) {
  background-color: rgba(147, 197, 253, 0.1);
}

/* Scrollbar personalizado */
:deep(.vjs-tree)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.vjs-tree)::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.dark :deep(.vjs-tree)::-webkit-scrollbar-track {
  background: #374151;
}

:deep(.vjs-tree)::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

:deep(.vjs-tree)::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>

