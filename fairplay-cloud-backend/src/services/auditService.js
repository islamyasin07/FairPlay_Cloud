import {
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamo.js";
import { env } from "../config/env.js";

export async function getAllAuditLogs() {
  const command = new ScanCommand({
    TableName: env.auditLogsTable,
  });

  const result = await dynamo.send(command);
  return result.Items ?? [];
}

export async function getAuditLogsByIncidentId(incidentId) {
  const command = new QueryCommand({
    TableName: env.auditLogsTable,
    IndexName: "incidentId-timestamp-index",
    KeyConditionExpression: "incidentId = :incidentIdValue",
    ExpressionAttributeValues: {
      ":incidentIdValue": incidentId,
    },
    ScanIndexForward: false,
  });

  const result = await dynamo.send(command);
  return result.Items ?? [];
}