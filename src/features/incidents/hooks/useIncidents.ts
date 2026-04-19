import { useQuery } from "@tanstack/react-query";
import { getIncidentRecords } from "../../../services/incidentService";

export function useIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: getIncidentRecords,
  });
}
