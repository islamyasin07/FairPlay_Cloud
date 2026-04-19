import { playerRiskRecords } from "../lib/mock-data/dashboard.ts";

export async function getPlayerRiskRecords() {
  return Promise.resolve(playerRiskRecords);
}