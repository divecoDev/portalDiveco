import { Amplify } from "aws-amplify";

export default defineNuxtPlugin(() => {
  // Solo ejecutar en el lado del cliente
  if (process.client) {
    try {
      // Configuración básica de Amplify
      Amplify.configure({});
      console.log("✅ Amplify configurado correctamente en el cliente");
    } catch (error) {
      console.error("❌ Error configurando Amplify:", error);
    }
  }
});
