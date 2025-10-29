import { generateClient } from "aws-amplify/data";

interface MetaDiariaFinalRow {
  Sociedad: string;
  MesExtraido: string;
  Total_Cantidad: number;
  Total_Venta_Neta: number;
}

interface MetaDiariaFinalResponse {
  success: boolean;
  data: MetaDiariaFinalRow[];
  summary: {
    sociedades: string[];
    mesesDisponibles: string[];
  };
  message?: string;
}

export const useSuicMetaDiariaFinal = () => {
  const client = generateClient();

  const getMetaDiariaFinal = async (suicId: string): Promise<MetaDiariaFinalResponse> => {
    try {
      console.log('🔍 Consultando meta_diaria_final para SUIC:', suicId);

      const { data } = await client.queries.getMetaDiariaFinal({ suicId });

      console.log('📊 Respuesta de meta_diaria_final:', data);

      // Parsear respuesta si viene como string
      let result: MetaDiariaFinalResponse;
      
      if (typeof data === 'string') {
        try {
          result = JSON.parse(data);
        } catch (e) {
          console.error('Error parseando respuesta:', e);
          result = JSON.parse(data);
        }
      } else if (data && typeof data === 'object') {
        // Si viene envuelto en un campo, extraerlo
        result = data.getMetaDiariaFinal || data as any;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

      // Validar que la respuesta tenga la estructura esperada
      if (!result.success && !result.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return result;
    } catch (error) {
      console.error('❌ Error consultando meta_diaria_final:', error);
      
      return {
        success: false,
        data: [],
        summary: {
          sociedades: [],
          mesesDisponibles: []
        },
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  return {
    getMetaDiariaFinal
  };
};

