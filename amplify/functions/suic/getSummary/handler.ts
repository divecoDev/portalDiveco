import mysql from "mysql2/promise";

interface SuicSummaryRequest {
  suicId: string;
}

interface CountrySummary {
  paisCode: string;
  totalRecords: number;
  lastUpdated: string | null;
  availableMonths: number[]; // Array de números de mes (1-12)
  ventasByMonth: number[]; // Array de 12 posiciones con totales de ventas
  unidadesByMonth: number[]; // Array de 12 posiciones con totales de unidades
}

interface SuicSummaryResponse {
  success: boolean;
  suicId: string;
  countries: CountrySummary[];
  message: string;
}

export const handler = async (event: any): Promise<SuicSummaryResponse> => {
  console.log('🔍 Consultando resumen de SUIC');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));

  // Configuración de MySQL
  const mysqlConfig: mysql.ConnectionOptions = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'portal',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    ssl: process.env.MYSQL_SSL === 'true' ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 60000,
  };

  console.log('🔧 Configuración MySQL:', {
    host: mysqlConfig.host,
    user: mysqlConfig.user,
    database: mysqlConfig.database,
    port: mysqlConfig.port,
    ssl: mysqlConfig.ssl ? 'enabled' : 'disabled'
  });

  try {
    // Parsear los datos del evento
    let body: SuicSummaryRequest;

    if (event.arguments) {
      body = event.arguments;
    } else if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event;
    }

    console.log(`📋 SUIC ID: ${body.suicId}`);

    // Validaciones básicas
    if (!body.suicId) {
      throw new Error('suicId es requerido');
    }

    // Conectar a MySQL
    console.log('🔌 Conectando a MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');

    try {
      // Consultar totales por país y detectar meses disponibles
      const query = `
        SELECT 
          pais,
          COUNT(*) as totalRecords,
          -- Detectar meses con datos (al menos una columna no nula/vacía)
          SUM(CASE WHEN 
            (unidades_plan_1 IS NOT NULL AND unidades_plan_1 != '') OR 
            (precio_proyectado_1 IS NOT NULL AND precio_proyectado_1 != '') OR 
            (venta_bruta_plan_1 IS NOT NULL AND venta_bruta_plan_1 != '') OR 
            (venta_plan_1 IS NOT NULL AND venta_plan_1 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_1,
          SUM(CASE WHEN 
            (unidades_plan_2 IS NOT NULL AND unidades_plan_2 != '') OR 
            (precio_proyectado_2 IS NOT NULL AND precio_proyectado_2 != '') OR 
            (venta_bruta_plan_2 IS NOT NULL AND venta_bruta_plan_2 != '') OR 
            (venta_plan_2 IS NOT NULL AND venta_plan_2 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_2,
          SUM(CASE WHEN 
            (unidades_plan_3 IS NOT NULL AND unidades_plan_3 != '') OR 
            (precio_proyectado_3 IS NOT NULL AND precio_proyectado_3 != '') OR 
            (venta_bruta_plan_3 IS NOT NULL AND venta_bruta_plan_3 != '') OR 
            (venta_plan_3 IS NOT NULL AND venta_plan_3 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_3,
          SUM(CASE WHEN 
            (unidades_plan_4 IS NOT NULL AND unidades_plan_4 != '') OR 
            (precio_proyectado_4 IS NOT NULL AND precio_proyectado_4 != '') OR 
            (venta_bruta_plan_4 IS NOT NULL AND venta_bruta_plan_4 != '') OR 
            (venta_plan_4 IS NOT NULL AND venta_plan_4 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_4,
          SUM(CASE WHEN 
            (unidades_plan_5 IS NOT NULL AND unidades_plan_5 != '') OR 
            (precio_proyectado_5 IS NOT NULL AND precio_proyectado_5 != '') OR 
            (venta_bruta_plan_5 IS NOT NULL AND venta_bruta_plan_5 != '') OR 
            (venta_plan_5 IS NOT NULL AND venta_plan_5 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_5,
          SUM(CASE WHEN 
            (unidades_plan_6 IS NOT NULL AND unidades_plan_6 != '') OR 
            (precio_proyectado_6 IS NOT NULL AND precio_proyectado_6 != '') OR 
            (venta_bruta_plan_6 IS NOT NULL AND venta_bruta_plan_6 != '') OR 
            (venta_plan_6 IS NOT NULL AND venta_plan_6 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_6,
          SUM(CASE WHEN 
            (unidades_plan_7 IS NOT NULL AND unidades_plan_7 != '') OR 
            (precio_proyectado_7 IS NOT NULL AND precio_proyectado_7 != '') OR 
            (venta_bruta_plan_7 IS NOT NULL AND venta_bruta_plan_7 != '') OR 
            (venta_plan_7 IS NOT NULL AND venta_plan_7 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_7,
          SUM(CASE WHEN 
            (unidades_plan_8 IS NOT NULL AND unidades_plan_8 != '') OR 
            (precio_proyectado_8 IS NOT NULL AND precio_proyectado_8 != '') OR 
            (venta_bruta_plan_8 IS NOT NULL AND venta_bruta_plan_8 != '') OR 
            (venta_plan_8 IS NOT NULL AND venta_plan_8 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_8,
          SUM(CASE WHEN 
            (unidades_plan_9 IS NOT NULL AND unidades_plan_9 != '') OR 
            (precio_proyectado_9 IS NOT NULL AND precio_proyectado_9 != '') OR 
            (venta_bruta_plan_9 IS NOT NULL AND venta_bruta_plan_9 != '') OR 
            (venta_plan_9 IS NOT NULL AND venta_plan_9 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_9,
          SUM(CASE WHEN 
            (unidades_plan_10 IS NOT NULL AND unidades_plan_10 != '') OR 
            (precio_proyectado_10 IS NOT NULL AND precio_proyectado_10 != '') OR 
            (venta_bruta_plan_10 IS NOT NULL AND venta_bruta_plan_10 != '') OR 
            (venta_plan_10 IS NOT NULL AND venta_plan_10 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_10,
          SUM(CASE WHEN 
            (unidades_plan_11 IS NOT NULL AND unidades_plan_11 != '') OR 
            (precio_proyectado_11 IS NOT NULL AND precio_proyectado_11 != '') OR 
            (venta_bruta_plan_11 IS NOT NULL AND venta_bruta_plan_11 != '') OR 
            (venta_plan_11 IS NOT NULL AND venta_plan_11 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_11,
          SUM(CASE WHEN 
            (unidades_plan_12 IS NOT NULL AND unidades_plan_12 != '') OR 
            (precio_proyectado_12 IS NOT NULL AND precio_proyectado_12 != '') OR 
            (venta_bruta_plan_12 IS NOT NULL AND venta_bruta_plan_12 != '') OR 
            (venta_plan_12 IS NOT NULL AND venta_plan_12 != '')
          THEN 1 ELSE 0 END) > 0 as has_month_12,
          -- Sumas de venta_plan por mes
          SUM(CASE WHEN venta_plan_1 IS NOT NULL AND venta_plan_1 != '' 
              THEN CAST(venta_plan_1 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_1,
          SUM(CASE WHEN venta_plan_2 IS NOT NULL AND venta_plan_2 != '' 
              THEN CAST(venta_plan_2 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_2,
          SUM(CASE WHEN venta_plan_3 IS NOT NULL AND venta_plan_3 != '' 
              THEN CAST(venta_plan_3 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_3,
          SUM(CASE WHEN venta_plan_4 IS NOT NULL AND venta_plan_4 != '' 
              THEN CAST(venta_plan_4 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_4,
          SUM(CASE WHEN venta_plan_5 IS NOT NULL AND venta_plan_5 != '' 
              THEN CAST(venta_plan_5 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_5,
          SUM(CASE WHEN venta_plan_6 IS NOT NULL AND venta_plan_6 != '' 
              THEN CAST(venta_plan_6 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_6,
          SUM(CASE WHEN venta_plan_7 IS NOT NULL AND venta_plan_7 != '' 
              THEN CAST(venta_plan_7 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_7,
          SUM(CASE WHEN venta_plan_8 IS NOT NULL AND venta_plan_8 != '' 
              THEN CAST(venta_plan_8 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_8,
          SUM(CASE WHEN venta_plan_9 IS NOT NULL AND venta_plan_9 != '' 
              THEN CAST(venta_plan_9 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_9,
          SUM(CASE WHEN venta_plan_10 IS NOT NULL AND venta_plan_10 != '' 
              THEN CAST(venta_plan_10 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_10,
          SUM(CASE WHEN venta_plan_11 IS NOT NULL AND venta_plan_11 != '' 
              THEN CAST(venta_plan_11 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_11,
          SUM(CASE WHEN venta_plan_12 IS NOT NULL AND venta_plan_12 != '' 
              THEN CAST(venta_plan_12 AS DECIMAL(15,2)) ELSE 0 END) as total_venta_12,
          -- Sumas de unidades_plan por mes
          SUM(CASE WHEN unidades_plan_1 IS NOT NULL AND unidades_plan_1 != '' 
              THEN CAST(unidades_plan_1 AS SIGNED) ELSE 0 END) as total_unidades_1,
          SUM(CASE WHEN unidades_plan_2 IS NOT NULL AND unidades_plan_2 != '' 
              THEN CAST(unidades_plan_2 AS SIGNED) ELSE 0 END) as total_unidades_2,
          SUM(CASE WHEN unidades_plan_3 IS NOT NULL AND unidades_plan_3 != '' 
              THEN CAST(unidades_plan_3 AS SIGNED) ELSE 0 END) as total_unidades_3,
          SUM(CASE WHEN unidades_plan_4 IS NOT NULL AND unidades_plan_4 != '' 
              THEN CAST(unidades_plan_4 AS SIGNED) ELSE 0 END) as total_unidades_4,
          SUM(CASE WHEN unidades_plan_5 IS NOT NULL AND unidades_plan_5 != '' 
              THEN CAST(unidades_plan_5 AS SIGNED) ELSE 0 END) as total_unidades_5,
          SUM(CASE WHEN unidades_plan_6 IS NOT NULL AND unidades_plan_6 != '' 
              THEN CAST(unidades_plan_6 AS SIGNED) ELSE 0 END) as total_unidades_6,
          SUM(CASE WHEN unidades_plan_7 IS NOT NULL AND unidades_plan_7 != '' 
              THEN CAST(unidades_plan_7 AS SIGNED) ELSE 0 END) as total_unidades_7,
          SUM(CASE WHEN unidades_plan_8 IS NOT NULL AND unidades_plan_8 != '' 
              THEN CAST(unidades_plan_8 AS SIGNED) ELSE 0 END) as total_unidades_8,
          SUM(CASE WHEN unidades_plan_9 IS NOT NULL AND unidades_plan_9 != '' 
              THEN CAST(unidades_plan_9 AS SIGNED) ELSE 0 END) as total_unidades_9,
          SUM(CASE WHEN unidades_plan_10 IS NOT NULL AND unidades_plan_10 != '' 
              THEN CAST(unidades_plan_10 AS SIGNED) ELSE 0 END) as total_unidades_10,
          SUM(CASE WHEN unidades_plan_11 IS NOT NULL AND unidades_plan_11 != '' 
              THEN CAST(unidades_plan_11 AS SIGNED) ELSE 0 END) as total_unidades_11,
          SUM(CASE WHEN unidades_plan_12 IS NOT NULL AND unidades_plan_12 != '' 
              THEN CAST(unidades_plan_12 AS SIGNED) ELSE 0 END) as total_unidades_12
        FROM suic 
        WHERE id_suic = ?
        GROUP BY pais
        ORDER BY pais
      `;

      console.log(`🔍 Ejecutando query para SUIC: ${body.suicId}`);
      const [rows] = await connection.execute(query, [body.suicId]);
      
      const resultRows = rows as any[];
      console.log(`📊 Registros encontrados para ${resultRows.length} países`);

      // Procesar resultados para extraer meses disponibles
      const countries = resultRows.map(row => {
        const availableMonths: number[] = [];
        for (let i = 1; i <= 12; i++) {
          if (row[`has_month_${i}`] === 1) {
            availableMonths.push(i);
          }
        }
        
        // Extraer totales de ventas por mes
        const ventasByMonth: number[] = [];
        for (let i = 1; i <= 12; i++) {
          ventasByMonth.push(parseFloat(row[`total_venta_${i}`] || '0') || 0);
        }
        
        // Extraer totales de unidades por mes
        const unidadesByMonth: number[] = [];
        for (let i = 1; i <= 12; i++) {
          unidadesByMonth.push(parseInt(row[`total_unidades_${i}`] || '0') || 0);
        }
        
        console.log(`📅 Meses disponibles para ${row.pais}:`, availableMonths);
        console.log(`💰 Total ventas por mes para ${row.pais}:`, ventasByMonth);
        console.log(`📦 Total unidades por mes para ${row.pais}:`, unidadesByMonth);
        
        return {
          paisCode: row.pais as string,
          totalRecords: row.totalRecords as number,
          lastUpdated: null,
          availableMonths,
          ventasByMonth,
          unidadesByMonth
        };
      }) as CountrySummary[];

      const response: SuicSummaryResponse = {
        success: true,
        suicId: body.suicId,
        countries,
        message: `Resumen obtenido: ${countries.length} países encontrados`
      };

      console.log(`✅ Resumen SUIC completado:`, response);
      return response;

    } finally {
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error consultando resumen SUIC:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return {
      success: false,
      suicId: event.suicId || 'unknown',
      countries: [],
      message: `Error consultando resumen SUIC: ${errorMessage}`
    };
  }
};

