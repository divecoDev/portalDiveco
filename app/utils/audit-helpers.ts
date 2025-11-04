/**
 * Utilidades para el módulo de auditoría
 * Funciones helper para formateo y visualización
 */

import type { AuditAction, AuditModule } from "~/domain/audit/types";

/**
 * Formatea una acción de auditoría para mostrar en UI
 */
export function formatAuditAction(action: AuditAction): {
  label: string;
  color: string;
  icon: string;
} {
  const actionMap: Record<
    AuditAction,
    { label: string; color: string; icon: string }
  > = {
    CREATE: {
      label: "Crear",
      color: "green",
      icon: "i-heroicons-plus-circle",
    },
    UPDATE: {
      label: "Actualizar",
      color: "blue",
      icon: "i-heroicons-pencil",
    },
    DELETE: {
      label: "Eliminar",
      color: "red",
      icon: "i-heroicons-trash",
    },
    READ: {
      label: "Leer",
      color: "gray",
      icon: "i-heroicons-eye",
    },
    LOGIN: {
      label: "Inicio de Sesión",
      color: "cyan",
      icon: "i-heroicons-arrow-right-on-rectangle",
    },
    LOGOUT: {
      label: "Cierre de Sesión",
      color: "orange",
      icon: "i-heroicons-arrow-left-on-rectangle",
    },
    CONFIG_CHANGE: {
      label: "Cambio de Configuración",
      color: "purple",
      icon: "i-heroicons-cog-6-tooth",
    },
  };

  return (
    actionMap[action] || {
      label: action,
      color: "gray",
      icon: "i-heroicons-question-mark-circle",
    }
  );
}

/**
 * Obtiene el nombre de visualización de un módulo
 */
export function getModuleDisplayName(module: AuditModule | string): string {
  const moduleMap: Record<string, string> = {
    boom: "Explosión de Materiales",
    suic: "SUIC",
    "admin-users": "Administración de Usuarios",
    "carga-insumos": "Carga de Insumos",
    aprovisionamiento: "Aprovisionamiento",
    audit: "Auditoría",
    system: "Sistema",
  };

  return moduleMap[module] || module;
}

/**
 * Formatea un timestamp para mostrar en UI
 */
export function formatTimestamp(timestamp: string): {
  date: string;
  time: string;
  full: string;
  relative: string;
} {
  try {
    const date = new Date(timestamp);
    const now = new Date();

    // Formato de fecha
    const dateStr = date.toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Formato de hora
    const timeStr = date.toLocaleTimeString("es-GT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Formato completo
    const fullStr = `${dateStr} ${timeStr}`;

    // Formato relativo
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relativeStr = "";

    if (diffSeconds < 60) {
      relativeStr = "hace unos segundos";
    } else if (diffMinutes < 60) {
      relativeStr = `hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
    } else if (diffHours < 24) {
      relativeStr = `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    } else if (diffDays < 7) {
      relativeStr = `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    } else {
      relativeStr = dateStr;
    }

    return {
      date: dateStr,
      time: timeStr,
      full: fullStr,
      relative: relativeStr,
    };
  } catch (error) {
    console.error("Error al formatear timestamp:", error);
    return {
      date: timestamp,
      time: "",
      full: timestamp,
      relative: timestamp,
    };
  }
}

/**
 * Formatea un IP address para mostrar (oculta parte si es necesario)
 */
export function formatIpAddress(ip?: string): string {
  if (!ip || ip === "unknown") return "Desconocido";

  // En producción, podrías ocultar parte de la IP por seguridad
  // Por ahora, mostramos completa
  return ip;
}

/**
 * Formatea un User-Agent para mostrar (versión simplificada)
 */
export function formatUserAgent(userAgent?: string): string {
  if (!userAgent || userAgent === "unknown") return "Desconocido";

  // Extraer información básica del User-Agent
  const browserMatch = userAgent.match(
    /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/
  );
  const osMatch = userAgent.match(
    /(Windows|Mac|Linux|Android|iOS|iPhone|iPad)/
  );

  if (browserMatch && osMatch) {
    return `${browserMatch[1]} en ${osMatch[1]}`;
  }

  // Si no se puede extraer, mostrar una versión truncada
  return userAgent.length > 50 ? `${userAgent.substring(0, 50)}...` : userAgent;
}

/**
 * Formatea un device fingerprint para mostrar (versión truncada)
 */
export function formatDeviceFingerprint(fingerprint?: string): string {
  if (!fingerprint || fingerprint === "unknown") return "Desconocido";

  // Mostrar solo los primeros y últimos caracteres por seguridad
  if (fingerprint.length > 16) {
    return `${fingerprint.substring(0, 8)}...${fingerprint.substring(
      fingerprint.length - 8
    )}`;
  }

  return fingerprint;
}

/**
 * Normaliza un identificador de autenticación eliminando prefijos de proveedores
 * Funciona tanto para correos electrónicos como para nombres de usuario
 * Ejemplos:
 * - microsoftentraidsaml_jonhathan.rodas.gt@camasolympia.com -> jonhathan.rodas.gt@camasolympia.com
 * - microsoftentraidsaml_jonhathan.rodas.gt -> jonhathan.rodas.gt
 */
export function normalizeAuthIdentifier(identifier?: string | null): string {
  if (!identifier || identifier === "unknown" || identifier === "unknown@example.com" || identifier === "Unknown User") {
    return identifier || "unknown";
  }

  // Lista de prefijos comunes de proveedores de autenticación
  const authPrefixes = [
    "microsoftentraidsaml_",
    "novafinanzaz_",
    "google_",
    "facebook_",
    "github_",
    "twitter_",
  ];

  let normalized = identifier;

  // Eliminar prefijos de autenticación
  for (const prefix of authPrefixes) {
    if (normalized.toLowerCase().startsWith(prefix.toLowerCase())) {
      normalized = normalized.substring(prefix.length);
      break; // Solo eliminar un prefijo
    }
  }

  // Si es un correo, validar formato
  if (normalized.includes("@")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      // Si después de eliminar el prefijo no es un correo válido, devolver el original
      return identifier;
    }
  }

  return normalized;
}

/**
 * Normaliza un correo electrónico eliminando prefijos de proveedores de autenticación
 * Ejemplo: microsoftentraidsaml_jonhathan.rodas.gt@camasolympia.com -> jonhathan.rodas.gt@camasolympia.com
 * @deprecated Usa normalizeAuthIdentifier en su lugar para mayor flexibilidad
 */
export function normalizeEmail(email?: string | null): string {
  return normalizeAuthIdentifier(email);
}

