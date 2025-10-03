import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { groups } from "../functions/admin-users/Groups/resource";
import { resetPassword } from "../functions/reset-password/resource";
import { users } from "../functions/admin-users/Users/resource";
import { allGroups } from "../functions/admin-users/AllGroups/resource";
import { assignUserToGroup } from "../functions/admin-users/AssignUserToGroup/resource";
import { removeUserFromGroup } from "../functions/admin-users/RemoveUserFromGroup/resource";
import { adminUserGlobalSignOut } from "../functions/admin-users/AdminUserGlobalSignOut/resource";
import { microsoftGraphToken } from "../functions/microsoft-graph/token/resource";
/* Functions Boom */
import { cargaInsumosSaveBatch } from "../functions/carga-insumos/saveBatch/resource";
import { cargaInsumosGetData } from "../functions/carga-insumos/getData/resource";
import { runPipeline } from "../functions/boom/runPipeline/resource";
import { BoomGetStatusPipeline } from "../functions/boom/GetStatusPipeline/resource";
import { GetMaterialesSinAprovicionamiento } from "../functions/boom/GetMaterialesSinAprovicionamiento/resource";
import { GetMaterialesSinCentroProduccion } from "../functions/boom/getMaterialesSinCentroProduccion/resource";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Group: a
    .query()
    .arguments({ username: a.string() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(groups)),

  ResetPassword: a
    .query()
    .arguments({
      sapUser: a.string(),
      email: a.string(),
      accion: a.string(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(resetPassword)),

  ListUsers: a
    .query()
    .arguments({
      limit: a.integer(),
      paginationToken: a.string(),
      filter: a.string(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(users)),

  AllGroups: a
    .query()
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(allGroups)),

  AssignUserToGroup: a
    .query()
    .arguments({ userId: a.string(), groupName: a.string() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(assignUserToGroup)),

  RemoveUserFromGroup: a
    .query()
    .arguments({ userId: a.string(), groupName: a.string() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(removeUserFromGroup)),

  AdminUserGlobalSignOut: a
    .query()
    .arguments({ userId: a.string() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(adminUserGlobalSignOut)),

  SapUserActionHistory: a
    .model({
      sapUser: a.string(),
      emailOwner: a.string(),
      accion: a.string(), // "RESET_PASSWORD" o "UNLOCK_USER"
      status: a.string(),
      logs: a.string(),
      date: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  /*
    Modelo para generar eplocion de materiales
    */
  Boom: a
    .model({
      version: a.string(),
      descripcion: a.string(),
      username: a.string(),
      status: a.string(),
      aditionalData: a.json(),
      PiepelineRunIdInsumos: a.string(),
      PiepelineRunIdPlanVentas: a.string(),
      PiepelineRunIdPlanDemandas: a.string(),
      PiepelineRunIdExplocion: a.string(),
      SyncInsumosStatus: a.string(),
      SyncSalesPlanStatus: a.string(),
      SyncDemandPlanStatus: a.string(),
      ExecuteBoomStatus: a.string(),
      reportePlanDemanda: a.json(),
      materialesSinAprovicion: a.json(),
      materialesSinCentroProduccion: a.json(),
      insumoPlanVentasPath: a.string(),
      insumoExistenciasPath: a.string(),
      insumoCoberturaPath: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  /**
   * Microsoft Graph Module
   */
  MicrosoftGraphToken: a
    .query()
    .arguments({ tenantName: a.string() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(microsoftGraphToken)),
 /**
  *  Carga de Insumos - Procesamiento por lotes
  */
  saveCargaInsumosBatch: a
    .mutation()
    .arguments({
      tipo: a.string().required(),
      data: a.json().required(),
      metadata: a.json().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(cargaInsumosSaveBatch)),

  /**
   *  Carga de Insumos - Consulta de datos guardados
   */
  getCargaInsumosData: a
    .query()
    .arguments({
      documentId: a.string(),
      batchId: a.string(),
      tipo: a.string(),
      limit: a.integer(),
      offset: a.integer(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(cargaInsumosGetData)),

  /**
   *  Ejeucuion de Pipelines ADF
   */
  runPipeline: a
    .mutation()
    .arguments({
      pipelineName: a.string(),
      Pversion: a.string(),
      boomId: a.string(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(runPipeline)),

  /**
   *  Obtener estado de una pipeline
   */
  getStatusPipeline: a
    .query()
    .arguments({ runId: a.string() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(BoomGetStatusPipeline)),

  /**
   *  Obtener materiales sin aprovicionamiento
   */
  getMaterialesSinAprovicionamiento: a
    .query()
    .arguments({ boomId: a.string() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(GetMaterialesSinAprovicionamiento)),

  /**
   *  Obtener materiales sin centro de produccion
   */
  getMaterialesSinCentroProduccion: a
    .query()
    .arguments({ boomId: a.string() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(GetMaterialesSinCentroProduccion)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
