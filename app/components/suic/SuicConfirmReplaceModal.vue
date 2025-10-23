<template>
  <Teleport to="body">
    <UModal v-model:open="isOpen">
      <template #header>
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-lg"
             style="margin: -1.5rem -1.5rem -1.5rem; width: calc(100% + 3rem);">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
          </div>
        </div>
      </template>

      <template #body>
        <p class="text-gray-700 dark:text-gray-300">{{ message }}</p>
      </template>

      <template #footer>
        <div class="flex justify-center space-x-3">
          <button
            @click="isOpen = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 rounded"
          >
            Cancelar
          </button>
          <button
            @click="handleConfirm"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            {{ confirmText }}
          </button>
        </div>
      </template>
    </UModal>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
  title: String,
  message: String,
  confirmText: String
});

const emit = defineEmits(['update:open', 'confirm']);

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

const handleConfirm = () => {
  emit('confirm');
  isOpen.value = false;
};
</script>
