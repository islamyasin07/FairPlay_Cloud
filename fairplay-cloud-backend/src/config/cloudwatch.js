import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { env } from "./env.js";

const clientConfig = {
  region: env.awsRegion || "us-east-1",
};

if (env.awsAccessKeyId && env.awsSecretAccessKey) {
  clientConfig.credentials = {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  };
}

export const cloudWatch = new CloudWatchClient(clientConfig);
