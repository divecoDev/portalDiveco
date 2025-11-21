<template>
  <div
    :class="[
      'backdrop-blur-sm rounded-md shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden',
      isPrimary 
        ? 'bg-gradient-to-br from-green-50 via-green-100/80 to-green-50 dark:from-green-900/30 dark:via-green-800/20 dark:to-green-900/30 p-8 border-2 border-green-300/50 dark:border-green-600/40' 
        : 'bg-white/90 dark:bg-gray-800/90 p-6 border border-cyan-200/20 dark:border-cyan-700/20'
    ]"
  >
    <!-- Elementos decorativos para card principal -->
    <div v-if="isPrimary" class="absolute top-0 right-0 w-32 h-32 opacity-10">
      <div class="absolute top-0 right-0 w-24 h-24 bg-green-400 rounded-full blur-2xl"></div>
      <div class="absolute top-8 right-8 w-16 h-16 bg-green-300 rounded-full blur-xl"></div>
    </div>

    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <div
          :class="[
            'bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg',
            colorClass,
            isPrimary ? 'w-20 h-20 shadow-green-500/25' : 'w-12 h-12'
          ]"
        >
          <UIcon :name="icon" :class="[isPrimary ? 'w-10 h-10' : 'w-6 h-6', 'text-white']" />
        </div>
        <div
          v-if="loading"
          class="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      
      <h3 :class="[
        'font-semibold mb-3',
        isPrimary 
          ? 'text-lg text-gray-700 dark:text-gray-200' 
          : 'text-sm text-gray-600 dark:text-gray-400'
      ]">
        {{ title }}
      </h3>
      
      <div class="space-y-2">
        <div :class="[
          'font-bold',
          isPrimary 
            ? 'text-5xl text-gray-900 dark:text-white leading-tight' 
            : 'text-2xl text-gray-900 dark:text-white'
        ]">
          <span v-if="isPrimary" class="block">{{ formattedValue }}</span>
          <span v-else>{{ formattedValue }}</span>
          <span v-if="unit" :class="isPrimary ? 'text-2xl' : 'text-sm'" class="font-normal text-gray-500 dark:text-gray-400 ml-2">{{ unit }}</span>
        </div>
        
        <div v-if="subtitle" :class="[
          'text-gray-600 dark:text-gray-400',
          isPrimary ? 'text-base' : 'text-sm'
        ]">
          {{ subtitle }}
        </div>
        
        <div v-if="trend" class="flex items-center text-sm" :class="trendColorClass">
          <UIcon
            :name="trend.icon"
            class="w-4 h-4 mr-1"
          />
          <span>{{ trend.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Trend {
  icon: string;
  text: string;
  type: "up" | "down" | "neutral";
}

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  color?: "cyan" | "blue" | "green" | "yellow" | "red" | "purple";
  unit?: string;
  loading?: boolean;
  trend?: Trend;
  formatValue?: (value: number | string) => string;
  isPrimary?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: "cyan",
  loading: false,
  isPrimary: false,
});

const colorClass = computed(() => {
  const colors = {
    cyan: "from-cyan-500 to-cyan-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };
  return colors[props.color];
});

const trendColorClass = computed(() => {
  if (!props.trend) return "";
  const colors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };
  return colors[props.trend.type];
});

const formattedValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(props.value);
  }
  if (typeof props.value === "number") {
    return props.value.toLocaleString("es-GT");
  }
  return props.value;
});
</script>

