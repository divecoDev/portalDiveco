<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="transform opacity-0 translate-x-full scale-95 rotate-3"
      enter-to-class="transform opacity-100 translate-x-0 scale-100 rotate-0"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="transform opacity-100 translate-x-0 scale-100 rotate-0"
      leave-to-class="transform opacity-0 translate-x-full scale-95 rotate-3"
    >
      <div
        v-if="show"
        class="fixed top-20 right-4 z-[9999] w-96"
        style="z-index: 9999 !important"
      >
        <!-- Notificación principal con glassmorphism -->
        <div
          class="relative p-6 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl overflow-hidden"
          style="z-index: 9999 !important; position: relative !important"
          :class="{
            'bg-gradient-to-br from-emerald-50/90 to-emerald-100/90 dark:from-emerald-900/90 dark:to-emerald-800/90 border-emerald-200/50':
              type === 'success',
            'bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-900/90 dark:to-red-800/90 border-red-200/50':
              type === 'error',
            'bg-gradient-to-br from-amber-50/90 to-amber-100/90 dark:from-amber-900/90 dark:to-amber-800/90 border-amber-200/50':
              type === 'warning',
            'bg-gradient-to-br from-cyan-50/90 to-cyan-100/90 dark:from-cyan-900/90 dark:to-cyan-800/90 border-cyan-200/50':
              type === 'info',
          }"
        >
          <!-- Efecto de brillo superior -->
          <div
            class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          ></div>

          <!-- Efecto de sombra interna -->
          <div class="absolute inset-0 rounded-2xl shadow-inner"></div>

          <!-- Contenido principal -->
          <div class="relative z-10 flex items-center space-x-5">
            <!-- Icono principal con efectos -->
            <div class="flex-shrink-0">
              <div
                class="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
                :class="{
                  'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25':
                    type === 'success',
                  'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25':
                    type === 'error',
                  'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25':
                    type === 'warning',
                  'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/25':
                    type === 'info',
                }"
              >
                <UIcon
                  :name="iconName"
                  class="w-7 h-7 text-white drop-shadow-lg"
                />
                <!-- Efecto de brillo en el icono -->
                <div
                  class="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"
                ></div>
              </div>
            </div>

            <!-- Contenido de texto -->
            <div class="flex-1 min-w-0 py-1">
              <h4
                class="text-lg font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent leading-tight"
                :class="{
                  'from-emerald-600 to-emerald-800 dark:text-white':
                    type === 'success',
                  'from-red-600 to-red-800 dark:text-white': type === 'error',
                  'from-amber-600 to-amber-800 dark:text-white':
                    type === 'warning',
                  'from-cyan-600 to-cyan-800 dark:text-white': type === 'info',
                }"
              >
                {{ title }}
              </h4>
              <p
                class="text-base leading-relaxed font-medium leading-tight"
                :class="{
                  'text-emerald-700 dark:text-white': type === 'success',
                  'text-red-700 dark:text-white': type === 'error',
                  'text-amber-700 dark:text-white': type === 'warning',
                  'text-cyan-700 dark:text-white': type === 'info',
                }"
              >
                {{ message }}
              </p>
            </div>

            <!-- Botón cerrar mejorado -->
            <div class="flex-shrink-0">
              <button
                @click="closeMessage"
                class="group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                :class="{
                  'hover:bg-emerald-200/50 dark:hover:bg-emerald-700/50':
                    type === 'success',
                  'hover:bg-red-200/50 dark:hover:bg-red-700/50':
                    type === 'error',
                  'hover:bg-amber-200/50 dark:hover:bg-amber-700/50':
                    type === 'warning',
                  'hover:bg-cyan-200/50 dark:hover:bg-cyan-700/50':
                    type === 'info',
                }"
              >
                <UIcon
                  name="i-heroicons-x-mark"
                  class="w-5 h-5 transition-all duration-300 group-hover:rotate-90"
                  :class="{
                    'text-emerald-600 dark:text-emerald-300':
                      type === 'success',
                    'text-red-600 dark:text-red-300': type === 'error',
                    'text-amber-600 dark:text-amber-300': type === 'warning',
                    'text-cyan-600 dark:text-cyan-300': type === 'info',
                  }"
                />
                <!-- Efecto de hover en el botón -->
                <div
                  class="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
              </button>
            </div>
          </div>

          <!-- Barra de progreso mejorada -->
          <div
            v-if="autoHide && show"
            class="relative mt-4 h-2 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm"
          >
            <!-- Fondo de la barra -->
            <div class="absolute inset-0 rounded-full bg-white/20"></div>

            <!-- Barra de progreso animada -->
            <div
              class="relative h-full rounded-full transition-all duration-100 ease-out shadow-lg"
              :class="{
                'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/50':
                  type === 'success',
                'bg-gradient-to-r from-red-400 to-red-500 shadow-red-500/50':
                  type === 'error',
                'bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/50':
                  type === 'warning',
                'bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-cyan-500/50':
                  type === 'info',
              }"
              :style="{ width: progressWidth + '%' }"
            >
              <!-- Efecto de brillo en la barra -->
              <div
                class="absolute inset-0 rounded-full bg-gradient-to-r from-white/30 to-transparent"
              ></div>

              <!-- Efecto de pulso -->
              <div
                class="absolute inset-0 rounded-full animate-pulse"
                :class="{
                  'bg-emerald-300/50': type === 'success',
                  'bg-red-300/50': type === 'error',
                  'bg-amber-300/50': type === 'warning',
                  'bg-cyan-300/50': type === 'info',
                }"
              ></div>
            </div>
          </div>

          <!-- Efectos decorativos -->
          <div
            class="absolute -top-1 -right-1 w-20 h-20 rounded-full opacity-10 blur-xl"
            :class="{
              'bg-emerald-400': type === 'success',
              'bg-red-400': type === 'error',
              'bg-amber-400': type === 'warning',
              'bg-cyan-400': type === 'info',
            }"
          ></div>

          <div
            class="absolute -bottom-1 -left-1 w-16 h-16 rounded-full opacity-10 blur-xl"
            :class="{
              'bg-emerald-300': type === 'success',
              'bg-red-300': type === 'error',
              'bg-amber-300': type === 'warning',
              'bg-cyan-300': type === 'info',
            }"
          ></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, ref, onMounted, onUnmounted } from "vue";

