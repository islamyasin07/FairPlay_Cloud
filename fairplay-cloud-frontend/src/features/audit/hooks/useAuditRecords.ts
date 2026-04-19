import { useQuery } from "@tanstack/react-query";
import { getAuditRecords } from "../../../services/auditService";

export function useAuditRecords() {
  return useQuery({
    queryKey: ["audit-records"],
    queryFn: getAuditRecords,
  });
}