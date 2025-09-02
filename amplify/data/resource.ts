import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { groups } from "../functions/groups/resource";
import { resetPassword } from "../functions/reset-password/resource";
import { users } from "../functions/users/resource";
import { allGroups } from "../functions/AllGroups/resource";
import { assignUserToGroup } from "../functions/AssignUserToGroup/resource";
import { removeUserFromGroup } from "../functions/removeUserFromGroup/resource";
/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update",
and "delete" any "Todo" records.
=========================================================================*/
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

  // Modelo para la bitacora de usarios que se les resetea la contraseña o se desbloqueo el usuario.
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
