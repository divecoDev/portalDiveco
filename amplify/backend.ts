import { defineBackend } from "@aws-amplify/backend";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
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
/* Functions Boom */
import { saveSalePlan } from "./functions/boom/saveSalePlan/resource";
import { runPipeline } from "./functions/boom/runPipeline/resource";
import { cargaInsumosSaveBatch } from "./functions/carga-insumos/saveBatch/resource";
import { cargaInsumosGetData } from "./functions/carga-insumos/getData/resource";
import { BoomGetStatusPipeline } from "./functions/boom/GetStatusPipeline/resource";
import { GetPlanProduccion } from "./functions/boom/GetPlanProduccion/resource";
import { GetMaterialesSinAprovicionamiento } from "./functions/boom/GetMaterialesSinAprovicionamiento/resource";
import { GetMaterialesSinCentroProduccion } from "./functions/boom/getMaterialesSinCentroProduccion/resource";
import { boomFilesStore } from "./functions/boom/boomFilesStore.ts/resource";
import { suicSaveBatch } from "./functions/suic/resource";
import {generateSociedadesCsv} from "./functions/suic/generateSociedadesCsv/resource";
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
  saveSalePlan,
  runPipeline,
  cargaInsumosSaveBatch,
  cargaInsumosGetData,
  BoomGetStatusPipeline,
  GetPlanProduccion,
  GetMaterialesSinAprovicionamiento,
  GetMaterialesSinCentroProduccion,
  boomFilesStore,
  suicSaveBatch,
  generateSociedadesCsv,
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

const saveSalePlanLambda = backend.saveSalePlan.resources.lambda;
const saveSalePlanPolicy = new iam.PolicyStatement({
  actions: [
    "ec2:CreateNetworkInterface",
    "ec2:DescribeNetworkInterfaces",
    "ec2:DeleteNetworkInterface"],
  resources: ["*"],
});
saveSalePlanLambda.addToRolePolicy(saveSalePlanPolicy);

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

const cargaInsumosGetDataLambda = backend.cargaInsumosGetData.resources.lambda;
const cargaInsumosGetDataPolicy = new iam.PolicyStatement({
  actions: [
    "ec2:CreateNetworkInterface",
    "ec2:DescribeNetworkInterfaces",
    "ec2:DeleteNetworkInterface",
  ],
  resources: ["*"],
});
cargaInsumosGetDataLambda.addToRolePolicy(cargaInsumosGetDataPolicy);

const getPlanProduccionLambda = backend.GetPlanProduccion.resources.lambda;
const getPlanProduccionPolicy = new iam.PolicyStatement({
  actions: ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"],
  resources: ["*"],
});
getPlanProduccionLambda.addToRolePolicy(getPlanProduccionPolicy);


const getBoomS3Policy = new iam.PolicyStatement({
  actions: [
    "s3:PutObject",
    "s3:PutObjectAcl",
    "s3:GetObject",
    "s3:DeleteObject",
    "s3:ListBucket"
  ],
  resources: [
    "arn:aws:s3:::explosion-materiales-uts",
    "arn:aws:s3:::explosion-materiales-uts/*"
  ],
});
getPlanProduccionLambda.addToRolePolicy(getBoomS3Policy);
getPlanProduccionLambda.addFunctionUrl(
  {
    authType: FunctionUrlAuthType.NONE,
  }
);

const getMaterialesSinAprovicionamientoLambda = backend.GetMaterialesSinAprovicionamiento.resources.lambda;
const getMaterialesSinAprovicionamientoPolicy = new iam.PolicyStatement(getBoomS3Policy);
getMaterialesSinAprovicionamientoLambda.addToRolePolicy(getMaterialesSinAprovicionamientoPolicy);
getMaterialesSinAprovicionamientoLambda.addFunctionUrl(
  {
    authType: FunctionUrlAuthType.NONE,
  }
);

const getMaterialesSinCentroProduccionLambda = backend.GetMaterialesSinCentroProduccion.resources.lambda;
const getMaterialesSinCentroProduccionPolicy = new iam.PolicyStatement(getBoomS3Policy);
getMaterialesSinCentroProduccionLambda.addToRolePolicy(getMaterialesSinCentroProduccionPolicy);
getMaterialesSinCentroProduccionLambda.addFunctionUrl(
  {
    authType: FunctionUrlAuthType.NONE,
  }
);

const boomFilesStoreLambda = backend.boomFilesStore.resources.lambda;
const boomFilesStorePolicy = new iam.PolicyStatement(getBoomS3Policy);
boomFilesStoreLambda.addToRolePolicy(boomFilesStorePolicy);
boomFilesStoreLambda.addFunctionUrl(
  {
    authType: FunctionUrlAuthType.NONE,
  }
);

const suicSaveBatchLambda = backend.suicSaveBatch.resources.lambda;
const suicSaveBatchPolicy = new iam.PolicyStatement({
  actions: [
    "ec2:CreateNetworkInterface",
    "ec2:DescribeNetworkInterfaces",
    "ec2:DeleteNetworkInterface",
  ],
  resources: ["*"],
});
suicSaveBatchLambda.addToRolePolicy(suicSaveBatchPolicy);

/// generateSociedadesCsv con permisos de S3
const generateSociedadesCsvLambda = backend.generateSociedadesCsv.resources.lambda;
const generateSociedadesCsvPolicy = new iam.PolicyStatement({
  actions: [
    "s3:PutObject",
    "s3:PutObjectAcl",
    "s3:GetObject",
    "s3:DeleteObject",
    "s3:ListBucket"
  ],
  resources: ["arn:aws:s3:::porta-diveco-suic", "arn:aws:s3:::porta-diveco-suic/*"],
});
generateSociedadesCsvLambda.addToRolePolicy(generateSociedadesCsvPolicy);
/*
 * CREACION DE API REST
 */
const apiStack = backend.createStack("api-stack");

// Exportar para uso en otros archivos
export default backend;
