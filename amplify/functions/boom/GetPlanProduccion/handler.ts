import msql from "mssql";
import { json2csv } from 'json-2-csv';

export const handler = async (event: any) => {
    try {
        const boomId = event.headers.boomId;
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

        // Convert to CSV
        const csv = await json2csv(dataArray);
        console.log("CSV generated successfully");
        console.log("csv", csv);
        return {
            success: true,
            message: "Plan de Produccion obtenido",
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
}