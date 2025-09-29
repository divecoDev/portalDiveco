import {DataFactoryManagementClient} from "@azure/arm-datafactory";
import { DefaultAzureCredential } from "@azure/identity";

export const handler = async (event: any) => {
  const runId = event.arguments.runId || "";

  const resourceGroupName = "ADF";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";

  const credential = new DefaultAzureCredential();

  const client = new DataFactoryManagementClient(credential, subscriptionId);
    const result = await client.pipelineRuns.get(resourceGroupName, factoryName, runId);

  console.log(result);
  return result;
};
