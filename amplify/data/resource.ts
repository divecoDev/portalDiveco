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
import { cargaInsumosDeleteBatch } from "../functions/carga-insumos/deleteBatch/resource";
import { cargaInsumosGetData } from "../functions/carga-insumos/getData/resource";
import { runPipeline } from "../functions/boom/runPipeline/resource";
import { BoomGetStatusPipeline } from "../functions/boom/GetStatusPipeline/resource";
import { GetMaterialesSinAprovicionamiento } from "../functions/boom/GetMaterialesSinAprovicionamiento/resource";
import { GetMaterialesSinCentroProduccion } from "../functions/boom/getMaterialesSinCentroProduccion/resource";
import { aprovisionamiento } from "../functions/porcentajes-asignacion/resource";
import { suicSaveBatch } from "../functions/suic/resource";
import { suicGetSummary } from "../functions/suic/getSummary/resource";
import { runExplosionSuic } from "../functions/suic/runExplosion/resource";
import { getMetaDiariaFinal } from "../functions/suic/getMetaDiariaFinal/resource";

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
      enableShowDocuments: a.boolean(),
    })
    .secondaryIndexes((index) => [
      index("version") // Crear GSI para búsquedas por version
    ])
    .authorization((allow) => [allow.publicApiKey()]),



  Cobertura: a
    .model({
      boomId: a.string(),
      cobertura: a.json(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

   /*
    Modelo para  la carga de plantillas SUIC
    */

    SUIC: a
    .model({
      descripcion: a.string(),
      filesPath: a.json(),
      createdBy: a.string(),
      type: a.string(), //
      explosionRunId: a.string(),
      explosionStatus: a.string(), // 'Pendiente', 'En Proceso', 'Completado', 'Error'
      rpaExecutionId: a.string(), // ID único generado antes de ejecutar el RPA
      rpaStatus: a.string(), // Estados: 'pending', 'running', 'completed', 'error'
      rpaType: a.string(), // Tipo de RPA: 'bloqueo-sap', 'carga-plantilla'
      rpaLastUpdate: a.string(), // Timestamp de última actualización
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
   *  Carga de Insumos - Eliminar datos por document_id
   */
  deleteCargaInsumosBatch: a
    .mutation()
    .arguments({
      documentId: a.string().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(cargaInsumosDeleteBatch)),

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

  /**
   *  CRUD de Aprovisionamiento
   */
  aprovisionamiento: a
    .query()
    .arguments({
      operation: a.string(),
      centroIdOrigen: a.integer(),
      materialId: a.integer(),
      centroIdAprov: a.integer(),
      porcentaje: a.float(),
      limit: a.integer(),
      offset: a.integer(),
      search: a.string(),
      data: a.string(), // Para carga masiva - JSON string de array de aprovisionamientos
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(aprovisionamiento)),

  /**
   *  SUIC - Guardar datos en MySQL por lotes
   */
  saveSuicBatch: a
    .mutation()
    .arguments({
      suicId: a.string().required(),
      paisCode: a.string().required(),
      data: a.json().required(),
      batchIndex: a.integer().required(),
      totalBatches: a.integer().required(),
      deleteExisting: a.boolean().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(suicSaveBatch)),

  /**
   *  SUIC - Consultar resumen de datos guardados en MySQL
   */
  getSuicSummary: a
    .query()
    .arguments({
      suicId: a.string().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(suicGetSummary)),

  /**
   *  SUIC - Consultar datos de meta_diaria_final agregados por sociedad y mes
   */
  getMetaDiariaFinal: a
    .query()
    .arguments({
      suicId: a.string().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(getMetaDiariaFinal)),

  /**
   *  SUIC - Ejecutar pipeline de explosión en Azure Data Factory
   */
  runExplosionSuic: a
    .mutation()
    .arguments({
      pipelineName: a.string(),
      idSuic: a.string().required(),
      tipo: a.string().required(),
      primerMes: a.integer().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(runExplosionSuic)),
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
