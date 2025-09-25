import {DataFactoryManagementClient} from "@azure/arm-datafactory";
import { DefaultAzureCredential } from "@azure/identity";

export const handler = async (event: any) => {
  const pipelineName = event.arguments.pipelineName || "";
  const Pversion = event.arguments.Pversion || "";

  const resourceGroupName = "ADF";
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "";
  const factoryName = process.env.AZURE_DATA_FACTORY_NAME || "";


  console.log("subscriptionId", subscriptionId);
  console.log("factoryName", factoryName);
  console.log("pipelineName", pipelineName);

  const credential = new DefaultAzureCredential();

  console.log("Pversion", Pversion);


  const referencePipelineRunId = undefined;
  const parameters = {
    PVersion: Pversion,
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


