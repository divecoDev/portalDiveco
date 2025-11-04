import sql from 'mssql';

interface MaterialPorCentro {
  centroId: string;
  materialId: string;
  [key: string]: any; // Para campos adicionales de v_MaterialesUnificados
}

interface MaterialesPorCentroRequest {
  page?: number;
  limit?: number;
  search?: string;
}

interface MaterialesPorCentroResponse {
  materiales: MaterialPorCentro[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const handler = async (event: any): Promise<MaterialesPorCentroResponse> => {
  console.log('🔍 Iniciando consulta de materiales por centro desde MSSQL');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));

  // Parsear parámetros de paginación
  let requestParams: MaterialesPorCentroRequest = {};
  
  if (event.arguments) {
    requestParams = event.arguments;
  } else if (typeof event.body === 'string') {
    requestParams = JSON.parse(event.body);
  } else {
    requestParams = event;
  }

  // Valores por defecto para paginación
  const page = Math.max(1, requestParams.page || 1);
  const limit = Math.min(1000, Math.max(1, requestParams.limit || 1000));
  const offset = (page - 1) * limit;
  const search = requestParams.search?.trim() || '';

  console.log(`📋 Parámetros de paginación: page=${page}, limit=${limit}, offset=${offset}`);
  console.log(`📋 Parámetro de búsqueda: "${search}"`);

  const mssqlUser = 'divecoadm';
  const mssqlPassword = 'J$YSAc@@gm44ExB';
  const mssqlServer =  'divecosqlserver.database.windows.net';
  const mssqlDatabase = 'STGDiveco';
  
  // Logs para verificar variables de entorno
  console.log('🔧 Configuración MSSQL:');
  console.log(`  - Server: ${mssqlServer}`);
  console.log(`  - Database: ${mssqlDatabase}`);
  console.log(`  - User: ${mssqlUser}`);
  console.log(`  - Password: ${mssqlPassword ? '***' + mssqlPassword.slice(-3) : 'NOT SET'}`);
  console.log(`  - MSSQL_SERVER desde env: ${process.env.MSSQL_SERVER ? 'SET' : 'NOT SET'}`);
  console.log(`  - MSSQL_USER desde env: ${process.env.MSSQL_USER ? 'SET' : 'NOT SET'}`);
  console.log(`  - MSSQL_DATABASE desde env: ${process.env.MSSQL_DATABASE ? 'SET' : 'NOT SET'}`);
  
  const mssqlConfig = {
    user: mssqlUser,
    password: mssqlPassword,
    server: mssqlServer,
    database: mssqlDatabase,
    options: {
      encrypt: true,
    },
  };

