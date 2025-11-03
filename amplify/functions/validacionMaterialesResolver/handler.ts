import sql from 'mssql';

interface ValidacionMaterialesRequest {
  version: string;
}

interface MaterialSinAprovisionamiento {
  centroId: string;
  materialId: string;
  descripcionMaterial: string;
  marca: string;
  presentacion: string;
  modelo: string;
  tamano: string;
  color: string;
  segmento: string;
  linea: string;
}

interface PlanVentasSinCentro {
  anio: number;
  mes: number;
  centroDeVenta: string;
  materialId: string;
  descripcionMaterial: string;
  cantidadVentas: number;
  marca: string;
  presentacion: string;
  modelo: string;
  linea: string;
  segmento: string;
}

interface ValidacionMaterialesResponse {
  materialesSinAprovisionamiento: MaterialSinAprovisionamiento[];
  planVentasSinCentro: PlanVentasSinCentro[];
}

export const handler = async (event: any): Promise<ValidacionMaterialesResponse> => {
  console.log('🔍 Iniciando validación de materiales desde MSSQL');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));

  // Configuración de MSSQL
  const mssqlUser = 'divecoadm';
  const mssqlPassword = 'J$YSAc@@gm44ExB';
  const mssqlServer =  'divecosqlserver.database.windows.net';
  const mssqlDatabase = 'STGDiveco';
  
  // Logs para verificar variables de entorno (sin mostrar password completo)
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
    // Parsear los datos del evento
    let body: ValidacionMaterialesRequest;

    if (event.arguments) {
      body = event.arguments;
    } else if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event;
    }

    console.log(`📋 Versión: ${body.version}`);

    // Validaciones básicas
    if (!body.version) {
      throw new Error('version es requerido');
    }

    const version = body.version;

    // Conectar a MSSQL
    console.log('🔌 Conectando a MSSQL...');
    const mssqlPool = new sql.ConnectionPool(mssqlConfig);
    await mssqlPool.connect();
    console.log('✅ Conexión a MSSQL establecida');

    try {
      // Ejecutar stored procedure 1: MaterialesSinAprovisionamiento
      console.log('📖 Ejecutando sp_check_MaterialesSinAprovisionamiento...');
      console.log(`📋 Parámetro @PVersion: "${version}"`);
      
      const startTime1 = Date.now();
      const result1 = await mssqlPool.request()
        .input('PVersion', sql.VarChar, version)
        .execute('[Silver].[sp_check_MaterialesSinAprovisionamiento]');
      const executionTime1 = Date.now() - startTime1;
      
      console.log(`⏱️ Tiempo de ejecución del SP: ${executionTime1}ms`);
      console.log(`📊 Resultado SQL - Tipo: ${typeof result1}`);
      console.log(`📊 Resultado SQL - Recordset existe: ${!!result1.recordset}`);
      console.log(`📊 Resultado SQL - Total de registros en recordset: ${result1.recordset?.length || 0}`);
      
      // Log de la estructura del recordset
      if (result1.recordset && result1.recordset.length > 0) {
        const firstRecord = result1.recordset[0];
        console.log(`📋 Estructura del primer registro:`, JSON.stringify(Object.keys(firstRecord), null, 2));
        console.log(`📋 Primer registro completo:`, JSON.stringify(firstRecord, null, 2));
        
        // Log de algunos registros más (máximo 5) para ver la estructura
        const recordsToLog = result1.recordset.slice(0, Math.min(5, result1.recordset.length));
        console.log(`📋 Primeros ${recordsToLog.length} registros completos:`, JSON.stringify(recordsToLog, null, 2));
      } else {
        console.log(`⚠️ Recordset vacío o sin datos`);
      }
      
      // Log de toda la respuesta SQL (sin datos sensibles completos si hay muchos)
      if (result1.recordset && result1.recordset.length <= 10) {
        console.log(`📊 Recordset completo:`, JSON.stringify(result1.recordset, null, 2));
      } else if (result1.recordset && result1.recordset.length > 10) {
        console.log(`📊 Recordset tiene ${result1.recordset.length} registros. Mostrando primeros 3 y últimos 2:`);
        const firstThree = result1.recordset.slice(0, 3);
        const lastTwo = result1.recordset.slice(-2);
        console.log(`📊 Primeros 3 registros:`, JSON.stringify(firstThree, null, 2));
        console.log(`📊 Últimos 2 registros:`, JSON.stringify(lastTwo, null, 2));
      }

      const materialesSinAprovisionamiento: MaterialSinAprovisionamiento[] = 
        (result1.recordset || []).map((record: any) => ({
          centroId: record.centro_id?.toString() || '',
          materialId: record.material_id?.toString() || '',
          descripcionMaterial: record.Descripcion_Material?.toString() || '',
          marca: record.marca?.toString() || '',
          presentacion: record.presentacion?.toString() || '',
          modelo: record.modelo?.toString() || '',
          tamano: record.tamano?.toString() || '',
          color: record.color?.toString() || '',
          segmento: record.segmento?.toString() || '',
          linea: record.linea?.toString() || '',
        }));

      console.log(`✅ ${materialesSinAprovisionamiento.length} materiales sin aprovisionamiento encontrados`);
      console.log(`📦 Materiales mapeados (primeros 3):`, JSON.stringify(materialesSinAprovisionamiento.slice(0, 3), null, 2));

      // Ejecutar stored procedure 2: PlanVentasSinCentroProduccion
      console.log('📖 Ejecutando sp_check_PlanVentasSinCentroProduccion...');
      console.log(`📋 Parámetro @PVersion: "${version}"`);
      
      const startTime2 = Date.now();
      const result2 = await mssqlPool.request()
        .input('PVersion', sql.VarChar, version)
        .execute('[Silver].[sp_check_PlanVentasSinCentroProduccion]');
      const executionTime2 = Date.now() - startTime2;
      
      console.log(`⏱️ Tiempo de ejecución del SP: ${executionTime2}ms`);
      console.log(`📊 Resultado SQL - Tipo: ${typeof result2}`);
      console.log(`📊 Resultado SQL - Recordset existe: ${!!result2.recordset}`);
      console.log(`📊 Resultado SQL - Total de registros en recordset: ${result2.recordset?.length || 0}`);
      
      // Log de la estructura del recordset
      if (result2.recordset && result2.recordset.length > 0) {
        const firstRecord = result2.recordset[0];
        console.log(`📋 Estructura del primer registro:`, JSON.stringify(Object.keys(firstRecord), null, 2));
        console.log(`📋 Primer registro completo:`, JSON.stringify(firstRecord, null, 2));
        
        // Log de algunos registros más (máximo 5) para ver la estructura
        const recordsToLog = result2.recordset.slice(0, Math.min(5, result2.recordset.length));
        console.log(`📋 Primeros ${recordsToLog.length} registros completos:`, JSON.stringify(recordsToLog, null, 2));
      } else {
        console.log(`⚠️ Recordset vacío o sin datos`);
      }
      
      // Log de toda la respuesta SQL (sin datos sensibles completos si hay muchos)
      if (result2.recordset && result2.recordset.length <= 10) {
        console.log(`📊 Recordset completo:`, JSON.stringify(result2.recordset, null, 2));
      } else if (result2.recordset && result2.recordset.length > 10) {
        console.log(`📊 Recordset tiene ${result2.recordset.length} registros. Mostrando primeros 3 y últimos 2:`);
        const firstThree = result2.recordset.slice(0, 3);
        const lastTwo = result2.recordset.slice(-2);
        console.log(`📊 Primeros 3 registros:`, JSON.stringify(firstThree, null, 2));
        console.log(`📊 Últimos 2 registros:`, JSON.stringify(lastTwo, null, 2));
      }

      const planVentasSinCentro: PlanVentasSinCentro[] = 
        (result2.recordset || []).map((record: any) => ({
          anio: record.Anio ? parseInt(record.Anio.toString()) : 0,
          mes: record.Mes ? parseInt(record.Mes.toString()) : 0,
          centroDeVenta: record.centro_de_venta?.toString() || '',
          materialId: record.Material_Id?.toString() || '',
          descripcionMaterial: record.Descripcion_Material?.toString() || '',
          cantidadVentas: record.Cantidad_Ventas ? parseFloat(record.Cantidad_Ventas.toString()) : 0,
          marca: record.marca?.toString() || '',
          presentacion: record.presentacion?.toString() || '',
          modelo: record.modelo?.toString() || '',
          linea: record.linea?.toString() || '',
          segmento: record.segmento?.toString() || '',
        }));

      console.log(`✅ ${planVentasSinCentro.length} registros de plan de ventas sin centro encontrados`);
      console.log(`📦 Plan ventas mapeados (primeros 3):`, JSON.stringify(planVentasSinCentro.slice(0, 3), null, 2));

      // Log del resumen final
      console.log(`📊 RESUMEN FINAL:`);
      console.log(`  - Materiales sin aprovisionamiento: ${materialesSinAprovisionamiento.length} registros`);
      console.log(`  - Plan ventas sin centro: ${planVentasSinCentro.length} registros`);
      console.log(`  - Tiempo total SP1: ${executionTime1}ms`);
      console.log(`  - Tiempo total SP2: ${executionTime2}ms`);
      console.log(`  - Tiempo total: ${executionTime1 + executionTime2}ms`);

      return {
        materialesSinAprovisionamiento,
        planVentasSinCentro
      };

    } finally {
      console.log('🔌 Cerrando conexión a MSSQL...');
      await mssqlPool.close();
      console.log('✅ Conexión a MSSQL cerrada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error en validación de materiales:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Retornar arrays vacíos en caso de error, no lanzar excepción
    return {
      materialesSinAprovisionamiento: [],
      planVentasSinCentro: []
    };
  }
};
