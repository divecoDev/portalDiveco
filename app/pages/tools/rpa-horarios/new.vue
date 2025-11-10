<template>
  <div class="">
    <!-- Header de la página integrado -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="text-4xl font-bold text-gray-900 dark:text-white flex items-center"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25"
            >
              <UIcon
                name="i-heroicons-plus-circle"
                class="w-7 h-7 text-white"
              />
            </div>
            Nueva Ventana de Ejecución RPA
          </h1>
          <p class="mt-3 text-lg text-gray-600 dark:text-gray-300 ml-16">
            Crea una nueva ventana de ejecución de RPA
          </p>
        </div>

        <!-- Botón para volver al listado -->
        <NuxtLink to="/tools/rpa-horarios">
          <UButton
            icon="i-heroicons-arrow-left"
            size="lg"
            color="gray"
            variant="outline"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
          >
            Volver al Listado
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Formulario -->
      <div
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md shadow-xl border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
      >
        <!-- Header del formulario con gradiente -->
        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div class="flex items-center">
            <UIcon
              name="i-heroicons-clock"
              class="w-6 h-6 text-white mr-3"
            />
            <h2 class="text-xl font-semibold text-white">Nueva Ventana</h2>
          </div>
        </div>

        <div class="p-6">
          <!-- Formulario -->
          <form @submit.prevent="createWindow" class="space-y-6">
            <!-- Nombre (Destacado) -->
            <div class="relative">
              <div
                class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 p-4 rounded-md border border-cyan-200 dark:border-cyan-700/50 shadow-sm"
              >
                <label
                  class="block text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center"
                >
                  <UIcon
                    name="i-heroicons-hashtag"
                    class="w-4 h-4 mr-1.5"
                  />
                  Nombre de la Ventana *
                </label>
                <UInput
                  v-model="formData.name"
                  type="text"
                  placeholder="Ej: Cierre Contable Nocturno"
                  size="lg"
                  :error="errors.name"
                  class="w-full"
                />
                <p
                  class="mt-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium"
                >
                  Identificador principal de la ventana
                </p>
              </div>
            </div>

            <!-- Descripción -->
            <div class="relative">
              <label
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-4 h-4 mr-1.5"
                />
                Descripción
              </label>
              <UTextarea
                v-model="formData.description"
                placeholder="Descripción opcional de la ventana (ej: qué se bloquea durante este período)"
                :rows="3"
                :error="errors.description"
                class="w-full"
              />
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Explicación opcional de qué se bloquea durante esta ventana
              </p>
            </div>

            <!-- Horario: Hora Inicio y Fin -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Hora de Inicio -->
              <div class="relative">
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-1.5" />
                  Hora de Inicio *
                </label>
                <UInput
                  v-model="formData.startTime"
                  type="time"
                  size="lg"
                  :error="errors.startTime"
                  class="w-full"
                />
                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Hora de inicio del bloqueo (HH:MM)
                </p>
              </div>

              <!-- Hora de Fin -->
              <div class="relative">
                <label
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-1.5" />
                  Hora de Fin *
                </label>
                <UInput
                  v-model="formData.endTime"
                  type="time"
                  size="lg"
                  :error="errors.endTime"
                  class="w-full"
                />
                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Hora de fin del bloqueo (HH:MM)
                </p>
              </div>
            </div>

            <!-- Zona Horaria -->
            <div class="relative">
              <label
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 mr-1.5" />
                Zona Horaria *
              </label>
              <select
                v-model="formData.timezone"
                :class="[
                  'w-full px-4 py-3 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500',
                  errors.timezone 
                    ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                    : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                ]"
              >
                <option value="America/Guatemala">America/Guatemala (GTM-6)</option>
                <option value="America/Mexico_City">America/Mexico_City (GTM-6)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                <option value="America/Denver">America/Denver (MST/MDT)</option>
                <option value="UTC">UTC</option>
              </select>
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Zona horaria para la ventana de ejecución
              </p>
            </div>

            <!-- Días de la Semana -->
            <div class="relative">
              <label
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center"
              >
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1.5" />
                Días de Recurrencia *
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label
                  v-for="day in daysOfWeek"
                  :key="day.value"
                  class="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                  :class="formData.daysOfWeek.includes(day.value)
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-gray-300 dark:border-gray-600'"
                >
                  <input
                    type="checkbox"
                    :value="day.value"
                    v-model="formData.daysOfWeek"
                    class="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ day.label }}
                  </span>
                </label>
              </div>
              <p
                v-if="errors.daysOfWeek"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.daysOfWeek }}
              </p>
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Selecciona al menos un día de la semana
              </p>
            </div>

            <!-- Estado -->
            <div class="relative">
              <label
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center"
              >
                <UIcon name="i-heroicons-power" class="w-4 h-4 mr-1.5" />
                Estado *
              </label>
              <select
                v-model="formData.isActive"
                :class="[
                  'w-full px-4 py-3 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500',
                  errors.isActive 
                    ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                    : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                ]"
              >
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Solo las ventanas activas aplican restricciones
              </p>
            </div>

            <!-- Mensajes de error generales -->
            <div
              v-if="hasErrors"
              class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
            >
              <div class="flex items-center">
                <UIcon
                  name="i-heroicons-exclamation-circle"
                  class="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
                />
                <span class="text-sm text-red-800 dark:text-red-200 font-medium">
                  Por favor, corrige los errores antes de continuar
                </span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 pt-4">
              <NuxtLink to="/tools/rpa-horarios">
                <UButton
                  type="button"
                  color="gray"
                  variant="outline"
                  size="lg"
                  :disabled="creating"
                >
                  Cancelar
                </UButton>
              </NuxtLink>

              <button
                type="submit"
                :disabled="!isFormValid || creating"
                class="rounded-md inline-flex items-center px-6 py-3 text-sm gap-2 shadow-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:from-cyan-500 disabled:hover:to-cyan-600 disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                <div
                  v-if="creating"
                  class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                <UIcon v-else name="i-heroicons-check" class="w-5 h-5" />
                {{ creating ? "Creando..." : "Crear Ventana" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { generateClient } from "aws-amplify/data";
import { useAudit } from "~/composables/useAudit";

// Definir el layout y middleware
definePageMeta({
  layout: "default",
  middleware: ["require-role"],
  requiredRole: ["ADMINISTRAR-RPA-HORARIOS", "ADMIN"],
});

// Cliente de Amplify
const client = generateClient();

// Meta tags para SEO
useSeoMeta({
  title: "Nueva Ventana RPA - Portal Diveco",
  description: "Crear nueva ventana de ejecución de RPA",
});

// Breadcrumbs
const { setBreadcrumbs } = useLayoutState();
setBreadcrumbs([
  { title: "Inicio", href: "/" },
  { title: "Herramientas", href: "/" },
  { title: "Horarios RPA", href: "/tools/rpa-horarios" },
  { title: "Nueva Ventana" },
]);

const toast = useToast();
const { logCreate } = useAudit();

// Días de la semana
const daysOfWeek = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

// Estado reactivo
const creating = ref(false);
const formData = ref({
  name: "",
  description: "",
  startTime: "",
  endTime: "",
  timezone: "America/Guatemala",
  daysOfWeek: [],
  isActive: true,
});

const errors = ref({
  name: "",
  description: "",
  startTime: "",
  endTime: "",
  timezone: "",
  daysOfWeek: "",
  isActive: "",
});

// Validaciones
const validateForm = () => {
  errors.value = {
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    timezone: "",
    daysOfWeek: "",
    isActive: "",
  };

  let isValid = true;

  // Validar nombre
  if (!formData.value.name || formData.value.name.trim().length === 0) {
    errors.value.name = "El nombre es requerido";
    isValid = false;
  }

  // Validar hora de inicio
  if (!formData.value.startTime) {
    errors.value.startTime = "La hora de inicio es requerida";
    isValid = false;
  }

  // Validar hora de fin
  if (!formData.value.endTime) {
    errors.value.endTime = "La hora de fin es requerida";
    isValid = false;
  }

  // Validar que hora fin > hora inicio (si no cruza medianoche)
  if (formData.value.startTime && formData.value.endTime) {
    const startMinutes = timeToMinutes(formData.value.startTime);
    const endMinutes = timeToMinutes(formData.value.endTime);
    
    // Permitir cruce de medianoche (ej: 22:00 - 06:00)
    // Solo validar si no cruza medianoche
    if (endMinutes > startMinutes && endMinutes - startMinutes < 60) {
      errors.value.endTime = "La hora de fin debe ser al menos 1 hora después de la hora de inicio";
      isValid = false;
    }
  }

  // Validar zona horaria
  if (!formData.value.timezone) {
    errors.value.timezone = "La zona horaria es requerida";
    isValid = false;
  }

  // Validar días de la semana
  if (!formData.value.daysOfWeek || formData.value.daysOfWeek.length === 0) {
    errors.value.daysOfWeek = "Debes seleccionar al menos un día de la semana";
    isValid = false;
  }

  return isValid;
};

// Función auxiliar para convertir tiempo a minutos
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.name.trim().length > 0 &&
    formData.value.startTime &&
    formData.value.endTime &&
    formData.value.timezone &&
    formData.value.daysOfWeek.length > 0
  );
});

