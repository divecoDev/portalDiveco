import { defineFunction } from "@aws-amplify/backend";
import { secret } from "@aws-amplify/backend";

export const resetPassword = defineFunction({
  name: "reset-password",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  environment: {
    SAP_URL: secret("SAP_URL"),
  },
});
