import { auditRecords } from "../lib/mock-data/dashboard";

export async function getAuditRecords() {
  return Promise.resolve(auditRecords);
}