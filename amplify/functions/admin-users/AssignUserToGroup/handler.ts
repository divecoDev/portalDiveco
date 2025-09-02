import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const handler = async (event: any) => {
  const { userId, groupName } = event.arguments;
  const client = new CognitoIdentityProviderClient();
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: userId,
    GroupName: groupName,
  });
  const response = await client.send(command);
  return JSON.stringify({
    success: true,
    message: `User ${userId} added to group ${groupName}`,
  });
};
