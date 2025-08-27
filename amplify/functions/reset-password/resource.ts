import { defineFunction } from "@aws-amplify/backend";
import { secret } from "@aws-amplify/backend";

export const resetPassword = defineFunction({
  name: "reset-password",
  entry: "./handler.ts",
  timeoutSeconds: 180,
  memoryMB: 1024,
  environment: {
    SAP_URL: secret("SAP_URL"),
    SAP_PASSWORD: secret("SAP_PASSWORD"),
  },
});
