import type { AuditRecord } from "../types/dashboard";
import { apiFetch } from "./api";

type AuditRecordResponse = {
  actionId: string;
  actionType: AuditRecord["actionType"];
  actor: string;
  incidentId?: string;
  playerId?: string;
  playerName?: string;
  summary: string;
  timestamp: string;
};

export async function getAuditRecords(): Promise<AuditRecord[]> {
  const response = await apiFetch("/audit");

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  const data = (await response.json()) as AuditRecordResponse[];

  return data.map((record) => ({
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
