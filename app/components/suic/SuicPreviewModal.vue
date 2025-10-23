<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'w-full max-w-7xl' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <UIcon name="i-heroicons-eye" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Previsualización de Datos SUIC
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Primeros 10 registros por país
            </p>
          </div>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
          @click="isOpen = false"
        />
      </div>
    </template>

    <div class="space-y-6">
      <!-- Descripción accesible -->
      <div class="sr-only">
        <p>Este modal muestra una previsualización de los primeros 10 registros de datos SUIC por país. Puede navegar entre países usando las pestañas.</p>
      </div>

      <!-- Resumen por país -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          v-for="(count, paisCode) in previewData"
          :key="paisCode"
          class="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg p-3 border border-cyan-200 dark:border-cyan-700/50"
        >
          <div class="text-center">
            <div class="text-lg font-bold text-cyan-600 dark:text-cyan-400">
              {{ paisCode }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300">
              {{ count.length }} registros
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs por país -->
      <UTabs :items="tabItems" class="w-full">
        <template #default="{ item }">
          <div class="mt-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <!-- Header de la tabla -->
              <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ item.label }} - Primeros 10 registros
                  </h4>
                  <div class="text-sm text-gray-600 dark:text-gray-300">
                    Total: {{ previewData[item.key]?.length || 0 }} registros
                  </div>
                </div>
              </div>

              <!-- Tabla de datos -->
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        #
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Centro
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Vendedor
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Cliente
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Canal
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Material
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Modelo
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Marca
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        Presentación
                      </th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Tamaño
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(record, index) in (previewData[item.key] || []).slice(0, 10)"
                      :key="index"
                      class="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td class="px-3 py-2 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                        {{ index + 1 }}
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        {{ record.centro || '-' }}
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        <div class="max-w-32 truncate" :title="record.vendedor">
                          {{ record.vendedor || '-' }}
                        </div>
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        <div class="max-w-32 truncate" :title="record.cliente_correcto">
                          {{ record.cliente_correcto || '-' }}
                        </div>
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        <div class="max-w-32 truncate" :title="record.canal">
                          {{ record.canal || '-' }}
                        </div>
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        {{ record.material || '-' }}
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        <div class="max-w-32 truncate" :title="record.modelo">
                          {{ record.modelo || '-' }}
                        </div>
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        {{ record.marca || '-' }}
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                        {{ record.presentacion || '-' }}
                      </td>
                      <td class="px-3 py-2 text-gray-900 dark:text-white">
                        {{ record.tamano || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Footer con información adicional -->
              <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    Mostrando primeros 10 de {{ previewData[item.key]?.length || 0 }} registros
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                    <span>Datos cargados desde IndexedDB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          color="gray"
          variant="outline"
          @click="isOpen = false"
        >
          Cerrar
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  previewData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:open']);

const isOpen = ref(false);

// Observar cambios en previewData para abrir el modal automáticamente
watch(() => props.previewData, (newData) => {
  console.log('🔍 Modal recibió datos:', newData);
  if (newData && Object.keys(newData).length > 0) {
    console.log('✅ Abriendo modal con datos');
    isOpen.value = true;
  }
}, { immediate: true });

// Crear tabs dinámicos basados en los países con datos
const tabItems = computed(() => {
  return Object.keys(props.previewData || {}).map(paisCode => ({
    key: paisCode,
    label: paisCode,
    content: paisCode
  }));
});

// Función para cerrar el modal
const closeModal = () => {
  isOpen.value = false;
  emit('update:open', false);
};

// Exponer función para cerrar desde el componente padre
defineExpose({
  closeModal
});
</script>
