<script setup>
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";

import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

import { signInWithRedirect } from "aws-amplify/auth";

import { I18n } from "aws-amplify/utils";
import { translations } from "@aws-amplify/ui-vue";
I18n.putVocabularies(translations);
I18n.setLanguage("es");

// Función para manejar el inicio de sesión con Microsoft Entra ID
const handleMicrosoftSignIn = async () => {
  try {
    await signInWithRedirect({
      provider: { custom: "MicrosoftEntraIDSAML" },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

const handleNovaFinanzasSignIn = async () => {
  try {
    await signInWithRedirect({
      provider: { custom: "MicrosoftEntraID" },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};
</script>

<template>
  <div class="bg-gradient-diveco h-screen">
    <authenticator :hide-sign-up="true">
      <template v-slot:header>
        <div style="text-align: center">
          <img class="w-64 mx-auto" alt="Amplify logo" src="/logo.png" />
        </div>

        <div style="bottom: -13px; position: relative">
          <img class="w-64 mx-auto" alt="Amplify logo" src="/personajes.png" />
        </div>
      </template>

      <template v-slot:footer>
        <div class="flex w-full pt-4 gap-4">
          <button
            @click="handleMicrosoftSignIn"
            class="group relative w-full px-8 py-4 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300/50 overflow-hidden"
          >
            <!-- Efecto de brillo en hover -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            ></div>

            <!-- Contenido del botón -->
            <div class="relative flex items-center justify-center space-x-3">
              <!-- Ícono de Microsoft mejorado -->
              <div class="w-6 h-6 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                <svg
                  class="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                  />
                </svg>
              </div>

              <!-- Texto del botón -->
              <span class="font-semibold text-lg tracking-wide">Diveco</span>
            </div>
          </button>

          <button
            @click="handleNovaFinanzasSignIn"
            class="hidden group relative w-full px-8 py-4 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300/50 overflow-hidden"
          >
            <!-- Efecto de brillo en hover -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            ></div>

            <!-- Contenido del botón -->
            <div class="relative flex items-center justify-center space-x-3">
              <!-- Ícono de Microsoft mejorado -->
              <div class="w-6 h-6 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                <svg
                  class="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                  />
                </svg>
              </div>

              <!-- Texto del botón -->
              <span class="font-semibold text-lg tracking-wide"
                >Nova Finanzas</span
              >
            </div>
          </button>
        </div>
      </template>

      <template v-slot="{ user, signOut }" class="bg-white">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </template>
    </authenticator>
  </div>
</template>

<style>
[data-amplify-container] {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Centrar los elementos internos del contenedor de Amplify */
[data-amplify-container] > * {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Centrar los campos de entrada */
[data-amplify-container] [data-amplify-input] {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
