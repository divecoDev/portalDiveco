import { defineFunction, secret } from "@aws-amplify/backend";

export const allGroups = defineFunction({
  name: "allGroups",
  entry: "./handler.ts",
  environment: {
    COGNITO_USER_POOL_ID: secret("COGNITO_USER_POOL_ID"),
  },
});
