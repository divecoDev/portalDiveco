import mysql from "mysql2/promise";

interface DeleteBatchRequest {
  documentId: string;
}

interface DeleteBatchResponse {
  success: boolean;
  documentId: string;
  deletedRecords: {
    planVentas: number;
    existencias: number;
    cobertura: number;
    total: number;
  };
  message: string;
  errors?: any[];
}

export const handler = async (event: any): Promise<DeleteBatchResponse> => {
  console.log('🗑️ Iniciando eliminación de datos de Carga de Insumos (MySQL)');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));

  // Configuración de MySQL
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

  try {
    // Parsear los datos del evento
    let body: DeleteBatchRequest;

    // Para Amplify Gen 2, el evento viene con la estructura { arguments: { documentId } }
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

    // Validaciones básicas
    if (!body.documentId) {
      throw new Error('documentId es requerido');
    }

    console.log(`🔖 Document ID a eliminar: ${body.documentId}`);

    // Conectar a MySQL
    console.log('🔌 Conectando a MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');

    const deletedRecords = {
      planVentas: 0,
      existencias: 0,
      cobertura: 0,
      total: 0
    };

    try {
      // Iniciar transacción
      await connection.beginTransaction();
      console.log('🔄 Transacción iniciada');

      // Eliminar Plan de Ventas
      console.log('🗑️ Eliminando registros de Plan de Ventas...');
      const [planVentasResult] = await connection.execute(
        'DELETE FROM plan_ventas WHERE document_id = ?',
        [body.documentId]
      ) as any;
      deletedRecords.planVentas = planVentasResult.affectedRows || 0;
      console.log(`✅ Plan de Ventas: ${deletedRecords.planVentas} registros eliminados`);

      // Eliminar Existencias
      console.log('🗑️ Eliminando registros de Existencias...');
      const [existenciasResult] = await connection.execute(
        'DELETE FROM existencias WHERE document_id = ?',
        [body.documentId]
      ) as any;
      deletedRecords.existencias = existenciasResult.affectedRows || 0;
      console.log(`✅ Existencias: ${deletedRecords.existencias} registros eliminados`);

      // Eliminar Cobertura
      console.log('🗑️ Eliminando registros de Cobertura...');
      const [coberturaResult] = await connection.execute(
        'DELETE FROM cobertura WHERE document_id = ?',
        [body.documentId]
      ) as any;
      deletedRecords.cobertura = coberturaResult.affectedRows || 0;
      console.log(`✅ Cobertura: ${deletedRecords.cobertura} registros eliminados`);

      // Calcular total
      deletedRecords.total = deletedRecords.planVentas + deletedRecords.existencias + deletedRecords.cobertura;

      // Confirmar transacción
      await connection.commit();
      console.log('✅ Transacción confirmada');

      console.log(`🎉 Eliminación completada: ${deletedRecords.total} registros eliminados en total`);

      return {
        success: true,
        documentId: body.documentId,
        deletedRecords,
        message: `Se eliminaron ${deletedRecords.total} registros exitosamente`
      };

    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      console.error('❌ Transacción revertida debido a error');
      throw error;
    } finally {
      // Cerrar conexión
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error eliminando datos:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return {
      success: false,
      documentId: event.documentId || event.arguments?.documentId || 'unknown',
      deletedRecords: {
        planVentas: 0,
        existencias: 0,
        cobertura: 0,
        total: 0
      },
      errors: [errorMessage],
      message: `Error eliminando datos: ${errorMessage}`
    };
  }
};

