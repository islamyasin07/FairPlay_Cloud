import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamo.js";
import { env } from "../config/env.js";

export async function getAllHealthMetrics() {
  const command = new ScanCommand({
    TableName: env.systemHealthTable,
  });

  const result = await dynamo.send(command);
  return result.Items ?? [];
}