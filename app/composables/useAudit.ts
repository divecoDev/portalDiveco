/**
 * Composable para auditoría
 * Application Layer - Interface reactiva para componentes Vue
 */

import { ref, computed, readonly } from "vue";
import { auditService } from "~/services/audit.service";
import type {
  AuditAction,
  AuditModule,
  GetAuditLogsRequest,
  GetAuditLogsResponse,
  GetAuditLogDetailResponse,
  AuditLog,
} from "~/domain/audit/types";
import { detectChanges } from "~/domain/audit/audit-domain.service";

export const useAudit = () => {
  // Estado reactivo
  const loading = ref(false);
  const error = ref<string | null>(null);
  const logs = ref<AuditLog[]>([]);
  const currentLog = ref<AuditLog | null>(null);
  const pagination = ref<GetAuditLogsResponse["pagination"] | null>(null);

  /**
   * Registra una acción de auditoría manualmente
   */
  const logAction = async (
    action: AuditAction,
    module: AuditModule,
    entityType: string,
    entityId?: string,
    changes?: { before?: any; after?: any },
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await auditService.logAction(
        action,
        module,
        entityType,
        entityId,
        changes,
        metadata
      );

      if (!result.success) {
        error.value = result.error || "Error al registrar acción de auditoría";
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Error desconocido";
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Registra una acción CREATE
   */
  const logCreate = async (
    module: AuditModule,
    entityType: string,
    entityId: string,
    newData: any,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> => {
    return logAction(
      "CREATE",
      module,
      entityType,
      entityId,
      { after: newData },
      metadata
    );
  };

  /**
   * Registra una acción UPDATE
   */
  const logUpdate = async (
    module: AuditModule,
    entityType: string,
    entityId: string,
    oldData: any,
    newData: any,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> => {
    return logAction(
      "UPDATE",
      module,
      entityType,
      entityId,
      { before: oldData, after: newData },
      metadata
    );
  };

  /**
   * Registra una acción DELETE
   */
  const logDelete = async (
    module: AuditModule,
    entityType: string,
    entityId: string,
    oldData: any,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> => {
    return logAction(
      "DELETE",
      module,
      entityType,
      entityId,
      { before: oldData },
      metadata
    );
  };

  /**
   * Registra una acción READ (opcional, para auditoría completa)
   */
  const logRead = async (
    module: AuditModule,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> => {
    return logAction("READ", module, entityType, entityId, undefined, metadata);
  };

  /**
   * Registra un inicio de sesión
   */
  const logLogin = async (
    userId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await auditService.logLogin(userId, metadata);

      if (!result.success) {
        error.value = result.error || "Error al registrar inicio de sesión";
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Error desconocido";
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Registra un cierre de sesión
   */
  const logLogout = async (
    userId: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; logId?: string; error?: string }> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await auditService.logLogout(userId, metadata);

      if (!result.success) {
        error.value = result.error || "Error al registrar cierre de sesión";
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Error desconocido";
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Consulta logs de auditoría con filtros
   */
  const getAuditLogs = async (
    request?: GetAuditLogsRequest
  ): Promise<GetAuditLogsResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await auditService.getAuditLogs(request || {});

      if (result.success) {
        logs.value = result.data || [];
        pagination.value = result.pagination || null;
      } else {
        error.value = result.error || "Error al consultar logs de auditoría";
        logs.value = [];
        pagination.value = null;
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Error desconocido";
      error.value = errorMessage;
      logs.value = [];
      pagination.value = null;

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene el detalle completo de un log
   */
  const getAuditLogDetail = async (
    logId: string
  ): Promise<GetAuditLogDetailResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await auditService.getAuditLogDetail(logId);

      if (result.success) {
        currentLog.value = result.data || null;
      } else {
        error.value = result.error || "Error al obtener detalle de log";
        currentLog.value = null;
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Error desconocido";
      error.value = errorMessage;
      currentLog.value = null;

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  };

  // Computed properties
  const hasLogs = computed(() => logs.value.length > 0);
  const hasCurrentLog = computed(() => currentLog.value !== null);
  const hasPagination = computed(() => pagination.value !== null);

  return {
    // Estado
    loading: readonly(loading),
    error: readonly(error),
    logs: readonly(logs),
    currentLog: readonly(currentLog),
    pagination: readonly(pagination),

    // Computed
    hasLogs,
    hasCurrentLog,
    hasPagination,

    // Métodos
    logAction,
    logCreate,
    logUpdate,
    logDelete,
    logRead,
    logLogin,
    logLogout,
    getAuditLogs,
    getAuditLogDetail,
  };
};

