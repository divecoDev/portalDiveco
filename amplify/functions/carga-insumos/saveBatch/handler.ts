import mysql from "mysql2/promise";

interface CargaInsumosRecord {
  tipo: 'planVentas' | 'existencias' | 'cobertura';
  data: any[];
  metadata: {
    fileName: string;
    loadedAt: string;
    documentId: string;
    batchId: string;
    batchIndex: number;
    totalBatches: number;
  };
}

interface BatchResponse {
  success: boolean;
  batchId: string;
  batchIndex: number;
  totalBatches: number;
  processedRecords: number;
  errors?: any[];
  message: string;
}

export const handler = async (event: any): Promise<BatchResponse> => {
  console.log('🚀 Iniciando procesamiento de lote de Carga de Insumos (MySQL)');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));
  console.log('📥 Tipo de evento:', typeof event);
  console.log('📥 Keys del evento:', Object.keys(event || {}));

  // Configuración de MySQL
  console.log('🔧 DEBUG: Variables de entorno MySQL:');
  console.log('🔧 MYSQL_HOST:', process.env.MYSQL_HOST);
  console.log('🔧 MYSQL_USER:', process.env.MYSQL_USER);
  console.log('🔧 MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
  console.log('🔧 MYSQL_PORT:', process.env.MYSQL_PORT);
  console.log('🔧 MYSQL_SSL:', process.env.MYSQL_SSL);

  const mysqlConfig: mysql.ConnectionOptions = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'STGDiveco',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    ssl: process.env.MYSQL_SSL === 'true' ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 60000,
  };

  console.log('🔧 DEBUG: Config MySQL final:', {
    ...mysqlConfig,
    password: '***'  // No mostrar password en logs
  });

  try {
    // Parsear los datos del evento
    let body: CargaInsumosRecord;

    console.log('🔍 DEBUG: Parseando evento...');

    // Para Amplify Gen 2, el evento viene con la estructura { arguments: { tipo, data, metadata } }
    if (event.arguments) {
      console.log('🔍 DEBUG: Evento tiene arguments, extrayendo...');
      body = event.arguments;
    } else if (typeof event.body === 'string') {
      console.log('🔍 DEBUG: Evento tiene body string, parseando...');
      body = JSON.parse(event.body);
    } else {
      console.log('🔍 DEBUG: Usando evento directamente...');
      body = event;
    }

    console.log('🔍 DEBUG: Body parseado:', JSON.stringify(body, null, 2));
    console.log('🔍 DEBUG: Body.data tipo:', typeof body.data);
    console.log('🔍 DEBUG: Body.metadata tipo:', typeof body.metadata);

    // Decodificar los campos JSON si vienen como strings
    if (typeof body.data === 'string') {
      console.log('🔄 Decodificando campo data desde string...');
      body.data = JSON.parse(body.data);
    }

    if (typeof body.metadata === 'string') {
      console.log('🔄 Decodificando campo metadata desde string...');
      body.metadata = JSON.parse(body.metadata);
    }

    console.log(`📋 Datos decodificados - Tipo: ${body.tipo}`);

    // Verificar que body.data existe antes de acceder a .length
    if (body.data && Array.isArray(body.data)) {
      console.log(`📋 Registros: ${body.data.length}`);
    } else {
      console.error('❌ body.data no es un array válido:', typeof body.data, body.data);
      throw new Error(`body.data inválido: esperado array, recibido ${typeof body.data}`);
    }

    // Log de muestra del primer registro para debug
    if (body.data.length > 0) {
      console.log(`📋 Muestra del primer registro:`, JSON.stringify(body.data[0], null, 2));
    }

    // Validaciones básicas
    if (!body.tipo || !body.data || !Array.isArray(body.data)) {
      throw new Error('Datos inválidos: tipo y data son requeridos');
    }

    if (!body.metadata || !body.metadata.documentId || !body.metadata.batchId) {
      throw new Error('Metadatos requeridos: documentId y batchId son obligatorios');
    }

    console.log(`📊 Procesando lote ${body.metadata.batchIndex + 1}/${body.metadata.totalBatches}`);
    console.log(`📋 Tipo: ${body.tipo} - Registros: ${body.data.length}`);
    console.log(`🔖 Document ID: ${body.metadata.documentId}`);
    console.log(`🏷️ Batch ID: ${body.metadata.batchId}`);

    // Conectar a MySQL
    console.log('🔌 Conectando a MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');

    let result: BatchResponse;

    try {
      // Procesar según el tipo de datos
      switch (body.tipo) {
        case 'planVentas':
          result = await processPlanVentasBatch(connection, body);
          break;
        case 'existencias':
          result = await processExistenciasBatch(connection, body);
          break;
        case 'cobertura':
          result = await processCoberturasBatch(connection, body);
          break;
        default:
          throw new Error(`Tipo de datos no soportado: ${body.tipo}`);
      }
    } finally {
      // Cerrar conexión
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

    console.log(`✅ Lote procesado exitosamente: ${result.processedRecords} registros`);
    return result;

  } catch (error) {
    console.error('❌ Error procesando lote:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return {
      success: false,
      batchId: event.metadata?.batchId || 'unknown',
      batchIndex: event.metadata?.batchIndex || 0,
      totalBatches: event.metadata?.totalBatches || 1,
      processedRecords: 0,
      errors: [errorMessage],
      message: `Error procesando lote: ${errorMessage}`
    };
  }
};

