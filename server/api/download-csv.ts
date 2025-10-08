export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { boomId, fileName } = query;

    // Validar parámetros
    if (!boomId || !fileName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: boomId and fileName'
      });
    }

    // Validar que el fileName sea uno de los permitidos (seguridad)
    const allowedFiles = [
      'materialesSinAprovisionamiento.csv',
      'materialesSinCentroProduccion.csv'
    ];

    if (!allowedFiles.includes(fileName as string)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file name'
      });
    }

    // Construir la URL de CloudFront
    const fileUrl = `https://d1p0twkya81b3k.cloudfront.net/${boomId}/${fileName}`;

    // Verificar el método de la petición
    const method = event.node.req.method;

    // Para HEAD, solo verificar si existe sin descargar
    if (method === 'HEAD') {
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        
        if (!response.ok) {
          throw createError({
            statusCode: response.status === 403 ? 404 : response.status,
            statusMessage: 'File not found'
          });
        }

        // Configurar cabeceras sin contenido
        setHeader(event, 'Content-Type', 'text/csv');
        setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);
        
        return null;
      } catch (error: any) {
        throw createError({
          statusCode: 404,
          statusMessage: 'File not found'
        });
      }
    }

    // Para GET, descargar el archivo completo
    const response = await fetch(fileUrl);

    if (!response.ok) {
      const statusCode = response.status === 403 ? 404 : response.status;
      throw createError({
        statusCode,
        statusMessage: 'File not found or not accessible'
      });
    }

    // Obtener el contenido del archivo
    const fileBuffer = await response.arrayBuffer();

    // Configurar las cabeceras de respuesta para forzar la descarga
    setHeader(event, 'Content-Type', 'text/csv');
    setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);
    setHeader(event, 'Content-Length', fileBuffer.byteLength.toString());

    // Devolver el archivo
    return fileBuffer;
  } catch (error: any) {
    console.error('Error downloading CSV file:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error downloading file'
    });
  }
});

