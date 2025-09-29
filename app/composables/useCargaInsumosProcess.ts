import { useCargaInsumosProcessStore } from "~/stores/useCargaInsumosProcess";
import type { CargaInsumosDocument } from "~/stores/useCargaInsumosProcess";

/**
 * Composable para facilitar el uso del store de Carga de Insumos
 * Proporciona métodos y estado reactivo de manera conveniente
 */
export const useCargaInsumosProcess = () => {
  const store = useCargaInsumosProcessStore();

  // Estado reactivo del store
  const state = reactive({
    currentStep: computed(() => store.currentStep),
    isProcessing: computed(() => store.isProcessing),
    allStepsHaveData: computed(() => store.allStepsHaveData),
    allStepsProcessed: computed(() => store.allStepsProcessed),
    processProgress: computed(() => store.processProgress),
    dataStats: computed(() => store.dataStats),
    documentsStats: computed(() => store.documentsStats),
    documents: computed(() => store.documentsSorted),
    selectedDocument: computed(() => store.selectedDocument),
    error: computed(() => store.error),
    canGoNext: computed(() => store.canGoNext),
    canGoPrev: computed(() => store.canGoPrev),
  });

  // Métodos de navegación
  const navigation = {
    goToNextStep: () => store.goToNextStep(),
    goToPrevStep: () => store.goToPrevStep(),
    goToStep: (step: number) => store.goToStep(step),
  };

  // Métodos de gestión de datos
  const dataManagement = {
    updatePlanVentas: (data: any[], fileName = "") => 
      store.updatePlanVentasData(data, fileName),
    
    updateExistencias: (data: any[], fileName = "") => 
      store.updateExistenciasData(data, fileName),
    
    updateCobertura: (data: any[], fileName = "") => 
      store.updateCoberturaData(data, fileName),
    
    clearStepData: (step: 'planVentas' | 'existencias' | 'cobertura') => 
      store.clearStepData(step),
    
    clearAllData: () => store.clearAllData(),
  };

  // Métodos de procesamiento
  const processing = {
    processDocuments: () => store.processDocuments(),
    createDocument: (name?: string) => store.createDocument(name),
    saveAsDraft: () => store.saveCurrentDataAsDraft(),
  };

  // Métodos de gestión de documentos
  const documentManagement = {
    selectDocument: (documentId: string) => store.selectDocument(documentId),
    loadDocument: (documentId: string) => store.loadDocumentData(documentId),
    deleteDocument: (documentId: string) => store.deleteDocument(documentId),
    updateDocumentStatus: (documentId: string, status: CargaInsumosDocument['status']) => 
      store.updateDocumentStatus(documentId, status),
  };

  // Métodos de configuración
  const settings = {
    setAutoSave: (enabled: boolean) => store.setAutoSave(enabled),
    setMaxDocuments: (max: number) => store.setMaxDocuments(max),
    resetStore: () => store.resetStore(),
  };

  // Método de inicialización
  const initialize = async () => {
    await store.initialize();
  };

  // Utilidades para formateo y validación
  const utils = {
    formatDate: (date: Date | null) => {
      if (!date) return 'Sin fecha';
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    getStepName: (stepIndex: number) => {
      const stepNames = ['Plan de Ventas', 'Existencias', 'Cobertura', 'Guardar'];
      return stepNames[stepIndex] || 'Paso desconocido';
    },

    getStatusColor: (status: CargaInsumosDocument['status']) => {
      const colors = {
        draft: 'amber',
        processing: 'cyan',
        completed: 'green',
        error: 'red',
      };
      return colors[status] || 'gray';
    },

    getStatusText: (status: CargaInsumosDocument['status']) => {
      const texts = {
        draft: 'Borrador',
        processing: 'Procesando',
        completed: 'Completado',
        error: 'Error',
      };
      return texts[status] || 'Desconocido';
    },

    validateStepData: (step: 'planVentas' | 'existencias' | 'cobertura') => {
      const stepData = store[step];
      return {
        isValid: stepData.isValid,
        hasData: stepData.data.length > 0,
        recordCount: stepData.data.length,
        fileName: stepData.fileName,
        loadedAt: stepData.loadedAt,
      };
    },
  };

  // Hooks del ciclo de vida para auto-inicialización
  onMounted(async () => {
    await initialize();
  });

  // Watchers útiles
  const watchers = {
    // Watcher para auto-guardado cuando todos los pasos tienen datos
    watchForAutoSave: (callback?: () => void) => {
      return watch(
        () => store.allStepsHaveData,
        (hasData) => {
          if (hasData && store.autoSave) {
            store.saveCurrentDataAsDraft();
            callback?.();
          }
        }
      );
    },

    // Watcher para cambios en el progreso del proceso
    watchProcessProgress: (callback: (progress: number) => void) => {
      return watch(
        () => store.processProgress,
        (progress) => callback(progress),
        { immediate: true }
      );
    },

    // Watcher para errores
    watchErrors: (callback: (error: string | null) => void) => {
      return watch(
        () => store.error,
        (error) => callback(error),
        { immediate: true }
      );
    },
  };

  return {
    // Estado reactivo
    ...state,
    
    // Métodos organizados por categoría
    navigation,
    dataManagement,
    processing,
    documentManagement,
    settings,
    
    // Utilidades
    utils,
    watchers,
    
    // Método de inicialización
    initialize,
    
    // Acceso directo al store para casos avanzados
    store,
  };
};

/**
 * Composable simplificado para componentes que solo necesitan lectura
 */
export const useCargaInsumosProcessRead = () => {
  const store = useCargaInsumosProcessStore();
  
  return {
    currentStep: computed(() => store.currentStep),
    dataStats: computed(() => store.dataStats),
    documentsStats: computed(() => store.documentsStats),
    documents: computed(() => store.documentsSorted),
    selectedDocument: computed(() => store.selectedDocument),
    isProcessing: computed(() => store.isProcessing),
    processProgress: computed(() => store.processProgress),
    allStepsHaveData: computed(() => store.allStepsHaveData),
    allStepsProcessed: computed(() => store.allStepsProcessed),
  };
};

/**
 * Composable para gestión específica de documentos
 */
export const useCargaInsumosDocuments = () => {
  const store = useCargaInsumosProcessStore();
  
  const documents = computed(() => store.documentsSorted);
  const selectedDocument = computed(() => store.selectedDocument);
  const documentsStats = computed(() => store.documentsStats);
  
  const actions = {
    select: (documentId: string) => store.selectDocument(documentId),
    load: (documentId: string) => store.loadDocumentData(documentId),
    delete: (documentId: string) => store.deleteDocument(documentId),
    create: (name?: string) => store.createDocument(name),
    updateStatus: (documentId: string, status: CargaInsumosDocument['status']) => 
      store.updateDocumentStatus(documentId, status),
  };
  
  return {
    documents,
    selectedDocument,
    documentsStats,
    actions,
  };
};
