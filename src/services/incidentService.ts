import { incidentRecords } from "../lib/mock-data/dashboard";

export async function getIncidentRecords() {
  return Promise.resolve(incidentRecords);
}