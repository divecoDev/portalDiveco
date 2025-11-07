import { defineFunction } from "@aws-amplify/backend";

export const getExplosionGenerationStatus = defineFunction({
  name: "getExplosionGenerationStatus",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 512,
});


