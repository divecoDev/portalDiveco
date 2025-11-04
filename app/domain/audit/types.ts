/**
 * Tipos de dominio para el módulo de auditoría
 * Domain Layer - Entidades y Value Objects
 */

/**
 * Acciones de auditoría disponibles
 */
export type AuditAction = 
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "READ"
  | "LOGIN"
  | "LOGOUT"
  | "CONFIG_CHANGE";

/**
 * Módulos del sistema que pueden ser auditados
 */
export type AuditModule =
  | "boom"
  | "suic"
  | "admin-users"
  | "carga-insumos"
  | "aprovisionamiento"
  | "audit"
  | "system";

/**
 * Entidad de log de auditoría
 */
export type AuditLog = {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  entityId?: string;
  changes?: AuditChange;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

/**
 * Cambios detectados en una entidad
 */
export type AuditChange = {
  before?: any;
  after?: any;
  diff?: Record<string, FieldChange>;
};

/**
 * Cambio específico en un campo
 */
export type FieldChange = {
  before: any;
  after: any;
  field: string;
};

/**
 * Request para crear un log de auditoría
 */
export type CreateAuditLogRequest = {
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  entityId?: string;
  changes?: AuditChange;
  metadata?: Record<string, any>;
};

/**
 * Request para consultar logs de auditoría
 */
export type GetAuditLogsRequest = {
  userId?: string;
  module?: AuditModule;
  action?: AuditAction;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
};

/**
 * Response de consulta de logs
 */
export type GetAuditLogsResponse = {
  success: boolean;
  data?: AuditLog[];
  pagination?: PaginationInfo;
  error?: string;
};

/**
 * Información de paginación
 */
export type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/**
 * Request para obtener detalle de un log
 */
export type GetAuditLogDetailRequest = {
  logId: string;
};

/**
 * Response de detalle de log
 */
export type GetAuditLogDetailResponse = {
  success: boolean;
  data?: AuditLog;
  error?: string;
};

/**
 * Contexto de auditoría extraído automáticamente
 */
export type AuditContext = {
  userId: string;
  userEmail: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
};

/**
 * Configuración de auditoría automática
 */
export type AuditAutoConfig = {
  enabled: boolean;
  models?: string[]; // Modelos a auditar automáticamente
  actions?: AuditAction[]; // Acciones a auditar
};

