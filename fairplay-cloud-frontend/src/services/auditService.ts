import type { AuditRecord } from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getAuditRecords(): Promise<AuditRecord[]> {
  const response = await fetch(`${API_BASE_URL}/audit`);

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