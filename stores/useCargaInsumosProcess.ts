import { defineStore } from "pinia";

// Tipos para los datos del proceso de Carga de Insumos
export interface CargaInsumosStepData {
  data: any[];
  fileName: string;
  loadedAt: Date | null;
  isValid: boolean;
}

export interface CargaInsumosDocument {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  planVentasData: any[];
  existenciasData: any[];
  coberturaData: any[];
  status: 'draft' | 'processing' | 'completed' | 'error';
  metadata: {
    planVentasRecords: number;
    existenciasRecords: number;
    coberturaRecords: number;
    totalRecords: number;
  };
}

export interface CargaInsumosProcessState {
  // Estado de los pasos
  currentStep: number;
  planVentas: CargaInsumosStepData;
  existencias: CargaInsumosStepData;
  cobertura: CargaInsumosStepData;

  // Estado del proceso de guardado
  isProcessing: boolean;
  processedSteps: {
    planVentas: boolean;
    existencias: boolean;
    cobertura: boolean;
  };

  // Documentos guardados
  documents: CargaInsumosDocument[];
  selectedDocument: CargaInsumosDocument | null;

  // Estados generales
  isLoading: boolean;
  error: string | null;

  // Configuración
  maxDocuments: number;
  autoSave: boolean;
  lastSaved: Date | null;
}

