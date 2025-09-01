import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { groups } from "./functions/groups/resource";
import { resetPassword } from "./functions/reset-password/resource";
import { users } from "./functions/users/resource";

/**
 * Configuración del backend de Amplify
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  groups,
  resetPassword,
  users,
});

const groupsLambda = backend.groups.resources.lambda;
const groupsPolicy = new iam.PolicyStatement({
  actions: ["cognito-idp:AdminListGroupsForUser"],
  resources: ["*"],
});
groupsLambda.addToRolePolicy(groupsPolicy);

const usersLambda = backend.users.resources.lambda;
const usersPolicy = new iam.PolicyStatement({
  actions: ["cognito-idp:ListUsers"],
  resources: ["*"],
});
usersLambda.addToRolePolicy(usersPolicy);

// Exportar para uso en otros archivos
export default backend;
