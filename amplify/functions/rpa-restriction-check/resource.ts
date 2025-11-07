import { defineFunction } from "@aws-amplify/backend";

export const rpaRestrictionCheck = defineFunction({
  name: "rpa-restriction-check",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 256,
});

