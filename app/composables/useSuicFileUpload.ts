// app/composables/useSuicFileUpload.ts
import { uploadData, downloadData, getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';

export const useSuicFileUpload = () => {
  const client = generateClient();
  
  /**
   * Subir archivo Excel a S3 en el storage de suic
   * @param suicId - ID del registro SUIC
   * @param file - Archivo Excel a subir
   * @param countries - Array de códigos de países que contiene el archivo
   * @returns Metadata del archivo subido (s3Path y uploadedAt)
   */
  const uploadSuicFile = async (
    suicId: string,
    file: File,
    countries: string[]
  ): Promise<{ s3Path: string; uploadedAt: string }> => {
    try {
      const timestamp = Date.now();
      const fileName = file.name;
      const s3Key = `suic/${suicId}/${timestamp}_${fileName}`;
      
      console.log('☁️ Subiendo archivo a S3:', {
        suicId,
        fileName,
        s3Key,
        fileSize: file.size,
        countries
      });
      
      const result = await uploadData({
        path: s3Key,
        data: file,
        options: {
          contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }).result;
      
      console.log('✅ Archivo subido exitosamente a S3:', result);
      
      return {
        s3Path: s3Key,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error subiendo archivo a S3:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`No se pudo subir el archivo a S3: ${errorMessage}`);
    }
  };
  
  /**
   * Actualizar el campo filesPath en el modelo SUIC
   * @param suicId - ID del registro SUIC
   * @param fileMetadata - Metadata del archivo (s3Path y uploadedAt)
   * @param countries - Array de códigos de países
   */
  const updateSuicFilesPath = async (
    suicId: string,
    fileMetadata: { s3Path: string; uploadedAt: string },
    countries: string[]
  ): Promise<void> => {
    try {
      console.log('📝 Iniciando actualización de filesPath en SUIC...');
      console.log('📝 Parámetros:', {
        suicId,
        fileMetadata,
        countries
      });
      
      // Verificar que el cliente esté disponible
      console.log('🔍 Verificando cliente:', client);
      console.log('🔍 Cliente tiene models?', !!client.models);
      console.log('🔍 Cliente tiene mutations?', !!client.mutations);
      
      // Obtener SUIC actual
      console.log('🔍 Obteniendo registro SUIC actual...');
      const { data: suic } = await (client as any).models.SUIC.get({ id: suicId });
      
      console.log('📋 SUIC actual:', suic);
      
      if (!suic) {
        throw new Error(`No se encontró el registro SUIC con id ${suicId}`);
      }
      
      // Construir nuevo filesPath
      console.log('🔧 Construyendo nuevo filesPath...');
      const currentFilesPath = (suic.filesPath && typeof suic.filesPath === 'object' && !Array.isArray(suic.filesPath)) 
        ? (suic.filesPath as Record<string, any>) 
        : {};
      const newFilesPath = { ...currentFilesPath };
      
      if (countries.length > 1) {
        // Archivo multi-país - guardar con key "ALL"
        newFilesPath['ALL'] = {
          s3Path: fileMetadata.s3Path,
          uploadedAt: fileMetadata.uploadedAt,
          countries: countries
        };
        
        console.log('📦 Archivo multi-país detectado. Países:', countries);
      } else {
        // Archivo individual - guardar con código del país (reemplaza si existe)
        const paisCode = countries[0];
        if (paisCode) {
          newFilesPath[paisCode] = {
            s3Path: fileMetadata.s3Path,
            uploadedAt: fileMetadata.uploadedAt
          };
          
          console.log('📦 Archivo individual. País:', paisCode);
        }
      }
      
      console.log('🔄 Ejecutando update con:', {
        id: suicId,
        filesPath: newFilesPath,
        filesPathType: typeof newFilesPath,
        filesPathString: JSON.stringify(newFilesPath)
      });
      
      // Amplify Gen 2 requiere que los campos a.json() se envíen como strings JSON
      const filesPathAsString = JSON.stringify(newFilesPath);
      
      console.log('📦 filesPathAsString:', filesPathAsString);
      console.log('📦 filePathAsString type:', typeof filesPathAsString);
      
      // Actualizar registro
      const updateResult = await (client as any).models.SUIC.update({
        id: suicId,
        filesPath: filesPathAsString // Enviar como string JSON
      });
      
      console.log('✅ Update completado. Resultado:', updateResult);
      console.log('✅ filesPath actualizado exitosamente:', newFilesPath);
      
      // Verificar que se haya guardado correctamente
      console.log('🔍 Verificando que el update se guardó correctamente...');
      const { data: updatedSuic } = await (client as any).models.SUIC.get({ id: suicId });
      console.log('✅ SUIC después del update:', updatedSuic);
      console.log('✅ filesPath verificado:', updatedSuic?.filesPath);
      
    } catch (error) {
      console.error('❌ Error actualizando filesPath:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'N/A',
        error: error
      });
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`No se pudo actualizar filesPath en SUIC: ${errorMessage}`);
    }
  };
  
  /**
   * Descargar archivo SUIC de S3
   * @param s3Path - Ruta del archivo en S3
   * @returns Blob del archivo
   */
  const downloadSuicFile = async (s3Path: string): Promise<Blob> => {
    try {
      console.log('⬇️ Descargando archivo de S3:', s3Path);
      
      const result = await downloadData({
        path: s3Path
      }).result;
      
      console.log('✅ Archivo descargado exitosamente');
      return result.body as unknown as Blob;
    } catch (error) {
      console.error('❌ Error descargando archivo de S3:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`No se pudo descargar el archivo de S3: ${errorMessage}`);
    }
  };
  
  /**
   * Obtener URL de descarga temporal para archivo SUIC
   * @param s3Path - Ruta del archivo en S3
   * @returns URL de descarga
   */
  const getDownloadUrl = async (s3Path: string): Promise<string> => {
    try {
      console.log('🔗 Generando URL de descarga para:', s3Path);
      
      const url = await getUrl({
        path: s3Path,
        options: {
          expiresIn: 3600 // 1 hora
        }
      });
      
      console.log('✅ URL de descarga generada:', url.url.toString());
      return url.url.toString();
    } catch (error) {
      console.error('❌ Error generando URL de descarga:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`No se pudo generar URL de descarga: ${errorMessage}`);
    }
  };
  
  return {
    uploadSuicFile,
    updateSuicFilesPath,
    downloadSuicFile,
    getDownloadUrl
  };
};
