import mysql from "mysql2/promise";

interface Aprovisionamiento {
  centroIdOrigen: number;
  materialId: number;
  centroIdAprov: number;
  porcentaje: number;
}

interface AprovisionamientoResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

export const handler = async (event: any): Promise<AprovisionamientoResponse> => {
  console.log('🚀 Iniciando operación CRUD de Aprovisionamiento');
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
    // Parsear los datos del evento
    let body: any;
    if (event.arguments) {
      body = event.arguments;
    } else if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event;
    }

    console.log('🔍 Body parseado:', JSON.stringify(body, null, 2));
    console.log('🔍 Tipo de body:', typeof body);
    console.log('🔍 Keys de body:', Object.keys(body || {}));

    // Conectar a MySQL
    console.log('🔌 Conectando a MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');
    
    // Verificar conexión con una consulta simple
    try {
      const [testResult] = await connection.execute('SELECT 1 as test');
      console.log('✅ Test de conexión exitoso:', testResult);
    } catch (testError) {
      console.error('❌ Error en test de conexión:', testError);
      throw new Error(`Error en test de conexión: ${testError instanceof Error ? testError.message : 'Error desconocido'}`);
    }

    let result: AprovisionamientoResponse;

    try {
      // Determinar la operación basada en los argumentos
      const operation = body.operation || 'list';
      
      switch (operation) {
        case 'list':
          result = await listAprovisionamientos(connection, body);
          break;
        case 'create':
          result = await createAprovisionamiento(connection, body);
          break;
        case 'bulkCreate':
          result = await bulkCreateAprovisionamiento(connection, body);
          break;
        case 'update':
          result = await updateAprovisionamiento(connection, body);
          break;
        case 'delete':
          result = await deleteAprovisionamiento(connection, body);
          break;
        case 'deleteAll':
          result = await deleteAllAprovisionamiento(connection, body);
          break;
        case 'get':
          result = await getAprovisionamiento(connection, body);
          break;
        default:
          throw new Error(`Operación no soportada: ${operation}`);
      }
    } finally {
      // Cerrar conexión
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

    console.log(`✅ Operación ${body.operation} completada exitosamente`);
    return result;

  } catch (error) {
    console.error('❌ Error en operación CRUD:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      success: false,
      message: `Error en operación CRUD: ${errorMessage}`,
      error: errorMessage
    };
  }
};

