import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createInitialStatus, ExplosionGenerationStatus, normalizeStatus } from '../generateExplosionFiles/statusUtils';
import { EXPLOSION_FILE_TYPES } from '../generateExplosionFiles/fileTypes';
import { explosionFileInfo } from '../generateExplosionFiles/fileTypes';

interface GetExplosionStatusRequest {
  boomId?: string;
  pversion?: string;
}

const bucketName = 'explosion-materiales-uts';
const s3Client = new S3Client({});

export const handler = async (event: any): Promise<ExplosionGenerationStatus> => {
  console.log('📊 Solicitando estado de generación de explosión:', JSON.stringify(event));

  let request: GetExplosionStatusRequest = {};

  if (event?.arguments) {
    request = event.arguments;
  } else if (typeof event?.body === 'string') {
    request = JSON.parse(event.body) as GetExplosionStatusRequest;
  } else {
    request = event ?? {};
  }

  const { boomId, pversion } = request;

  if (!boomId || boomId.trim() === '') {
    throw new Error('boomId es requerido');
  }

  if (!pversion || pversion.trim() === '') {
    throw new Error('pversion es requerido');
  }

  const normalizedPversion = pversion.trim();
  const statusKey = `${boomId}/status/${normalizedPversion}.json`;

  // Intentar obtener estado desde S3
  let statusSnapshot: ExplosionGenerationStatus | null = null;
  
  try {
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: statusKey,
    }));

    const body = response.Body ? await (response.Body as any).transformToString('utf-8') : '';

    if (body) {
      statusSnapshot = JSON.parse(body) as ExplosionGenerationStatus;
    }
  } catch (error) {
    if ((error as { name?: string }).name !== 'NoSuchKey') {
      console.error('❌ Error obteniendo estado desde S3:', error);
    }
  }

  // Si no hay estado guardado, crear uno inicial
  if (!statusSnapshot) {
    statusSnapshot = createInitialStatus(boomId, normalizedPversion);
  }

  // Verificar qué archivos realmente existen en S3
  const prefix = `${boomId}/`;
  
  try {
    const listResponse = await s3Client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    }));

    const existingFiles = (listResponse.Contents || []).map(obj => obj.Key || '').filter(Boolean);
    
    // Actualizar estado basado en archivos existentes
    statusSnapshot.files = statusSnapshot.files.map(fileStatus => {
      const expectedFileName = explosionFileInfo[fileStatus.fileType].fileName;
      const expectedS3Key = `${boomId}/${expectedFileName}`;
      const fileExists = existingFiles.includes(expectedS3Key);
      
      if (fileExists && fileStatus.status !== 'success') {
        // Archivo existe pero el estado no es success - actualizar
        return {
          ...fileStatus,
          status: 'success',
          s3Key: expectedS3Key,
          updatedAt: new Date().toISOString(),
        };
      } else if (!fileExists && fileStatus.status === 'success') {
        // Estado dice success pero archivo no existe - marcar como pendiente
        return {
          ...fileStatus,
          status: 'pending',
          s3Key: undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      
      return fileStatus;
    });
  } catch (error) {
    console.error('❌ Error listando archivos en S3:', error);
    // Continuar con el estado guardado si falla la verificación
  }

  return normalizeStatus(statusSnapshot, boomId, normalizedPversion);
};



