/**
 * Utilidad para generar fingerprint del dispositivo
 * Genera un identificador único basado en características del dispositivo y navegador
 */

export interface DeviceFingerprintData {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  canvasHash?: string;
}

/**
 * Genera un fingerprint del dispositivo desde el navegador
 */
export function generateDeviceFingerprint(): string {
  try {
    const fingerprintData: DeviceFingerprintData = {
      userAgent: navigator.userAgent || "unknown",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
      language: navigator.language || "unknown",
      platform: navigator.platform || "unknown",
    };

    // Intentar generar canvas hash (opcional, puede ser bloqueado por algunos navegadores)
    try {
      fingerprintData.canvasHash = generateCanvasHash();
    } catch (error) {
      // Canvas hash no disponible, continuar sin él
      console.debug("Canvas hash no disponible:", error);
    }

    // Crear string del fingerprint
    const fingerprintString = JSON.stringify(fingerprintData);

    // Generar hash simple (en producción, usar algo más robusto como crypto.subtle)
    return simpleHash(fingerprintString);
  } catch (error) {
    console.error("Error al generar device fingerprint:", error);
    // Retornar fingerprint básico basado en timestamp si falla
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Genera un hash simple de un string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }

  // Convertir a base64 y limitar a 64 caracteres
  const hashString = Math.abs(hash).toString(36);
  return hashString.substring(0, 64);
}

/**
 * Genera un hash del canvas (fingerprinting por canvas)
 * Puede ser bloqueado por algunos navegadores por privacidad
 */
function generateCanvasHash(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context no disponible");
    }

    canvas.width = 200;
    canvas.height = 50;

    // Dibujar texto único
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Device Fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Device Fingerprint", 4, 17);

    // Obtener hash del canvas
    const dataURL = canvas.toDataURL();
    return simpleHash(dataURL);
  } catch (error) {
    throw new Error("No se pudo generar canvas hash");
  }
}

/**
 * Obtiene información básica del dispositivo sin generar fingerprint completo
 * Útil para logging básico
 */
export function getDeviceInfo(): {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
} {
  return {
    userAgent: navigator.userAgent || "unknown",
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    language: navigator.language || "unknown",
    platform: navigator.platform || "unknown",
  };
}

