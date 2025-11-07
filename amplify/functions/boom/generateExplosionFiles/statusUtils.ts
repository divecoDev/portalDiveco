import { EXPLOSION_FILE_TYPES, ExplosionFileType, explosionFileInfo } from './fileTypes';

export type FileStatusState = 'pending' | 'processing' | 'success' | 'error';

export interface ExplosionFileStatus {
  fileType: ExplosionFileType;
  fileName: string;
  status: FileStatusState;
  recordCount?: number;
  s3Key?: string;
  error?: string;
  updatedAt?: string;
}

export interface ExplosionGenerationStatus {
  boomId: string;
  pversion: string;
  files: ExplosionFileStatus[];
  lastUpdatedAt: string;
}

export const createInitialStatus = (boomId: string, pversion: string): ExplosionGenerationStatus => ({
  boomId,
  pversion,
  files: EXPLOSION_FILE_TYPES.map((type) => ({
    fileType: type,
    fileName: explosionFileInfo[type].fileName,
    status: 'pending',
  })),
  lastUpdatedAt: new Date().toISOString(),
});

export const normalizeStatus = (
  status: ExplosionGenerationStatus,
  boomId: string,
  pversion: string,
): ExplosionGenerationStatus => {
  const fileMap = new Map(status.files.map((item) => [item.fileType, item]));

  const normalizedFiles = EXPLOSION_FILE_TYPES.map((type) => {
    const existing = fileMap.get(type);

    if (existing) {
      return {
        fileType: type,
        fileName: explosionFileInfo[type].fileName,
        status: existing.status,
        recordCount: existing.recordCount,
        s3Key: existing.s3Key,
        error: existing.error,
        updatedAt: existing.updatedAt,
      } satisfies ExplosionFileStatus;
    }

    return {
      fileType: type,
      fileName: explosionFileInfo[type].fileName,
      status: 'pending',
    } satisfies ExplosionFileStatus;
  });

  return {
    boomId,
    pversion,
    files: normalizedFiles,
    lastUpdatedAt: status.lastUpdatedAt ?? new Date().toISOString(),
  } satisfies ExplosionGenerationStatus;
};


