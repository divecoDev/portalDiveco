import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "boomStorage",
  access: (allow) => ({
    "carga-insumos/*": [
      allow.authenticated.to(["read", "write", "delete"]),
    ],
    "archivos-originales/*": [
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});


export const suicStorage = defineStorage({
  name: "suicStorage",
  access: (allow) => ({
    "suic/*": [
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});