import type { Handler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminListGroupsForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import dotenv from "dotenv";

dotenv.config({ path: "@/.env" });

const client = new CognitoIdentityProviderClient();
export const handler: Handler = async (event) => {
  const { username } = event.arguments;

  const input = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: username,
  };

  const command = new AdminListGroupsForUserCommand(input);

  const response = await client.send(command);

  return JSON.stringify({
    groups: response.Groups,
  });
};
