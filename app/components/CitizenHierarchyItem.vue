<template>
  <div
    :class="[
      'relative',
      level > 0
        ? 'ml-4 border-l border-gray-300 dark:border-gray-600 pl-3'
        : '',
    ]"
  >
    <!-- Citizen Card - Diseño Compacto -->
    <div
      :class="[
        'group relative rounded-lg p-4 border transition-all duration-200',
        citizen.hasSapUser
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-md'
          : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-70',
      ]"
    >
      <!-- Main Content Row -->
      <div class="flex items-center space-x-3">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="relative w-10 h-10">
            <!-- User Photo -->
            <img
              v-if="userPhotos.get(citizen.id)"
              :src="userPhotos.get(citizen.id)"
              :alt="citizen.displayName"
              class="w-10 h-10 rounded-full object-cover shadow-sm"
            />
            <!-- Fallback to Initials -->
            <div
              v-else
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center shadow-sm',
                citizen.hasSapUser
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600',
              ]"
            >
              <span
                :class="[
                  'text-sm font-bold',
                  citizen.hasSapUser ? 'text-white' : 'text-gray-200',
                ]"
              >
                {{ getInitials(citizen.displayName) }}
              </span>
            </div>
            <!-- Loading indicator for photo -->
            <div
              v-if="loadingPhotos.has(citizen.id)"
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full"
            >
              <div
                class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="flex-1 min-w-0">
          <!-- Name with Badges -->
          <div class="flex items-center space-x-2 mb-1">
            <h4
              :class="[
                'text-sm font-semibold truncate',
                citizen.hasSapUser
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ citizen.displayName }}
            </h4>

            <!-- SAP Status Badge -->
            <div
              :class="[
                'flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                citizen.hasSapUser
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
              ]"
            >
              <UIcon
                :name="
                  citizen.hasSapUser
                    ? 'i-heroicons-check-circle'
                    : 'i-heroicons-x-circle'
                "
                class="w-3 h-3"
              />
            </div>

            <!-- Subordinates Count Badge -->
            <span
              v-if="citizen.hasSubordinates"
              class="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 px-1.5 py-0.5 rounded text-xs font-medium flex items-center"
            >
              <UIcon name="i-heroicons-users" class="w-3 h-3 mr-1" />
              {{ citizen.subordinatesCount }}
            </span>
          </div>

          <!-- Job Title and Actions Row -->
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'text-xs truncate',
                  citizen.hasSapUser
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-gray-400 dark:text-gray-500',
                ]"
              >
                {{ citizen.jobTitle || "Sin cargo definido" }}
              </p>

              <!-- Email - Siempre visible pero más sutil -->
              <div
                :class="[
                  'flex items-center mt-0.5 text-xs',
                  citizen.hasSapUser
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-400 dark:text-gray-500',
                ]"
              >
                <UIcon
                  name="i-heroicons-envelope"
                  class="w-3 h-3 mr-1 flex-shrink-0"
                />
                <span class="truncate">{{ citizen.mail }}</span>
              </div>
            </div>

            <!-- Actions Row -->
            <div class="flex items-center space-x-1 ml-3">
              <!-- Action Buttons -->
              <template v-if="citizen.hasSapUser">
                <UButton
                  size="xs"
                  variant="outline"
                  color="cyan"
                  @click="handleCitizenAction('reset')"
                  class="px-2 py-1"
                >
                  <UIcon name="i-heroicons-key" class="w-3 h-3" />
                </UButton>
                <UButton
                  size="xs"
                  variant="outline"
                  color="orange"
                  @click="handleCitizenAction('unlock')"
                  class="px-2 py-1"
                >
                  <UIcon name="i-heroicons-lock-open" class="w-3 h-3" />
                </UButton>
              </template>

              <!-- Expand/Collapse Button -->
              <UButton
                v-if="citizen.hasSubordinates"
                @click="handleToggleSubordinates"
                variant="ghost"
                size="xs"
                :icon="
                  isExpanded
                    ? 'i-heroicons-chevron-up'
                    : 'i-heroicons-chevron-down'
                "
                class="transition-transform duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subordinates (Recursive) -->
    <div v-if="citizen.hasSubordinates && isExpanded" class="mt-3 space-y-2">
      <CitizenHierarchyItem
        v-for="subordinate in citizen.subordinates"
        :key="subordinate.id"
        :citizen="subordinate"
        :user-photos="userPhotos"
        :loading-photos="loadingPhotos"
        :expanded-subordinates="expandedSubordinates"
        :level="level + 1"
        @citizen-selected="
          (citizen, action) => $emit('citizen-selected', citizen, action)
        "
        @toggle-subordinates="(id) => $emit('toggle-subordinates', id)"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  citizen: {
    type: Object,
    required: true,
  },
  userPhotos: {
    type: Map,
    required: true,
  },
  loadingPhotos: {
    type: Set,
    required: true,
  },
  expandedSubordinates: {
    type: Set,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["citizen-selected", "toggle-subordinates"]);

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const isExpanded = computed(() => {
  return props.expandedSubordinates.has(props.citizen.id);
});

const handleCitizenAction = (action) => {
  emit("citizen-selected", props.citizen, action);
};

const handleToggleSubordinates = () => {
  emit("toggle-subordinates", props.citizen.id);
};
</script>

<style scoped>
/* Animaciones suaves para el diseño compacto */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Hover effects compactos */
.hover\:shadow-md:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Mejoras para el modo oscuro */
@media (prefers-color-scheme: dark) {
  .hover\:shadow-md:hover {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.3),
      0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }
}

/* Líneas de jerarquía más sutiles */
.border-l {
  border-left-width: 1px;
}

/* Efectos de hover para los botones */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