  try {
    // Conectar a MSSQL
    console.log('🔌 Conectando a MSSQL...');
    const mssqlPool = new sql.ConnectionPool(mssqlConfig);
    await mssqlPool.connect();
    console.log('✅ Conexión a MSSQL establecida');

    try {
      // Construir condiciones WHERE dinámicas
      let whereConditions = `mp.Centro_Id IN ('1100', '1111', '1700', '1800', '1801', '1900', '2000')`;
      
      // Verificar si la búsqueda es numérica (probablemente material ID sin ceros)
      const isNumericSearch = search ? /^\d+$/.test(search) : false;
      
      // Si hay búsqueda, agregar condiciones
      if (search) {
        // La búsqueda puede ser por material ID (sin ceros iniciales) o descripción
        const searchPattern = `%${search}%`;
        
        whereConditions += `
          AND (
            -- Buscar en material ID sin ceros iniciales (comparación numérica)
            ${isNumericSearch ? `CAST(mp.Material_Id AS BIGINT) = CAST(@search AS BIGINT) OR` : ''}
            -- Buscar en material ID completo (con ceros)
            mp.Material_Id LIKE @searchPattern
            -- Buscar en descripciones
            OR v.Descripcion_Material LIKE @searchPattern
            OR v.Descripcion_Marca LIKE @searchPattern
            OR v.Descripcion_Modelo LIKE @searchPattern
            OR v.Descripcion_Presentacion LIKE @searchPattern
            OR v.Descripcion_Color LIKE @searchPattern
            OR v.Descripcion_Segmento LIKE @searchPattern
            OR v.Descripcion_Linea LIKE @searchPattern
          )
        `;
      }

      // Primero obtener el total de registros
      console.log('📊 Obteniendo total de registros...');
      const countQuery = `
        SELECT COUNT(*) as total
        FROM Silver.MaterialPlanta as mp
        INNER JOIN [Silver].[v_MaterialesUnificados] as v 
          ON mp.Material_Id = v.Material_Id
        WHERE ${whereConditions}
      `;
      
      const countStartTime = Date.now();
      let countRequest = mssqlPool.request();
      if (search) {
        countRequest = countRequest.input('searchPattern', sql.NVarChar, `%${search}%`);
        if (isNumericSearch) {
          countRequest = countRequest.input('search', sql.BigInt, BigInt(search));
        } else {
          countRequest = countRequest.input('search', sql.NVarChar, search);
        }
      }
      const countResult = await countRequest.query(countQuery);
      const total = countResult.recordset[0]?.total || 0;
      const countExecutionTime = Date.now() - countStartTime;
      console.log(`📊 Total de registros: ${total} (${countExecutionTime}ms)`);

      // Ejecutar consulta SQL con paginación
      console.log('📖 Ejecutando consulta de materiales por centro con paginación...');
      
      const query = `
        SELECT mp.Centro_Id, v.*
        FROM Silver.MaterialPlanta as mp
        INNER JOIN [Silver].[v_MaterialesUnificados] as v 
          ON mp.Material_Id = v.Material_Id
        WHERE ${whereConditions}
        ORDER BY mp.Material_Id, Centro_Id
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const startTime = Date.now();
      let request = mssqlPool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit);
      
      if (search) {
        request = request.input('searchPattern', sql.NVarChar, `%${search}%`);
        if (isNumericSearch) {
          request = request.input('search', sql.BigInt, BigInt(search));
        } else {
          request = request.input('search', sql.NVarChar, search);
        }
      }
      
      const result = await request.query(query);
      const executionTime = Date.now() - startTime;
      
      console.log(`⏱️ Tiempo de ejecución de la consulta: ${executionTime}ms`);
      console.log(`📊 Resultado SQL - Tipo: ${typeof result}`);
      console.log(`📊 Resultado SQL - Recordset existe: ${!!result.recordset}`);
      console.log(`📊 Resultado SQL - Total de registros: ${result.recordset?.length || 0}`);
      
      // Log de la estructura del primer registro (solo si hay registros)
      if (result.recordset && result.recordset.length > 0) {
        const firstRecord = result.recordset[0];
        console.log(`📋 Estructura del primer registro:`, JSON.stringify(Object.keys(firstRecord), null, 2));
        // Solo log del primer registro para no consumir memoria innecesaria
        console.log(`📋 Primer registro completo:`, JSON.stringify(firstRecord, null, 2));
      } else {
        console.log(`⚠️ Recordset vacío o sin datos`);
      }

      // Mapear resultados de forma optimizada
      console.log(`🔄 Iniciando mapeo de ${result.recordset.length} registros...`);
      const startMapping = Date.now();
      
      const materiales: MaterialPorCentro[] = [];
      const recordset = result.recordset || [];
      
      // Procesar registros
      for (let i = 0; i < recordset.length; i++) {
        const record = recordset[i];
        const material: MaterialPorCentro = {
          centroId: record.Centro_Id?.toString() || '',
          materialId: record.Material_Id?.toString() || '',
        };
        
        // Agregar todos los demás campos de la vista de forma eficiente
        for (const key in record) {
          if (key !== 'Centro_Id' && key !== 'Material_Id') {
            const value = record[key];
            if (value === null || value === undefined) {
              material[key] = '';
            } else if (typeof value === 'number') {
              material[key] = value;
            } else {
              material[key] = value.toString();
            }
          }
        }
        
        materiales.push(material);
      }
      
      const mappingTime = Date.now() - startMapping;
      console.log(`✅ ${materiales.length} materiales por centro encontrados`);
      console.log(`⏱️ Tiempo de mapeo: ${mappingTime}ms`);
      
      // Calcular información de paginación
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      // Log del resumen final
      console.log(`📊 RESUMEN FINAL:`);
      console.log(`  - Materiales por centro: ${materiales.length} registros`);
      console.log(`  - Total de registros: ${total}`);
      console.log(`  - Página: ${page} de ${totalPages}`);
      console.log(`  - Tiempo total: ${executionTime}ms`);

      return {
        materiales,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        }
      };

    } finally {
      console.log('🔌 Cerrando conexión a MSSQL...');
      await mssqlPool.close();
      console.log('✅ Conexión a MSSQL cerrada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error en consulta de materiales por centro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`❌ Detalle del error: ${errorMessage}`);
    
    // Retornar estructura vacía en caso de error, no lanzar excepción
    return {
      materiales: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    };
  }
};

