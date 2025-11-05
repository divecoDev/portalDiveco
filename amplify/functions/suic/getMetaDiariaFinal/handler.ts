import mysql from 'mysql2/promise';

interface MetaDiariaFinalRequest {
  suicId: string;
}

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
  totalCount?: number;
  message?: string;
}

export const handler = async (event: any): Promise<MetaDiariaFinalResponse> => {
  console.log('🔍 Consultando datos de meta_diaria_final para SUIC');
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

  try {
    // Parsear los datos del evento
    let body: MetaDiariaFinalRequest;

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
      // Consultar conteo total primero
      const countQuery = `SELECT COUNT(*) as total FROM meta_diaria_final WHERE id_suic = ?`;
      console.log(`🔍 Consultando conteo total para SUIC: ${body.suicId}`);
      const [countRows] = await connection.execute<mysql.RowDataPacket[]>(countQuery, [body.suicId]);
      const totalCount = countRows[0]?.total || 0;
      console.log(`📊 Conteo total: ${totalCount} registros`);

      // Consultar datos agregados por sociedad y mes
      // Optimización: extracción de mes con operación matemática (más rápida que SUBSTRING+CAST para INT)
      const query = `
        SELECT
          Sociedad,
          LPAD(FLOOR((Fecha_Factura % 10000) / 100), 2, '0') AS MesExtraido,
          SUM(Cant_Factura) AS Total_Cantidad,
          SUM(Venta_Neta) AS Total_Venta_Neta
        FROM
          meta_diaria_final
        WHERE id_suic = ?
        GROUP BY
          Sociedad,
          FLOOR((Fecha_Factura % 10000) / 100)
        ORDER BY
          Sociedad, FLOOR((Fecha_Factura % 10000) / 100)
      `;

      console.log(`🔍 Ejecutando query agregada para SUIC: ${body.suicId}`);
      const [rows] = await connection.execute(query, [body.suicId]);
      const data = rows as MetaDiariaFinalRow[];

      console.log(`✅ Datos obtenidos: ${data.length} registros agregados`);

      // Generar resumen optimizado (una sola pasada con Set)
      const sociedadesSet = new Set<string>();
      const mesesSet = new Set<string>();
      
      data.forEach(row => {
        sociedadesSet.add(row.Sociedad);
        mesesSet.add(row.MesExtraido);
      });
      
      const sociedades = Array.from(sociedadesSet).sort();
      const meses = Array.from(mesesSet).sort();

      return {
        success: true,
        data,
        summary: {
          sociedades,
          mesesDisponibles: meses
        },
        totalCount,
        message: `Datos obtenidos exitosamente: ${data.length} registros agregados de ${sociedades.length} sociedades (${totalCount} registros totales)`
      };

    } finally {
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error consultando meta_diaria_final:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      success: false,
      data: [],
      summary: {
        sociedades: [],
        mesesDisponibles: []
      },
      message: `Error consultando datos: ${errorMessage}`
    };
  }
};

