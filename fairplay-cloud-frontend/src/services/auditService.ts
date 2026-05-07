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

export async function getAuditRecords(
  incidentId?: string
): Promise<AuditRecord[]> {
  const query = incidentId ? `?incidentId=${encodeURIComponent(incidentId)}` : "";
  const response = await apiFetch(`/audit${query}`);

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
