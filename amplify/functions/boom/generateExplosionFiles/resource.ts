import { defineFunction } from "@aws-amplify/backend";

export const generateExplosionFile = defineFunction({
  name: "generateExplosionFiles",
  entry: "./handler.ts",
  timeoutSeconds: 900, // 15 minutos - las consultas pueden tardar varios minutos
  memoryMB: 1024, // Más memoria para consultas grandes
});

