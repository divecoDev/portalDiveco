import { defineFunction, secret } from '@aws-amplify/backend';

export const suicSaveBatch = defineFunction({
  name: 'suicSaveBatch',
  entry: './handler.ts',
  timeoutSeconds: 900, // 15 minutos para lotes grandes
  environment: {
    MYSQL_HOST: secret("MYSQL_HOST"),
    MYSQL_USER: secret("MYSQL_USER"),
    MYSQL_PASSWORD: secret("MYSQL_PASSWORD"),
    MYSQL_DATABASE:  "portal",
    MYSQL_PORT: "3306",
    MYSQL_SSL: "false",
  }
});
