/**
 * Configuración de Amplify para desarrollo local
 * Este archivo permite probar las funciones de Amplify sin necesidad de desplegarlas
 */

// Configuración para desarrollo local
export const amplifyDevConfig = {
  // Configuración del cliente de datos para desarrollo
  Data: {
    // En desarrollo, usar configuración local
    endpoint: "http://localhost:3000",
    region: "us-east-1", // Región por defecto
  },
};

/**
 * Verifica si estamos en modo desarrollo
 */
export function isDevelopmentMode(): boolean {
  return (
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local"
  );
}

/**
 * Obtiene la configuración de Amplify según el entorno
 */
export function getAmplifyConfig() {
  if (isDevelopmentMode()) {
    return amplifyDevConfig;
  }

  // En producción, usar configuración real
  return {};
}

export default amplifyDevConfig;
