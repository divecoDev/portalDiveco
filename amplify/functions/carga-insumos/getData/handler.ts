import * as mysql from "mysql2/promise";

interface QueryParams {
  documentId?: string;
  batchId?: string;
  tipo?: 'planVentas' | 'existencias' | 'cobertura';
  limit?: number;
  offset?: number;
}

interface CargaInsumosData {
  tipo: 'planVentas' | 'existencias' | 'cobertura';
  data: any[];
  metadata: {
    documentId: string;
    batchId: string;
    fileName: string;
    loadedAt: string;
    totalRecords: number;
  };
  summary: {
    totalRecords: number;
    batchesCount: number;
    lastLoaded: string;
  };
}

interface QueryResponse {
  success: boolean;
  data?: CargaInsumosData[];
  summary?: {
    totalDocuments: number;
    totalRecords: number;
    types: {
      planVentas: number;
      existencias: number;
      cobertura: number;
    };
  };
  error?: string;
  message: string;
}

export const handler = async (event: any): Promise<QueryResponse> => {
  console.log('🔍 Iniciando consulta de datos de Carga de Insumos');
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
    connectTimeout: 30000,
  };

  try {
    // Parsear parámetros de consulta
    let queryParams: QueryParams = {};

    if (event.arguments) {
      queryParams = event.arguments;
    } else if (typeof event.body === 'string') {
      queryParams = JSON.parse(event.body);
    } else {
      queryParams = event;
    }

    // Filtrar parámetros null/undefined para evitar problemas en las consultas
    const cleanParams: QueryParams = {};
    if (queryParams.documentId && queryParams.documentId !== '') {
      cleanParams.documentId = queryParams.documentId;
    }
    if (queryParams.batchId && queryParams.batchId !== '') {
      cleanParams.batchId = queryParams.batchId;
    }
    if (queryParams.tipo) {
      cleanParams.tipo = queryParams.tipo;
    }
    if (queryParams.limit && queryParams.limit > 0) {
      cleanParams.limit = queryParams.limit;
    }
    if (queryParams.offset && queryParams.offset >= 0) {
      cleanParams.offset = queryParams.offset;
    }

    console.log('🔍 Parámetros de consulta originales:', queryParams);
    console.log('🔍 Parámetros de consulta limpios:', cleanParams);
    console.log('🔍 Tipo de consulta:', (!cleanParams.documentId && !cleanParams.tipo) ? 'RESUMEN GENERAL' : 'CONSULTA ESPECÍFICA');
    
    if (cleanParams.documentId) {
      console.log(`🎯 Consultando datos específicos para documentId: ${cleanParams.documentId}`);
    }

    // Conectar a MySQL
    console.log('🔌 Conectando a MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');

    let result: QueryResponse;

    try {
      // Si no hay parámetros específicos, devolver resumen general
      if (!cleanParams.documentId && !cleanParams.tipo) {
        const summary = await getDataSummary(connection);
        result = {
          success: true,
          summary,
          message: summary
            ? `Resumen de datos: ${summary.totalRecords} registros en ${summary.totalDocuments} documentos`
            : 'No se encontraron datos para mostrar resumen'
        };
      } else {
        // Obtener datos específicos
        const data = await getSpecificData(connection, cleanParams);
        
        // Si se consulta por documentId específico, obtener summary específico
        let summary = null;
        if (cleanParams.documentId) {
          summary = await getDataSummaryByDocument(connection, cleanParams.documentId);
        } else {
          // Si solo se consulta por tipo, usar resumen general
          summary = await getDataSummary(connection);
        }
        
        result = {
          success: true,
          data,
          summary,
          message: `Datos obtenidos: ${data.length} conjuntos de datos`
        };
      }

    } finally {
      // Cerrar conexión
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

    console.log(`✅ Consulta completada exitosamente`);
    return result;

  } catch (error) {
    console.error('❌ Error en consulta:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return {
      success: false,
      error: errorMessage,
      message: `Error en consulta: ${errorMessage}`
    };
  }
};

