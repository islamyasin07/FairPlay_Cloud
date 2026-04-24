import { useQuery } from "@tanstack/react-query";
import { getCaseCommandRecords } from "../../../services/caseCommandService";

export function useCaseCommands() {
  return useQuery({
    queryKey: ["case-commands"],
    queryFn: getCaseCommandRecords,
  });
}