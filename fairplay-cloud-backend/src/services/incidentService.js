import {
  ScanCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamo.js";
import { env } from "../config/env.js";

export async function getAllIncidents() {
  const command = new ScanCommand({
    TableName: env.incidentsTable,
  });

  const result = await dynamo.send(command);
  return result.Items ?? [];
}

export async function getIncidentById(incidentId) {
  const command = new GetCommand({
    TableName: env.incidentsTable,
    Key: {
      incidentId,
    },
  });

  const result = await dynamo.send(command);
  return result.Item ?? null;
}

export async function getIncidentsByStatus(status) {
  const command = new QueryCommand({
    TableName: env.incidentsTable,
    IndexName: "status-createdAt-index",
    KeyConditionExpression: "#status = :statusValue",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":statusValue": status,
    },
    ScanIndexForward: false,
  });

  const result = await dynamo.send(command);
  return result.Items ?? [];
}

export async function getIncidentsByPlayerId(playerId) {
  const command = new QueryCommand({
    TableName: env.incidentsTable,
    IndexName: "playerId-createdAt-index",
    KeyConditionExpression: "playerId = :playerIdValue",
    ExpressionAttributeValues: {
      ":playerIdValue": playerId,
    },
    ScanIndexForward: false,
  });

  const result = await dynamo.send(command);
  return result.Items ?? [];
}

export async function updateIncidentStatus(incidentId, status) {
  const command = new UpdateCommand({
    TableName: env.incidentsTable,
    Key: {
      incidentId,
    },
    UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":updatedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  });

  const result = await dynamo.send(command);
  return result.Attributes ?? null;
}