// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
  ],

  css: ["@/assets/css/main.css"],

  typescript: {
    typeCheck: false, // Desactivamos temporalmente para debug
  },

  runtimeConfig: {
    msTenantId: "",
    msClientId: "",
    msClientSecret: "",
  },

});