// Función para obtener resumen de datos
async function getDataSummary(connection: mysql.Connection): Promise<QueryResponse['summary']> {
  console.log('📊 Obteniendo resumen de datos...');

  try {
    // Contar documentos únicos por tipo
    const [planVentasCount] = await connection.execute(`
      SELECT COUNT(DISTINCT document_id) as count
      FROM plan_ventas
    `);

    const [existenciasCount] = await connection.execute(`
      SELECT COUNT(DISTINCT document_id) as count
      FROM existencias
    `);

    const [coberturaCount] = await connection.execute(`
      SELECT COUNT(DISTINCT document_id) as count
      FROM cobertura
    `);

    // Contar registros totales
    const [totalRecordsResult] = await connection.execute(`
      SELECT
        (SELECT COUNT(*) FROM plan_ventas) +
        (SELECT COUNT(*) FROM existencias) +
        (SELECT COUNT(*) FROM cobertura) as total
    `);

    const planVentasDocuments = (planVentasCount as any[])[0]?.count || 0;
    const existenciasDocuments = (existenciasCount as any[])[0]?.count || 0;
    const coberturaDocuments = (coberturaCount as any[])[0]?.count || 0;
    const totalRecords = (totalRecordsResult as any[])[0]?.total || 0;

    return {
      totalDocuments: planVentasDocuments + existenciasDocuments + coberturaDocuments,
      totalRecords,
      types: {
        planVentas: planVentasDocuments,
        existencias: existenciasDocuments,
        cobertura: coberturaDocuments
      }
    };

  } catch (error) {
    console.error('❌ Error obteniendo resumen:', error);
    throw error;
  }
}

// Función para obtener resumen de datos específico por documentId
async function getDataSummaryByDocument(connection: mysql.Connection, documentId: string): Promise<QueryResponse['summary']> {
  console.log(`📊 Obteniendo resumen de datos para documentId: ${documentId}`);

  try {
    // Contar documentos únicos por tipo para el documentId específico
    const [planVentasCount] = await connection.execute(`
      SELECT COUNT(DISTINCT document_id) as count
      FROM plan_ventas
      WHERE document_id = ?
    `, [documentId]);

    const [existenciasCount] = await connection.execute(`
      SELECT COUNT(DISTINCT document_id) as count
      FROM existencias
      WHERE document_id = ?
    `, [documentId]);

    const [coberturaCount] = await connection.execute(`
      SELECT COUNT(DISTINCT document_id) as count
      FROM cobertura
      WHERE document_id = ?
    `, [documentId]);

    // Contar registros totales para el documentId específico
    const [totalRecordsResult] = await connection.execute(`
      SELECT
        (SELECT COUNT(*) FROM plan_ventas WHERE document_id = ?) +
        (SELECT COUNT(*) FROM existencias WHERE document_id = ?) +
        (SELECT COUNT(*) FROM cobertura WHERE document_id = ?) as total
    `, [documentId, documentId, documentId]);

    const planVentasDocuments = (planVentasCount as any[])[0]?.count || 0;
    const existenciasDocuments = (existenciasCount as any[])[0]?.count || 0;
    const coberturaDocuments = (coberturaCount as any[])[0]?.count || 0;
    const totalRecords = (totalRecordsResult as any[])[0]?.total || 0;

    console.log(`📊 Resumen específico para documentId ${documentId}:`, {
      planVentasDocuments,
      existenciasDocuments,
      coberturaDocuments,
      totalRecords
    });

    return {
      totalDocuments: planVentasDocuments + existenciasDocuments + coberturaDocuments,
      totalRecords,
      types: {
        planVentas: planVentasDocuments,
        existencias: existenciasDocuments,
        cobertura: coberturaDocuments
      }
    };

  } catch (error) {
    console.error('❌ Error obteniendo resumen específico:', error);
    throw error;
  }
}

// Función para obtener datos específicos
async function getSpecificData(connection: mysql.Connection, params: QueryParams): Promise<CargaInsumosData[]> {
  console.log('📋 Obteniendo datos específicos...');

  const results: CargaInsumosData[] = [];

  try {
    // Si se especifica un tipo, obtener solo ese tipo
    if (params.tipo) {
      const data = await getDataByType(connection, params.tipo, params);
      if (data) results.push(data);
    } else {
      // Obtener todos los tipos
      const planVentasData = await getDataByType(connection, 'planVentas', params);
      if (planVentasData) results.push(planVentasData);

      const existenciasData = await getDataByType(connection, 'existencias', params);
      if (existenciasData) results.push(existenciasData);

      const coberturaData = await getDataByType(connection, 'cobertura', params);
      if (coberturaData) results.push(coberturaData);
    }

    return results;

  } catch (error) {
    console.error('❌ Error obteniendo datos específicos:', error);
    throw error;
  }
}

