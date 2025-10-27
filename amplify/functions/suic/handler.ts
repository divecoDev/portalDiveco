import mysql from "mysql2/promise";

interface SuicBatchRequest {
  suicId: string;
  paisCode: string;
  data: any[];
  batchIndex: number;
  totalBatches: number;
  deleteExisting: boolean;
}

interface SuicBatchResponse {
  success: boolean;
  suicId: string;
  paisCode: string;
  batchIndex: number;
  totalBatches: number;
  processedRecords: number;
  message: string;
  errors?: any[];
}

export const handler = async (event: any): Promise<SuicBatchResponse> => {
  console.log('🚀🚀🚀 HANDLER COMPLETO SUIC EJECUTÁNDOSE - VERSIÓN CON 119 COLUMNAS 🚀🚀🚀');
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
    let body: SuicBatchRequest;

    if (event.arguments) {
      body = event.arguments;
    } else if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event;
    }

    // Decodificar los campos JSON si vienen como strings
    if (typeof body.data === 'string') {
      body.data = JSON.parse(body.data);
    }

    console.log(`📋 SUIC ID: ${body.suicId}`);
    console.log(`🌍 País: ${body.paisCode}`);
    console.log(`📊 Registros: ${body.data.length}`);
    console.log(`📦 Lote: ${body.batchIndex + 1}/${body.totalBatches}`);
    console.log(`🗑️ Borrar existentes: ${body.deleteExisting}`);

    // Validaciones básicas
    if (!body.suicId || !body.paisCode || !body.data || !Array.isArray(body.data)) {
      throw new Error('Datos inválidos: suicId, paisCode y data son requeridos');
    }

    // Conectar a MySQL
    console.log('🔌 Conectando a MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');
    
    // Probar la conexión con una consulta simple
    try {
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Conexión MySQL verificada:', rows);
    } catch (testError) {
      console.error('❌ Error verificando conexión MySQL:', testError);
      throw testError;
    }

    let result: SuicBatchResponse;

    try {
      result = await processSuicBatch(connection, body);
    } finally {
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

    console.log(`✅ Lote SUIC procesado exitosamente: ${result.processedRecords} registros`);
    return result;

  } catch (error) {
    console.error('❌ Error procesando lote SUIC:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return {
      success: false,
      suicId: event.suicId || 'unknown',
      paisCode: event.paisCode || 'unknown',
      batchIndex: event.batchIndex || 0,
      totalBatches: event.totalBatches || 1,
      processedRecords: 0,
      errors: [errorMessage],
      message: `Error procesando lote SUIC: ${errorMessage}`
    };
  }
};

