import sql from 'mssql';
import { json2csv } from 'json-2-csv';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { EXPLOSION_FILE_TYPES, ExplosionFileType, explosionFileInfo } from './fileTypes';
import { createInitialStatus, ExplosionFileStatus, ExplosionGenerationStatus, normalizeStatus } from './statusUtils';

interface GenerateExplosionFilesRequest {
  boomId?: string;
  pversion?: string;
  fileType?: string;
}

interface FileGenerationResult {
  fileType: ExplosionFileType;
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
  status?: ExplosionGenerationStatus;
}

const isExplosionFileType = (value: string): value is ExplosionFileType => {
  return EXPLOSION_FILE_TYPES.includes(value as ExplosionFileType);
};

export const generateFileHandler = async (event: any, context?: any): Promise<GenerateExplosionFilesResponse> => {
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

  const { boomId, pversion, fileType } = requestParams;

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

  if (!fileType || fileType.trim() === '') {
    return {
      success: false,
      message: 'fileType es requerido',
      files: [],
      error: 'fileType no puede estar vacío'
    };
  }

  const trimmedFileType = fileType.trim();

  if (!isExplosionFileType(trimmedFileType)) {
    return {
      success: false,
      message: 'fileType no es válido',
      files: [],
      error: `fileType ${fileType} no es soportado. Valores válidos: ${EXPLOSION_FILE_TYPES.join(', ')}`
    };
  }

  const normalizedFileType: ExplosionFileType = trimmedFileType;

  const normalizedPversion = pversion.trim();

  console.log(`📋 Parámetros: boomId=${boomId}, pversion=${normalizedPversion}, fileType=${normalizedFileType}`);

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
    port: 1433, // Puerto explícito para Azure SQL
    connectionTimeout: 60000, // 60 segundos para establecer conexión inicial
    requestTimeout: 120000, // 120 segundos para ejecutar queries
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: true, // Requerido para Azure SQL
      trustServerCertificate: false,
      enableArithAbort: true,
      requestTimeout: 120000,
      connectTimeout: 60000,
    },
  };

  // Configuración de S3
  const bucketName = 'explosion-materiales-uts';
  const s3Client = new S3Client({});

  const files: FileGenerationResult[] = [];

  type CsvRow = Record<string, unknown>;

  interface FileTask {
    fileType: ExplosionFileType;
    fileName: string;
    startMessage: string;
    buildData: () => Promise<CsvRow[]>;
  }

  interface FileConfig {
    fileName: string;
    startMessage: string;
    buildData: (pool: sql.ConnectionPool, version: string) => Promise<CsvRow[]>;
  }

  const runCsvTask = async ({ fileType, startMessage, fileName, buildData }: FileTask): Promise<FileGenerationResult> => {
    console.log(startMessage);

    const requestStart = Date.now();

    try {
      const data = await buildData();
      const executionTime = Date.now() - requestStart;

      console.log(`⏱️ Tiempo de ejecución: ${executionTime}ms`);
      console.log(`📊 Registros obtenidos: ${data.length}`);

      const csv = await json2csv(data, { excelBOM: true });
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

      return {
        fileType,
        fileName,
        success: true,
        recordCount: data.length,
        s3Key,
      };
    } catch (error) {
      console.error(`❌ Error generando ${fileName}:`, error);

      return {
        fileType,
        fileName,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  };

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

  const fileConfigs: Record<ExplosionFileType, FileConfig> = {
    aprovisionamiento: {
      fileName: explosionFileInfo.aprovisionamiento.fileName,
      startMessage: explosionFileInfo.aprovisionamiento.startMessage,
      buildData: async (pool) => {
        const result = await pool.request().query(aprovisionamientoQuery);
        return (result.recordset ?? []) as CsvRow[];
      },
    },
    modeloSemielaborados: {
      fileName: explosionFileInfo.modeloSemielaborados.fileName,
      startMessage: explosionFileInfo.modeloSemielaborados.startMessage,
      buildData: async (pool, version) => {
        const result = await pool.request()
          .input('PVersion', sql.VarChar, version)
          .execute('[Silver].[sp_por_modelo_con_semielaborados]');
        return (result.recordset ?? []) as CsvRow[];
      },
    },
    materiaPrimaSemielaborados: {
      fileName: explosionFileInfo.materiaPrimaSemielaborados.fileName,
      startMessage: explosionFileInfo.materiaPrimaSemielaborados.startMessage,
      buildData: async (pool, version) => {
        const result = await pool.request()
          .input('PVersion', sql.VarChar, version)
          .execute('[Silver].[sp_por_materia_prima_con_semielaborados]');
        return (result.recordset ?? []) as CsvRow[];
      },
    },
    planVentas: {
      fileName: explosionFileInfo.planVentas.fileName,
      startMessage: explosionFileInfo.planVentas.startMessage,
      buildData: async (pool, version) => {
        const result = await pool.request()
          .input('PVersion', sql.VarChar, version)
          .execute('[Silver].[sp_plan_ventas]');
        return (result.recordset ?? []) as CsvRow[];
      },
    },
    planProduccion: {
      fileName: explosionFileInfo.planProduccion.fileName,
      startMessage: explosionFileInfo.planProduccion.startMessage,
      buildData: async (pool, version) => {
        const result = await pool.request()
          .input('PVersion', sql.VarChar, version)
          .execute('[Silver].[sp_plan_produccion]');
        return (result.recordset ?? []) as CsvRow[];
      },
    },
  };

  const statusKey = `${boomId}/status/${normalizedPversion}.json`;

  const loadStatus = async (): Promise<ExplosionGenerationStatus> => {
    try {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: statusKey,
      }));

      const body = response.Body ? await (response.Body as any).transformToString('utf-8') : '';

      if (!body) {
        return createInitialStatus(boomId, normalizedPversion);
      }

      const parsed = JSON.parse(body) as ExplosionGenerationStatus;
      return normalizeStatus(parsed, boomId, normalizedPversion);
    } catch (error) {
      if ((error as { name?: string }).name === 'NoSuchKey') {
        return createInitialStatus(boomId, normalizedPversion);
      }

      console.error('❌ Error obteniendo estado de generación:', error);
      throw error;
    }
  };

  const saveStatus = async (status: ExplosionGenerationStatus) => {
    const payload = JSON.stringify(status, null, 2);

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: statusKey,
      Body: payload,
      ContentType: 'application/json; charset=utf-8',
    }));
  };

  const getFileTask = (pool: sql.ConnectionPool, type: ExplosionFileType): FileTask => {
    const config = fileConfigs[type];

    if (!config) {
      throw new Error(`Tipo de archivo ${type} no está soportado`);
    }

    return {
      fileType: type,
      fileName: config.fileName,
      startMessage: config.startMessage,
      buildData: () => config.buildData(pool, normalizedPversion),
    } satisfies FileTask;
  };

  let statusSnapshot = await loadStatus();

  const updateStatus = async (
    fileTypeToUpdate: ExplosionFileType,
    mutator: (entry: ExplosionFileStatus) => ExplosionFileStatus,
  ) => {
    const normalized = normalizeStatus(statusSnapshot, boomId, normalizedPversion);

    const updatedFiles = normalized.files.map((entry) => {
      if (entry.fileType !== fileTypeToUpdate) {
        return entry;
      }

      return mutator({
        ...entry,
        fileName: explosionFileInfo[fileTypeToUpdate].fileName,
      });
    });

    statusSnapshot = {
      boomId,
      pversion: normalizedPversion,
      files: updatedFiles,
      lastUpdatedAt: new Date().toISOString(),
    };

    // Guardar estado en S3 - la UI verificará los archivos directamente desde S3
    await saveStatus(statusSnapshot);
    console.log(`✅ Estado guardado en S3 para ${fileTypeToUpdate}`);
  };

  const markProcessing = async () => {
    await updateStatus(normalizedFileType, (entry) => ({
      ...entry,
      status: 'processing',
      recordCount: undefined,
      s3Key: undefined,
      error: undefined,
      updatedAt: new Date().toISOString(),
    }));
  };

  const markSuccess = async (result: FileGenerationResult) => {
    await updateStatus(normalizedFileType, (entry) => ({
      ...entry,
      status: 'success',
      recordCount: result.recordCount,
      s3Key: result.s3Key,
      error: undefined,
      updatedAt: new Date().toISOString(),
    }));
  };

  const markFailure = async (errorMessage: string) => {
    await updateStatus(normalizedFileType, (entry) => ({
      ...entry,
      status: 'error',
      error: errorMessage,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Inicializar estado como "processing" inmediatamente
  await markProcessing();

  // Ejecutar generación de forma síncrona - esperamos a que termine completamente antes de retornar
  // Esto garantiza que el archivo se genere y se suba a S3 antes de retornar la respuesta
  let mssqlPool: sql.ConnectionPool | null = null;
  
  try {
    // Conectar a MSSQL con reintentos
    console.log('🔌 Conectando a MSSQL...');
    console.log(`📋 Configuración: server=${mssqlServer}, database=${mssqlDatabase}, connectionTimeout=${mssqlConfig.connectionTimeout}ms`);
    
    let retries = 3;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        mssqlPool = new sql.ConnectionPool(mssqlConfig);
        await mssqlPool.connect();
        connected = true;
        console.log('✅ Conexión a MSSQL establecida');
      } catch (connectError) {
        retries--;
        console.error(`❌ Error conectando a MSSQL (intentos restantes: ${retries}):`, connectError);
        
        if (mssqlPool) {
          try {
            await mssqlPool.close();
          } catch (closeError) {
            // Ignorar errores al cerrar
          }
          mssqlPool = null;
        }
        
        if (retries > 0) {
          const waitTime = (4 - retries) * 2000; // Esperar 2s, 4s, 6s entre reintentos
          console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw connectError;
        }
      }
    }
    
    if (!mssqlPool || !connected) {
      throw new Error('No se pudo establecer conexión a MSSQL después de múltiples intentos');
    }

    // Generar el archivo
    try {
      const fileTask = getFileTask(mssqlPool, normalizedFileType);
      const fileResult = await runCsvTask(fileTask);

      if (fileResult.success) {
        await markSuccess(fileResult);
        console.log(`✅ ${fileResult.fileName} generado exitosamente`);
        
        return {
          success: true,
          message: `${fileResult.fileName} generado exitosamente`,
          files: [fileResult],
          status: statusSnapshot,
        };
      } else {
        await markFailure(fileResult.error || 'Error desconocido');
        console.error(`❌ Error generando ${fileResult.fileName}:`, fileResult.error);
        
        return {
          success: false,
          message: `Error generando ${fileResult.fileName}`,
          files: [],
          error: fileResult.error || 'Error desconocido',
          status: statusSnapshot,
        };
      }
    } finally {
      if (mssqlPool) {
        console.log('🔌 Cerrando conexión a MSSQL...');
        try {
          await mssqlPool.close();
          console.log('✅ Conexión a MSSQL cerrada exitosamente');
        } catch (closeError) {
          console.error('⚠️ Error cerrando conexión MSSQL:', closeError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error general en generación de CSVs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    try {
      await markFailure(errorMessage);
    } catch (statusError) {
      console.error('❌ Error actualizando estado tras fallo general:', statusError);
    }
    
    return {
      success: false,
      message: 'Error generando archivo CSV',
      files: [],
      error: errorMessage,
      status: statusSnapshot,
    };
  }
};

export const handler = generateFileHandler;

