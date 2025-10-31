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
      const query = `
        SELECT
          Sociedad,
          SUBSTRING(CAST(Fecha_Factura AS CHAR(8)), 5, 2) AS MesExtraido,
          SUM(cant_factura) AS Total_Cantidad,
          SUM(venta_neta) AS Total_Venta_Neta
        FROM
          meta_diaria_final
        WHERE id_suic = ?
        GROUP BY
          Sociedad,
          MesExtraido
        ORDER BY
          Sociedad, MesExtraido
      `;

      console.log(`🔍 Ejecutando query agregada para SUIC: ${body.suicId}`);
      const [rows] = await connection.execute(query, [body.suicId]);
      const data = rows as MetaDiariaFinalRow[];

      console.log(`✅ Datos obtenidos: ${data.length} registros agregados`);

      // Generar resumen
      const sociedades = [...new Set(data.map(row => row.Sociedad))].sort();
      const meses = [...new Set(data.map(row => row.MesExtraido))].sort();

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

