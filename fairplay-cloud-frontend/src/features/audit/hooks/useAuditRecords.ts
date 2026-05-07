import { useQuery } from "@tanstack/react-query";
import { getAuditRecords } from "../../../services/auditService";

export function useAuditRecords(incidentId?: string) {
  return useQuery({
    queryKey: ["audit-records", incidentId ?? null],
    queryFn: () => getAuditRecords(incidentId),
  });
}