// Props
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "info",
    validator: (value) =>
      ["success", "error", "warning", "info"].includes(value),
  },
  show: {
    type: Boolean,
    default: false,
  },
  autoHide: {
    type: Boolean,
    default: true,
  },
  autoHideDelay: {
    type: Number,
    default: 15000, // 15 segundos (aumentado de 8)
  },
});

// Emits
const emit = defineEmits(["close"]);

// Estado para la barra de progreso
const progressWidth = ref(100);

// Computed properties
const iconName = computed(() => {
  switch (props.type) {
    case "success":
      return "i-heroicons-check-circle";
    case "error":
      return "i-heroicons-x-circle";
    case "warning":
      return "i-heroicons-exclamation-triangle";
    case "info":
    default:
      return "i-heroicons-information-circle";
  }
});

const title = computed(() => {
  switch (props.type) {
    case "success":
      return "Éxito";
    case "error":
      return "Error";
    case "warning":
      return "Advertencia";
    case "info":
    default:
      return "Información";
  }
});

// Methods
const closeMessage = () => {
  emit("close");
};

// Auto-hide functionality con barra de progreso
let autoHideTimer = null;
let progressTimer = null;

const startAutoHide = () => {
  if (props.autoHide && props.show) {
    // Resetear la barra de progreso
    progressWidth.value = 100;

    // Timer para cerrar el mensaje
    autoHideTimer = setTimeout(() => {
      closeMessage();
    }, props.autoHideDelay);

    // Timer para la barra de progreso (actualizar cada 100ms)
    const progressInterval = 100;
    const totalSteps = props.autoHideDelay / progressInterval;
    let currentStep = 0;

    progressTimer = setInterval(() => {
      currentStep++;
      progressWidth.value = 100 - (currentStep / totalSteps) * 100;

      if (currentStep >= totalSteps) {
        clearInterval(progressTimer);
      }
    }, progressInterval);
  }
};

const clearAutoHide = () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  progressWidth.value = 100;
};

// Watch for changes
watch(
  () => props.show,
  (newValue) => {
    console.log("🔍 StatusMessage - show changed:", newValue);
    console.log("🔍 StatusMessage - current props:", {
      show: props.show,
      message: props.message,
      type: props.type,
    });

    if (newValue) {
      startAutoHide();
    } else {
      clearAutoHide();
    }
  },
  { immediate: true }
);

// Watch for message changes
watch(
  () => props.message,
  (newValue) => {
    console.log("🔍 StatusMessage - message changed:", newValue);
  }
);

