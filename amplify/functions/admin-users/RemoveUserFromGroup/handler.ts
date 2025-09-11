import {
  CognitoIdentityProviderClient,
  AdminRemoveUserFromGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();

export const handler = async (event: any) => {
  const { userId, groupName } = event.arguments;
  const command = new AdminRemoveUserFromGroupCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: userId,
    GroupName: groupName,
  });
  const response = await client.send(command);
  return JSON.stringify({
    success: true,
    message: `User ${userId} removed from group ${groupName}`,
  });
};