// Función para procesar lotes de Plan de Ventas
async function processPlanVentasBatch(connection: mysql.Connection, body: CargaInsumosRecord): Promise<BatchResponse> {
  console.log('📈 Procesando lote de Plan de Ventas...');

  const { data, metadata } = body;
  let processedRecords = 0;
  const errors: any[] = [];

  try {
    // Preparar la consulta de inserción
    const insertQuery = `
      INSERT INTO plan_ventas (
        document_id, batch_id, file_name,
        ssour, vrsio, spmon, sptag, spwoc, spbup,
        pmnux, wenux, vsnda, periv, vwdat, basme,
        absat, produ, lagri, lagrz, reich, reicz,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    // Procesar cada registro
    for (const record of data) {
      try {
        const values = [
          metadata.documentId,
          metadata.batchId,
          metadata.fileName || null,
          record.ssour || null,
          record.vrsio || null,
          record.spmon || null,
          record.sptag || null,
          record.spwoc || null,
          record.spbup || null,
          record.pmnux || null,
          record.wenux || null,
          record.vsnda || null,
          record.periv || null,
          record.vwdat || null,
          record.basme || null,
          record.absat || null,
          record.produ || null,
          record.lagri || null,
          record.lagrz || null,
          record.reich || null,
          record.reicz || null
        ];

        await connection.execute(insertQuery, values);
        processedRecords++;

        if (processedRecords % 100 === 0) {
          console.log(`📊 Plan de Ventas: ${processedRecords}/${data.length} registros procesados`);
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

    console.log(`✅ Plan de Ventas completado: ${processedRecords}/${data.length} registros procesados`);

    return {
      success: true,
      batchId: metadata.batchId,
      batchIndex: metadata.batchIndex,
      totalBatches: metadata.totalBatches,
      processedRecords,
      errors: errors.length > 0 ? errors : undefined,
      message: `Plan de Ventas: ${processedRecords} registros procesados${errors.length > 0 ? ` (${errors.length} errores)` : ''}`
    };

  } catch (error) {
    console.error('❌ Error en procesamiento de Plan de Ventas:', error);
    throw new Error(`Error en Plan de Ventas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Función para procesar lotes de Existencias
async function processExistenciasBatch(connection: mysql.Connection, body: CargaInsumosRecord): Promise<BatchResponse> {
  console.log('📦 Procesando lote de Existencias...');

  const { data, metadata } = body;
  let processedRecords = 0;
  const errors: any[] = [];

  try {
    // Preparar la consulta de inserción
    const insertQuery = `
      INSERT INTO existencias (
        document_id, batch_id, file_name,
        version, centro, almacen, material, periodo, mes,
        libre_u, no_liberado, bloqueado, devolucion,
        traslados, calidad, bloqueado_em,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    // Procesar cada registro
    for (const record of data) {
      try {
        const values = [
          metadata.documentId,
          metadata.batchId,
          metadata.fileName || null,
          record.version || null,
          record.centro || null,
          record.almacen || null,
          record.material || null,
          record.periodo || null,
          record.mes || null,
          parseFloat(record.libre_u) || 0,
          parseFloat(record.no_liberado) || 0,
          parseFloat(record.bloqueado) || 0,
          parseFloat(record.devolucion) || 0,
          parseFloat(record.traslados) || 0,
          parseFloat(record.calidad) || 0,
          parseFloat(record.bloqueado_em) || 0
        ];

        await connection.execute(insertQuery, values);
        processedRecords++;

        if (processedRecords % 100 === 0) {
          console.log(`📊 Existencias: ${processedRecords}/${data.length} registros procesados`);
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

    console.log(`✅ Existencias completado: ${processedRecords}/${data.length} registros procesados`);

    return {
      success: true,
      batchId: metadata.batchId,
      batchIndex: metadata.batchIndex,
      totalBatches: metadata.totalBatches,
      processedRecords,
      errors: errors.length > 0 ? errors : undefined,
      message: `Existencias: ${processedRecords} registros procesados${errors.length > 0 ? ` (${errors.length} errores)` : ''}`
    };

  } catch (error) {
    console.error('❌ Error en procesamiento de Existencias:', error);
    throw new Error(`Error en Existencias: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Función para procesar lotes de Cobertura
async function processCoberturasBatch(connection: mysql.Connection, body: CargaInsumosRecord): Promise<BatchResponse> {
  console.log('📊 Procesando lote de Cobertura...');

  const { data, metadata } = body;
  let processedRecords = 0;
  const errors: any[] = [];

  try {
    // Preparar la consulta de inserción
    const insertQuery = `
      INSERT INTO cobertura (
        document_id, batch_id, file_name,
        version, centro, periodo, mes,
        dias_habiles_mes_planta, dias_coberturas_mes, dias_habiles_venta,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    // Procesar cada registro
    for (const record of data) {
      try {
        const values = [
          metadata.documentId,
          metadata.batchId,
          metadata.fileName || null,
          record.version || null,
          record.centro || null,
          record.periodo || null,
          record.mes || null,
          parseInt(record.dias_habiles_mes_planta) || 0,
          parseInt(record.dias_coberturas_mes) || 0,
          parseInt(record.dias_habiles_venta) || 0
        ];

        await connection.execute(insertQuery, values);
        processedRecords++;

        if (processedRecords % 100 === 0) {
          console.log(`📊 Cobertura: ${processedRecords}/${data.length} registros procesados`);
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

    console.log(`✅ Cobertura completado: ${processedRecords}/${data.length} registros procesados`);

    return {
      success: true,
      batchId: metadata.batchId,
      batchIndex: metadata.batchIndex,
      totalBatches: metadata.totalBatches,
      processedRecords,
      errors: errors.length > 0 ? errors : undefined,
      message: `Cobertura: ${processedRecords} registros procesados${errors.length > 0 ? ` (${errors.length} errores)` : ''}`
    };

  } catch (error) {
    console.error('❌ Error en procesamiento de Cobertura:', error);
    throw new Error(`Error en Cobertura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
