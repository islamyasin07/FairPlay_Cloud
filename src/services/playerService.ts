import { playerRiskRecords } from "../lib/mock-data/dashboard";

export async function getPlayerRiskRecords() {
  return Promise.resolve(playerRiskRecords);
}