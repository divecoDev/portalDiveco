// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
    "nuxt-delay-hydration",
    "nuxt-booster",
  ],

  css: ["@/assets/css/main.css"],

  typescript: {
    typeCheck: false, // Desactivamos temporalmente para debug
  },

  runtimeConfig: {
    msTenantId: "",
    msClientId: "",
    msClientSecret: "",
    rpaApiUrl: process.env.RPA_API_URL || "", // URL base de la API externa del RPA
  },

   pinia: {
    storesDirs: ['./stores/**'],
  },

  delayHydration: {
    mode: 'init',
  },
});