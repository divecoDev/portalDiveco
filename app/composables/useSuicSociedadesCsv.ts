import { generateClient } from "aws-amplify/data";

interface CsvFile {
  sociedad: string;
  fileName: string;
  s3Path: string;
  recordCount: number;
  partIndex?: number;
  totalParts?: number;
  publicUrl?: string;
}

interface GenerateCsvResponse {
  success: boolean;
  files: CsvFile[];
  totalSocieties: number;
  message: string;
  error?: string;
}

export const useSuicSociedadesCsv = () => {
  const client = generateClient();

  const generateSociedadesCsv = async (suicId: string): Promise<GenerateCsvResponse> => {
    try {
      console.log('📊 Generando CSVs por sociedad para SUIC:', suicId);

      const result = await (client.mutations as any).generateSociedadesCsv({ suicId });

      console.log('📊 Respuesta completa de generateSociedadesCsv:', result);
      console.log('📊 Tipo de respuesta:', typeof result);
      console.log('📊 result.data:', result?.data);

      // Parsear respuesta siguiendo el patrón de useSuicMySQL
      let parsedResult: GenerateCsvResponse;
      
      if (typeof result === 'string') {
        parsedResult = JSON.parse(result);
      } else if (result && result.data && typeof result.data === 'string') {
        // AWS Amplify devuelve {data: "string JSON"}
        parsedResult = JSON.parse(result.data);
      } else if (result && typeof result === 'object' && result.data) {
        // Si tiene estructura {data: {...}}
        parsedResult = result.data;
      } else if (result && typeof result === 'object') {
        // Si es directamente el objeto
        parsedResult = result;
      } else {
        throw new Error(`Respuesta inválida del servidor: ${JSON.stringify(result)}`);
      }

      console.log('📊 Resultado parseado:', parsedResult);

      // Validar que la respuesta tenga la estructura esperada
      if (!parsedResult || (typeof parsedResult !== 'object')) {
        throw new Error(`Respuesta no es un objeto válido: ${JSON.stringify(parsedResult)}`);
      }

      // Validar estructura mínima - permitir success: false con mensaje de error
      if (parsedResult.success === undefined && !parsedResult.files && !parsedResult.message) {
        throw new Error(`Respuesta no tiene estructura esperada: ${JSON.stringify(parsedResult)}`);
      }

      return parsedResult as GenerateCsvResponse;
    } catch (error) {
      console.error('❌ Error generando CSVs por sociedad:', error);
      
      return {
        success: false,
        files: [],
        totalSocieties: 0,
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  return {
    generateSociedadesCsv
  };
};
