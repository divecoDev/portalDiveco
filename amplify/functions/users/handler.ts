import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();

export const handler = async (event: any) => {
  const input = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
  };
  const command = new ListUsersCommand(input);
  const response = await client.send(command);

  return JSON.stringify({
    statusCode: 200,
    users: response.Users,
  });
};
