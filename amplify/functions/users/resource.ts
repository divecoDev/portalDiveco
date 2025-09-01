import { defineFunction, secret } from "@aws-amplify/backend";

export const users = defineFunction({
  name: "get-cognito-users",
  entry: "./handler.ts",
  environment: {
    COGNITO_USER_POOL_ID: secret("COGNITO_USER_POOL_ID"),
  },
});
