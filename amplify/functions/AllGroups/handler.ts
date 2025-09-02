import {
  CognitoIdentityProviderClient,
  ListGroupsCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();

export const handler = async (event: any) => {
  const command = new ListGroupsCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
  });
  const response = await client.send(command);
  return JSON.stringify({
    groups: response.Groups,
  });
};
