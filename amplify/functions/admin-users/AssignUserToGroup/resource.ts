import { defineFunction, secret } from "@aws-amplify/backend";

export const assignUserToGroup = defineFunction({
  name: "assignUserToGroup",
  entry: "./handler.ts",
  environment: {
    COGNITO_USER_POOL_ID: secret("COGNITO_USER_POOL_ID"),
  },
});
