import { useQuery } from "@tanstack/react-query";
import { getPlayerRiskRecords } from "../../../services/playerService";

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: getPlayerRiskRecords,
  });
}