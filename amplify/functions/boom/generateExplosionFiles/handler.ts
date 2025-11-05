import sql from 'mssql';
import { json2csv } from 'json-2-csv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface GenerateExplosionFilesRequest {
  boomId?: string;
  pversion?: string;
}

interface FileGenerationResult {
  fileName: string;
  success: boolean;
  recordCount?: number;
  error?: string;
  s3Key?: string;
}

interface GenerateExplosionFilesResponse {
  success: boolean;
  message: string;
  files: FileGenerationResult[];
  error?: string;
}

export const handler = async (event: any): Promise<GenerateExplosionFilesResponse> => {
  console.log('📊 Iniciando generación de CSVs de explosión desde MSSQL');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));

  // Parsear parámetros del evento
  let requestParams: GenerateExplosionFilesRequest = {};
  
  if (event.arguments) {
    requestParams = event.arguments;
  } else if (typeof event.body === 'string') {
    requestParams = JSON.parse(event.body);
  } else {
    requestParams = event;
  }

  const { boomId, pversion } = requestParams;

  // Validaciones
  if (!boomId || boomId.trim() === '') {
    return {
      success: false,
      message: 'boomId es requerido',
      files: [],
      error: 'boomId no puede estar vacío'
    };
  }

  if (!pversion || pversion.trim() === '') {
    return {
      success: false,
      message: 'pversion es requerido',
      files: [],
      error: 'pversion no puede estar vacío'
    };
  }

  console.log(`📋 Parámetros: boomId=${boomId}, pversion=${pversion}`);

  // Configuración de MSSQL
  const mssqlUser = 'divecoadm';
  const mssqlPassword = 'J$YSAc@@gm44ExB';
  const mssqlServer = 'divecosqlserver.database.windows.net';
  const mssqlDatabase = 'STGDiveco';
  
  const mssqlConfig = {
    user: mssqlUser,
    password: mssqlPassword,
    server: mssqlServer,
    database: mssqlDatabase,
    options: {
      encrypt: true,
    },
  };

  // Configuración de S3
  const bucketName = 'explosion-materiales-uts';
  const s3Client = new S3Client({});

  const files: FileGenerationResult[] = [];

  try {
    // Conectar a MSSQL
    console.log('🔌 Conectando a MSSQL...');
    const mssqlPool = new sql.ConnectionPool(mssqlConfig);
    await mssqlPool.connect();
    console.log('✅ Conexión a MSSQL establecida');

    try {
      // 1. Aprovisionamiento configurado - Query SQL directa
      console.log('📊 1/5 Generando AprovisionamientoConfigurado.csv...');
      try {
        const aprovisionamientoQuery = `
          SELECT
            a.Centro_Origen_Id AS centro_id_origen,
            a.Material_Id AS material_id,
            a.Centro_Aprovisionador_Id AS centro_id_aprov,
            a.Porcentaje_Suministro AS porcentaje,
            c.Descripcion_Material AS desc_material,
            c.Marca_Id + ' ' + c.Descripcion_Marca AS marca,
            c.Presentacion_Id + ' ' + c.Descripcion_Presentacion AS presentacion,
            c.Modelo_Id + ' ' + c.Descripcion_Modelo AS modelo,
            c.Tamano_Id + ' ' + c.Descripcion_Tamano AS tamano
          FROM
            Silver.ReglasAprovisionamiento AS a
          JOIN
            Silver.v_MaterialesUnificados AS c ON a.Material_Id = c.Material_Id
          ORDER BY
            a.Centro_Origen_Id,
            a.Material_Id,
            a.Centro_Aprovisionador_Id
        `;

        const aprovisionamientoStartTime = Date.now();
        const aprovisionamientoResult = await mssqlPool.request().query(aprovisionamientoQuery);
        const aprovisionamientoExecutionTime = Date.now() - aprovisionamientoStartTime;
        
        console.log(`⏱️ Tiempo de ejecución: ${aprovisionamientoExecutionTime}ms`);
        console.log(`📊 Registros obtenidos: ${aprovisionamientoResult.recordset?.length || 0}`);

        const aprovisionamientoData = aprovisionamientoResult.recordset || [];
        const csv = await json2csv(aprovisionamientoData, { excelBOM: true });
        
        const fileName = 'AprovisionamientoConfigurado.csv';
        const s3Key = `${boomId}/${fileName}`;
        
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: csv,
          ContentType: 'text/csv; charset=utf-8',
          ContentEncoding: 'utf-8',
          ContentDisposition: `attachment; filename="${fileName}"`,
        }));

        console.log(`✅ ${fileName} generado y subido a S3: ${s3Key}`);
        files.push({
          fileName,
          success: true,
          recordCount: aprovisionamientoData.length,
          s3Key
        });
      } catch (error) {
        console.error(`❌ Error generando AprovisionamientoConfigurado.csv:`, error);
        files.push({
          fileName: 'AprovisionamientoConfigurado.csv',
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      // 2. PlanModeloConSemielaborados - Stored procedure
      console.log('📊 2/5 Generando PlanModeloConSemielaborados.csv...');
      try {
        const modeloStartTime = Date.now();
        const modeloResult = await mssqlPool.request()
          .input('PVersion', sql.VarChar, pversion)
          .execute('[Silver].[sp_por_modelo_con_semielaborados]');
        const modeloExecutionTime = Date.now() - modeloStartTime;
        
        console.log(`⏱️ Tiempo de ejecución: ${modeloExecutionTime}ms`);
        console.log(`📊 Registros obtenidos: ${modeloResult.recordset?.length || 0}`);

        const modeloData = modeloResult.recordset || [];
        const csv = await json2csv(modeloData, { excelBOM: true });
        
        const fileName = 'PlanModeloConSemielaborados.csv';
        const s3Key = `${boomId}/${fileName}`;
        
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: csv,
          ContentType: 'text/csv; charset=utf-8',
          ContentEncoding: 'utf-8',
          ContentDisposition: `attachment; filename="${fileName}"`,
        }));

        console.log(`✅ ${fileName} generado y subido a S3: ${s3Key}`);
        files.push({
          fileName,
          success: true,
          recordCount: modeloData.length,
          s3Key
        });
      } catch (error) {
        console.error(`❌ Error generando PlanModeloConSemielaborados.csv:`, error);
        files.push({
          fileName: 'PlanModeloConSemielaborados.csv',
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      // 3. PlanModeloMateriasPrimaConSemielaborados - Stored procedure
      console.log('📊 3/5 Generando PlanModeloMateriasPrimaConSemielaborados.csv...');
      try {
        const materiaPrimaStartTime = Date.now();
        const materiaPrimaResult = await mssqlPool.request()
          .input('PVersion', sql.VarChar, pversion)
          .execute('[Silver].[sp_por_materia_prima_con_semielaborados]');
        const materiaPrimaExecutionTime = Date.now() - materiaPrimaStartTime;
        
        console.log(`⏱️ Tiempo de ejecución: ${materiaPrimaExecutionTime}ms`);
        console.log(`📊 Registros obtenidos: ${materiaPrimaResult.recordset?.length || 0}`);

        const materiaPrimaData = materiaPrimaResult.recordset || [];
        const csv = await json2csv(materiaPrimaData, { excelBOM: true });
        
        const fileName = 'PlanModeloMateriasPrimaConSemielaborados.csv';
        const s3Key = `${boomId}/${fileName}`;
        
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: csv,
          ContentType: 'text/csv; charset=utf-8',
          ContentEncoding: 'utf-8',
          ContentDisposition: `attachment; filename="${fileName}"`,
        }));

        console.log(`✅ ${fileName} generado y subido a S3: ${s3Key}`);
        files.push({
          fileName,
          success: true,
          recordCount: materiaPrimaData.length,
          s3Key
        });
      } catch (error) {
        console.error(`❌ Error generando PlanModeloMateriasPrimaConSemielaborados.csv:`, error);
        files.push({
          fileName: 'PlanModeloMateriasPrimaConSemielaborados.csv',
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      // 4. PlanVentas - Stored procedure
      console.log('📊 4/5 Generando PlanVentas.csv...');
      try {
        const ventasStartTime = Date.now();
        const ventasResult = await mssqlPool.request()
          .input('PVersion', sql.VarChar, pversion)
          .execute('[Silver].[sp_plan_ventas]');
        const ventasExecutionTime = Date.now() - ventasStartTime;
        
        console.log(`⏱️ Tiempo de ejecución: ${ventasExecutionTime}ms`);
        console.log(`📊 Registros obtenidos: ${ventasResult.recordset?.length || 0}`);

        const ventasData = ventasResult.recordset || [];
        const csv = await json2csv(ventasData, { excelBOM: true });
        
        const fileName = 'PlanVentas.csv';
        const s3Key = `${boomId}/${fileName}`;
        
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: csv,
          ContentType: 'text/csv; charset=utf-8',
          ContentEncoding: 'utf-8',
          ContentDisposition: `attachment; filename="${fileName}"`,
        }));

        console.log(`✅ ${fileName} generado y subido a S3: ${s3Key}`);
        files.push({
          fileName,
          success: true,
          recordCount: ventasData.length,
          s3Key
        });
      } catch (error) {
        console.error(`❌ Error generando PlanVentas.csv:`, error);
        files.push({
          fileName: 'PlanVentas.csv',
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      // 5. PlanProduccion - Stored procedure
      console.log('📊 5/5 Generando PlanProduccion.csv...');
      try {
        const produccionStartTime = Date.now();
        const produccionResult = await mssqlPool.request()
          .input('PVersion', sql.VarChar, pversion)
          .execute('[Silver].[sp_plan_produccion]');
        const produccionExecutionTime = Date.now() - produccionStartTime;
        
        console.log(`⏱️ Tiempo de ejecución: ${produccionExecutionTime}ms`);
        console.log(`📊 Registros obtenidos: ${produccionResult.recordset?.length || 0}`);

        const produccionData = produccionResult.recordset || [];
        const csv = await json2csv(produccionData, { excelBOM: true });
        
        const fileName = 'PlanProduccion.csv';
        const s3Key = `${boomId}/${fileName}`;
        
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: csv,
          ContentType: 'text/csv; charset=utf-8',
          ContentEncoding: 'utf-8',
          ContentDisposition: `attachment; filename="${fileName}"`,
        }));

        console.log(`✅ ${fileName} generado y subido a S3: ${s3Key}`);
        files.push({
          fileName,
          success: true,
          recordCount: produccionData.length,
          s3Key
        });
      } catch (error) {
        console.error(`❌ Error generando PlanProduccion.csv:`, error);
        files.push({
          fileName: 'PlanProduccion.csv',
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      // Verificar si todos los archivos se generaron exitosamente
      const successCount = files.filter(f => f.success).length;
      const failedCount = files.filter(f => !f.success).length;

      console.log(`📊 RESUMEN: ${successCount} archivos generados exitosamente, ${failedCount} fallaron`);

      if (failedCount === 0) {
        return {
          success: true,
          message: 'Todos los archivos CSV fueron generados exitosamente',
          files
        };
      } else {
        return {
          success: false,
          message: `${successCount} archivos generados exitosamente, ${failedCount} fallaron`,
          files,
          error: 'Algunos archivos fallaron al generarse'
        };
      }

    } finally {
      console.log('🔌 Cerrando conexión a MSSQL...');
      await mssqlPool.close();
      console.log('✅ Conexión a MSSQL cerrada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error general en generación de CSVs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      success: false,
      message: 'Error al generar archivos CSV',
      files,
      error: errorMessage
    };
  }
};