export const useCargaInsumosProcessStore = defineStore("cargaInsumosProcess", {
  state: (): CargaInsumosProcessState => ({
    // Estado de los pasos
    currentStep: 0,
    planVentas: {
      data: [],
      fileName: "",
      loadedAt: null,
      isValid: false,
    },
    existencias: {
      data: [],
      fileName: "",
      loadedAt: null,
      isValid: false,
    },
    cobertura: {
      data: [],
      fileName: "",
      loadedAt: null,
      isValid: false,
    },

    // Estado del proceso de guardado
    isProcessing: false,
    processedSteps: {
      planVentas: false,
      existencias: false,
      cobertura: false,
    },

    // Documentos guardados
    documents: [],
    selectedDocument: null,

    // Estados generales
    isLoading: false,
    error: null,

    // Configuración
    maxDocuments: 10,
    autoSave: false,
    lastSaved: null,
  }),

  getters: {
    /**
     * Configuración de los pasos del stepper
     */
    stepItems: () => [
      {
        slot: "plan-de-ventas",
        title: "Plan de ventas",
        icon: "i-heroicons-chart-bar",
      },
      {
        slot: "existencias",
        title: "Existencias",
        icon: "i-heroicons-shopping-cart",
      },
      {
        slot: "cobertura",
        title: "Cobertura",
        icon: "i-heroicons-shield-check",
      },
      {
        slot: "guardar",
        title: "Guardar",
        icon: "i-heroicons-cloud-arrow-up",
      }
    ],

    /**
     * Validaciones para cada paso
     */
    isPlanVentasValid: (state) => state.planVentas.data.length > 0,
    isExistenciasValid: (state) => state.existencias.data.length > 0,
    isCoberturaValid: (state) => state.cobertura.data.length > 0,

    /**
     * Validación de navegación
     */
    canGoNext: (state) => {
      switch (state.currentStep) {
        case 0: // Plan de ventas
          return state.planVentas.data.length > 0;
        case 1: // Existencias
          return state.existencias.data.length > 0;
        case 2: // Cobertura
          return state.cobertura.data.length > 0;
        default:
          return false;
      }
    },

    canGoPrev: (state) => state.currentStep > 0,

    /**
     * Verificar si todos los pasos tienen datos válidos
     */
    allStepsHaveData: (state) => {
      return (
        state.planVentas.data.length > 0 &&
        state.existencias.data.length > 0 &&
        state.cobertura.data.length > 0
      );
    },

    /**
     * Verificar si todos los pasos están procesados
     */
    allStepsProcessed: (state) => {
      return Object.values(state.processedSteps).every(processed => processed);
    },

    /**
     * Obtener estadísticas de los datos cargados
     */
    dataStats: (state) => ({
      planVentas: {
        records: state.planVentas.data.length,
        fileName: state.planVentas.fileName,
        loadedAt: state.planVentas.loadedAt,
        isValid: state.planVentas.data.length > 0,
      },
      existencias: {
        records: state.existencias.data.length,
        fileName: state.existencias.fileName,
        loadedAt: state.existencias.loadedAt,
        isValid: state.existencias.data.length > 0,
      },
      cobertura: {
        records: state.cobertura.data.length,
        fileName: state.cobertura.fileName,
        loadedAt: state.cobertura.loadedAt,
        isValid: state.cobertura.data.length > 0,
      },
      total: state.planVentas.data.length + state.existencias.data.length + state.cobertura.data.length,
    }),

    /**
     * Obtener el progreso del proceso actual
     */
    processProgress: (state) => {
      const stepsCompleted = Object.values(state.processedSteps).filter(Boolean).length;
      const totalSteps = Object.keys(state.processedSteps).length;
      return Math.round((stepsCompleted / totalSteps) * 100);
    },

    /**
     * Obtener documentos ordenados por fecha de creación
     */
    documentsSorted: (state) => {
      return [...state.documents].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    /**
     * Verificar si se puede crear un nuevo documento
     */
    canCreateDocument: (state) => {
      return state.documents.length < state.maxDocuments && !state.isProcessing;
    },

    /**
     * Obtener estadísticas de documentos
     */
    documentsStats: (state) => ({
      total: state.documents.length,
      completed: state.documents.filter(doc => doc.status === 'completed').length,
      processing: state.documents.filter(doc => doc.status === 'processing').length,
      draft: state.documents.filter(doc => doc.status === 'draft').length,
      error: state.documents.filter(doc => doc.status === 'error').length,
      hasSelected: !!state.selectedDocument,
    }),
  },

  actions: {
    /**
     * Navegar al siguiente paso
     */
    goToNextStep() {
      if (this.canGoNext && this.currentStep < this.stepItems.length - 1) {
        this.currentStep++;
        console.log(`🚀 Carga Insumos Store: Navegando al paso ${this.currentStep + 1}`);
        return true;
      }
      return false;
    },

    /**
     * Navegar al paso anterior
     */
    goToPrevStep() {
      if (this.canGoPrev) {
        this.currentStep--;
        console.log(`⬅️ Carga Insumos Store: Navegando al paso ${this.currentStep + 1}`);
        return true;
      }
      return false;
    },

    /**
     * Ir directamente a un paso específico
     */
    goToStep(stepIndex: number) {
      if (stepIndex >= 0 && stepIndex < this.stepItems.length) {
        this.currentStep = stepIndex;
        console.log(`📍 Carga Insumos Store: Navegando directamente al paso ${stepIndex + 1}`);
        return true;
      }
      return false;
    },

    /**
     * Actualizar datos del plan de ventas
     */
    updatePlanVentasData(data: any[], fileName = "") {
      this.planVentas = {
        data: data || [],
        fileName,
        loadedAt: data.length > 0 ? new Date() : null,
        isValid: data.length > 0,
      };

      console.log(`📊 Carga Insumos Store: Plan de ventas actualizado - ${data.length} registros`);

      if (this.autoSave && this.allStepsHaveData) {
        this.saveCurrentDataAsDraft();
      }
    },

    /**
     * Actualizar datos de existencias
     */
    updateExistenciasData(data: any[], fileName = "") {
      this.existencias = {
        data: data || [],
        fileName,
        loadedAt: data.length > 0 ? new Date() : null,
        isValid: data.length > 0,
      };

      console.log(`📦 Carga Insumos Store: Existencias actualizadas - ${data.length} registros`);

      if (this.autoSave && this.allStepsHaveData) {
        this.saveCurrentDataAsDraft();
      }
    },

    /**
     * Actualizar datos de cobertura
     */
    updateCoberturaData(data: any[], fileName = "") {
      this.cobertura = {
        data: data || [],
        fileName,
        loadedAt: data.length > 0 ? new Date() : null,
        isValid: data.length > 0,
      };

      console.log(`🛡️ Carga Insumos Store: Cobertura actualizada - ${data.length} registros`);

      if (this.autoSave && this.allStepsHaveData) {
        this.saveCurrentDataAsDraft();
      }
    },

    /**
     * Limpiar datos de un paso específico
     */
    clearStepData(step: 'planVentas' | 'existencias' | 'cobertura') {
      this[step] = {
        data: [],
        fileName: "",
        loadedAt: null,
        isValid: false,
      };

      // Resetear el estado de procesado del paso
      this.processedSteps[step] = false;

      console.log(`🧹 Carga Insumos Store: Datos de ${step} limpiados`);
    },

    /**
     * Limpiar todos los datos del proceso actual
     */
    clearAllData() {
      this.planVentas = {
        data: [],
        fileName: "",
        loadedAt: null,
        isValid: false,
      };

      this.existencias = {
        data: [],
        fileName: "",
        loadedAt: null,
        isValid: false,
      };

      this.cobertura = {
        data: [],
        fileName: "",
        loadedAt: null,
        isValid: false,
      };

      this.processedSteps = {
        planVentas: false,
        existencias: false,
        cobertura: false,
      };

      this.currentStep = 0;
      this.error = null;

      console.log("🧹 Carga Insumos Store: Todos los datos limpiados");
    },

    /**
     * Procesar y guardar documentos
     */
    async processDocuments() {
      if (!this.allStepsHaveData || this.isProcessing) {
        console.warn("⚠️ Carga Insumos Store: No se puede procesar - datos faltantes o ya procesando");
        return { success: false, error: "Datos insuficientes o proceso en curso" };
      }

      this.isProcessing = true;
      this.error = null;

      // Resetear estados de procesado
      this.processedSteps = {
        planVentas: false,
        existencias: false,
        cobertura: false,
      };

      try {
        console.log("🚀 Carga Insumos Store: Iniciando procesamiento de documentos...");

        // Simular procesamiento de cada paso
        const steps = ['planVentas', 'existencias', 'cobertura'] as const;

        for (const step of steps) {
          console.log(`⏳ Carga Insumos Store: Procesando ${step}...`);

          // Simular tiempo de procesamiento
          await new Promise(resolve => setTimeout(resolve, 2000));

          this.processedSteps[step] = true;
        }

        // Crear documento con los datos procesados
        const document = await this.createDocument();

        console.log("✅ Carga Insumos Store: Documentos procesados exitosamente");

        return {
          success: true,
          documentId: document.id,
          message: "Documentos procesados y guardados exitosamente"
        };

      } catch (error) {
        console.error("❌ Carga Insumos Store: Error al procesar documentos:", error);

        this.error = error instanceof Error ? error.message : "Error desconocido";

        return {
          success: false,
          error: this.error
        };
      } finally {
        this.isProcessing = false;
      }
    },

    /**
     * Crear un nuevo documento con los datos actuales
     */
    async createDocument(name?: string): Promise<CargaInsumosDocument> {
      const document: CargaInsumosDocument = {
        id: `carga-insumos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name || `Carga de Insumos ${new Date().toLocaleDateString()}`,
        version: "1.0",
        createdAt: new Date(),
        planVentasData: [...this.planVentas.data],
        existenciasData: [...this.existencias.data],
        coberturaData: [...this.cobertura.data],
        status: this.allStepsProcessed ? 'completed' : 'processing',
        metadata: {
          planVentasRecords: this.planVentas.data.length,
          existenciasRecords: this.existencias.data.length,
          coberturaRecords: this.cobertura.data.length,
          totalRecords: this.dataStats.total,
        },
      };

      // Agregar documento a la lista
      this.documents.unshift(document);

      // Mantener solo los documentos dentro del límite
      if (this.documents.length > this.maxDocuments) {
        this.documents = this.documents.slice(0, this.maxDocuments);
      }

      this.lastSaved = new Date();

      console.log(`📄 Carga Insumos Store: Documento creado - ID: ${document.id}`);

      // Persistir en localStorage
      this.persistDocuments();

      return document;
    },

    /**
     * Guardar datos actuales como borrador
     */
    async saveCurrentDataAsDraft() {
      if (!this.allStepsHaveData) return null;

      const document = await this.createDocument(`Borrador ${new Date().toLocaleString()}`);
      document.status = 'draft';

      console.log("📝 Carga Insumos Store: Datos guardados como borrador");

      return document;
    },

    /**
     * Seleccionar un documento
     */
    selectDocument(documentId: string) {
      const document = this.documents.find(doc => doc.id === documentId);

      if (document) {
        this.selectedDocument = document;
        console.log(`📄 Carga Insumos Store: Documento seleccionado - ${document.name}`);
        return document;
      }

      console.warn(`⚠️ Carga Insumos Store: Documento no encontrado - ID: ${documentId}`);
      return null;
    },

    /**
     * Cargar datos de un documento seleccionado
     */
    loadDocumentData(documentId: string) {
      const document = this.selectDocument(documentId);

      if (document) {
        this.updatePlanVentasData(document.planVentasData, "Datos cargados desde documento");
        this.updateExistenciasData(document.existenciasData, "Datos cargados desde documento");
        this.updateCoberturaData(document.coberturaData, "Datos cargados desde documento");

        console.log(`📥 Carga Insumos Store: Datos del documento cargados - ${document.name}`);
        return true;
      }

      return false;
    },

    /**
     * Eliminar un documento
     */
    deleteDocument(documentId: string) {
      const index = this.documents.findIndex(doc => doc.id === documentId);

      if (index !== -1) {
        const document = this.documents[index];
        this.documents.splice(index, 1);

        // Si era el documento seleccionado, limpiar selección
        if (this.selectedDocument?.id === documentId) {
          this.selectedDocument = null;
        }

        this.persistDocuments();

        console.log(`🗑️ Carga Insumos Store: Documento eliminado - ${document.name}`);
        return true;
      }

      return false;
    },

    /**
     * Actualizar el estado de un documento
     */
    updateDocumentStatus(documentId: string, status: CargaInsumosDocument['status']) {
      const document = this.documents.find(doc => doc.id === documentId);

      if (document) {
        document.status = status;
        this.persistDocuments();

        console.log(`📄 Carga Insumos Store: Estado del documento actualizado - ${document.name}: ${status}`);
        return true;
      }

      return false;
    },

    /**
     * Persistir documentos en localStorage
     */
    persistDocuments() {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('carga-insumos-documents', JSON.stringify(this.documents));
          console.log("💾 Carga Insumos Store: Documentos persistidos en localStorage");
        }
      } catch (error) {
        console.error("❌ Carga Insumos Store: Error al persistir documentos:", error);
      }
    },

    /**
     * Cargar documentos desde localStorage
     */
    loadPersistedDocuments() {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('carga-insumos-documents');
          if (stored) {
            const documents = JSON.parse(stored);

            // Validar y convertir fechas
            this.documents = documents.map((doc: any) => ({
              ...doc,
              createdAt: new Date(doc.createdAt),
            }));

            console.log(`📥 Carga Insumos Store: ${this.documents.length} documentos cargados desde localStorage`);
          }
        }
      } catch (error) {
        console.error("❌ Carga Insumos Store: Error al cargar documentos persistidos:", error);
        this.documents = [];
      }
    },

    /**
     * Configurar auto-guardado
     */
    setAutoSave(enabled: boolean) {
      this.autoSave = enabled;
      console.log(`⚙️ Carga Insumos Store: Auto-guardado ${enabled ? 'habilitado' : 'deshabilitado'}`);
    },

    /**
     * Configurar límite máximo de documentos
     */
    setMaxDocuments(max: number) {
      this.maxDocuments = max;

      // Si hay más documentos que el nuevo límite, mantener solo los más recientes
      if (this.documents.length > max) {
        this.documents = this.documentsSorted.slice(0, max);
        this.persistDocuments();
      }

      console.log(`⚙️ Carga Insumos Store: Límite de documentos establecido en ${max}`);
    },

    /**
     * Reiniciar el store completamente
     */
    resetStore() {
      this.clearAllData();
      this.documents = [];
      this.selectedDocument = null;
      this.isProcessing = false;
      this.error = null;
      this.lastSaved = null;

      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('carga-insumos-documents');
      }

      console.log("🔄 Carga Insumos Store: Store reiniciado completamente");
    },

    /**
     * Inicializar el store
     */
    async initialize() {
      console.log("🏁 Carga Insumos Store: Inicializando store...");

      // Cargar documentos persistidos
      this.loadPersistedDocuments();

      console.log("✅ Carga Insumos Store: Store inicializado exitosamente");

      return { success: true };
    },
  },
});
