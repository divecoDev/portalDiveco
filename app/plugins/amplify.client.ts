import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

export default defineNuxtPlugin(() => {
  // Solo ejecutar en el lado del cliente
  if (process.client) {
    try {
      // Configuración completa de Amplify con los outputs correctos
      // En Amplify Gen 2, los outputs ya vienen en el formato correcto
      Amplify.configure(outputs);
      
      // Verificar que la configuración se aplicó correctamente
      const config = Amplify.getConfig();
      console.log("✅ Amplify configurado correctamente en el cliente");
      console.log("🔍 Configuración de Amplify:", {
        hasConfig: !!config,
        hasAPI: !!config?.API,
        hasGraphQL: !!config?.API?.GraphQL,
        hasAuth: !!config?.Auth,
        hasData: !!outputs?.data,
      });
    } catch (error) {
      console.error("❌ Error configurando Amplify:", error);
    }
  }
});
