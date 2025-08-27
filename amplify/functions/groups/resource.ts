import { defineFunction } from "@aws-amplify/backend";

export const groups = defineFunction({
  name: "groups",
  entry: "./handler.ts",
});
