<script setup lang="ts">
import { generateClient } from "aws-amplify/api";

const client = generateClient();

const request = await client.queries.ResetPassword({
  sapUser: "GT_GORTIZ",
  email: "gerson.ortiz.gt@camasolympia.com",
});

console.log(request);
</script>

<template>
  <h1>Password Reset on Lambda</h1>
</template>
