import {
  CognitoIdentityProviderClient,
  AdminUserGlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();

export const handler = async (event: any) => {
  const { userId } = event.arguments;
  const command = new AdminUserGlobalSignOutCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: userId,
  });
  const response = await client.send(command);
  return JSON.stringify({
    success: true,
  });
};
