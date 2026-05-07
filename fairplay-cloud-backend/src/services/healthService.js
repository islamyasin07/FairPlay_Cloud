import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamo.js";
import { env } from "../config/env.js";

function parseLatencyValue(latency) {
  if (typeof latency !== "string") {
    return null;
  }

  const match = latency.match(/\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

function normalizeHealthStatus(item) {
  const status = typeof item.status === "string" ? item.status.trim() : "";

  if (status !== "Warning") {
    return status || "Healthy";
  }

  const latency = parseLatencyValue(item.latency);
  if (latency !== null && latency < 150) {
    return "Healthy";
  }

  return status;
}

export async function getAllHealthMetrics() {
  const command = new ScanCommand({
    TableName: env.systemHealthTable,
  });

  const result = await dynamo.send(command);
  return (result.Items ?? []).map((item) => ({
    ...item,
    status: normalizeHealthStatus(item),
  }));
}