<script setup>
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";

import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <authenticator>
      <template v-slot:header>
        <div style="padding: var(--amplify-space-large); text-align: center">
          <img class="amplify-image" alt="Amplify logo" src="/logo.png" />
        </div>
      </template>

      <template v-slot="{ user, signOut }">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </template>
    </authenticator>
  </div>
</template>
