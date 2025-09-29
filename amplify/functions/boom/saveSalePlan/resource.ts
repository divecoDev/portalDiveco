import { defineFunction } from "@aws-amplify/backend";

export const saveSalePlan = defineFunction({
  name: "saveSalePlan",
  entry: "./handler.ts",
});
