import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { groups } from "./functions/groups/resource";
import { resetPassword } from "./functions/reset-password/resource";

/**
 * Configuración del backend de Amplify
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  groups,
  resetPassword,
});

// Exportar para uso en otros archivos
export default backend;