const hasErrors = computed(() => {
  return Object.values(errors.value).some((error) => error && error.length > 0);
});

// Limpiar errores cuando cambian los campos
watch(() => formData.value.name, () => {
  if (errors.value.name) errors.value.name = "";
});

watch(() => formData.value.startTime, () => {
  if (errors.value.startTime) errors.value.startTime = "";
  if (errors.value.endTime) errors.value.endTime = "";
});

watch(() => formData.value.endTime, () => {
  if (errors.value.endTime) errors.value.endTime = "";
});

watch(() => formData.value.daysOfWeek, () => {
  if (errors.value.daysOfWeek) errors.value.daysOfWeek = "";
});

// Métodos
const createWindow = async () => {
  if (!validateForm()) {
    toast.add({
      title: "Error de validación",
      description: "Por favor, corrige los errores en el formulario",
      color: "red",
    });
    return;
  }

  creating.value = true;

  try {
    // Convertir hora de formato HH:MM a formato requerido
    const startTime = formData.value.startTime;
    const endTime = formData.value.endTime;

    const { data, errors: createErrors } = await client.models.RpaExecutionWindow.create({
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || null,
      startTime,
      endTime,
      timezone: formData.value.timezone,
      daysOfWeek: formData.value.daysOfWeek,
      isActive: formData.value.isActive,
    });

    if (createErrors) {
      console.error("Error creating window:", createErrors);
      toast.add({
        title: "Error",
        description: "No se pudo crear la ventana de ejecución",
        color: "red",
      });
      return;
    }

    // Log de auditoría
    await logCreate(
      "rpa-horarios",
      "RpaExecutionWindow",
      data.id,
      data
    );

    toast.add({
      title: "Éxito",
      description: "Ventana de ejecución creada correctamente",
      color: "green",
    });

    // Redirigir al listado
    navigateTo("/tools/rpa-horarios");
  } catch (error) {
    console.error("Error creating window:", error);
    toast.add({
      title: "Error",
      description: "No se pudo crear la ventana de ejecución",
      color: "red",
    });
  } finally {
    creating.value = false;
  }
};
</script>

