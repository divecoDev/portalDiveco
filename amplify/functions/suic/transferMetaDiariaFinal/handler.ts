import mysql from 'mysql2/promise';
import sql from 'mssql';

interface TransferMetaDiariaRequest {
  suicId: string;
}

interface TransferResponse {
  success: boolean;
  message: string;
  recordsTransferred: number;
  error?: string;
}

export const handler = async (event: any): Promise<TransferResponse> => {
  console.log('🔄 Iniciando transferencia de meta_diaria_final desde MSSQL a MySQL');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));

  // Configuración de MSSQL
  const mssqlConfig = {
    user: 'divecoadm',
    password: 'J$YSAc@@gm44ExB', // TODO: Mover a secret
    server: 'divecosqlserver.database.windows.net',
    database: 'STGDiveco',
    options: {
      encrypt: true,
    },
  };

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
    let body: TransferMetaDiariaRequest;

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

    // Conectar a MSSQL
    console.log('🔌 Conectando a MSSQL...');
    const mssqlPool = new sql.ConnectionPool(mssqlConfig);
    await mssqlPool.connect();
    console.log('✅ Conexión a MSSQL establecida');

    let totalRecords = 0;

    try {
      // Leer datos de MSSQL
      console.log('📖 Leyendo datos de Gold.Meta_Diaria_Final...');
      const result = await mssqlPool.request().query('SELECT * FROM Gold.Meta_Diaria_Final');
      const records = result.recordset;
      
      console.log(`✅ ${records.length} registros leídos de MSSQL`);

      if (records.length === 0) {
        await mssqlPool.close();
        return {
          success: true,
          message: 'No hay registros para transferir',
          recordsTransferred: 0
        };
      }

      // Conectar a MySQL
      console.log('🔌 Conectando a MySQL...');
      const mysqlConnection = await mysql.createConnection(mysqlConfig);
      console.log('✅ Conexión a MySQL establecida');

      try {
        // Eliminar registros existentes con el mismo id_suic
        console.log(`🗑️ Eliminando registros existentes para id_suic: ${body.suicId}`);
        await mysqlConnection.execute(
          'DELETE FROM meta_diaria_final WHERE id_suic = ?',
          [body.suicId]
        );
        console.log('✅ Registros antiguos eliminados');

        // Procesar en lotes de 500
        const BATCH_SIZE = 500;
        const batches = Math.ceil(records.length / BATCH_SIZE);

        console.log(`📦 Procesando ${records.length} registros en ${batches} lotes de ${BATCH_SIZE}`);

        for (let i = 0; i < batches; i++) {
          const startIdx = i * BATCH_SIZE;
          const endIdx = Math.min(startIdx + BATCH_SIZE, records.length);
          const batch = records.slice(startIdx, endIdx);

          console.log(`📦 Procesando lote ${i + 1}/${batches} (${batch.length} registros)`);

          // Preparar valores para INSERT
          const values = batch.map(record => {
            return [
              body.suicId, // id_suic
              record.Sociedad || null,
              record.Centro || null,
              record.Version || null,
              record.Vendedor || null,
              record.Cliente || null,
              record.Material || null,
              record.Canal || null,
              record.Color || null,
              record.Marca || null,
              record.Presentacion || null,
              record.Modelo || null,
              record.Tamano || null,
              record.Fecha_Factura || null,
              record.Cant_Factura || null,
              record.Unidad || null,
              record.Decuento_Ben || null,
              record.Descuento_Mer || null,
              record.Venta_Neta || null,
              record.Moneda || null,
              record.Sector || null,
              record.Org_ventas || null,
              record.margen_bruto || null,
              record.margen_cebe || null
            ];
          });

          // Crear placeholders para la query
          const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');

          // Ejecutar INSERT
          const insertQuery = `
            INSERT INTO meta_diaria_final (
              id_suic, Sociedad, Centro, Version, Vendedor, Cliente, Material, 
              Canal, Color, Marca, Presentacion, Modelo, Tamano, Fecha_Factura, 
              Cant_Factura, Unidad, Decuento_Ben, Descuento_Mer, Venta_Neta, 
              Moneda, Sector, Org_ventas, margen_bruto, margen_cebe
            ) VALUES ${placeholders}
          `;

          const flatValues = values.flat();
          await mysqlConnection.execute(insertQuery, flatValues);

          totalRecords += batch.length;
          console.log(`✅ Lote ${i + 1}/${batches} insertado: ${batch.length} registros`);
        }

        console.log(`✅ Transferencia completada: ${totalRecords} registros`);

      } finally {
        console.log('🔌 Cerrando conexión a MySQL...');
        await mysqlConnection.end();
        console.log('✅ Conexión a MySQL cerrada exitosamente');
      }

    } finally {
      console.log('🔌 Cerrando conexión a MSSQL...');
      await mssqlPool.close();
      console.log('✅ Conexión a MSSQL cerrada exitosamente');
    }

    return {
      success: true,
      message: `Transferencia completada exitosamente`,
      recordsTransferred: totalRecords
    };

  } catch (error) {
    console.error('❌ Error transfiriendo meta_diaria_final:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      success: false,
      message: `Error en la transferencia: ${errorMessage}`,
      recordsTransferred: 0,
      error: errorMessage
    };
  }
};

