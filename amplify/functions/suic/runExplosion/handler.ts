import {DataFactoryManagementClient} from "@azure/arm-datafactory";
import { DefaultAzureCredential } from "@azure/identity";

export const handler = async (event: any) => {
  const pipelineName = "PL_Genera_SUIC";
  const idSuic = event.arguments.idSuic || "";
  const tipo = event.arguments.tipo || "";
  const primerMes = event.arguments.primerMes || 0;

  const resourceGroupName = "ADF";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";

  console.log("📋 Parámetros SUIC Generación:");
  console.log("  - idSuic:", idSuic);
  console.log("  - tipo:", tipo);
  console.log("  - primerMes:", primerMes);
  console.log("  - pipelineName:", pipelineName);

  const credential = new DefaultAzureCredential();

  const parameters = {
    id_suic: idSuic,
    tipo: tipo,       
    mes: primerMes 
  };

  const options = {
    referencePipelineRunId: undefined,
    parameters,
  };

  console.log("🔍 Parámetros finales enviados al pipeline:", JSON.stringify(parameters, null, 2));

  const client = new DataFactoryManagementClient(credential, subscriptionId);
  const result = await client.pipelines.createRun(
    resourceGroupName,
    factoryName,
    pipelineName,
    options,
  );
  
  console.log("✅ Pipeline SUIC iniciado:", result);
  return result;
};

