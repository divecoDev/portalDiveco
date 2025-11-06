import { defineFunction } from "@aws-amplify/backend";

export const sendRpaStatusEmail = defineFunction({
  name: "send-rpa-status-email",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 256,
});

