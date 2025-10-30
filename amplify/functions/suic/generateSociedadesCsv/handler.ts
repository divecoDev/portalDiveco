import mysql from 'mysql2/promise';
import { json2csv } from 'json-2-csv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface GenerateCsvRequest {
  suicId: string;
}

interface CsvFile {
  sociedad: string;
  partIndex: number; // 1-based
  totalParts: number;
  fileName: string;
  s3Path: string;
  recordCount: number; // rows in this part
  publicUrl?: string;
}

interface GenerateCsvResponse {
  success: boolean;
  files: CsvFile[];
  societiesDetected: string[];
  societiesCount: number;
  uploadsSucceeded: number;
  uploadsFailed: number;
  message: string;
  error?: string;
}

export const handler = async (event: any): Promise<GenerateCsvResponse> => {
  console.log('📊 Iniciando generación de CSVs por sociedad desde meta_diaria_final');
  console.log('📥 Evento recibido:', JSON.stringify(event, null, 2));

  // Límite hardcodeado de filas por archivo y tamaño de página para lecturas
  const MAX_ROWS_PER_FILE = 1_000_000;
  const PAGE_SIZE = 200_000;
  const CLOUDFRONT_BASE = 'https://d1p0twkya81b3k.cloudfront.net/';

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
    let body: GenerateCsvRequest;

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

    // Conectar a MySQL
    console.log('🔌 Conectando a MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');

    try {
      // 1) Obtener sociedades distintas para el SUIC (normalizadas con TRIM)
      const societiesQuery = `
        SELECT DISTINCT TRIM(Sociedad) AS Sociedad
        FROM meta_diaria_final
        WHERE id_suic = ? AND Sociedad IS NOT NULL AND TRIM(Sociedad) <> ''
        ORDER BY Sociedad
      `;
      console.log('🔍 Obteniendo sociedades distintas...');
      const [societyRows] = await connection.execute(societiesQuery, [body.suicId]);
      const societies = (societyRows as any[]).map(r => r.Sociedad as string).filter(Boolean);
      console.log(`📊 Sociedades encontradas (${societies.length}): ${societies.join(', ')}`);

      if (societies.length === 0) {
        return {
          success: false,
          files: [],
          societiesDetected: [],
          societiesCount: 0,
          uploadsSucceeded: 0,
          uploadsFailed: 0,
          message: 'No se encontraron sociedades para este SUIC',
          error: 'No hay datos para generar CSVs'
        };
      }

      // Inicializar cliente S3 y estructuras de salida
      const s3Client = new S3Client({});
      const bucketName = 'porta-diveco-suic';
      const files: CsvFile[] = [];
      let uploadsSucceeded = 0;
      let uploadsFailed = 0;

      // 2) Procesar cada sociedad con paginación y particionado por límite de filas
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM meta_diaria_final
        WHERE id_suic = ? AND TRIM(Sociedad) = ?
      `;

      const baseSelectQuery = `
        SELECT 
          id_suic,
          TRIM(Sociedad) AS Sociedad,
          Centro,
          Version,
          Vendedor,
          Cliente,
          Material,
          Canal,
          Color,
          Marca,
          Presentacion,
          Modelo,
          Tamano,
          Fecha_Factura,
          Cant_Factura,
          Unidad,
          Decuento_Ben,
          Descuento_Mer,
          Venta_Neta,
          Moneda,
          Sector,
          Org_ventas,
          margen_bruto,
          margen_cebe
        FROM meta_diaria_final
        WHERE id_suic = ? AND TRIM(Sociedad) = ?
        ORDER BY Fecha_Factura, Material
      `;

      for (const sociedadRaw of societies) {
        const sociedad = sociedadRaw || 'SIN_SOCIEDAD';
        console.log(`\n🧩 Procesando sociedad: ${sociedad}`);

        // 2.1) Contar total de registros para calcular totalParts
        const [countRows] = await connection.execute(countQuery, [body.suicId, sociedad]);
        const totalRows = (countRows as any[])[0]?.total as number || 0;
        const totalParts = Math.max(1, Math.ceil(totalRows / MAX_ROWS_PER_FILE));
        console.log(`📈 totalRows=${totalRows}, MAX_ROWS_PER_FILE=${MAX_ROWS_PER_FILE}, totalParts=${totalParts}`);

        if (totalRows === 0) {
          console.log(`⚠️ Sociedad ${sociedad} no tiene registros. Se omite.`);
          continue;
        }

        // 2.2) Leer por páginas y emitir partes
        let currentPartIndex = 1; // 1-based
        let buffer: any[] = [];
        let emittedRowsThisPart = 0;
        let offset = 0;

        while (offset < totalRows) {
          console.log(`   🔄 Leyendo página offset=${offset}, limit=${PAGE_SIZE}`);
          // Algunas versiones de MySQL no aceptan placeholders en LIMIT/OFFSET
          const pageSelectQuery = `${baseSelectQuery} LIMIT ${Number(PAGE_SIZE)} OFFSET ${Number(offset)}`;
          const [pageRows] = await connection.execute(pageSelectQuery, [body.suicId, sociedad]);
          const pageData = pageRows as any[];
          if (pageData.length === 0) {
            break;
          }

          for (const row of pageData) {
            buffer.push(row);
            emittedRowsThisPart++;

            // Si alcanzamos el límite de filas por archivo, emitimos la parte actual
            if (emittedRowsThisPart >= MAX_ROWS_PER_FILE) {
              const fileName = `${sociedad}_meta_diaria_final_part-${String(currentPartIndex).padStart(2, '0')}-of-${String(totalParts).padStart(2, '0')}.csv`;
              const s3Key = `suic/${body.suicId}/${fileName}`;

              try {
                const csv = await json2csv(buffer, { excelBOM: true });
                const uploadParams = {
                  Bucket: bucketName,
                  Key: s3Key,
                  Body: csv,
                  ContentType: 'text/csv; charset=utf-8',
                  ContentEncoding: 'utf-8',
                  ContentDisposition: `attachment; filename="${fileName}"`,
                };
                await s3Client.send(new PutObjectCommand(uploadParams));
                uploadsSucceeded++;
                files.push({
                  sociedad,
                  partIndex: currentPartIndex,
                  totalParts,
                  fileName,
                  s3Path: s3Key,
                  recordCount: buffer.length,
                  publicUrl: `${CLOUDFRONT_BASE}${s3Key}`
                });
                console.log(`   ✅ Subido ${s3Key} (${buffer.length} filas)`);
              } catch (err) {
                uploadsFailed++;
                console.error(`   ❌ Error subiendo ${s3Key}:`, err);
              }

              // Reset para siguiente parte
              buffer = [];
              emittedRowsThisPart = 0;
              currentPartIndex++;
            }
          }

          offset += PAGE_SIZE;
        }

        // Emitir última parte si quedaron filas en buffer
        if (buffer.length > 0) {
          const effectivePartIndex = Math.min(currentPartIndex, totalParts);
          const fileName = `${sociedad}_meta_diaria_final_part-${String(effectivePartIndex).padStart(2, '0')}-of-${String(totalParts).padStart(2, '0')}.csv`;
          const s3Key = `suic/${body.suicId}/${fileName}`;
          try {
            const csv = await json2csv(buffer, { excelBOM: true });
            const uploadParams = {
              Bucket: bucketName,
              Key: s3Key,
              Body: csv,
              ContentType: 'text/csv; charset=utf-8',
              ContentEncoding: 'utf-8',
              ContentDisposition: `attachment; filename="${fileName}"`,
            };
            await s3Client.send(new PutObjectCommand(uploadParams));
            uploadsSucceeded++;
            files.push({
              sociedad,
              partIndex: effectivePartIndex,
              totalParts,
              fileName,
              s3Path: s3Key,
              recordCount: buffer.length,
              publicUrl: `${CLOUDFRONT_BASE}${s3Key}`
            });
            console.log(`   ✅ Subido ${s3Key} (${buffer.length} filas)`);
          } catch (err) {
            uploadsFailed++;
            console.error(`   ❌ Error subiendo ${s3Key}:`, err);
          }
        }
      }

      const message = `Generación finalizada. Archivos: ${files.length}. Sociedades: ${societies.length}. Éxitos: ${uploadsSucceeded}. Fallos: ${uploadsFailed}.`;
      console.log(`\n✅ ${message}`);

      return {
        success: uploadsSucceeded > 0,
        files,
        societiesDetected: societies,
        societiesCount: societies.length,
        uploadsSucceeded,
        uploadsFailed,
        message
      };

    } finally {
      console.log('🔌 Cerrando conexión a MySQL...');
      await connection.end();
      console.log('✅ Conexión cerrada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error generando CSVs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      success: false,
      files: [],
      societiesDetected: [],
      societiesCount: 0,
      uploadsSucceeded: 0,
      uploadsFailed: 0,
      message: `Error generando CSVs: ${errorMessage}`,
      error: errorMessage
    };
  }
};

