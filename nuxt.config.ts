// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "nuxt-mongoose", "@pinia/nuxt"],

  css: ["@/assets/css/main.css"],

  typescript: {
    typeCheck: false, // Desactivamos temporalmente para debug
  },

  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {},
    modelsDir: "models",
    devtools: true,
  },

  runtimeConfig: {
    msTenantId: "",
    msClientId: "",
    msClientSecret: "",
  },
});
