import { defineFunction } from "@aws-amplify/backend";

export const GetMaterialesSinCentroProduccion = defineFunction({
    name: "GetMaterialesSinCentroProduccion",
    entry: "./handler.ts",
    timeoutSeconds: 300,
    memoryMB: 512,
});