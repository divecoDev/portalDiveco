import { defineFunction, secret } from '@aws-amplify/backend';

export const generateSociedadesCsv = defineFunction({
  name: 'generateSociedadesCsv',
  entry: './handler.ts',
  timeoutSeconds: 900,
  memoryMB: 2048,
  environment: {
    MYSQL_HOST: secret("MYSQL_HOST"),
    MYSQL_USER: secret("MYSQL_USER"),
    MYSQL_PASSWORD: secret("MYSQL_PASSWORD"),
    MYSQL_DATABASE: "portal",
    MYSQL_PORT: "3306",
    MYSQL_SSL: "false",
  }
});

