import { defineFunction } from "@aws-amplify/backend";
import { secret } from "@aws-amplify/backend";

export const resetPassword = defineFunction({
  name: "reset-password",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 1024,
  environment: {
    SAP_URL: process.env.SAP_URL || "",
    SAP_PASSWORD: process.env.SAP_PASSWORD || "",
  },
});
