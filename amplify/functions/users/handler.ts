import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();

export const handler = async (event: any) => {
  try {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    if (!userPoolId) {
      throw new Error("COGNITO_USER_POOL_ID environment variable is not set");
    }

    let allUsers: any[] = [];
    let paginationToken: string | undefined = undefined;
    const limit = 60; // Número máximo de usuarios por solicitud

    do {
      const input: ListUsersCommandInput = {
        UserPoolId: userPoolId,
        Limit: limit,
        PaginationToken: paginationToken,
      };

      const command = new ListUsersCommand(input);
      const response: ListUsersCommandOutput = await client.send(command);

      // Agregar usuarios de esta página a la lista total
      if (response.Users) {
        allUsers = allUsers.concat(response.Users);
      }

      // Actualizar el token de paginación para la siguiente iteración
      paginationToken = response.PaginationToken;

      // Continuar mientras haya más páginas
    } while (paginationToken);

    return JSON.stringify({
      statusCode: 200,
      users: allUsers,
      totalUsers: allUsers.length,
      message: `Successfully retrieved ${allUsers.length} users from User Pool`,
    });
  } catch (error) {
    console.error("Error listing users:", error);

    return JSON.stringify({
      statusCode: 500,
      error: "Failed to list users",
      message: error instanceof Error ? error.message : "Unknown error",
      users: [],
    });
  }
};
