import type { CaseCommandRecord, CaseQueueStatus } from "../types/dashboard";
import { apiFetch } from "./api";

function mapCaseRecord(record: any): CaseCommandRecord {
  return {
    caseId: record.caseId,
    incidentId: record.incidentId,
    playerId: record.playerId,
    playerName: record.playerName,
    region: record.region,
    cheatType: record.cheatType,
    severity: record.severity,
    riskScore: Number(record.riskScore),
    priority: record.priority,
    queueStatus: record.queueStatus,
    assignee: record.assignee ?? "Unassigned",
    notes: record.notes ?? "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    slaDueAt: record.slaDueAt,
  };
}

export async function getCaseCommandRecords(): Promise<CaseCommandRecord[]> {
  const response = await apiFetch("/case-commands");

  if (!response.ok) {
    throw new Error("Failed to fetch case commands");
  }

  const data = await response.json();
  return data.map(mapCaseRecord);
}

export async function updateCaseCommandRecord(
  caseId: string,
  updates: Partial<{
    priority: string;
    queueStatus: CaseQueueStatus;
    assignee: string;
    notes: string;
    slaDueAt: string;
  }>
): Promise<CaseCommandRecord> {
  const response = await apiFetch(`/case-commands/${caseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update case command record");
  }

  const data = await response.json();
  return mapCaseRecord(data);
}

export async function bootstrapCaseCommands(limit = 200): Promise<{
  createdCount: number;
  records: CaseCommandRecord[];
}> {
  const response = await apiFetch("/case-commands/bootstrap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit }),
  });

  if (!response.ok) {
    throw new Error("Failed to bootstrap case commands");
  }

  const data = await response.json();

  return {
    createdCount: data.createdCount,
    records: (data.records ?? []).map(mapCaseRecord),
  };
}