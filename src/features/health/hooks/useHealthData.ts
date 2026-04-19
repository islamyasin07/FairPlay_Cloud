import { useQuery } from "@tanstack/react-query";
import {
  getQueueHealthRecords,
  getReliabilityMetrics,
  getServiceHealthRecords,
} from "../../../services/healthService";

export function useHealthData() {
  return useQuery({
    queryKey: ["health-data"],
    queryFn: async () => {
      const [services, queues, metrics] = await Promise.all([
        getServiceHealthRecords(),
        getQueueHealthRecords(),
        getReliabilityMetrics(),
      ]);

      return {
        services,
        queues,
        metrics,
      };
    },
  });
}