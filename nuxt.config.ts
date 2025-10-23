// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxt/test-utils/module",
    "nuxt-delay-hydration",
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

   pinia: {
    storesDirs: ['./stores/**'],
  },

  delayHydration: {
    mode: 'init',
  },
});