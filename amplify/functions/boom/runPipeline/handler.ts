import {DataFactoryManagementClient} from "@azure/arm-datafactory";
import { DefaultAzureCredential } from "@azure/identity";

export const handler = async (event: any) => {
  const pipelineName = event.arguments.pipelineName || "";
  const Pversion = event.arguments.Pversion || "";
  const boomId = event.arguments.boomId || "";

  const resourceGroupName = "ADF";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";

  // Debugging logs para Pversion
  console.log("🔍 Backend Debugging - event.arguments:", event.arguments);
  console.log("🔍 Backend Debugging - Pversion recibido:", Pversion);
  console.log("🔍 Backend Debugging - typeof Pversion:", typeof Pversion);
  console.log("🔍 Backend Debugging - Pversion length:", Pversion?.length);
  console.log("🔍 Backend Debugging - Pversion isEmpty:", Pversion === "" || !Pversion);
  
  console.log("AZURE_TENANT_ID", process.env.AZURE_TENANT_ID);
  console.log("AZURE_CLIENT_ID", process.env.AZURE_CLIENT_ID);
  console.log("AZURE_CLIENT_SECRET", process.env.AZURE_CLIENT_SECRET);
  console.log("AZURE_SUBSCRIPTION_ID", process.env.AZURE_SUBSCRIPTION_ID);
  console.log("AZURE_DATA_FACTORY_NAME", process.env.AZURE_DATA_FACTORY_NAME);

  const credential = new DefaultAzureCredential();

  console.log("📋 Pversion final que se enviará al pipeline:", Pversion);


  const referencePipelineRunId = undefined;
  const parameters = {
    PVersion: Pversion,
    BoomId: boomId,
  };
  const options = {
    referencePipelineRunId,
    parameters,
  };


  const client = new DataFactoryManagementClient(credential, subscriptionId);
   const result = await client.pipelines.createRun(
    resourceGroupName,
    factoryName,
    pipelineName,
    options,
  );
  console.log(result);
  return result;
};


