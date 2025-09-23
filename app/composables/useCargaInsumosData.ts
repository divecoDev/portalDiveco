import { generateClient } from "aws-amplify/data";

/**
 * Tipos para los datos de carga de insumos
 */
export interface CargaInsumosRecord {
  tipo: 'planVentas' | 'existencias' | 'cobertura';
  data: any[];
  metadata: {
    documentId: string;
    batchId: string;
    fileName: string;
    loadedAt: string;
    totalRecords: number;
  };
  summary: {
    totalRecords: number;
    batchesCount: number;
    lastLoaded: string;
  };
}

export interface CargaInsumosSummary {
  totalDocuments: number;
  totalRecords: number;
  types: {
    planVentas: number;
    existencias: number;
    cobertura: number;
  };
}

export interface CargaInsumosQueryParams {
  documentId?: string;
  batchId?: string;
  tipo?: 'planVentas' | 'existencias' | 'cobertura';
  limit?: number;
  offset?: number;
}

export interface CargaInsumosQueryResponse {
  success: boolean;
  data?: CargaInsumosRecord[];
  summary?: CargaInsumosSummary;
  error?: string;
  message: string;
}

/**
 * Composable para consultar datos de carga de insumos guardados
 * Sigue principios SOLID:
 * - Single Responsibility: Solo maneja consultas de datos
 * - Open/Closed: Extensible para nuevos tipos de consultas
 * - Dependency Inversion: Depende de abstracciones (Amplify client)
 */