// Listar todos los aprovisionamientos
async function listAprovisionamientos(connection: mysql.Connection, body: any): Promise<AprovisionamientoResponse> {
  console.log('📋 Listando aprovisionamientos...');
  
  try {
    console.log('🔍 Body recibido en listAprovisionamientos:', JSON.stringify(body, null, 2));
    
    const { limit, offset, search } = body;
    
    // Convertir parámetros a números enteros con validación más robusta
    const limitNum = limit !== undefined && limit !== null ? parseInt(String(limit)) : 100;
    const offsetNum = offset !== undefined && offset !== null ? parseInt(String(offset)) : 0;
    const searchStr = search ? String(search).trim() : '';
    
    // Validar que los números sean válidos
    if (isNaN(limitNum) || limitNum < 0) {
      throw new Error(`Invalid limit parameter: ${limit}`);
    }
    if (isNaN(offsetNum) || offsetNum < 0) {
      throw new Error(`Invalid offset parameter: ${offset}`);
    }
    
    console.log('🔍 Parámetros procesados:', { limitNum, offsetNum, searchStr });
    
    // Verificar si la tabla existe y crearla si no existe
    try {
      const [tableCheck] = await connection.execute('SHOW TABLES LIKE "aprovisionamiento"');
      console.log('🔍 Verificación de tabla:', tableCheck);
      
      if (Array.isArray(tableCheck) && tableCheck.length === 0) {
        console.log('⚠️ La tabla "aprovisionamiento" no existe, creándola...');
        
        const createTableQuery = `
          CREATE TABLE aprovisionamiento (
            centro_id_origen INT NOT NULL COMMENT 'Identificador del centro de origen o suministro.',
            material_id INT NOT NULL COMMENT 'Identificador del material o producto.',
            centro_id_aprov INT NOT NULL COMMENT 'Identificador del centro de aprovisionamiento o destino.',
            porcentaje DECIMAL(5, 2) NOT NULL COMMENT 'Porcentaje de asignación (ej. 100.00).',
            PRIMARY KEY (centro_id_origen, material_id, centro_id_aprov)
          ) ENGINE=InnoDB COMMENT='Tabla de aprovisionamiento entre centros'
        `;
        
        await connection.execute(createTableQuery);
        console.log('✅ Tabla "aprovisionamiento" creada exitosamente');
        
        // Insertar algunos datos de prueba
        const insertTestData = `
          INSERT IGNORE INTO aprovisionamiento (centro_id_origen, material_id, centro_id_aprov, porcentaje) VALUES
          (1001, 12345, 2001, 100.00),
          (1001, 12346, 2001, 75.00),
          (1001, 12346, 2002, 25.00),
          (1002, 12345, 2001, 50.00),
          (1002, 12345, 2002, 50.00)
        `;
        
        await connection.execute(insertTestData);
        console.log('✅ Datos de prueba insertados');
      }
      
      // Verificar la estructura de la tabla
      const [tableStructure] = await connection.execute('DESCRIBE aprovisionamiento');
      console.log('🔍 Estructura de la tabla aprovisionamiento:', tableStructure);
      
      // Verificar si la columna porcentaje necesita ser actualizada
      const porcentajeColumn = (tableStructure as any[]).find(col => col.Field === 'porcentaje');
      if (porcentajeColumn && (porcentajeColumn.Type === 'decimal(5,3)' || porcentajeColumn.Type === 'decimal(6,3)')) {
        console.log(`⚠️ Actualizando tipo de columna porcentaje de ${porcentajeColumn.Type} a DECIMAL(5,2)...`);
        await connection.execute('ALTER TABLE aprovisionamiento MODIFY COLUMN porcentaje DECIMAL(5,2) NOT NULL COMMENT \'Porcentaje de asignación (ej. 100.00).\'');
        console.log('✅ Columna porcentaje actualizada exitosamente');
      }
      
    } catch (tableError) {
      console.error('❌ Error verificando/creando tabla:', tableError);
      throw new Error(`Error verificando/creando tabla: ${tableError instanceof Error ? tableError.message : 'Error desconocido'}`);
    }
    
    let query = `
      SELECT 
        centro_id_origen as centroIdOrigen,
        material_id as materialId,
        centro_id_aprov as centroIdAprov,
        porcentaje as porcentaje
      FROM aprovisionamiento
    `;
    
    const params: any[] = [];
    
    if (searchStr) {
      query += ` WHERE 
        centro_id_origen LIKE ? OR 
        material_id LIKE ? OR 
        centro_id_aprov LIKE ?`;
      params.push(`%${searchStr}%`, `%${searchStr}%`, `%${searchStr}%`);
    }
    
    // Construir LIMIT y OFFSET directamente sin parámetros preparados
    // para evitar el error "Incorrect arguments to mysqld_stmt_execute"
    query += ` ORDER BY centro_id_origen, material_id, centro_id_aprov LIMIT ${limitNum} OFFSET ${offsetNum}`;
    
    console.log('🔍 Query final:', query);
    console.log('🔍 Params finales:', params);
    console.log('🔍 Tipos de params:', params.map(p => typeof p));
    
    let rows;
    try {
      // Usar query() cuando no hay parámetros preparados, execute() cuando sí los hay
      if (params.length > 0) {
        [rows] = await connection.execute(query, params);
      } else {
        [rows] = await connection.query(query);
      }
      console.log('✅ Query ejecutada exitosamente, filas obtenidas:', Array.isArray(rows) ? rows.length : 'N/A');
    } catch (queryError) {
      console.error('❌ Error ejecutando query principal:', queryError);
      console.error('❌ Query que falló:', query);
      console.error('❌ Params que fallaron:', params);
      throw queryError;
    }
    
    // Obtener el total de registros
    let countQuery = `SELECT COUNT(*) as total FROM aprovisionamiento`;
    const countParams: any[] = [];
    
    if (searchStr) {
      countQuery += ` WHERE 
        centro_id_origen LIKE ? OR 
        material_id LIKE ? OR 
        centro_id_aprov LIKE ?`;
      countParams.push(`%${searchStr}%`, `%${searchStr}%`, `%${searchStr}%`);
    }
    
    console.log('🔍 Count Query:', countQuery);
    console.log('🔍 Count Params:', countParams);
    
    let countRows;
    try {
      // Usar query() cuando no hay parámetros preparados, execute() cuando sí los hay
      if (countParams.length > 0) {
        [countRows] = await connection.execute(countQuery, countParams);
      } else {
        [countRows] = await connection.query(countQuery);
      }
      console.log('✅ Count query ejecutada exitosamente');
    } catch (countError) {
      console.error('❌ Error ejecutando count query:', countError);
      console.error('❌ Count query que falló:', countQuery);
      console.error('❌ Count params que fallaron:', countParams);
      throw countError;
    }
    
    const total = (countRows as any[])[0].total;
    
    console.log('🔍 Total registros encontrados:', total);
    
    return {
      success: true,
      data: {
        items: rows,
        total,
        limit: limitNum,
        offset: offsetNum
      },
      message: `Se encontraron ${total} aprovisionamientos`
    };
    
  } catch (error) {
    console.error('❌ Error listando aprovisionamientos:', error);
    throw new Error(`Error listando aprovisionamientos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Crear un nuevo aprovisionamiento
async function createAprovisionamiento(connection: mysql.Connection, body: any): Promise<AprovisionamientoResponse> {
  console.log('➕ Creando nuevo aprovisionamiento...');
  
  try {
    const { centroIdOrigen, materialId, centroIdAprov, porcentaje } = body;
    
    // Convertir parámetros a números
    const centroIdOrigenNum = parseInt(centroIdOrigen);
    const materialIdNum = parseInt(materialId);
    const centroIdAprovNum = parseInt(centroIdAprov);
    const porcentajeNum = parseFloat(porcentaje);
    
    // Validaciones
    if (!centroIdOrigenNum || !materialIdNum || !centroIdAprovNum || isNaN(porcentajeNum)) {
      throw new Error('Todos los campos son requeridos: centroIdOrigen, materialId, centroIdAprov, porcentaje');
    }
    
    if (porcentajeNum < 0 || porcentajeNum > 100) {
      throw new Error('El porcentaje debe estar entre 0 y 100');
    }
    
    const query = `
      INSERT INTO aprovisionamiento 
      (centro_id_origen, material_id, centro_id_aprov, porcentaje) 
      VALUES (?, ?, ?, ?)
    `;
    
    const params = [centroIdOrigenNum, materialIdNum, centroIdAprovNum, porcentajeNum];
    
    console.log('🔍 Query:', query);
    console.log('🔍 Params:', params);
    
    const [result] = await connection.execute(query, params);
    
    return {
      success: true,
      data: {
        centroIdOrigen: centroIdOrigenNum,
        materialId: materialIdNum,
        centroIdAprov: centroIdAprovNum,
        porcentaje: porcentajeNum
      },
      message: 'Aprovisionamiento creado exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error creando aprovisionamiento:', error);
    
    // Verificar si es error de clave duplicada
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      throw new Error('Ya existe un aprovisionamiento para esta combinación de centro origen, material y centro de aprovisionamiento');
    }
    
    throw new Error(`Error creando aprovisionamiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Crear múltiples aprovisionamientos (carga masiva)
async function bulkCreateAprovisionamiento(connection: mysql.Connection, body: any): Promise<AprovisionamientoResponse> {
  console.log('➕ Creando aprovisionamientos masivos...');
  
  try {
    const { data } = body;
    
    // Parsear datos si vienen como string
    let parsedData;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        throw new Error('Error al parsear los datos JSON');
      }
    } else {
      parsedData = data;
    }
    
    // Validar que sea un array
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      throw new Error('Los datos deben ser un array con al menos un registro');
    }
    
    console.log(`📊 Total de registros a procesar: ${parsedData.length}`);
    
    // Validar y preparar los datos
    const validRecords: Aprovisionamiento[] = [];
    const invalidRecords: any[] = [];
    
    parsedData.forEach((record, index) => {
      try {
        const centroIdOrigenNum = parseInt(record.centroIdOrigen);
        const materialIdNum = parseInt(record.materialId);
        const centroIdAprovNum = parseInt(record.centroIdAprov);
        const porcentajeNum = parseFloat(record.porcentaje);
        
        // Validaciones
        if (!centroIdOrigenNum || !materialIdNum || !centroIdAprovNum || isNaN(porcentajeNum)) {
          invalidRecords.push({ index: index + 1, error: 'Campos requeridos faltantes o inválidos', record });
          return;
        }
        
        if (porcentajeNum < 0 || porcentajeNum > 100) {
          invalidRecords.push({ index: index + 1, error: 'El porcentaje debe estar entre 0 y 100', record });
          return;
        }
        
        validRecords.push({
          centroIdOrigen: centroIdOrigenNum,
          materialId: materialIdNum,
          centroIdAprov: centroIdAprovNum,
          porcentaje: porcentajeNum
        });
      } catch (error) {
        invalidRecords.push({ index: index + 1, error: error instanceof Error ? error.message : 'Error desconocido', record });
      }
    });
    
    console.log(`✅ Registros válidos: ${validRecords.length}`);
    console.log(`❌ Registros inválidos: ${invalidRecords.length}`);
    
    if (validRecords.length === 0) {
      throw new Error('No hay registros válidos para insertar');
    }
    
    // Insertar registros usando INSERT IGNORE para evitar errores de duplicados
    const values = validRecords.map(record => 
      `(${record.centroIdOrigen}, ${record.materialId}, ${record.centroIdAprov}, ${record.porcentaje})`
    ).join(', ');
    
    const query = `
      INSERT IGNORE INTO aprovisionamiento 
      (centro_id_origen, material_id, centro_id_aprov, porcentaje) 
      VALUES ${values}
    `;
    
    console.log('🔍 Ejecutando query de inserción masiva...');
    
    const [result] = await connection.execute(query);
    const affectedRows = (result as any).affectedRows;
    
    console.log(`✅ Registros insertados: ${affectedRows}`);
    
    // Calcular duplicados (registros que no se insertaron)
    const duplicates = validRecords.length - affectedRows;
    
    return {
      success: true,
      data: {
        total: parsedData.length,
        valid: validRecords.length,
        invalid: invalidRecords.length,
        inserted: affectedRows,
        duplicates: duplicates,
        invalidRecords: invalidRecords.length > 0 ? invalidRecords.slice(0, 10) : [] // Solo los primeros 10 para no sobrecargar la respuesta
      },
      message: `Carga masiva completada: ${affectedRows} registros insertados, ${duplicates} duplicados ignorados, ${invalidRecords.length} registros inválidos`
    };
    
  } catch (error) {
    console.error('❌ Error en carga masiva:', error);
    throw new Error(`Error en carga masiva: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Actualizar un aprovisionamiento
async function updateAprovisionamiento(connection: mysql.Connection, body: any): Promise<AprovisionamientoResponse> {
  console.log('✏️ Actualizando aprovisionamiento...');
  
  try {
    const { centroIdOrigen, materialId, centroIdAprov, porcentaje } = body;
    
    // Convertir parámetros a números
    const centroIdOrigenNum = parseInt(centroIdOrigen);
    const materialIdNum = parseInt(materialId);
    const centroIdAprovNum = parseInt(centroIdAprov);
    const porcentajeNum = parseFloat(porcentaje);
    
    // Validaciones
    if (!centroIdOrigenNum || !materialIdNum || !centroIdAprovNum || isNaN(porcentajeNum)) {
      throw new Error('Todos los campos son requeridos: centroIdOrigen, materialId, centroIdAprov, porcentaje');
    }
    
    if (porcentajeNum < 0 || porcentajeNum > 100) {
      throw new Error('El porcentaje debe estar entre 0 y 100');
    }
    
    const query = `
      UPDATE aprovisionamiento 
      SET porcentaje = ? 
      WHERE centro_id_origen = ? AND material_id = ? AND centro_id_aprov = ?
    `;
    
    const params = [porcentajeNum, centroIdOrigenNum, materialIdNum, centroIdAprovNum];
    
    console.log('🔍 Query:', query);
    console.log('🔍 Params:', params);
    
    const [result] = await connection.execute(query, params);
    const affectedRows = (result as any).affectedRows;
    
    if (affectedRows === 0) {
      throw new Error('No se encontró el aprovisionamiento para actualizar');
    }
    
    return {
      success: true,
      data: {
        centroIdOrigen: centroIdOrigenNum,
        materialId: materialIdNum,
        centroIdAprov: centroIdAprovNum,
        porcentaje: porcentajeNum
      },
      message: 'Aprovisionamiento actualizado exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error actualizando aprovisionamiento:', error);
    throw new Error(`Error actualizando aprovisionamiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Eliminar un aprovisionamiento
async function deleteAprovisionamiento(connection: mysql.Connection, body: any): Promise<AprovisionamientoResponse> {
  console.log('🗑️ Eliminando aprovisionamiento...');
  
  try {
    const { centroIdOrigen, materialId, centroIdAprov } = body;
    
    // Convertir parámetros a números
    const centroIdOrigenNum = parseInt(centroIdOrigen);
    const materialIdNum = parseInt(materialId);
    const centroIdAprovNum = parseInt(centroIdAprov);
    
    // Validaciones
    if (!centroIdOrigenNum || !materialIdNum || !centroIdAprovNum) {
      throw new Error('Todos los campos de clave son requeridos: centroIdOrigen, materialId, centroIdAprov');
    }
    
    const query = `
      DELETE FROM aprovisionamiento 
      WHERE centro_id_origen = ? AND material_id = ? AND centro_id_aprov = ?
    `;
    
    const params = [centroIdOrigenNum, materialIdNum, centroIdAprovNum];
    
    console.log('🔍 Query:', query);
    console.log('🔍 Params:', params);
    
    const [result] = await connection.execute(query, params);
    const affectedRows = (result as any).affectedRows;
    
    if (affectedRows === 0) {
      throw new Error('No se encontró el aprovisionamiento para eliminar');
    }
    
    return {
      success: true,
      data: {
        centroIdOrigen: centroIdOrigenNum,
        materialId: materialIdNum,
        centroIdAprov: centroIdAprovNum
      },
      message: 'Aprovisionamiento eliminado exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error eliminando aprovisionamiento:', error);
    throw new Error(`Error eliminando aprovisionamiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Eliminar TODOS los aprovisionamientos
async function deleteAllAprovisionamiento(connection: mysql.Connection, body: any): Promise<AprovisionamientoResponse> {
  console.log('🗑️ Eliminando TODOS los aprovisionamientos...');
  
  try {
    // Primero obtener el conteo de registros que se van a eliminar
    const countQuery = 'SELECT COUNT(*) as total FROM aprovisionamiento';
    const [countRows] = await connection.execute(countQuery);
    const totalRecords = (countRows as any[])[0].total;
    
    console.log(`⚠️ Se eliminarán ${totalRecords} registros`);
    
    // Eliminar todos los registros
    const query = 'DELETE FROM aprovisionamiento';
    
    console.log('🔍 Query:', query);
    
    const [result] = await connection.execute(query);
    const affectedRows = (result as any).affectedRows;
    
    console.log(`✅ Registros eliminados: ${affectedRows}`);
    
    return {
      success: true,
      data: {
        deletedCount: affectedRows
      },
      message: `Se eliminaron ${affectedRows} registros de aprovisionamiento exitosamente`
    };
    
  } catch (error) {
    console.error('❌ Error eliminando todos los aprovisionamientos:', error);
    throw new Error(`Error eliminando todos los aprovisionamientos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Obtener un aprovisionamiento específico
async function getAprovisionamiento(connection: mysql.Connection, body: any): Promise<AprovisionamientoResponse> {
  console.log('🔍 Obteniendo aprovisionamiento específico...');
  
  try {
    const { centroIdOrigen, materialId, centroIdAprov } = body;
    
    // Convertir parámetros a números
    const centroIdOrigenNum = parseInt(centroIdOrigen);
    const materialIdNum = parseInt(materialId);
    const centroIdAprovNum = parseInt(centroIdAprov);
    
    // Validaciones
    if (!centroIdOrigenNum || !materialIdNum || !centroIdAprovNum) {
      throw new Error('Todos los campos de clave son requeridos: centroIdOrigen, materialId, centroIdAprov');
    }
    
    const query = `
      SELECT 
        centro_id_origen as centroIdOrigen,
        material_id as materialId,
        centro_id_aprov as centroIdAprov,
        porcentaje as porcentaje
      FROM aprovisionamiento 
      WHERE centro_id_origen = ? AND material_id = ? AND centro_id_aprov = ?
    `;
    
    const params = [centroIdOrigenNum, materialIdNum, centroIdAprovNum];
    
    console.log('🔍 Query:', query);
    console.log('🔍 Params:', params);
    
    const [rows] = await connection.execute(query, params);
    const items = rows as any[];
    
    if (items.length === 0) {
      throw new Error('No se encontró el aprovisionamiento');
    }
    
    return {
      success: true,
      data: items[0],
      message: 'Aprovisionamiento obtenido exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo aprovisionamiento:', error);
    throw new Error(`Error obteniendo aprovisionamiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

