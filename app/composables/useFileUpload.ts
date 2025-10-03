import { uploadData, downloadData, remove, list, getUrl } from 'aws-amplify/storage';
import { useToast } from '#imports';

export interface FileUploadProgress {
  transferredBytes: number;
  totalBytes: number;
  percentage: number;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  s3Path: string;
  documentId?: string;
  tipo?: 'planVentas' | 'existencias' | 'cobertura';
}

export interface UploadResult {
  success: boolean;
  metadata?: FileMetadata;
  error?: string;
}

/**
 * Composable para manejar la carga y descarga de archivos a S3 usando Amplify Storage
 */
export const useFileUpload = () => {
  const toast = useToast();

  // Estado reactivo para el progreso de carga
  const uploadProgress = ref<FileUploadProgress>({
    transferredBytes: 0,
    totalBytes: 0,
    percentage: 0
  });

  const isUploading = ref(false);
  const uploadError = ref<string | null>(null);

  /**
   * Genera una ruta única para el archivo en S3
   */
  const generateFilePath = (
    fileName: string, 
    tipo: 'planVentas' | 'existencias' | 'cobertura',
    documentId?: string
  ): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const userId = documentId || 'anonymous';
    
    return `carga-insumos/${tipo}/${userId}/${timestamp}_${sanitizedFileName}`;
  };

  /**
   * Carga un archivo a S3 con seguimiento de progreso
   */
  const uploadFile = async (
    file: File,
    tipo: 'planVentas' | 'existencias' | 'cobertura',
    documentId?: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<UploadResult> => {
    try {
      isUploading.value = true;
      uploadError.value = null;

      const s3Path = generateFilePath(file.name, tipo, documentId);

      console.log(`📤 Iniciando carga de archivo: ${file.name} a ${s3Path}`);

      const uploadTask = uploadData({
        path: s3Path,
        data: file,
        options: {
          contentType: file.type || 'application/octet-stream',
          metadata: {
            originalName: file.name,
            tipo: tipo,
            documentId: documentId || '',
            uploadedAt: new Date().toISOString(),
            fileSize: file.size.toString()
          },
          onProgress: ({ transferredBytes, totalBytes }) => {
            const percentage = totalBytes ? Math.round((transferredBytes / totalBytes) * 100) : 0;
            
            uploadProgress.value = {
              transferredBytes,
              totalBytes,
              percentage
            };

            // Llamar callback de progreso si se proporciona
            onProgress?.(uploadProgress.value);
          }
        }
      });

      const result = await uploadTask.result;

      const metadata: FileMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        s3Path: result.path,
        documentId,
        tipo
      };

      console.log(`✅ Archivo cargado exitosamente: ${result.path}`);

      toast.add({
        title: 'Archivo cargado exitosamente',
        description: `${file.name} se ha guardado en la nube`,
        color: 'green'
      });

      return {
        success: true,
        metadata
      };

    } catch (error) {
      console.error('❌ Error cargando archivo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar el archivo';
      uploadError.value = errorMessage;

      toast.add({
        title: 'Error al cargar archivo',
        description: errorMessage,
        color: 'red'
      });

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      isUploading.value = false;
    }
  };

  /**
   * Descarga un archivo desde S3
   */
  const downloadFile = async (s3Path: string, fileName?: string): Promise<Blob | null> => {
    try {
      console.log(`📥 Descargando archivo: ${s3Path}`);

      const result = await downloadData({
        path: s3Path
      }).result;

      const blob = await result.body;
      
      console.log(`✅ Archivo descargado exitosamente: ${s3Path}`);

      // Si se proporciona un nombre de archivo, crear un enlace de descarga
      if (fileName && typeof window !== 'undefined') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      return blob;

    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      
      toast.add({
        title: 'Error al descargar archivo',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'red'
      });

      return null;
    }
  };

  /**
   * Obtiene la URL de descarga de un archivo
   */
  const getDownloadUrl = async (s3Path: string): Promise<string | null> => {
    try {
      const result = await getUrl({
        path: s3Path,
        options: {
          expiresIn: 3600 // 1 hora
        }
      });

      return result.url.toString();

    } catch (error) {
      console.error('❌ Error obteniendo URL de descarga:', error);
      return null;
    }
  };

  /**
   * Elimina un archivo de S3
   */
  const deleteFile = async (s3Path: string): Promise<boolean> => {
    try {
      console.log(`🗑️ Eliminando archivo: ${s3Path}`);

      await remove({
        path: s3Path
      });

      console.log(`✅ Archivo eliminado exitosamente: ${s3Path}`);

      toast.add({
        title: 'Archivo eliminado',
        description: 'El archivo se ha eliminado correctamente',
        color: 'green'
      });

      return true;

    } catch (error) {
      console.error('❌ Error eliminando archivo:', error);
      
      toast.add({
        title: 'Error al eliminar archivo',
        description: error instanceof Error ? error.message : 'Error desconocido',
        color: 'red'
      });

      return false;
    }
  };

  /**
   * Lista archivos en una ruta específica
   */
  const listFiles = async (
    prefix: string,
    maxResults?: number
  ): Promise<FileMetadata[]> => {
    try {
      console.log(`📋 Listando archivos con prefijo: ${prefix}`);

      const result = await list({
        prefix,
        options: {
          maxKeys: maxResults || 100
        }
      });

      const files: FileMetadata[] = result.items.map(item => ({
        fileName: item.key.split('/').pop() || '',
        fileSize: item.size || 0,
        fileType: 'application/octet-stream',
        uploadedAt: item.lastModified?.toISOString() || new Date().toISOString(),
        s3Path: item.key
      }));

      console.log(`✅ Se encontraron ${files.length} archivos`);

      return files;

    } catch (error) {
      console.error('❌ Error listando archivos:', error);
      return [];
    }
  };

  /**
   * Lista archivos por tipo y documento
   */
  const listFilesByType = async (
    tipo: 'planVentas' | 'existencias' | 'cobertura',
    documentId?: string
  ): Promise<FileMetadata[]> => {
    const prefix = documentId 
      ? `carga-insumos/${tipo}/${documentId}/`
      : `carga-insumos/${tipo}/`;
    
    return listFiles(prefix);
  };

  /**
   * Formatea el tamaño de archivo en formato legible
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Formatea la fecha de carga
   */
  const formatUploadDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return {
    // Estado reactivo
    uploadProgress: readonly(uploadProgress),
    isUploading: readonly(isUploading),
    uploadError: readonly(uploadError),

    // Métodos principales
    uploadFile,
    downloadFile,
    getDownloadUrl,
    deleteFile,
    listFiles,
    listFilesByType,

    // Utilidades
    formatFileSize,
    formatUploadDate,
    generateFilePath
  };
};
