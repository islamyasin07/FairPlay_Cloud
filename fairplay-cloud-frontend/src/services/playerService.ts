import type { PlayerRiskRecord } from "../types/dashboard";
import { apiFetch } from "./api";

type PlayerRiskRecordResponse = {
  playerId: string;
  username: string;
  region: string;
  riskScore: number | string;
  status: PlayerRiskRecord["status"];
  totalIncidents: number | string;
  primaryPattern: PlayerRiskRecord["primaryPattern"];
  lastSeen: string;
  ipAddress?: string;
  "IP address"?: string;
};

export async function getPlayerRiskRecords(): Promise<PlayerRiskRecord[]> {
  const response = await apiFetch("/players");

  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }

  const data = (await response.json()) as PlayerRiskRecordResponse[];

  return data.map((player) => ({
    playerId: player.playerId,
    username: player.username,
    region: player.region,
    riskScore: Number(player.riskScore),
    status: player.status,
    totalIncidents: Number(player.totalIncidents),
    primaryPattern: player.primaryPattern,
    lastSeen: player.lastSeen,
    ipAddress: player['IP address'] || player.ipAddress || undefined,
  }));
}
