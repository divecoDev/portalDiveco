// app/composables/useSuicFileState.ts
// Composable dedicado para manejar el estado del archivo SUIC
// Aislado en su propio scope para evitar conflictos con variables del componente

export const useSuicFileState = () => {
  // Estado del archivo - aislado en el composable
  const fileForUpload = ref<File | null>(null);
  
  console.log('✅ useSuicFileState - fileForUpload inicializado como:', typeof fileForUpload);
  
  // Setter para el archivo
  const setFile = (file: File | null) => {
    console.log('📤 useSuicFileState - setFile llamado con:', file?.name || 'null');
    fileForUpload.value = file;
  };
  
  // Getter para el archivo
  const getFile = () => {
    return fileForUpload.value;
  };
  
  // Limpiar el archivo
  const clearFile = () => {
    console.log('🧹 useSuicFileState - clearFile llamado');
    fileForUpload.value = null;
  };
  
  // Verificar si hay archivo
  const hasFile = computed(() => fileForUpload.value !== null);
  
  return {
    fileForUpload: readonly(fileForUpload),
    setFile,
    getFile,
    clearFile,
    hasFile
  };
};

