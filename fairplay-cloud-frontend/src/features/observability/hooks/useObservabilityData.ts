import { useQuery } from "@tanstack/react-query";
import { getObservabilitySnapshot } from "../../../services/observabilityService";

export function useObservabilityData() {
  return useQuery({
    queryKey: ["observability-snapshot"],
    queryFn: getObservabilitySnapshot,
    staleTime: 15 * 1000, // Data is considered stale after 15 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 30 * 1000, // Automatically refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when connection is restored
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
