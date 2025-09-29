import {DataFactoryManagementClient} from "@azure/arm-datafactory";
import { DefaultAzureCredential } from "@azure/identity";

export const handler = async (event: any) => {

  /**
   * 
   *        
   *  Environment variables:
   *  AZURE_TENANT_ID: secret("AZURE_TENANT_ID"),
        AZURE_CLIENT_ID: secret("AZURE_CLIENT_ID"),
        AZURE_CLIENT_SECRET: secret("AZURE_CLIENT_SECRET"),
        AZURE_SUBSCRIPTION_ID: secret("AZURE_SUBSCRIPTION_ID"),
        AZURE_DATA_FACTORY_NAME: secret("AZURE_DATA_FACTORY_NAME"),
  },
});
   */

  
  console.log("AZURE_TENANT_ID", process.env.AZURE_TENANT_ID);
  console.log("AZURE_CLIENT_ID", process.env.AZURE_CLIENT_ID);
  console.log("AZURE_CLIENT_SECRET", process.env.AZURE_CLIENT_SECRET);
  console.log("AZURE_SUBSCRIPTION_ID", process.env.AZURE_SUBSCRIPTION_ID);
  console.log("AZURE_DATA_FACTORY_NAME", process.env.AZURE_DATA_FACTORY_NAME);

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
