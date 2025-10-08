import { defineStore } from "pinia";
import { generateClient } from "aws-amplify/api";

// Tipos para los datos del proceso de Carga de Insumos
export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  s3Path: string;
  documentId?: string;
  tipo?: 'planVentas' | 'existencias' | 'cobertura';
}

export interface CargaInsumosStepData {
  data: any[];
  fileName: string;
  loadedAt: Date | null;
  isValid: boolean;
  fileMetadata?: FileMetadata;
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
  fileMetadata?: {
    planVentas?: FileMetadata;
    existencias?: FileMetadata;
    cobertura?: FileMetadata;
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

  // Boom ID para relacionar con la explosión
  boomId: string | null;

  // Estados generales
  isLoading: boolean;
  error: string | null;

  // Configuración
  maxDocuments: number;
  autoSave: boolean;
  lastSaved: Date | null;
}

// Función para obtener el cliente de Amplify (lazy loading)
const getAmplifyClient = () => {
  try {
    const client = generateClient();
    console.log('🔧 Cliente de Amplify Gen 2 generado:', client);
    return client;
  } catch (error) {
    console.error('❌ Error generando cliente de Amplify:', error);
    throw error;
  }
};

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

    // Boom ID para relacionar con la explosión
    boomId: null,

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
      return Object.values(state.processedSteps).every(processed => {
        // Un paso está completado si es true o si es un número >= 1
        if (typeof processed === 'boolean') {
          return processed;
        } else if (typeof processed === 'number') {
          return processed >= 1;
        }
        return false;
      });
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
      const steps = Object.values(state.processedSteps);
      const totalSteps = steps.length;

      // Sumar el progreso de cada paso (puede ser decimal entre 0 y 1, o true/false)
      const totalProgress = steps.reduce((sum, stepProgress) => {
        if (typeof stepProgress === 'boolean') {
          return sum + (stepProgress ? 1 : 0);
        } else if (typeof stepProgress === 'number') {
          return sum + Math.min(1, Math.max(0, stepProgress)); // Clamp entre 0 y 1
        }
        return sum;
      }, 0);

      return Math.round((totalProgress / totalSteps) * 100);
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
    updatePlanVentasData(data: any[], fileName = "", fileMetadata?: FileMetadata) {
      console.log(`🔍 DEBUG updatePlanVentasData - Iniciando:`);
      console.log(`  - data.length: ${data?.length || 0}`);
      console.log(`  - fileName: ${fileName}`);
      console.log(`  - fileMetadata:`, fileMetadata);
      console.log(`  - boomId: ${this.boomId}`);

      this.planVentas = {
        data: data || [],
        fileName,
        loadedAt: data.length > 0 ? new Date() : null,
        isValid: data.length > 0,
        fileMetadata,
      };

      console.log(`📊 Carga Insumos Store: Plan de ventas actualizado - ${data.length} registros`);
      
      // Si hay metadatos de archivo con S3 path, actualizar el modelo Boom
      if (fileMetadata?.s3Path && this.boomId) {
        console.log(`🔄 DEBUG: Llamando updateBoomWithFilePath para planVentas con path: ${fileMetadata.s3Path}`);
        this.updateBoomWithFilePath('planVentas', fileMetadata.s3Path);
      } else {
        console.log(`⚠️ DEBUG: No se actualiza Boom porque:`);
        console.log(`  - fileMetadata?.s3Path: ${fileMetadata?.s3Path || 'undefined'}`);
        console.log(`  - this.boomId: ${this.boomId || 'undefined'}`);
      }

      if (this.autoSave && this.allStepsHaveData) {
        this.saveCurrentDataAsDraft();
      }
    },

