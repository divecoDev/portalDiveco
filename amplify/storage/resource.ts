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
    "suic/*": [
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});