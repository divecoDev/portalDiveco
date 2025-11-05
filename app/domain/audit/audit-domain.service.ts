/**
 * Servicio de dominio para auditoría
 * Domain Layer - Lógica de negocio pura
 */

import type { AuditChange, FieldChange } from "./types";

/**
 * Detecta y genera diff completo entre dos estados de una entidad
 */
export function detectChanges(before: any, after: any): AuditChange | null {
  if (!before && !after) return null;

  // Si es CREATE, solo hay after
  if (!before && after) {
    return {
      after: deepClone(after),
    };
  }

  // Si es DELETE, solo hay before
  if (before && !after) {
    return {
      before: deepClone(before),
    };
  }

  // Si es UPDATE, hay ambos
  if (before && after) {
    const diff = generateDiff(before, after);

    return {
      before: deepClone(before),
      after: deepClone(after),
      diff: Object.keys(diff).length > 0 ? diff : undefined,
    };
  }

  return null;
}

/**
 * Genera un diff detallado entre dos objetos
 */
function generateDiff(before: any, after: any): Record<string, FieldChange> {
  if (!before || !after) return {};

  const diff: Record<string, FieldChange> = {};

  // Obtener todas las claves únicas
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    const beforeValue = before[key];
    const afterValue = after[key];

    // Comparar valores usando JSON.stringify para objetos complejos
    const beforeStr = JSON.stringify(beforeValue);
    const afterStr = JSON.stringify(afterValue);

    if (beforeStr !== afterStr) {
      diff[key] = {
        field: key,
        before: beforeValue,
        after: afterValue,
      };
    }
  }

  return diff;
}

/**
 * Formatea cambios para visualización en UI
 */
export function formatChanges(changes: AuditChange | null): {
  formatted: string;
  hasChanges: boolean;
  fieldsChanged: string[];
} {
  if (!changes) {
    return {
      formatted: "Sin cambios",
      hasChanges: false,
      fieldsChanged: [],
    };
  }

  // Si es CREATE
  if (changes.after && !changes.before) {
    return {
      formatted: "Entidad creada",
      hasChanges: true,
      fieldsChanged: Object.keys(changes.after || {}),
    };
  }

  // Si es DELETE
  if (changes.before && !changes.after) {
    return {
      formatted: "Entidad eliminada",
      hasChanges: true,
      fieldsChanged: Object.keys(changes.before || {}),
    };
  }

  // Si es UPDATE
  if (changes.diff) {
    const fieldsChanged = Object.keys(changes.diff);
    const formatted =
      fieldsChanged.length > 0
        ? `${fieldsChanged.length} campo(s) modificado(s): ${fieldsChanged.join(", ")}`
        : "Sin cambios detectados";

    return {
      formatted,
      hasChanges: fieldsChanged.length > 0,
      fieldsChanged,
    };
  }

  return {
    formatted: "Sin cambios",
    hasChanges: false,
    fieldsChanged: [],
  };
}

/**
 * Valida datos antes de registrar auditoría
 */
export function validateAuditData(data: {
  action: string;
  module: string;
  entityType: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar action
  const validActions = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "READ",
    "LOGIN",
    "LOGOUT",
    "CONFIG_CHANGE",
  ];
  if (!data.action || !validActions.includes(data.action)) {
    errors.push(`Action inválida: ${data.action}. Debe ser uno de: ${validActions.join(", ")}`);
  }

  // Validar module
  if (!data.module || data.module.trim().length === 0) {
    errors.push("Module es requerido");
  }

  // Validar entityType
  if (!data.entityType || data.entityType.trim().length === 0) {
    errors.push("EntityType es requerido");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Clona un objeto de forma profunda
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

