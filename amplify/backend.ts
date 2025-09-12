import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
/**
 * Imports functions
 */
import { groups } from "./functions/admin-users/Groups/resource";
import { resetPassword } from "./functions/reset-password/resource";
import { users } from "./functions/admin-users/Users/resource";
import { allGroups } from "./functions/admin-users/AllGroups/resource";
import { assignUserToGroup } from "./functions/admin-users/AssignUserToGroup/resource";
import { removeUserFromGroup } from "./functions/admin-users/RemoveUserFromGroup/resource";
import { adminUserGlobalSignOut } from "./functions/admin-users/AdminUserGlobalSignOut/resource";
import { microsoftGraphToken } from "./functions/microsoft-graph/token/resource";
/**
 * Configuración del backend de Amplify
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
  groups,
  resetPassword,
  users,
  allGroups,
  assignUserToGroup,
  removeUserFromGroup,
  adminUserGlobalSignOut,
});

const resetPasswordLambda = backend.resetPassword.resources.lambda;
const resetPasswordPolicy = new iam.PolicyStatement({
  actions: [
    "ec2:CreateNetworkInterface",
    "ec2:DescribeNetworkInterfaces",
    "ec2:DeleteNetworkInterface",
  ],
  resources: ["*"],
});
resetPasswordLambda.addToRolePolicy(resetPasswordPolicy);

/// add resePasswordLambda to  VPC

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

const allGroupsLambda = backend.allGroups.resources.lambda;
const allGroupsPolicy = new iam.PolicyStatement({
  actions: ["cognito-idp:ListGroups"],
  resources: ["*"],
});
allGroupsLambda.addToRolePolicy(allGroupsPolicy);

const assignUserToGroupLambda = backend.assignUserToGroup.resources.lambda;
const assignUserToGroupPolicy = new iam.PolicyStatement({
  actions: ["cognito-idp:AdminAddUserToGroup"],
  resources: ["*"],
});
assignUserToGroupLambda.addToRolePolicy(assignUserToGroupPolicy);

const removeUserFromGroupLambda = backend.removeUserFromGroup.resources.lambda;
const removeUserFromGroupPolicy = new iam.PolicyStatement({
  actions: ["cognito-idp:AdminRemoveUserFromGroup"],
  resources: ["*"],
});
removeUserFromGroupLambda.addToRolePolicy(removeUserFromGroupPolicy);

const adminUserGlobalSignOutLambda =
  backend.adminUserGlobalSignOut.resources.lambda;
const adminUserGlobalSignOutPolicy = new iam.PolicyStatement({
  actions: ["cognito-idp:AdminUserGlobalSignOut"],
  resources: ["*"],
});
adminUserGlobalSignOutLambda.addToRolePolicy(adminUserGlobalSignOutPolicy);

/*
 * CREACION DE API REST
 */
const apiStack = backend.createStack("api-stack");

// Exportar para uso en otros archivos
export default backend;
