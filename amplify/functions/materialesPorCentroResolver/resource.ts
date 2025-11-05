import { defineFunction, secret } from "@aws-amplify/backend";

export const materialesPorCentroResolver = defineFunction({
  name: "materialesPorCentroResolver",
  entry: "./handler.ts",
  timeoutSeconds: 300,
  memoryMB: 3008, // Máxima memoria disponible para manejar grandes volúmenes de datos
  environment: {
    MSSQL_USER: secret("MSSQL_USER"),
    MSSQL_PASSWORD: secret("MSSQL_PASSWORD"),
    MSSQL_SERVER: secret("MSSQL_SERVER"),
    MSSQL_DATABASE: secret("MSSQL_DATABASE"),
  },
});

