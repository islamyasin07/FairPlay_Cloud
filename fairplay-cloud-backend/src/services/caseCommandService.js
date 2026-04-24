import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamo.js";
import { env } from "../config/env.js";

function ensureCasesTable() {
  if (!env.caseCommandsTable) {
    throw new Error("CASE_COMMANDS_TABLE is not configured.");
  }
}

function priorityFromSeverity(severity) {
  if (severity === "Critical") return "P0";
  if (severity === "High") return "P1";
  if (severity === "Medium") return "P2";
  return "P3";
}

function queueStatusFromIncidentStatus(status) {
  if (status === "Open") return "Needs Triage";
  if (status === "Under Review") return "Under Review";
  if (status === "Confirmed") return "Needs Decision";
  return "Resolved";
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildCaseFromIncident(incident) {
  const createdAt = incident.createdAt ?? new Date().toISOString();
  const createdTime = new Date(createdAt).getTime();
  const fallbackCreated = Number.isNaN(createdTime) ? Date.now() : createdTime;
  const slaDueAt = new Date(fallbackCreated + 24 * 60 * 60 * 1000).toISOString();

  return {
    caseId: `CASE-${incident.incidentId}`,
    incidentId: incident.incidentId,
    playerId: incident.playerId,
    playerName: incident.playerName,
    region: incident.region,
    cheatType: incident.cheatType,
    severity: incident.severity,
    riskScore: toNumber(incident.riskScore),
    priority: priorityFromSeverity(incident.severity),
    queueStatus: queueStatusFromIncidentStatus(incident.status),
    assignee: "Unassigned",
    notes: "",
    createdAt,
    updatedAt: new Date().toISOString(),
    slaDueAt,
  };
}

export async function getAllCaseCommands() {
  ensureCasesTable();

  const command = new ScanCommand({
    TableName: env.caseCommandsTable,
  });

  const result = await dynamo.send(command);
  return (result.Items ?? []).sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
}

export async function getCaseCommandById(caseId) {
  ensureCasesTable();

  const command = new GetCommand({
    TableName: env.caseCommandsTable,
    Key: { caseId },
  });

  const result = await dynamo.send(command);
  return result.Item ?? null;
}

export async function createCaseCommand(payload) {
  ensureCasesTable();

  const now = new Date().toISOString();
  const caseRecord = {
    caseId: payload.caseId ?? `CASE-${payload.incidentId ?? Date.now()}`,
    incidentId: payload.incidentId,
    playerId: payload.playerId,
    playerName: payload.playerName,
    region: payload.region,
    cheatType: payload.cheatType,
    severity: payload.severity,
    riskScore: toNumber(payload.riskScore),
    priority: payload.priority ?? priorityFromSeverity(payload.severity),
    queueStatus: payload.queueStatus ?? "Needs Triage",
    assignee: payload.assignee ?? "Unassigned",
    notes: payload.notes ?? "",
    createdAt: payload.createdAt ?? now,
    updatedAt: now,
    slaDueAt:
      payload.slaDueAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  const command = new PutCommand({
    TableName: env.caseCommandsTable,
    Item: caseRecord,
  });

  await dynamo.send(command);
  return caseRecord;
}

export async function updateCaseCommand(caseId, updates) {
  ensureCasesTable();

  const fields = ["priority", "queueStatus", "assignee", "notes", "slaDueAt"];
  const nextUpdates = Object.fromEntries(
    fields
      .filter((field) => updates[field] !== undefined)
      .map((field) => [field, updates[field]])
  );

  nextUpdates.updatedAt = new Date().toISOString();

  const keys = Object.keys(nextUpdates);
  if (keys.length === 0) {
    return getCaseCommandById(caseId);
  }

  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  const setParts = [];

  keys.forEach((field) => {
    const nameToken = `#${field}`;
    const valueToken = `:${field}`;
    expressionAttributeNames[nameToken] = field;
    expressionAttributeValues[valueToken] = nextUpdates[field];
    setParts.push(`${nameToken} = ${valueToken}`);
  });

  const command = new UpdateCommand({
    TableName: env.caseCommandsTable,
    Key: { caseId },
    UpdateExpression: `SET ${setParts.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  const result = await dynamo.send(command);
  return result.Attributes ?? null;
}

export async function bootstrapCaseCommandsFromIncidents(limit = 200) {
  ensureCasesTable();

  if (!env.incidentsTable) {
    throw new Error("INCIDENTS_TABLE is not configured.");
  }

  const [casesResult, incidentsResult] = await Promise.all([
    dynamo.send(
      new ScanCommand({
        TableName: env.caseCommandsTable,
      })
    ),
    dynamo.send(
      new ScanCommand({
        TableName: env.incidentsTable,
      })
    ),
  ]);

  const existingByIncidentId = new Set(
    (casesResult.Items ?? [])
      .map((item) => item.incidentId)
      .filter((incidentId) => typeof incidentId === "string")
  );

  const incidents = (incidentsResult.Items ?? [])
    .slice()
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);

  const created = [];

  for (const incident of incidents) {
    if (!incident.incidentId || existingByIncidentId.has(incident.incidentId)) {
      continue;
    }

    const caseRecord = buildCaseFromIncident(incident);

    await dynamo.send(
      new PutCommand({
        TableName: env.caseCommandsTable,
        Item: caseRecord,
      })
    );

    created.push(caseRecord);
    existingByIncidentId.add(incident.incidentId);
  }

  return created;
}