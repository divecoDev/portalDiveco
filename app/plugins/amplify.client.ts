import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

export default defineNuxtPlugin(() => {
  // Solo ejecutar en el lado del cliente
  if (process.client) {
    try {
      // Configuración completa de Amplify con los outputs correctos
      Amplify.configure(outputs);
      console.log("✅ Amplify configurado correctamente en el cliente");
    } catch (error) {
      console.error("❌ Error configurando Amplify:", error);
    }
  }
});
