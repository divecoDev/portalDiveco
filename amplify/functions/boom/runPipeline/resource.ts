import { defineFunction, secret } from "@aws-amplify/backend";

export const runPipeline = defineFunction({
  name: "runPipeline",
  entry: "./handler.ts",
  environment: {
    AZURE_TENANT_ID: secret("AZURE_TENANT_ID"),
    AZURE_CLIENT_ID: secret("AZURE_CLIENT_ID"),
    AZURE_CLIENT_SECRET: secret("AZURE_CLIENT_SECRET"),
    AZURE_SUBSCRIPTION_ID: secret("AZURE_SUBSCRIPTION_ID"),
    AZURE_DATA_FACTORY_NAME: secret("AZURE_DATA_FACTORY_NAME"),
  },
  timeoutSeconds: 30,
  memoryMB: 502,
});
