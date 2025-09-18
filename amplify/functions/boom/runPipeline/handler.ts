import {DataFactoryManagementClient} from "@azure/arm-datafactory";
import { DefaultAzureCredential } from "@azure/identity";

export const handler = async (event: any) => {
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";
  const pipelineName = process.env.AZURE_PIPELINE_NAME || "";
  const referencePipelineRunId = process.env.AZURE_REFERENCE_PIPELINE_RUN_ID || "";

  const credential = new DefaultAzureCredential();

  const client = new DataFactoryManagementClient(credential, subscriptionId);
  const result = await client.pipelines.createRun(factoryName, pipelineName, referencePipelineRunId);
  console.log(result);
  return result;
};


