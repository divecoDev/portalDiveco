<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
  >
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-users"
            class="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-3"
          />
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Empleados a Cargo
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ subordinates.length }} empleado{{
                subordinates.length !== 1 ? "s" : ""
              }}
              bajo tu supervisión
            </p>
          </div>
        </div>
        <UButton
          @click="toggleExpanded"
          variant="ghost"
          size="sm"
          :icon="
            isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
        >
          {{ isExpanded ? "Contraer" : "Expandir" }}
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <div v-if="isExpanded" class="p-6">
      <div v-if="subordinates.length === 0" class="text-center py-8">
        <UIcon
          name="i-heroicons-user-group"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-500 dark:text-gray-400">
          No tienes empleados a cargo asignados
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="employee in subordinates"
          :key="employee.id"
          :class="[
            'group relative rounded-xl p-6 border transition-all duration-300',
            employee.hasSapUser
              ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-lg transform hover:-translate-y-1'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed',
          ]"
        >
          <!-- SAP Status Indicator -->
          <div class="absolute top-4 right-4 z-20">
            <div
              :class="[
                'flex items-center px-2 py-1 rounded-full text-xs font-medium',
                employee.hasSapUser
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              ]"
            >
              <UIcon
                :name="
                  employee.hasSapUser
                    ? 'i-heroicons-check-circle'
                    : 'i-heroicons-x-circle'
                "
                class="w-3 h-3 mr-1"
              />
              {{ employee.hasSapUser ? "SAP" : "Sin SAP" }}
            </div>
          </div>

          <!-- Decorative gradient overlay (only for active users) -->
          <div
            v-if="employee.hasSapUser"
            class="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>

          <!-- Content -->
          <div class="relative z-10">
            <!-- Employee Avatar and Basic Info -->
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex-shrink-0">
                <div
                  :class="[
                    'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-shadow duration-300',
                    employee.hasSapUser
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 group-hover:shadow-xl'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600',
                  ]"
                >
                  <span
                    :class="[
                      'text-lg font-bold',
                      employee.hasSapUser ? 'text-white' : 'text-gray-200',
                    ]"
                  >
                    {{ getInitials(employee.displayName) }}
                  </span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  :class="[
                    'text-base font-semibold truncate transition-colors duration-200',
                    employee.hasSapUser
                      ? 'text-gray-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  {{ employee.displayName }}
                </h3>
                <p
                  :class="[
                    'text-sm truncate flex items-center mt-1',
                    employee.hasSapUser
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500',
                  ]"
                >
                  <UIcon
                    name="i-heroicons-envelope"
                    :class="[
                      'w-4 h-4 mr-2',
                      employee.hasSapUser ? 'text-gray-400' : 'text-gray-500',
                    ]"
                  />
                  {{ employee.mail }}
                </p>
              </div>
            </div>

            <!-- Job Title with Icon -->
            <div class="mb-6">
              <div
                :class="[
                  'flex items-center space-x-2 p-3 rounded-lg',
                  employee.hasSapUser
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'bg-gray-200 dark:bg-gray-600',
                ]"
              >
                <UIcon
                  name="i-heroicons-briefcase"
                  :class="[
                    'w-4 h-4 flex-shrink-0',
                    employee.hasSapUser
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                />
                <p
                  :class="[
                    'text-sm font-medium',
                    employee.hasSapUser
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-500 dark:text-gray-400',
                  ]"
                >
                  {{ employee.jobTitle || "Sin cargo definido" }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3">
              <UButton
                size="sm"
                variant="outline"
                color="cyan"
                :disabled="!employee.hasSapUser"
                :class="[
                  'flex-1 justify-center transition-transform duration-200',
                  employee.hasSapUser
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50',
                ]"
                @click="
                  employee.hasSapUser
                    ? selectEmployeeForAction(employee, 'reset')
                    : null
                "
              >
                <UIcon name="i-heroicons-key" class="w-4 h-4 mr-2" />
                Reiniciar
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                color="orange"
                :disabled="!employee.hasSapUser"
                :class="[
                  'flex-1 justify-center transition-transform duration-200',
                  employee.hasSapUser
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50',
                ]"
                @click="
                  employee.hasSapUser
                    ? selectEmployeeForAction(employee, 'unlock')
                    : null
                "
              >
                <UIcon name="i-heroicons-lock-open" class="w-4 h-4 mr-2" />
                Desbloquear
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  subordinates: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["employee-selected"]);

// Reactive data
const isExpanded = ref(true);

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const selectEmployeeForAction = (employee, action) => {
  emit("employee-selected", { employee, action });
};
</script>

<style scoped>
/* Animaciones suaves y efectos mejorados */
.transition-colors {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Hover effects */
.group:hover .group-hover\:shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:-translate-y-1:hover {
  transform: translateY(-0.25rem);
}

/* Custom gradient backgrounds */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Improved card shadow on hover */
.hover\:shadow-lg:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .group:hover .group-hover\:shadow-xl {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.25),
      0 10px 10px -5px rgba(0, 0, 0, 0.1);
  }

  .hover\:shadow-lg:hover {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.3),
      0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }
}
</style>
