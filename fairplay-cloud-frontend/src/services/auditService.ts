import type { AuditRecord } from "../types/dashboard";
import { apiFetch } from "./api";

export async function getAuditRecords(): Promise<AuditRecord[]> {
  const response = await apiFetch("/audit");

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  const data = await response.json();

  return data.map((record: any) => ({
    actionId: record.actionId,
    actionType: record.actionType,
    actor: record.actor,
    incidentId: record.incidentId,
    playerId: record.playerId,
    playerName: record.playerName,
    summary: record.summary,
    timestampRelative: record.timestamp,
  }));
}