export const useCargaInsumosData = () => {
  const client = generateClient();

  // Estado reactivo
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<CargaInsumosRecord[]>([]);
  const summary = ref<CargaInsumosSummary | null>(null);

  /**
   * Consultar datos específicos de carga de insumos
   * @param params Parámetros de consulta
   * @returns Promise con los datos obtenidos
   */
  const queryData = async (params?: CargaInsumosQueryParams): Promise<CargaInsumosQueryResponse> => {
    loading.value = true;
    error.value = null;

    try {
      console.log('🔍 Consultando datos de carga de insumos:', params);

      // Si no hay parámetros, no enviar nada para evitar parámetros null
      const response = params
        ? await client.queries.getCargaInsumosData(params)
        : await client.queries.getCargaInsumosData();

      console.log('🔍 Respuesta completa del servidor:', response);

      // La respuesta viene como string JSON directamente en response.data
      let parsedData: CargaInsumosQueryResponse;

      if (typeof response.data === 'string') {
        parsedData = JSON.parse(response.data);
      } else if (response.data?.getCargaInsumosData && typeof response.data.getCargaInsumosData === 'string') {
        parsedData = JSON.parse(response.data.getCargaInsumosData);
      } else if (response.data?.getCargaInsumosData) {
        parsedData = response.data.getCargaInsumosData;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('🔍 Datos parseados:', parsedData);

      if (parsedData.success) {
        data.value = parsedData.data || [];
        summary.value = parsedData.summary || null;

        console.log('✅ Datos obtenidos exitosamente:', {
          dataCount: data.value.length,
          summary: summary.value
        });

        return parsedData;
      } else {
        throw new Error(parsedData.error || 'Error desconocido en la consulta');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      error.value = errorMessage;

      console.error('❌ Error consultando datos:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        message: `Error consultando datos: ${errorMessage}`
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtener resumen de datos (sin parámetros específicos)
   * @returns Promise con el resumen
   */
  const getSummary = async (): Promise<CargaInsumosQueryResponse> => {
    return queryData(); // Sin parámetros
  };

  /**
   * Consultar datos por documento ID
   * @param documentId ID del documento
   * @returns Promise con los datos del documento
   */
  const getDataByDocument = async (documentId: string): Promise<CargaInsumosQueryResponse> => {
    return queryData({ documentId });
  };

  /**
   * Consultar datos por tipo
   * @param tipo Tipo de datos a consultar
   * @param limit Límite de registros
   * @param offset Offset para paginación
   * @returns Promise con los datos del tipo especificado
   */
  const getDataByType = async (
    tipo: 'planVentas' | 'existencias' | 'cobertura',
    limit?: number,
    offset?: number
  ): Promise<CargaInsumosQueryResponse> => {
    return queryData({ tipo, limit, offset });
  };

  /**
   * Consultar datos por batch ID
   * @param batchId ID del batch
   * @returns Promise con los datos del batch
   */
  const getDataByBatch = async (batchId: string): Promise<CargaInsumosQueryResponse> => {
    return queryData({ batchId });
  };

  /**
   * Limpiar estado del composable
   */
  const clearState = () => {
    loading.value = false;
    error.value = null;
    data.value = [];
    summary.value = null;
  };

  /**
   * Verificar si hay datos cargados
   */
  const hasData = computed(() => data.value.length > 0);

  /**
   * Obtener estadísticas de los datos cargados
   */
  const dataStats = computed(() => {
    if (!data.value.length) {
      return {
        totalRecords: 0,
        totalTypes: 0,
        types: {
          planVentas: 0,
          existencias: 0,
          cobertura: 0
        }
      };
    }

    const types = data.value.reduce((acc, record) => {
      acc[record.tipo] = (acc[record.tipo] || 0) + record.data.length;
      return acc;
    }, {} as Record<string, number>);

    const totalRecords = data.value.reduce((sum, record) => sum + record.data.length, 0);

    return {
      totalRecords,
      totalTypes: data.value.length,
      types: {
        planVentas: types.planVentas || 0,
        existencias: types.existencias || 0,
        cobertura: types.cobertura || 0
      }
    };
  });

  /**
   * Obtener metadatos de los documentos
   */
  const documentsMetadata = computed(() => {
    return data.value.map(record => ({
      documentId: record.metadata.documentId,
      batchId: record.metadata.batchId,
      fileName: record.metadata.fileName,
      loadedAt: record.metadata.loadedAt,
      tipo: record.tipo,
      totalRecords: record.data.length,
      batchesCount: record.summary.batchesCount,
      lastLoaded: record.summary.lastLoaded
    }));
  });

  /**
   * Filtrar datos por tipo
   */
  const getDataByTypeFiltered = (tipo: 'planVentas' | 'existencias' | 'cobertura') => {
    return data.value.find(record => record.tipo === tipo);
  };

  /**
   * Obtener datos combinados de todos los tipos
   */
  const getAllDataCombined = computed(() => {
    return data.value.reduce((acc, record) => {
      acc[record.tipo] = record.data;
      return acc;
    }, {} as Record<string, any[]>);
  });

  return {
    // Estado reactivo
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    summary: readonly(summary),

    // Computed
    hasData,
    dataStats,
    documentsMetadata,
    getAllDataCombined,

    // Métodos principales
    queryData,
    getSummary,
    getDataByDocument,
    getDataByType,
    getDataByBatch,
    getDataByTypeFiltered,
    clearState
  };
};

/**
 * Composable simplificado para componentes que solo necesitan leer datos
 * Implementa el principio de Single Responsibility
 */
export const useCargaInsumosDataRead = () => {
  const { loading, error, data, summary, hasData, dataStats, documentsMetadata } = useCargaInsumosData();

  return {
    loading,
    error,
    data,
    summary,
    hasData,
    dataStats,
    documentsMetadata
  };
};

/**
 * Composable para gestión específica de documentos
 * Implementa el principio de Interface Segregation
 */
export const useCargaInsumosDocuments = () => {
  const { queryData, getSummary, clearState, documentsMetadata } = useCargaInsumosData();

  const getDocumentById = async (documentId: string) => {
    return queryData({ documentId });
  };

  const getAllDocuments = async () => {
    return getSummary();
  };

  return {
    getDocumentById,
    getAllDocuments,
    documentsMetadata,
    clearState
  };
};
