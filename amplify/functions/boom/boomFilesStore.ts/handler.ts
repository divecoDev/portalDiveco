import { json2csv } from 'json-2-csv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * 
 * Files type: AprovisionamientoConfigurado, PlanModeloConSemielaborados,  PlanModeloMateriasPrimaConSemielaborados, , PlanVentas, PlanProduccion 
 * @
 */


export const handler = async (event: any) => {
    const boomId = event.headers.boom_id;
    const fileType = event.headers.file_type;
    
    if (!boomId || !fileType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "boom_id and file_type are required" }),
        };
    }

    try {
        let data = event.body;
        
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing JSON body:", parseError);
                return {
                    success: false,
                    message: "Error parsing request body",
                    error: "Invalid JSON format"
                };
            }
        }

        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : [data];

        // Check if we have any data to convert
        if (!dataArray.length) {
            return {
                success: false,
                message: "No data provided to convert to CSV",
                error: "Empty data array"
            };
        }


        const options = {
            excelBOM: true 
          };

        // Convert to CSV
        const csv = await json2csv(dataArray, options);
        console.log("CSV generated successfully");
        
        // Initialize S3 client
        const s3Client = new S3Client({});
        
        // Generate filename with boom ID
        const fileName = `${boomId}/${fileType}.csv`;
        const bucketName = 'explosion-materiales-uts';
        
        // Upload CSV to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: csv,
            ContentType: 'text/csv; charset=utf-8', 
            ContentEncoding: 'utf-8',
            ContentDisposition: `attachment; filename="${fileName}"`,
        };
        
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`CSV uploaded successfully to S3: ${bucketName}/${fileName}`);
        
        return {
            success: true,
            message: "Plan de Produccion obtenido y guardado en S3",
            fileName: fileName,
            bucketName: bucketName,
            s3Key: fileName
        };
        
    } catch (error) {
        console.error("Error in GetPlanProduccion handler:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            message: "Error processing request",
            error: errorMessage
        };
    }
};