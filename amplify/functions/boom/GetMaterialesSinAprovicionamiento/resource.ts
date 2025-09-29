import { defineFunction } from "@aws-amplify/backend";

export const GetMaterialesSinAprovicionamiento = defineFunction({
    name: "GetMaterialesSinAprovicionamiento",
    entry: "./handler.ts",
    timeoutSeconds: 300,
    memoryMB: 512,
});
