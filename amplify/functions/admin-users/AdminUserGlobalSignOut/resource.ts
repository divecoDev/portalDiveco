import { defineFunction, secret } from "@aws-amplify/backend";

export const adminUserGlobalSignOut = defineFunction({
  name: "adminUserGlobalSignOut",
  entry: "./handler.ts",
  environment: {
    COGNITO_USER_POOL_ID: secret("COGNITO_USER_POOL_ID"),
  },
});
