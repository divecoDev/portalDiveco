/**
 * Reglas de negocio para el módulo de auditoría
 * Define constantes y configuraciones para cálculos de métricas
 */

// Horario laboral estándar (6 AM - 6 PM)
export const BUSINESS_HOURS = {
  start: 6, // 6:00 AM
  end: 18, // 6:00 PM
};

// Acciones consideradas críticas para alertas
export const CRITICAL_ACTIONS: string[] = [
  "DELETE",
  "CONFIG_CHANGE",
];

// Umbral para considerar "deletes masivos"
export const MASSIVE_DELETE_THRESHOLD = 5; // 5 deletes en una hora

// Acciones que requieren atención especial
export const HIGH_ATTENTION_ACTIONS: string[] = [
  "DELETE",
  "CONFIG_CHANGE",
  "UPDATE", // Updates pueden ser críticos dependiendo del módulo
];

// Módulos del sistema (para referencia futura cuando se auditen)
export const BUSINESS_MODULES = {
  "explosion-materiales": {
    name: "Explosión de Materiales",
    icon: "i-heroicons-sparkles",
    criticalActions: ["DELETE", "UPDATE"],
  },
  "suic": {
    name: "SUIC",
    icon: "i-heroicons-chart-bar",
    criticalActions: ["CREATE", "DELETE"],
  },
  "admin-users": {
    name: "Gestión de Usuarios",
    icon: "i-heroicons-user-group",
    criticalActions: ["CREATE", "UPDATE", "DELETE"],
  },
  "carga-insumos": {
    name: "Carga de Insumos",
    icon: "i-heroicons-cube",
    criticalActions: ["CREATE", "DELETE"],
  },
  "aprovisionamiento": {
    name: "Aprovisionamiento",
    icon: "i-heroicons-cog-6-tooth",
    criticalActions: ["UPDATE", "DELETE"],
  },
  system: {
    name: "Sistema",
    icon: "i-heroicons-shield-check",
    criticalActions: ["CONFIG_CHANGE", "LOGIN", "LOGOUT"],
  },
} as const;

// Verificar si una hora está fuera del horario laboral
export function isOutsideBusinessHours(timestamp: string): boolean {
  const date = new Date(timestamp);
  const hour = date.getHours();
  return hour < BUSINESS_HOURS.start || hour >= BUSINESS_HOURS.end;
}

// Verificar si una acción es crítica
export function isCriticalAction(action: string): boolean {
  return CRITICAL_ACTIONS.includes(action);
}
