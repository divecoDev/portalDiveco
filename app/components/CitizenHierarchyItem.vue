<template>
  <div
    :class="[
      'relative',
      level > 0
        ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4'
        : '',
    ]"
  >
    <!-- Citizen Card -->
    <div
      :class="[
        'group relative rounded-xl p-6 border transition-all duration-300',
        citizen.hasSapUser
          ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-lg transform hover:-translate-y-1'
          : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed',
      ]"
    >
      <!-- SAP Status Indicator -->
      <div class="absolute top-4 right-4 z-20">
        <div
          :class="[
            'flex items-center p-1 rounded-full text-xs font-medium',
            citizen.hasSapUser
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
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
      </div>

      <!-- Subordinates Count Badge -->
      <div v-if="citizen.hasSubordinates" class="absolute top-4 left-4 z-20">
        <div
          class="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 px-2 py-1 rounded-full text-xs font-medium flex items-center"
        >
          <UIcon name="i-heroicons-users" class="w-3 h-3 mr-1" />
          {{ citizen.subordinatesCount }}
        </div>
      </div>

      <!-- Decorative gradient overlay (only for active users) -->
      <div
        v-if="citizen.hasSapUser"
        class="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <!-- Content -->
      <div class="relative z-10">
        <!-- Employee Avatar and Basic Info -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex-shrink-0">
            <div class="relative w-14 h-14">
              <!-- User Photo -->
              <img
                v-if="userPhotos.get(citizen.id)"
                :src="userPhotos.get(citizen.id)"
                :alt="citizen.displayName"
                class="w-14 h-14 rounded-full object-cover shadow-lg transition-shadow duration-300 group-hover:shadow-xl"
              />
              <!-- Fallback to Initials -->
              <div
                v-else
                :class="[
                  'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-shadow duration-300',
                  citizen.hasSapUser
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 group-hover:shadow-xl'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600',
                ]"
              >
                <span
                  :class="[
                    'text-lg font-bold',
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
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
              </div>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3
              :class="[
                'text-base font-semibold truncate transition-colors duration-200',
                citizen.hasSapUser
                  ? 'text-gray-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ citizen.displayName }}
            </h3>
            <p
              :class="[
                'text-sm truncate flex items-center mt-1',
                citizen.hasSapUser
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500',
              ]"
            >
              <UIcon
                name="i-heroicons-envelope"
                :class="[
                  'w-4 h-4 mr-2',
                  citizen.hasSapUser ? 'text-gray-400' : 'text-gray-500',
                ]"
              />
              {{ citizen.mail }}
            </p>
          </div>
          <!-- Expand/Collapse Button for Subordinates -->
          <div v-if="citizen.hasSubordinates" class="flex-shrink-0">
            <UButton
              @click="handleToggleSubordinates"
              variant="ghost"
              size="sm"
              :icon="
                isExpanded
                  ? 'i-heroicons-chevron-up'
                  : 'i-heroicons-chevron-down'
              "
              class="transition-transform duration-200"
              :class="{ 'rotate-180': isExpanded }"
            />
          </div>
        </div>

        <!-- Job Title with Icon -->
        <div class="mb-6">
          <div
            :class="[
              'flex items-center space-x-2 p-3 rounded-lg',
              citizen.hasSapUser
                ? 'bg-gray-100 dark:bg-gray-700'
                : 'bg-gray-200 dark:bg-gray-600',
            ]"
          >
            <UIcon
              name="i-heroicons-briefcase"
              :class="[
                'w-4 h-4 flex-shrink-0',
                citizen.hasSapUser
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            />
            <p
              :class="[
                'text-sm font-medium',
                citizen.hasSapUser
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ citizen.jobTitle || "Sin cargo definido" }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <UButton
            size="sm"
            variant="outline"
            color="cyan"
            :disabled="!citizen.hasSapUser"
            :class="[
              'flex-1 justify-center transition-transform duration-200',
              citizen.hasSapUser
                ? 'hover:scale-105'
                : 'cursor-not-allowed opacity-50',
            ]"
            @click="citizen.hasSapUser ? handleCitizenAction('reset') : null"
          >
            <UIcon name="i-heroicons-key" class="w-4 h-4 mr-2" />
            Reiniciar
          </UButton>
          <UButton
            size="sm"
            variant="outline"
            color="orange"
            :disabled="!citizen.hasSapUser"
            :class="[
              'flex-1 justify-center transition-transform duration-200',
              citizen.hasSapUser
                ? 'hover:scale-105'
                : 'cursor-not-allowed opacity-50',
            ]"
            @click="citizen.hasSapUser ? handleCitizenAction('unlock') : null"
          >
            <UIcon name="i-heroicons-lock-open" class="w-4 h-4 mr-2" />
            Desbloquear
          </UButton>
        </div>
      </div>
    </div>

    <!-- Subordinates (Recursive) -->
    <div v-if="citizen.hasSubordinates && isExpanded" class="mt-4 space-y-4">
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
