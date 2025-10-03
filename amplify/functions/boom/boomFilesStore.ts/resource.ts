import { defineFunction } from "@aws-amplify/backend";

export const boomFilesStore = defineFunction({
  name: "boomFilesStore",
  entry: "./handler.ts",
});