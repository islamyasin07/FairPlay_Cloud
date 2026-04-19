import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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

const client = new DynamoDBClient(clientConfig);

export const dynamo = DynamoDBDocumentClient.from(client);