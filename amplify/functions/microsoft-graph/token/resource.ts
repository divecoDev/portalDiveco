import { defineFunction } from "@aws-amplify/backend";
import { secret } from "@aws-amplify/backend";

export const microsoftGraphToken = defineFunction({
  name: "microsoft-graph-token",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 1024,
  environment: {
    MS_TENANT_ID: secret("MS_TENANT_ID"),
    MS_CLIENT_ID: secret("MS_CLIENT_ID"),
    MS_CLIENT_SECRET: secret("MS_CLIENT_SECRET"),
    // --- Nova Finanzas ---
    MS_NOVA_CLIENT_ID: secret("MS_NOVA_CLIENT_ID"),
    MS_NOVA_CLIENT_SECRET: secret("MS_NOVA_CLIENT_SECRET"),
    MS_NOVA_TENANT_ID: secret("MS_NOVA_TENANT_ID"),
  },
});
