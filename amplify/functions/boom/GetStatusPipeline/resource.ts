import { defineFunction } from "@aws-amplify/backend";

export const BoomGetStatusPipeline = defineFunction({
    name: "getStatusPipeline",
    entry: "./handler.ts",
});
