import { generateClient } from "aws-amplify/data";
import type { Schema } from "~/amplify/data/resource";

const client = generateClient<Schema>();

export interface SuicBatchResponse {
  success: boolean;
  suicId: string;
  paisCode: string;
  batchIndex: number;
  totalBatches: number;
  processedRecords: number;
  message: string;
  errors?: any[];
}

export interface SaveProgressCallback {
  (batchIndex: number, totalBatches: number): void;
}

export const useSuicMySQL = () => {
  const BATCH_SIZE = 500; // Registros por lote

  const saveSuicToMySQL = async (
    suicId: string,
    paisCode: string,
    data: any[],
    onProgress?: SaveProgressCallback
  ): Promise<SuicBatchResponse[]> => {
    console.log(`🚀 Iniciando guardado SUIC para ${paisCode}: ${data.length} registros`);

    // Dividir datos en lotes
    const batches = [];
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      batches.push(data.slice(i, i + BATCH_SIZE));
    }

    const totalBatches = batches.length;
    const results: SuicBatchResponse[] = [];

    console.log(`📦 Procesando ${totalBatches} lotes para ${paisCode}`);

    // Procesar cada lote secuencialmente
    for (let i = 0; i < batches.length; i++) {
      const deleteExisting = i === 0; // Solo borrar en el primer batch
      
      console.log(`📤 Enviando lote ${i + 1}/${totalBatches} para ${paisCode} (${batches[i].length} registros)`);
      console.log(`🔧 Configuración del lote:`, {
        batchIndex: i,
        totalBatches,
        deleteExisting,
        suicId,
        paisCode
      });

      try {
        console.log(`🚀 Iniciando mutación para lote ${i + 1}...`);
        const result = await client.mutations.saveSuicBatch({
          suicId,
          paisCode,
          data: JSON.stringify(batches[i]),
          batchIndex: i,
          totalBatches,
          deleteExisting
        });

        console.log(`✅ Lote ${i + 1}/${totalBatches} completado para ${paisCode}:`, result);

        // Parsear respuesta si viene como string
        const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
        console.log(`📊 Resultado parseado del lote ${i + 1}:`, {
          success: parsedResult.success,
          processedRecords: parsedResult.processedRecords,
          message: parsedResult.message,
          errors: parsedResult.errors?.length || 0
        });
        
        results.push(parsedResult);
        
        // Llamar callback de progreso
        if (onProgress) {
          onProgress(i + 1, totalBatches);
        }

        // Pequeña pausa entre lotes para evitar sobrecarga
        if (i < batches.length - 1) {
          console.log(`⏳ Esperando 100ms antes del siguiente lote...`);
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log(`🔄 Continuando con lote ${i + 2}/${totalBatches}...`);
        }

      } catch (error) {
        console.error(`❌ Error en lote ${i + 1}/${totalBatches} para ${paisCode}:`, error);
        
        const errorResult: SuicBatchResponse = {
          success: false,
          suicId,
          paisCode,
          batchIndex: i,
          totalBatches,
          processedRecords: 0,
          message: `Error en lote ${i + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          errors: [error instanceof Error ? error.message : 'Error desconocido']
        };

        results.push(errorResult);
        
        // Continuar con el siguiente lote aunque haya error
        if (onProgress) {
          onProgress(i + 1, totalBatches);
        }
      }
    }

    console.log(`🏁 Guardado completado para ${paisCode}: ${results.length} lotes procesados`);
    return results;
  };

  const saveAllCountries = async (
    suicId: string,
    dataByPais: Record<string, any[]>,
    onProgress?: (paisCode: string, batchIndex: number, totalBatches: number) => void
  ): Promise<Record<string, SuicBatchResponse[]>> => {
    console.log(`🌍 Iniciando guardado para todos los países:`, Object.keys(dataByPais));

    const results: Record<string, SuicBatchResponse[]> = {};

    // Procesar cada país secuencialmente
    for (const [paisCode, data] of Object.entries(dataByPais)) {
      console.log(`🌍 Procesando país ${paisCode}: ${data.length} registros`);
      
      try {
        const paisResults = await saveSuicToMySQL(
          suicId,
          paisCode,
          data,
          (batchIndex, totalBatches) => {
            if (onProgress) {
              onProgress(paisCode, batchIndex, totalBatches);
            }
          }
        );

        results[paisCode] = paisResults;
        console.log(`✅ País ${paisCode} completado: ${paisResults.length} lotes`);

      } catch (error) {
        console.error(`❌ Error procesando país ${paisCode}:`, error);
        
        results[paisCode] = [{
          success: false,
          suicId,
          paisCode,
          batchIndex: 0,
          totalBatches: 1,
          processedRecords: 0,
          message: `Error procesando país: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          errors: [error instanceof Error ? error.message : 'Error desconocido']
        }];
      }
    }

    console.log(`🏁 Guardado de todos los países completado`);
    return results;
  };

  return {
    saveSuicToMySQL,
    saveAllCountries,
    BATCH_SIZE
  };
};