// Función para procesar lotes de SUIC con todas las 119 columnas
async function processSuicBatch(connection: mysql.Connection, body: SuicBatchRequest): Promise<SuicBatchResponse> {
  console.log('📊 Procesando lote de SUIC (versión completa)...');
  console.log('📋 Datos del lote:', {
    suicId: body.suicId,
    paisCode: body.paisCode,
    dataLength: body.data.length,
    batchIndex: body.batchIndex,
    totalBatches: body.totalBatches,
    deleteExisting: body.deleteExisting
  });

  const { suicId, paisCode, data, batchIndex, totalBatches, deleteExisting } = body;
  let processedRecords = 0;
  const errors: any[] = [];

  try {
    // Si es el primer lote, borrar datos existentes para este país
    if (deleteExisting) {
      console.log(`🗑️ Borrando datos existentes para SUIC ${suicId} y país ${paisCode}...`);
      const deleteQuery = `DELETE FROM suic WHERE id_suic = ? AND pais = ?`;
      const deleteResult = await connection.execute(deleteQuery, [suicId, paisCode]);
      console.log(`✅ Datos existentes borrados: ${(deleteResult as any)[0].affectedRows} registros`);
    }

    // Preparar la consulta de inserción - 119 columnas total
    const insertQuery = `
      INSERT INTO suic (
        id_suic, pais, centro, asignacion_vendedor, vendedor, codigo_cliente, cliente_correcto,
        asignacion_canal, canal, material, modelo, linea, asignacion_color, color,
        asignacion_marca, marca, asignacion_presentacion, presentacion, asignacion_modelo, modelo_2,
        asignacion_tamano, tamano,
        unidades_plan_1, precio_proyectado_1, venta_bruta_plan_1, porcentaje__desc_merc_1, descuento_merc_1, porcentaje__desc_ben_1, descuento_ben_1, venta_plan_1,
        unidades_plan_2, precio_proyectado_2, venta_bruta_plan_2, porcentaje__desc_merc_2, descuento_merc_2, porcentaje__desc_ben_2, descuento_ben_2, venta_plan_2,
        unidades_plan_3, precio_proyectado_3, venta_bruta_plan_3, porcentaje__desc_merc_3, descuento_merc_3, porcentaje__desc_ben_3, descuento_ben_3, venta_plan_3,
        unidades_plan_4, precio_proyectado_4, venta_bruta_plan_4, porcentaje__desc_merc_4, descuento_merc_4, porcentaje__desc_ben_4, descuento_ben_4, venta_plan_4,
        unidades_plan_5, precio_proyectado_5, venta_bruta_plan_5, porcentaje__desc_merc_5, descuento_merc_5, porcentaje__desc_ben_5, descuento_ben_5, venta_plan_5,
        unidades_plan_6, precio_proyectado_6, venta_bruta_plan_6, porcentaje__desc_merc_6, descuento_merc_6, porcentaje__desc_ben_6, descuento_ben_6, venta_plan_6,
        unidades_plan_7, precio_proyectado_7, venta_bruta_plan_7, porcentaje__desc_merc_7, descuento_merc_7, porcentaje__desc_ben_7, descuento_ben_7, venta_plan_7,
        unidades_plan_8, precio_proyectado_8, venta_bruta_plan_8, porcentaje__desc_merc_8, descuento_merc_8, porcentaje__desc_ben_8, descuento_ben_8, venta_plan_8,
        unidades_plan_9, precio_proyectado_9, venta_bruta_plan_9, porcentaje__desc_merc_9, descuento_merc_9, porcentaje__desc_ben_9, descuento_ben_9, venta_plan_9,
        unidades_plan_10, precio_proyectado_10, venta_bruta_plan_10, porcentaje__desc_merc_10, descuento_merc_10, porcentaje__desc_ben_10, descuento_ben_10, venta_plan_10,
        unidades_plan_11, precio_proyectado_11, venta_bruta_plan_11, porcentaje__desc_merc_11, descuento_merc_11, porcentaje__desc_ben_11, descuento_ben_11, venta_plan_11,
        unidades_plan_12, precio_proyectado_12, venta_bruta_plan_12, porcentaje__desc_merc_12, descuento_merc_12, porcentaje__desc_ben_12, descuento_ben_12, venta_plan_12
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    // Procesar TODOS los registros del batch
    console.log(`🔄 Procesando ${data.length} registros con consulta completa...`);
    
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      try {
        if (i < 3 || i % 100 === 0) {
          console.log(`📝 Procesando registro ${i + 1}/${data.length}:`, {
            pais: record.pais,
            centro: record.centro,
            vendedor: record.vendedor?.substring(0, 20) + '...',
            material: record.material
          });
        }
        
        const values = [
          suicId,
          record.pais,
          record.centro || null,
          record.asignacion_vendedor || null,
          record.vendedor || null,
          record.codigo_cliente || null,
          record.cliente_correcto || null,
          record.asignacion_canal || null,
          record.canal || null,
          record.material || null,
          record.modelo || null,
          record.linea || null,
          record.asignacion_color || null,
          record.color || null,
          record.asignacion_marca || null,
          record.marca || null,
          record.asignacion_presentacion || null,
          record.presentacion || null,
          record.asignacion_modelo || null,
          record.modelo_2 || null,
          record.asignacion_tamano || null,
          record.tamano || null,
          // Plan 1
          parseInt(record.unidades_plan_1) || 0,
          parseFloat(record.precio_proyectado_1) || 0,
          parseFloat(record.venta_bruta_plan_1) || 0,
          parseFloat(record.porcentaje__desc_merc_1) || 0,
          parseFloat(record.descuento_merc_1) || 0,
          parseFloat(record.porcentaje__desc_ben_1) || 0,
          parseFloat(record.descuento_ben_1) || 0,
          parseFloat(record.venta_plan_1) || 0,
          // Plan 2
          parseInt(record.unidades_plan_2) || 0,
          parseFloat(record.precio_proyectado_2) || 0,
          parseFloat(record.venta_bruta_plan_2) || 0,
          parseFloat(record.porcentaje__desc_merc_2) || 0,
          parseFloat(record.descuento_merc_2) || 0,
          parseFloat(record.porcentaje__desc_ben_2) || 0,
          parseFloat(record.descuento_ben_2) || 0,
          parseFloat(record.venta_plan_2) || 0,
          // Plan 3
          parseInt(record.unidades_plan_3) || 0,
          parseFloat(record.precio_proyectado_3) || 0,
          parseFloat(record.venta_bruta_plan_3) || 0,
          parseFloat(record.porcentaje__desc_merc_3) || 0,
          parseFloat(record.descuento_merc_3) || 0,
          parseFloat(record.porcentaje__desc_ben_3) || 0,
          parseFloat(record.descuento_ben_3) || 0,
          parseFloat(record.venta_plan_3) || 0,
          // Plan 4
          parseInt(record.unidades_plan_4) || 0,
          parseFloat(record.precio_proyectado_4) || 0,
          parseFloat(record.venta_bruta_plan_4) || 0,
          parseFloat(record.porcentaje__desc_merc_4) || 0,
          parseFloat(record.descuento_merc_4) || 0,
          parseFloat(record.porcentaje__desc_ben_4) || 0,
          parseFloat(record.descuento_ben_4) || 0,
          parseFloat(record.venta_plan_4) || 0,
          // Plan 5
          parseInt(record.unidades_plan_5) || 0,
          parseFloat(record.precio_proyectado_5) || 0,
          parseFloat(record.venta_bruta_plan_5) || 0,
          parseFloat(record.porcentaje__desc_merc_5) || 0,
          parseFloat(record.descuento_merc_5) || 0,
          parseFloat(record.porcentaje__desc_ben_5) || 0,
          parseFloat(record.descuento_ben_5) || 0,
          parseFloat(record.venta_plan_5) || 0,
          // Plan 6
          parseInt(record.unidades_plan_6) || 0,
          parseFloat(record.precio_proyectado_6) || 0,
          parseFloat(record.venta_bruta_plan_6) || 0,
          parseFloat(record.porcentaje__desc_merc_6) || 0,
          parseFloat(record.descuento_merc_6) || 0,
          parseFloat(record.porcentaje__desc_ben_6) || 0,
          parseFloat(record.descuento_ben_6) || 0,
          parseFloat(record.venta_plan_6) || 0,
          // Plan 7
          parseInt(record.unidades_plan_7) || 0,
          parseFloat(record.precio_proyectado_7) || 0,
          parseFloat(record.venta_bruta_plan_7) || 0,
          parseFloat(record.porcentaje__desc_merc_7) || 0,
          parseFloat(record.descuento_merc_7) || 0,
          parseFloat(record.porcentaje__desc_ben_7) || 0,
          parseFloat(record.descuento_ben_7) || 0,
          parseFloat(record.venta_plan_7) || 0,
          // Plan 8
          parseInt(record.unidades_plan_8) || 0,
          parseFloat(record.precio_proyectado_8) || 0,
          parseFloat(record.venta_bruta_plan_8) || 0,
          parseFloat(record.porcentaje__desc_merc_8) || 0,
          parseFloat(record.descuento_merc_8) || 0,
          parseFloat(record.porcentaje__desc_ben_8) || 0,
          parseFloat(record.descuento_ben_8) || 0,
          parseFloat(record.venta_plan_8) || 0,
          // Plan 9
          parseInt(record.unidades_plan_9) || 0,
          parseFloat(record.precio_proyectado_9) || 0,
          parseFloat(record.venta_bruta_plan_9) || 0,
          parseFloat(record.porcentaje__desc_merc_9) || 0,
          parseFloat(record.descuento_merc_9) || 0,
          parseFloat(record.porcentaje__desc_ben_9) || 0,
          parseFloat(record.descuento_ben_9) || 0,
          parseFloat(record.venta_plan_9) || 0,
          // Plan 10
          parseInt(record.unidades_plan_10) || 0,
          parseFloat(record.precio_proyectado_10) || 0,
          parseFloat(record.venta_bruta_plan_10) || 0,
          parseFloat(record.porcentaje__desc_merc_10) || 0,
          parseFloat(record.descuento_merc_10) || 0,
          parseFloat(record.porcentaje__desc_ben_10) || 0,
          parseFloat(record.descuento_ben_10) || 0,
          parseFloat(record.venta_plan_10) || 0,
          // Plan 11
          parseInt(record.unidades_plan_11) || 0,
          parseFloat(record.precio_proyectado_11) || 0,
          parseFloat(record.venta_bruta_plan_11) || 0,
          parseFloat(record.porcentaje__desc_merc_11) || 0,
          parseFloat(record.descuento_merc_11) || 0,
          parseFloat(record.porcentaje__desc_ben_11) || 0,
          parseFloat(record.descuento_ben_11) || 0,
          parseFloat(record.venta_plan_11) || 0,
          // Plan 12
          parseInt(record.unidades_plan_12) || 0,
          parseFloat(record.precio_proyectado_12) || 0,
          parseFloat(record.venta_bruta_plan_12) || 0,
          parseFloat(record.porcentaje__desc_merc_12) || 0,
          parseFloat(record.descuento_merc_12) || 0,
          parseFloat(record.porcentaje__desc_ben_12) || 0,
          parseFloat(record.descuento_ben_12) || 0,
          parseFloat(record.venta_plan_12) || 0
        ];

        await connection.execute(insertQuery, values);
        processedRecords++;

        if (processedRecords % 100 === 0) {
          console.log(`📊 SUIC: ${processedRecords}/${data.length} registros procesados`);
        }

      } catch (recordError) {
        console.error(`❌ Error procesando registro ${processedRecords + 1}:`, recordError);
        errors.push({
          record: processedRecords + 1,
          error: recordError instanceof Error ? recordError.message : 'Error desconocido',
          data: record
        });
      }
    }

    console.log(`✅ SUIC completado: ${processedRecords}/${data.length} registros procesados`);

    return {
      success: true,
      suicId,
      paisCode,
      batchIndex,
      totalBatches,
      processedRecords,
      errors: errors.length > 0 ? errors : undefined,
      message: `SUIC COMPLETO: ${processedRecords} registros procesados${errors.length > 0 ? ` (${errors.length} errores)` : ''}`
    };

  } catch (error) {
    console.error('❌ Error en procesamiento de SUIC:', error);
    throw new Error(`Error en SUIC: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}