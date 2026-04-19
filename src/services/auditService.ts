import { auditRecords } from "../lib/mock-data/dashboard.ts";

export async function getAuditRecords() {
  return Promise.resolve(auditRecords);
}