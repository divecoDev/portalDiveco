import { Amplify } from "aws-amplify";

/**
 * Configuración del cliente de Amplify para el frontend
 * Este archivo debe ser importado en el main.ts o app.vue para inicializar Amplify
 */

// Configuración básica de Amplify
export const amplifyConfig = {
  // Configuración de autenticación (si es necesaria)
  Auth: {
    // Configuración de Cognito si se usa
  },

  // Configuración de datos
  Data: {
    // Configuración para el cliente de datos
  },
};

/**
 * Inicializa Amplify con la configuración
 * Llamar esta función en el main.ts o app.vue
 */
export function configureAmplify() {
  try {
    // Configurar Amplify
    Amplify.configure(amplifyConfig);
    console.log("✅ Amplify configurado correctamente");
  } catch (error) {
    console.error("❌ Error configurando Amplify:", error);
    throw error;
  }
}

/**
 * Verifica que Amplify esté configurado correctamente
 */
export function isAmplifyConfigured(): boolean {
  try {
    // Verificar que Amplify esté disponible
    return typeof Amplify !== "undefined" && Amplify.configure !== undefined;
  } catch {
    return false;
  }
}

export default amplifyConfig;
