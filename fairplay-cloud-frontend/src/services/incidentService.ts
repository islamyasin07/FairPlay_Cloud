import type { IncidentRecord, IncidentStatus } from "../types/dashboard";
import { apiFetch } from "./api";

function mapIncident(incident: any): IncidentRecord {
  return {
    incidentId: incident.incidentId,
    playerId: incident.playerId,
    playerName: incident.playerName,
    matchId: incident.matchId,
    cheatType: incident.cheatType,
    severity: incident.severity,
    status: incident.status,
    riskScore: Number(incident.riskScore),
    region: incident.region,
    detectionReason: incident.detectionReason,
    createdAtRelative: incident.createdAt ?? incident.createdAtRelative ?? "",
    evidenceVideo: incident.evidenceVideo,
    evidenceThumbnail: incident.evidenceThumbnail,
    metrics: incident.metrics ?? [],
    timeline: incident.timeline ?? [],
  };
}

export async function getIncidentRecords(): Promise<IncidentRecord[]> {
  const response = await apiFetch("/incidents");

  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }

  const data = await response.json();
  return data.map(mapIncident);
}

export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus
): Promise<IncidentRecord> {
  const response = await apiFetch(`/incidents/${incidentId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update incident status");
  }

  const data = await response.json();
  return mapIncident(data);
}
