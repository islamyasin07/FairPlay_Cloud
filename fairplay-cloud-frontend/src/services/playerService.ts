import type { PlayerRiskRecord } from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getPlayerRiskRecords(): Promise<PlayerRiskRecord[]> {
  const response = await fetch(`${API_BASE_URL}/players`);

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
  }));
}