    /**
     * Actualizar datos de existencias
     */
    updateExistenciasData(data: any[], fileName = "", fileMetadata?: FileMetadata) {
      console.log(`🔍 DEBUG updateExistenciasData - Iniciando:`);
      console.log(`  - data.length: ${data?.length || 0}`);
      console.log(`  - fileName: ${fileName}`);
      console.log(`  - fileMetadata:`, fileMetadata);
      console.log(`  - boomId: ${this.boomId}`);

      this.existencias = {
        data: data || [],
        fileName,
        loadedAt: data.length > 0 ? new Date() : null,
        isValid: data.length > 0,
        fileMetadata,
      };

      console.log(`📦 Carga Insumos Store: Existencias actualizadas - ${data.length} registros`);
      
      // Si hay metadatos de archivo con S3 path, actualizar el modelo Boom
      if (fileMetadata?.s3Path && this.boomId) {
        console.log(`🔄 DEBUG: Llamando updateBoomWithFilePath para existencias con path: ${fileMetadata.s3Path}`);
        this.updateBoomWithFilePath('existencias', fileMetadata.s3Path);
      } else {
        console.log(`⚠️ DEBUG: No se actualiza Boom porque:`);
        console.log(`  - fileMetadata?.s3Path: ${fileMetadata?.s3Path || 'undefined'}`);
        console.log(`  - this.boomId: ${this.boomId || 'undefined'}`);
      }

      if (this.autoSave && this.allStepsHaveData) {
        this.saveCurrentDataAsDraft();
      }
    },

    /**
     * Actualizar datos de cobertura
     */
    updateCoberturaData(data: any[], fileName = "", fileMetadata?: FileMetadata) {
      console.log(`🔍 DEBUG updateCoberturaData - Iniciando:`);
      console.log(`  - data.length: ${data?.length || 0}`);
      console.log(`  - fileName: ${fileName}`);
      console.log(`  - fileMetadata:`, fileMetadata);
      console.log(`  - boomId: ${this.boomId}`);

      this.cobertura = {
        data: data || [],
        fileName,
        loadedAt: data.length > 0 ? new Date() : null,
        isValid: data.length > 0,
        fileMetadata,
      };

      console.log(`🛡️ Carga Insumos Store: Cobertura actualizada - ${data.length} registros`);
      
      // Si hay metadatos de archivo con S3 path, actualizar el modelo Boom
      if (fileMetadata?.s3Path && this.boomId) {
        console.log(`🔄 DEBUG: Llamando updateBoomWithFilePath para cobertura con path: ${fileMetadata.s3Path}`);
        this.updateBoomWithFilePath('cobertura', fileMetadata.s3Path);
      } else {
        console.log(`⚠️ DEBUG: No se actualiza Boom porque:`);
        console.log(`  - fileMetadata?.s3Path: ${fileMetadata?.s3Path || 'undefined'}`);
        console.log(`  - this.boomId: ${this.boomId || 'undefined'}`);
      }

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
        fileMetadata: undefined,
      };

      // Resetear el estado de procesado del paso
      this.processedSteps[step] = false;

