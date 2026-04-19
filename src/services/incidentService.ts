import { incidentRecords } from "../lib/mock-data/dashboard.ts";

export async function getIncidentRecords() {
  return Promise.resolve(incidentRecords);
}