import { useQuery } from "@tanstack/react-query";
import { getObservabilitySnapshot } from "../../../services/observabilityService";

export function useObservabilityData() {
  return useQuery({
    queryKey: ["observability-snapshot"],
    queryFn: getObservabilitySnapshot,
  });
}
