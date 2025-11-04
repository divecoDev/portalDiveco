/**
 * Hooks de Vue para Auditoría Automática
 * Facilita la integración de auditoría en componentes Vue
 */

import { watch, onBeforeUnmount, type Ref } from "vue";
import { useAudit } from "./useAudit";
import type { AuditModule } from "~/domain/audit/types";
import { detectChanges } from "~/domain/audit/audit-domain.service";

/**
 * Hook para registrar automáticamente acciones CREATE
 * 
 * @example
 * ```typescript
 * const { result, create } = useMyService();
 * 
 * useAuditOnCreate(
 *   result,
 *   "boom",
 *   "Boom",
 *   () => result.value?.id,
 *   () => result.value
 * );
 * 
 * // Cuando create() se ejecuta y result cambia, se registra automáticamente
 * ```
 */
export function useAuditOnCreate(
  result: Ref<any>,
  module: AuditModule,
  entityType: string,
  extractEntityId?: (result: any) => string | undefined,
  extractData?: (result: any) => any,
  metadata?: (result: any) => Record<string, any>
) {
  const { logCreate } = useAudit();

  const stopWatcher = watch(
    result,
    async (newValue, oldValue) => {
      // Solo registrar si hay un nuevo valor y no había uno antes (CREATE)
      if (newValue && !oldValue) {
        const entityId = extractEntityId ? extractEntityId(newValue) : newValue?.id;
        const data = extractData ? extractData(newValue) : newValue;

        await logCreate(
          module,
          entityType,
          entityId || "unknown",
          data,
          metadata ? metadata(newValue) : undefined
        );
      }
    },
    { immediate: false }
  );

  onBeforeUnmount(() => {
    stopWatcher();
  });

  return { stopWatcher };
}

/**
 * Hook para registrar automáticamente acciones UPDATE
 * 
 * @example
 * ```typescript
 * const { result, oldData } = useMyService();
 * 
 * useAuditOnUpdate(
 *   result,
 *   oldData,
 *   "boom",
 *   "Boom",
 *   () => result.value?.id,
 *   () => oldData.value,
 *   () => result.value
 * );
 * ```
 */
export function useAuditOnUpdate(
  result: Ref<any>,
  oldData: Ref<any>,
  module: AuditModule,
  entityType: string,
  extractEntityId?: (result: any) => string | undefined,
  extractOldData?: (oldData: any) => any,
  extractNewData?: (result: any) => any,
  metadata?: (result: any, oldData: any) => Record<string, any>
) {
  const { logUpdate } = useAudit();

  const stopWatcher = watch(
    [result, oldData],
    async ([newValue, oldValue]) => {
      // Solo registrar si hay un nuevo valor y había uno antes (UPDATE)
      if (newValue && oldValue) {
        const entityId = extractEntityId
          ? extractEntityId(newValue)
          : newValue?.id || oldValue?.id;

        const old = extractOldData ? extractOldData(oldValue) : oldValue;
        const newData = extractNewData ? extractNewData(newValue) : newValue;

        // Detectar cambios
        const changes = detectChanges(old, newData);

        await logUpdate(
          module,
          entityType,
          entityId || "unknown",
          old,
          newData,
          metadata ? metadata(newValue, oldValue) : undefined
        );
      }
    },
    { immediate: false }
  );

  onBeforeUnmount(() => {
    stopWatcher();
  });

  return { stopWatcher };
}

/**
 * Hook para registrar automáticamente acciones DELETE
 * 
 * @example
 * ```typescript
 * const { deletedId, deletedData } = useMyService();
 * 
 * useAuditOnDelete(
 *   deletedId,
 *   deletedData,
 *   "boom",
 *   "Boom"
 * );
 * ```
 */
export function useAuditOnDelete(
  deletedId: Ref<string | undefined>,
  deletedData: Ref<any>,
  module: AuditModule,
  entityType: string,
  extractData?: (data: any) => any,
  metadata?: (data: any, id: string) => Record<string, any>
) {
  const { logDelete } = useAudit();

  const stopWatcher = watch(
    [deletedId, deletedData],
    async ([id, data]) => {
      // Solo registrar si hay un ID y datos
      if (id && data) {
        const extractedData = extractData ? extractData(data) : data;

        await logDelete(
          module,
          entityType,
          id,
          extractedData,
          metadata ? metadata(data, id) : undefined
        );
      }
    },
    { immediate: false }
  );

  onBeforeUnmount(() => {
    stopWatcher();
  });

  return { stopWatcher };
}

/**
 * Hook para registrar automáticamente accesos READ (opcional)
 * Útil para auditar visualizaciones de datos sensibles
 * 
 * @example
 * ```typescript
 * const { data } = useMyService();
 * 
 * useAuditOnRead(
 *   data,
 *   "boom",
 *   "Boom",
 *   () => data.value?.id
 * );
 * ```
 */
export function useAuditOnRead(
  data: Ref<any>,
  module: AuditModule,
  entityType: string,
  extractEntityId?: (data: any) => string | undefined,
  metadata?: (data: any) => Record<string, any>,
  options?: {
    debounce?: number;
    once?: boolean;
  }
) {
  const { logRead } = useAudit();
  let hasLogged = false;

  const stopWatcher = watch(
    data,
    async (newValue) => {
      // Solo registrar si hay datos y no se ha registrado antes (si once=true)
      if (newValue && (!options?.once || !hasLogged)) {
        const entityId = extractEntityId
          ? extractEntityId(newValue)
          : newValue?.id;

        await logRead(
          module,
          entityType,
          entityId,
          metadata ? metadata(newValue) : undefined
        );

        if (options?.once) {
          hasLogged = true;
        }
      }
    },
    {
      immediate: false,
      flush: options?.debounce ? "post" : "sync",
    }
  );

  onBeforeUnmount(() => {
    stopWatcher();
  });

  return { stopWatcher };
}

/**
 * Hook combinado para operaciones CRUD completas
 * 
 * @example
 * ```typescript
 * const { result, oldData, deletedId, deletedData } = useMyService();
 * 
 * useAuditCRUD({
 *   result,
 *   oldData,
 *   deletedId,
 *   deletedData,
 *   module: "boom",
 *   entityType: "Boom",
 * });
 * ```
 */
export function useAuditCRUD(options: {
  result?: Ref<any>;
  oldData?: Ref<any>;
  deletedId?: Ref<string | undefined>;
  deletedData?: Ref<any>;
  module: AuditModule;
  entityType: string;
  extractEntityId?: (data: any) => string | undefined;
  extractData?: (data: any) => any;
  metadata?: (data: any) => Record<string, any>;
}) {
  const hooks: Array<{ stopWatcher: () => void }> = [];

  if (options.result && !options.oldData) {
    // CREATE
    const hook = useAuditOnCreate(
      options.result,
      options.module,
      options.entityType,
      options.extractEntityId,
      options.extractData,
      options.metadata
    );
    hooks.push(hook);
  } else if (options.result && options.oldData) {
    // UPDATE
    const hook = useAuditOnUpdate(
      options.result,
      options.oldData,
      options.module,
      options.entityType,
      options.extractEntityId,
      options.extractData,
      options.extractData,
      options.metadata
    );
    hooks.push(hook);
  }

  if (options.deletedId && options.deletedData) {
    // DELETE
    const hook = useAuditOnDelete(
      options.deletedId,
      options.deletedData,
      options.module,
      options.entityType,
      options.extractData,
      options.metadata
    );
    hooks.push(hook);
  }

  return {
    stopAll: () => {
      hooks.forEach((hook) => hook.stopWatcher());
    },
  };
}

