import { defineFunction } from "@aws-amplify/backend";

export const resetPassword = defineFunction({
  name: "reset-password",
  entry: "./handler.ts",
});
