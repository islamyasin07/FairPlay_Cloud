import { useQuery } from "@tanstack/react-query";
import { getHealthDashboardData } from "../../../services/healthService";

export function useHealthData() {
  return useQuery({
    queryKey: ["health-data"],
    queryFn: getHealthDashboardData,
  });
}