// Watch for type changes
watch(
  () => props.type,
  (newValue) => {
    console.log("🔍 StatusMessage - type changed:", newValue);
  }
);

// Cleanup on unmount
onUnmounted(() => {
  clearAutoHide();
});
</script>

<style scoped>
/* Estilos para notificación global y compacta */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Animación de entrada desde la derecha */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sombra más sutil para notificación compacta */
.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-2xl {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Efectos de glassmorphism */
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Hover effects mejorados */
button:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease-in-out;
}

/* Barra de progreso más sutil */
.h-2 {
  height: 8px;
}

/* Responsive adjustments para notificación global */
@media (max-width: 640px) {
  .w-96 {
    width: calc(100vw - 2rem);
    right: 1rem;
  }
}

/* Animación de entrada más suave */
.enter-active-class {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto de hover en el botón de cerrar */
button {
  transition: all 0.3s ease-in-out;
}

/* Mejora de legibilidad del texto */
.text-emerald-700 {
  color: #047857;
}

.text-red-700 {
  color: #b91c1c;
}

.text-amber-700 {
  color: #b45309;
}

.text-cyan-700 {
  color: #0e7490;
}

/* Colores para modo oscuro - texto blanco para mejor legibilidad */
.dark .text-white {
  color: #ffffff;
}

/* Asegurar que el texto sea legible en modo oscuro */
.dark .bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
  color: #ffffff;
}

/* Optimización para notificaciones compactas */
.space-x-5 > * + * {
  margin-left: 1.25rem;
}

/* Mejoras para iconos circulares */
.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

/* Centrado perfecto para contenido */
.content-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ajustes de alineación vertical */
.vertical-center {
  display: flex;
  align-items: center;
}

/* Efectos especiales para contenedores circulares */
.circular-container {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}

.circular-container::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* Mejoras para botones circulares */
.circular-button {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.circular-button:hover {
  transform: scale(1.1) rotate(5deg);
}

/* Efectos de profundidad para iconos */
.icon-depth {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/* Ajustes de espaciado para mejor alineación */
.text-content {
  padding: 0.25rem 0;
  line-height: 1.4;
}

/* Responsive adjustments para iconos circulares */
@media (max-width: 640px) {
  .w-14 {
    width: 3rem;
    height: 3rem;
  }

  .w-10 {
    width: 2.5rem;
    height: 2.5rem;
  }

  .space-x-5 > * + * {
    margin-left: 1rem;
  }
}

/* Truncate para títulos largos */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Asegurar que la notificación esté por encima de todo */
.fixed {
  position: fixed !important;
}

/* Z-index muy alto para estar por encima de todo */
.z-\[9999\] {
  z-index: 9999 !important;
}

/* Optimización para posicionamiento global */
@media (max-width: 768px) {
  .fixed.top-20.right-4 {
    top: 5rem;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .fixed.top-20.right-4 {
    top: 4rem;
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
  }
}

/* Efectos especiales para notificaciones */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(6, 182, 212, 0.6);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Efectos de hover para la notificación completa */
.notification-container:hover {
  animation: float 3s ease-in-out infinite;
}

/* Efectos de brillo para iconos */
.icon-glow {
  filter: drop-shadow(0 0 8px currentColor);
}

/* Efectos de sombra dinámica */
.dynamic-shadow {
  transition: box-shadow 0.3s ease;
}

.dynamic-shadow:hover {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* Efectos de borde brillante */
.border-glow {
  position: relative;
}

.border-glow::before {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  border-radius: inherit;
  z-index: -1;
  animation: shimmer 2s linear infinite;
}

/* Efectos de partículas flotantes */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float 4s ease-in-out infinite;
}

.particle:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.particle:nth-child(3) {
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

/* Efectos de entrada con partículas */
.enter-with-particles {
  position: relative;
  overflow: hidden;
}

.enter-with-particles::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 1.5s ease-in-out;
}

/* Efectos de profundidad */
.depth-effect {
  transform-style: preserve-3d;
  perspective: 1000px;
}

.depth-effect:hover {
  transform: rotateX(5deg) rotateY(5deg);
}

/* Efectos de neón */
.neon-effect {
  text-shadow:
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 15px currentColor;
}

/* Efectos de cristal */
.crystal-effect {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Efectos de ondas */
.wave-effect {
  position: relative;
  overflow: hidden;
}

.wave-effect::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  transform: translate(-50%, -50%) scale(0);
  animation: wave 2s ease-out infinite;
}

@keyframes wave {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>
