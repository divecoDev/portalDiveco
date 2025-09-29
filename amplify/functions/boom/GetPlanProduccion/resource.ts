import { defineFunction } from "@aws-amplify/backend";

export const GetPlanProduccion = defineFunction({
    name: "GetPlanProduccion",
    entry: "./handler.ts",
    memoryMB: 502,
    timeoutSeconds: 240,
    environment: {
        BUCKET_NAME: "explosion-materiales-uts"
    }
});