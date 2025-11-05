import { defineFunction, secret } from "@aws-amplify/backend";

export const validacionMaterialesResolver = defineFunction({
  name: "validacionMaterialesResolver",
  entry: "./handler.ts",
  timeoutSeconds: 300,
  memoryMB: 1024,
  environment: {
    MSSQL_USER: secret("MSSQL_USER"),
    MSSQL_PASSWORD: secret("MSSQL_PASSWORD"),
    MSSQL_SERVER: secret("MSSQL_SERVER"),
    MSSQL_DATABASE: secret("MSSQL_DATABASE"),
  },
});