      console.log(`🧹 Carga Insumos Store: Datos de ${step} limpiados`);
    },

    /**
     * Recargar un paso específico (limpiar y permitir nueva carga)
     */
    reloadStep(step: 'planVentas' | 'existencias' | 'cobertura') {
      console.log(`🔄 Carga Insumos Store: Recargando paso ${step}...`);
      this.clearStepData(step);
      console.log(`✅ Carga Insumos Store: Paso ${step} listo para recargar`);
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
     * Procesar y guardar documentos usando procesamiento por lotes
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
        console.log("🚀 Carga Insumos Store: Iniciando procesamiento por lotes...");

        // Usar boom_id como document_id para que cada explosión tenga una sola versión
        const documentId = this.boomId || `carga-insumos-${Date.now()}`;
        const batchId = `batch-${Date.now()}`;

        console.log(`📄 Document ID: ${documentId}`);
        console.log(`🏷️ Batch ID: ${batchId}`);

        // PASO 1: Eliminar datos existentes para este document_id antes de insertar nuevos
        console.log(`🗑️ Eliminando datos existentes para document_id: ${documentId}`);
        await this.deleteExistingData(documentId);

        // PASO 2: Procesar cada tipo de datos por lotes secuencialmente
        await this.processBatches('planVentas', this.planVentas.data, this.planVentas.fileName, documentId, batchId);
        await this.processBatches('existencias', this.existencias.data, this.existencias.fileName, documentId, batchId);
        await this.processBatches('cobertura', this.cobertura.data, this.cobertura.fileName, documentId, batchId);

        // Actualizar el modelo Boom con todos los paths de archivos S3
        await this.updateBoomWithAllFilePaths();

        // Crear documento local con los metadatos
        const document = await this.createDocument(`Carga de Insumos - ${new Date().toLocaleString()}`);

        console.log("✅ Carga Insumos Store: Todos los lotes procesados exitosamente");

        return {
          success: true,
          documentId: document.id,
          sqlDocumentId: documentId,
          message: "Documentos procesados y guardados exitosamente en RDS"
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
     * Eliminar datos existentes para un document_id específico
     */
    async deleteExistingData(documentId: string) {
      if (!documentId) {
        console.warn('⚠️ No se puede eliminar: documentId no proporcionado');
        return { success: false, error: 'documentId es requerido' };
      }

      try {
        console.log(`🗑️ Llamando a deleteCargaInsumosBatch para documentId: ${documentId}`);
        
        // Obtener cliente de Amplify
        const client = getAmplifyClient();
        
        // Llamar a la mutation para eliminar datos
        const { data } = await (client as any).mutations.deleteCargaInsumosBatch({
          documentId
        });
        
        console.log(`📡 Respuesta de eliminación:`, data);
        
        // Parsear la respuesta
        const result = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (result.success) {
          console.log(`✅ Datos eliminados exitosamente:`);
          console.log(`   - Plan de Ventas: ${result.deletedRecords.planVentas} registros`);
          console.log(`   - Existencias: ${result.deletedRecords.existencias} registros`);
          console.log(`   - Cobertura: ${result.deletedRecords.cobertura} registros`);
          console.log(`   - Total: ${result.deletedRecords.total} registros`);
          
          return result;
        } else {
          console.warn(`⚠️ Eliminación completada con advertencias:`, result.message);
          return result;
        }
        
      } catch (error) {
        console.error(`❌ Error eliminando datos existentes:`, error);
        // No lanzar error, solo registrar - podría ser que no existan datos previos
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Error desconocido',
          deletedRecords: { planVentas: 0, existencias: 0, cobertura: 0, total: 0 }
        };
      }
    },

    /**
     * Transformar arrays de datos a objetos con propiedades nombradas
     */
    transformDataToObjects(tipo: 'planVentas' | 'existencias' | 'cobertura', data: any[]): any[] {
      if (!data || data.length === 0) return [];

      return data.map(row => {
        // Si ya es un objeto, devolverlo tal como está
        if (!Array.isArray(row)) return row;

        // Transformar según el tipo
        switch (tipo) {
          case 'planVentas':
            return {
              ssour: row[0] || null,
              vrsio: row[1] || null,
              spmon: row[2] || null,
              sptag: row[3] || null,
              spwoc: row[4] || null,
              spbup: row[5] || null,
              pmnux: row[6] || null,
              wenux: row[7] || null,
              vsnda: row[8] || null,
              periv: row[9] || null,
              vwdat: row[10] || null,
              basme: row[11] || null,
              absat: row[12] || null,
              produ: row[13] || null,
              lagri: row[14] || null,
              lagrz: row[15] || null,
              reich: row[16] || null,
              reicz: row[17] || null,
            };

          case 'existencias':
            return {
              version: row[0] || null,
              centro: row[1] || null,
              almacen: row[2] || null,
              material: row[3] || null,
              periodo: row[4] || null,
              mes: row[5] || null,
              libre_u: row[6] || 0,
              no_liberado: row[7] || 0,
              bloqueado: row[8] || 0,
              devolucion: row[9] || 0,
              traslados: row[10] || 0,
              calidad: row[11] || 0,
              bloqueado_em: row[12] || 0,
            };

          case 'cobertura':
            return {
              version: row[0] || null,
              centro: row[1] || null,
              periodo: row[2] || null,
              mes: row[3] || null,
              dias_habiles_mes_planta: row[4] || 0,
              dias_coberturas_mes: row[5] || 0,
              dias_habiles_venta: row[6] || 0,
            };

          default:
            return row;
        }
      });
    },

    /**
     * Procesar datos por lotes para un tipo específico
     */
    async processBatches(tipo: 'planVentas' | 'existencias' | 'cobertura', data: any[], fileName: string, documentId: string, batchId: string) {
      if (!data || data.length === 0) {
        console.log(`⚠️ No hay datos para procesar en ${tipo}`);
        this.processedSteps[tipo] = true;
        return;
      }

      // Determinar tamaño de lote según el tipo de datos
      const batchSizes = {
        planVentas: 200,  // Plan de ventas tiene más campos, lotes más pequeños
        existencias: 400, // Existencias tiene campos numéricos, lotes medianos
        cobertura: 500    // Cobertura tiene menos campos, lotes más grandes
      };

      const batchSize = batchSizes[tipo];
      const totalBatches = Math.ceil(data.length / batchSize);

      console.log(`📊 Procesando ${data.length} registros de ${tipo} en ${totalBatches} lotes de ${batchSize} registros c/u`);

      // Transformar datos de arrays a objetos
      const transformedData = this.transformDataToObjects(tipo, data);
      console.log(`🔄 Datos transformados de arrays a objetos para ${tipo}`);
      console.log(`📊 Total de registros transformados: ${transformedData.length}`);
      console.log(`📋 Los datos se enviarán como JSON string para mejor compatibilidad`);

      // Procesar lotes secuencialmente
      for (let i = 0; i < totalBatches; i++) {
        const batchData = transformedData.slice(i * batchSize, (i + 1) * batchSize);

        console.log(`🔄 Procesando lote ${i + 1}/${totalBatches} de ${tipo} (${batchData.length} registros)`);

        // Log de muestra del primer registro transformado para debug
        if (i === 0 && batchData.length > 0) {
          console.log(`📋 Muestra del primer registro de ${tipo}:`, batchData[0]);
        }

        const payload = {
          tipo,
          data: batchData,
          metadata: {
            fileName: fileName || `${tipo}_${new Date().toISOString()}`,
            loadedAt: this[tipo].loadedAt?.toISOString() || new Date().toISOString(),
            documentId,
            batchId: `${batchId}-${tipo}-${i}`,
            batchIndex: i,
            totalBatches
          }
        };

        try {
          console.log(`🔍 DEBUG: Iniciando try block para lote ${i + 1}/${totalBatches}`);

          // Obtener cliente de Amplify de forma lazy
          const client = getAmplifyClient();

          // Verificar que el cliente esté disponible
          if (!client) {
            throw new Error('Cliente de Amplify no está configurado correctamente');
          }
          console.log(`✅ DEBUG: Cliente disponible`);

          // Verificar que client.mutations existe
          if (!client.mutations) {
            throw new Error('client.mutations no está disponible');
          }
          console.log(`✅ DEBUG: client.mutations disponible`);

          // Verificar que la mutation específica existe
          if (!client.mutations.saveCargaInsumosBatch) {
            throw new Error('saveCargaInsumosBatch mutation no encontrada');
          }
          console.log(`✅ DEBUG: mutation saveCargaInsumosBatch encontrada`);

          // Llamar a la mutation de Amplify Gen 2 (sin tipado como en el proyecto)
          // Convertir los datos a JSON string para evitar problemas de serialización
          console.log(`🔄 Enviando lote ${i + 1}/${totalBatches} a Amplify...`);
          console.log(`📋 Tamaño del payload:`, JSON.stringify(batchData).length, 'caracteres');

          const { data } = await (client as any).mutations.saveCargaInsumosBatch({
            tipo,
            data: JSON.stringify(batchData),
            metadata: JSON.stringify(payload.metadata)
          });

          console.log(`📡 Respuesta raw de Amplify:`, data);
          console.log(`📊 Tipo de data:`, typeof data);

          // Verificar si la respuesta es válida
          if (!data) {
            throw new Error(`Respuesta nula de Amplify para lote ${i + 1}/${totalBatches}`);
          }

          // Parsear la respuesta de Amplify (la data ya viene como string)
          const result = typeof data === 'string' ? JSON.parse(data) : data;

          console.log(`📋 Resultado parseado:`, result);

          if (!result.success) {
            throw new Error(`Error en lote ${i + 1}/${totalBatches}: ${result.message || 'Error desconocido'}`);
          }

          // Actualizar progreso (número decimal entre 0 y 1)
          const progress = (i + 1) / totalBatches;
          (this.processedSteps as any)[tipo] = progress;

          console.log(`✅ Lote ${i + 1}/${totalBatches} de ${tipo} procesado exitosamente (${result.processedRecords || batchData.length} registros)`);

          // Pequeña pausa entre lotes para no saturar la base de datos
          if (i < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (error) {
          console.error(`❌ DEBUG: Error completo:`, error);
          console.error(`❌ DEBUG: Error tipo:`, typeof error);
          console.error(`❌ DEBUG: Error mensaje:`, error instanceof Error ? error.message : 'No es instancia de Error');
          console.error(`❌ DEBUG: Error stack:`, error instanceof Error ? error.stack : 'No stack disponible');
          console.error(`❌ Error procesando lote ${i + 1}/${totalBatches} de ${tipo}:`, error);
          throw new Error(`Error en lote ${i + 1}/${totalBatches} de ${tipo}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Marcar como completado (true = 100%)
      (this.processedSteps as any)[tipo] = true;
      console.log(`🎉 Completado procesamiento de ${tipo}: ${data.length} registros en ${totalBatches} lotes`);
    },

    /**
     * Crear un nuevo documento con los datos actuales
     */
    async createDocument(name?: string): Promise<CargaInsumosDocument> {
      // Usar boom_id como document_id para mantener consistencia
      const documentId = this.boomId || `carga-insumos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log(`📄 Document ID en createDocument: ${documentId}`);

      const document: CargaInsumosDocument = {
        id: documentId,
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

        console.log(`🗑️ Carga Insumos Store: Documento eliminado - ${document?.name || documentId}`);
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
     * Establecer el Boom ID para relacionar con la explosión
     */
    setBoomId(boomId: string) {
      this.boomId = boomId;
      console.log(`🎯 Carga Insumos Store: Boom ID establecido - ${boomId}`);
    },

    /**
     * Actualizar el modelo Boom con el path del archivo S3
     */
    async updateBoomWithFilePath(tipo: 'planVentas' | 'existencias' | 'cobertura', s3Path: string) {
      console.log(`🔍 DEBUG updateBoomWithFilePath - Iniciando:`);
      console.log(`  - tipo: ${tipo}`);
      console.log(`  - s3Path: ${s3Path}`);
      console.log(`  - boomId: ${this.boomId}`);

      if (!this.boomId) {
        console.warn('⚠️ No se puede actualizar Boom: boomId no está establecido');
        return;
      }

      try {
        console.log(`🔄 Actualizando Boom ${this.boomId} con path de ${tipo}: ${s3Path}`);
        
        const client = getAmplifyClient();
        console.log(`🔍 DEBUG: Cliente Amplify obtenido:`, !!client);
        
        // Mapear el tipo a el campo correspondiente en el modelo Boom
        const fieldMap = {
          planVentas: 'insumoPlanVentasPath',
          existencias: 'insumoExistenciasPath',
          cobertura: 'insumoCoberturaPath'
        };

        const fieldName = fieldMap[tipo];
        console.log(`🔍 DEBUG: Campo mapeado para ${tipo}: ${fieldName}`);
        
        if (!fieldName) {
          console.error(`❌ Tipo de archivo no válido: ${tipo}`);
          return;
        }

        // Actualizar el modelo Boom con el path del archivo
        const updateData = {
          id: this.boomId,
          [fieldName]: s3Path
        };

        console.log(`📝 Actualizando campo ${fieldName} en Boom:`, updateData);

        // Usar la mutation de Amplify para actualizar el modelo Boom
        console.log(`🔍 DEBUG: Llamando client.models.Boom.update...`);
        const { data } = await (client as any).models.Boom.update(updateData);

        console.log(`✅ Boom actualizado exitosamente con path de ${tipo}:`, data);

      } catch (error) {
        console.error(`❌ Error actualizando Boom con path de ${tipo}:`, error);
        console.error(`❌ Error details:`, {
          message: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : 'No stack disponible',
          tipo,
          s3Path,
          boomId: this.boomId
        });
        this.error = error instanceof Error ? error.message : 'Error desconocido al actualizar Boom';
      }
    },

    /**
     * Actualizar el modelo Boom con todos los paths de archivos S3
     */
    async updateBoomWithAllFilePaths() {
      if (!this.boomId) {
        console.warn('⚠️ No se puede actualizar Boom: boomId no está establecido');
        return;
      }

      try {
        console.log(`🔄 Actualizando Boom ${this.boomId} con todos los paths de archivos S3`);
        
        const client = getAmplifyClient();
        
        // Preparar los datos de actualización con todos los paths disponibles
        const updateData: any = {
          id: this.boomId
        };

        // Agregar paths de archivos si están disponibles
        if (this.planVentas.fileMetadata?.s3Path) {
          updateData.insumoPlanVentasPath = this.planVentas.fileMetadata.s3Path;
          console.log(`📝 Agregando path de plan de ventas: ${this.planVentas.fileMetadata.s3Path}`);
        }

        if (this.existencias.fileMetadata?.s3Path) {
          updateData.insumoExistenciasPath = this.existencias.fileMetadata.s3Path;
          console.log(`📝 Agregando path de existencias: ${this.existencias.fileMetadata.s3Path}`);
        }

        if (this.cobertura.fileMetadata?.s3Path) {
          updateData.insumoCoberturaPath = this.cobertura.fileMetadata.s3Path;
          console.log(`📝 Agregando path de cobertura: ${this.cobertura.fileMetadata.s3Path}`);
        }

        // Solo actualizar si hay al menos un path
        if (Object.keys(updateData).length > 1) { // Más de solo el ID
          console.log(`📝 Actualizando Boom con paths:`, updateData);

          // Usar la mutation de Amplify para actualizar el modelo Boom
          const { data } = await (client as any).models.Boom.update(updateData);

          console.log(`✅ Boom actualizado exitosamente con todos los paths:`, data);
        } else {
          console.log(`ℹ️ No hay paths de archivos para actualizar en Boom`);
        }

      } catch (error) {
        console.error(`❌ Error actualizando Boom con todos los paths:`, error);
        this.error = error instanceof Error ? error.message : 'Error desconocido al actualizar Boom';
      }
    },

    /**
     * Cargar datos existentes desde la API
     */
    async loadExistingData(apiData: any[]) {
      console.log("📥 Carga Insumos Store: Cargando datos existentes desde la API...");
      
      try {
        // Limpiar datos actuales
        this.clearAllData();
        
        // Procesar cada tipo de datos
        for (const record of apiData) {
          const { tipo, data, metadata } = record;
          
          console.log(`📊 Procesando datos de tipo: ${tipo}, registros: ${data.length}`);
          
          switch (tipo) {
            case 'planVentas':
              this.updatePlanVentasData(data, metadata.fileName);
              break;
            case 'existencias':
              this.updateExistenciasData(data, metadata.fileName);
              break;
            case 'cobertura':
              this.updateCoberturaData(data, metadata.fileName);
              break;
            default:
              console.warn(`⚠️ Tipo de datos no reconocido: ${tipo}`);
          }
        }
        
        console.log("✅ Carga Insumos Store: Datos existentes cargados exitosamente");
        console.log(`📊 Resumen de datos cargados:`, this.dataStats);
        
        return { success: true };
        
      } catch (error) {
        console.error("❌ Carga Insumos Store: Error cargando datos existentes:", error);
        this.error = error instanceof Error ? error.message : "Error desconocido";
        return { success: false, error: this.error };
      }
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
