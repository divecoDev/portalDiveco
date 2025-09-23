import {DataFactoryManagementClient} from "@azure/arm-datafactory";
import { DefaultAzureCredential } from "@azure/identity";

export const handler = async (event: any) => {
  const resourceGroupName = "ADF";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";
  const pipelineName = process.env.AZURE_PIPELINE_NAME || "";


  console.log("subscriptionId", subscriptionId);
  console.log("factoryName", factoryName);
  console.log("pipelineName", pipelineName);

  const credential = new DefaultAzureCredential();


  const referencePipelineRunId = undefined;
  const parameters = {
    outputBlobNameList: ["exampleoutput.csv"],
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


