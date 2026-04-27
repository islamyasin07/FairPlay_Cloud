import type { PlayerRiskRecord } from "../types/dashboard";
import { apiFetch } from "./api";

export async function getPlayerRiskRecords(): Promise<PlayerRiskRecord[]> {
  const response = await apiFetch("/players");

  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }

  const data = await response.json();

  return data.map((player: any) => ({
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
