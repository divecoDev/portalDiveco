/**
 * SUIC Validations Composable
 * Lógica reactiva para validación de datos SUIC con procesamiento optimizado
 */

import { 
  validateCountryData, 
  validateDataChunk, 
  combineValidationResults,
  type CountryValidationResult,
  type MonthValidationResult 
} from '~/services/suicValidators';

export interface ValidationProgress {
  paisCode: string;
  currentChunk: number;
  totalChunks: number;
  processedRecords: number;
  totalRecords: number;
}

export interface CountryMonthsMetadata {
  paisCode: string;
  availableMonths: number[];
  incompleteMonths: Map<number, number[]>;
  totalErrors: number;
  monthsMetadata: MonthValidationResult[];
  isValidating: boolean;
  lastValidated: Date | null;
  ventasByMonth?: number[]; // Array de 12 posiciones con totales de ventas
  unidadesByMonth?: number[]; // Array de 12 posiciones con totales de unidades
}

export const useSuicValidations = () => {
  // Estados reactivos
  const isValidating = ref(false);
  const validationProgress = ref<ValidationProgress | null>(null);
  const monthsMetadata = ref<Record<string, CountryMonthsMetadata>>({});
  const validationErrors = ref<string[]>([]);

  // Configuración de procesamiento
  const CHUNK_SIZE = 500;
  const DEBOUNCE_DELAY = 100;

  /**
   * Valida datos de un país específico por chunks
   */
  const validateCountryMonths = async (
    paisCode: string, 
    data: Record<string, any>[]
  ): Promise<CountryMonthsMetadata> => {
    console.log(`🔍 Iniciando validación para ${paisCode}: ${data.length} registros`);
    
    // Inicializar estado
    isValidating.value = true;
    validationProgress.value = {
      paisCode,
      currentChunk: 0,
      totalChunks: Math.ceil(data.length / CHUNK_SIZE),
      processedRecords: 0,
      totalRecords: data.length
    };

    try {
      // Dividir datos en chunks
      const chunks: Record<string, any>[][] = [];
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        chunks.push(data.slice(i, i + CHUNK_SIZE));
      }

      const chunkResults: CountryValidationResult[] = [];

      // Procesar cada chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk) continue; // Skip undefined chunks
        
        const startIndex = i * CHUNK_SIZE;
        
        console.log(`📦 Procesando chunk ${i + 1}/${chunks.length} para ${paisCode}`);
        
        // Actualizar progreso
        validationProgress.value = {
          paisCode,
          currentChunk: i + 1,
          totalChunks: chunks.length,
          processedRecords: startIndex + chunk.length,
          totalRecords: data.length
        };

        // Validar chunk
        const chunkResult = validateDataChunk(chunk, startIndex);
        chunkResults.push(chunkResult);

        // Debounce para no bloquear UI
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DEBOUNCE_DELAY));
        }
      }

      // Combinar resultados
      const finalResult = combineValidationResults(chunkResults);

      // Crear metadata del país
      const countryMetadata: CountryMonthsMetadata = {
        paisCode,
        availableMonths: finalResult.availableMonths,
        incompleteMonths: finalResult.incompleteMonths,
        totalErrors: finalResult.totalErrors,
        monthsMetadata: finalResult.monthsMetadata,
        isValidating: false,
        lastValidated: new Date(),
        ventasByMonth: finalResult.ventasByMonth,
        unidadesByMonth: finalResult.unidadesByMonth
      };

      // Actualizar estado global
      monthsMetadata.value[paisCode] = countryMetadata;

      console.log(`✅ Validación completada para ${paisCode}:`, {
        availableMonths: finalResult.availableMonths.length,
        totalErrors: finalResult.totalErrors,
        monthsWithData: finalResult.availableMonths,
        monthsMetadata: finalResult.monthsMetadata.filter(m => m.hasData)
      });

      return countryMetadata;

    } catch (error) {
      console.error(`❌ Error validando ${paisCode}:`, error);
      
      const errorMessage = `Error validando datos de ${paisCode}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      validationErrors.value.push(errorMessage);
      
      // Crear metadata de error
      const errorMetadata: CountryMonthsMetadata = {
        paisCode,
        availableMonths: [],
        incompleteMonths: new Map(),
        totalErrors: 0,
        monthsMetadata: [],
        isValidating: false,
        lastValidated: null
      };

      monthsMetadata.value[paisCode] = errorMetadata;
      return errorMetadata;

    } finally {
      isValidating.value = false;
      validationProgress.value = null;
    }
  };

  /**
   * Valida múltiples países en paralelo
   */
  const validateMultipleCountries = async (
    dataByPais: Record<string, Record<string, any>[]>
  ): Promise<Record<string, CountryMonthsMetadata>> => {
    console.log(`🌍 Iniciando validación para ${Object.keys(dataByPais).length} países`);
    
    isValidating.value = true;
    validationErrors.value = [];

    try {
      // Procesar cada país
      const validationPromises = Object.entries(dataByPais).map(([paisCode, data]) => 
        validateCountryMonths(paisCode, data)
      );

      const results = await Promise.all(validationPromises);

      // Convertir array a objeto indexado por país
      const resultsByPais: Record<string, CountryMonthsMetadata> = {};
      results.forEach(result => {
        resultsByPais[result.paisCode] = result;
      });

      console.log(`🏁 Validación de todos los países completada`);
      return resultsByPais;

    } catch (error) {
      console.error('❌ Error en validación múltiple:', error);
      validationErrors.value.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return {};

    } finally {
      isValidating.value = false;
    }
  };

  /**
   * Obtiene metadata de un país específico
   */
  const getCountryMetadata = (paisCode: string): CountryMonthsMetadata | null => {
    return monthsMetadata.value[paisCode] || null;
  };

  /**
   * Verifica si un país tiene datos validados
   */
  const hasValidatedData = (paisCode: string): boolean => {
    const metadata = monthsMetadata.value[paisCode];
    return metadata ? metadata.availableMonths.length > 0 : false;
  };

  /**
   * Obtiene meses disponibles para un país
   */
  const getAvailableMonths = (paisCode: string): number[] => {
    const metadata = monthsMetadata.value[paisCode];
    return metadata ? metadata.availableMonths : [];
  };

  /**
   * Verifica si un país tiene errores de validación
   */
  const hasValidationErrors = (paisCode: string): boolean => {
    const metadata = monthsMetadata.value[paisCode];
    return metadata ? metadata.totalErrors > 0 : false;
  };

  /**
   * Obtiene resumen de validación para un país
   */
  const getValidationSummary = (paisCode: string) => {
    const metadata = monthsMetadata.value[paisCode];
    
    if (!metadata) {
      return {
        hasData: false,
        totalMonths: 0,
        completeMonths: 0,
        incompleteMonths: 0,
        totalErrors: 0,
        status: 'no-data' as const
      };
    }

    const completeMonths = metadata.monthsMetadata.filter(m => m.isComplete).length;
    const incompleteMonths = metadata.monthsMetadata.filter(m => m.hasData && !m.isComplete).length;

    return {
      hasData: metadata.availableMonths.length > 0,
      totalMonths: metadata.availableMonths.length,
      completeMonths,
      incompleteMonths,
      totalErrors: metadata.totalErrors,
      status: metadata.totalErrors > 0 ? 'has-errors' : 'valid' as const
    };
  };

  /**
   * Limpia metadata de un país específico
   */
  const clearCountryMetadata = (paisCode: string): void => {
    delete monthsMetadata.value[paisCode];
  };

  /**
   * Limpia toda la metadata de validación
   */
  const clearAllMetadata = (): void => {
    monthsMetadata.value = {};
    validationErrors.value = [];
  };

  /**
   * Obtiene estadísticas globales de validación
   */
  const getGlobalValidationStats = () => {
    const countries = Object.values(monthsMetadata.value);
    
    return {
      totalCountries: countries.length,
      countriesWithData: countries.filter(c => c.availableMonths.length > 0).length,
      countriesWithErrors: countries.filter(c => c.totalErrors > 0).length,
      totalErrors: countries.reduce((sum, c) => sum + c.totalErrors, 0),
      totalMonthsWithData: countries.reduce((sum, c) => sum + c.availableMonths.length, 0)
    };
  };

  return {
    // Estados reactivos
    isValidating: readonly(isValidating),
    validationProgress: readonly(validationProgress),
    monthsMetadata: readonly(monthsMetadata),
    validationErrors: readonly(validationErrors),

    // Métodos principales
    validateCountryMonths,
    validateMultipleCountries,

    // Métodos de consulta
    getCountryMetadata,
    hasValidatedData,
    getAvailableMonths,
    hasValidationErrors,
    getValidationSummary,
    getGlobalValidationStats,

    // Métodos de limpieza
    clearCountryMetadata,
    clearAllMetadata,

    // Configuración
    CHUNK_SIZE,
    DEBOUNCE_DELAY
  };
};