// Función para obtener datos por tipo
async function getDataByType(
  connection: mysql.Connection,
  tipo: 'planVentas' | 'existencias' | 'cobertura',
  params: QueryParams
): Promise<CargaInsumosData | null> {
  console.log(`📊 Obteniendo datos de tipo: ${tipo}`);

  try {
    let tableName: string;
    let selectFields: string;
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Configurar consulta según el tipo
    switch (tipo) {
      case 'planVentas':
        tableName = 'plan_ventas';
        selectFields = `
          ssour, vrsio, spmon, sptag, spwoc, spbup,
          pmnux, wenux, vsnda, periv, vwdat, basme,
          absat, produ, lagri, lagrz, reich, reicz,
          document_id, batch_id, file_name, created_at
        `;
        break;

      case 'existencias':
        tableName = 'existencias';
        selectFields = `
          version, centro, almacen, material, periodo, mes,
          libre_u, no_liberado, bloqueado, devolucion,
          traslados, calidad, bloqueado_em,
          document_id, batch_id, file_name, created_at
        `;
        break;

      case 'cobertura':
        tableName = 'cobertura';
        selectFields = `
          version, centro, periodo, mes,
          dias_habiles_mes_planta, dias_coberturas_mes, dias_habiles_venta,
          document_id, batch_id, file_name, created_at
        `;
        break;

      default:
        throw new Error(`Tipo no soportado: ${tipo}`);
    }

    // Construir condiciones WHERE
    if (params.documentId) {
      whereConditions.push('document_id = ?');
      queryParams.push(params.documentId);
    }

    if (params.batchId) {
      whereConditions.push('batch_id = ?');
      queryParams.push(params.batchId);
    }

    // Construir consulta
    let query = `SELECT ${selectFields} FROM ${tableName}`;
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    query += ` ORDER BY created_at DESC`;

    // Aplicar límite y offset
    if (params.limit) {
      query += ` LIMIT ${params.limit}`;
      if (params.offset) {
        query += ` OFFSET ${params.offset}`;
      }
    }

    console.log(`🔍 Ejecutando consulta: ${query}`);
    console.log(`🔍 Parámetros:`, queryParams);

    const [rows] = await connection.execute(query, queryParams);
    const data = rows as any[];

    if (data.length === 0) {
      console.log(`📭 No se encontraron datos para tipo: ${tipo}`);
      return null;
    }

    // Obtener metadatos del primer registro
    const firstRecord = data[0];
    const metadata = {
      documentId: firstRecord.document_id,
      batchId: firstRecord.batch_id,
      fileName: firstRecord.file_name || 'Sin nombre',
      loadedAt: firstRecord.created_at,
      totalRecords: data.length
    };

    // Limpiar datos (remover campos de metadatos)
    const cleanData = data.map(record => {
      const { document_id, batch_id, file_name, created_at, ...cleanRecord } = record;
      return cleanRecord;
    });

    // Obtener información adicional de batches
    const [batchInfo] = await connection.execute(`
      SELECT COUNT(DISTINCT batch_id) as batches_count,
             MAX(created_at) as last_loaded
      FROM ${tableName}
      WHERE document_id = ?
    `, [firstRecord.document_id]);

    const batchData = (batchInfo as any[])[0];

    console.log(`✅ Obtenidos ${data.length} registros de tipo: ${tipo}`);

    return {
      tipo,
      data: cleanData,
      metadata,
      summary: {
        totalRecords: data.length,
        batchesCount: batchData.batches_count || 1,
        lastLoaded: batchData.last_loaded || metadata.loadedAt
      }
    };

  } catch (error) {
    console.error(`❌ Error obteniendo datos de tipo ${tipo}:`, error);
    throw error;
  }
}
