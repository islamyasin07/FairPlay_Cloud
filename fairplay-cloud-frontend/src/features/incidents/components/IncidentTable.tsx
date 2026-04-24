import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import StatusBadge from "../../../components/ui/StatusBadge";
import LoadingState from "../../../components/ui/LoadingState";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import type { IncidentRecord, IncidentStatus } from "../../../types/dashboard";
import { useIncidents } from "../hooks/useIncidents";
import IncidentReplayDrawer from "./IncidentReplayDrawer";
import { updateIncidentStatus } from "../../../services/incidentService";

function severityTone(severity: string) {
  if (severity === "Critical") return "danger";
  if (severity === "High") return "warning";
  if (severity === "Medium") return "info";
  return "neutral";
}

function statusTone(status: string) {
  if (status === "Open") return "info";
  if (status === "Under Review") return "warning";
  if (status === "Confirmed") return "danger";
  return "neutral";
}

function IncidentTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "All">("All");
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [localIncidents, setLocalIncidents] = useState<IncidentRecord[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: incidents = [], isLoading, isError } = useIncidents();

  useEffect(() => {
    setLocalIncidents(incidents);
  }, [incidents]);

  const handleStatusChange = async (
    incidentId: string,
    newStatus: IncidentStatus
  ) => {
    try {
      setIsUpdating(true);

      const updatedIncident = await updateIncidentStatus(incidentId, newStatus);

      setLocalIncidents((prev) =>
        prev.map((incident) =>
          incident.incidentId === incidentId ? updatedIncident : incident
        )
      );

      setSelectedIncident((prev) =>
        prev && prev.incidentId === incidentId ? updatedIncident : prev
      );

      await queryClient.invalidateQueries({ queryKey: ["players"] });
    } catch (error) {
      console.error("Failed to update incident status:", error);
      alert("Failed to update incident status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredIncidents = useMemo(() => {
    return localIncidents.filter((incident) => {
      const matchesSearch =
        incident.incidentId.toLowerCase().includes(search.toLowerCase()) ||
        incident.playerName.toLowerCase().includes(search.toLowerCase()) ||
        incident.playerId.toLowerCase().includes(search.toLowerCase()) ||
        incident.cheatType.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : incident.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [localIncidents, search, statusFilter]);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading incident queue"
        description="Preparing suspicious incident records for moderator review."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load incident records"
        description="The incident queue could not be loaded at this time."
      />
    );
  }

  return (
    <>
      <div>
        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            type="text"
            placeholder="Search incident, player, player ID, or cheat type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/30"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | "All")}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/30"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <div className="hidden grid-cols-[1fr_1fr_1fr_120px_140px_100px] gap-4 border-b border-slate-800 bg-slate-950/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 lg:grid">
            <span>Incident</span>
            <span>Player</span>
            <span>Cheat Type</span>
            <span>Severity</span>
            <span>Status</span>
            <span>Score</span>
          </div>

          <div className="divide-y divide-slate-800">
            {filteredIncidents.map((incident) => (
              <button
                key={incident.incidentId}
                type="button"
                onClick={() => setSelectedIncident(incident)}
                className="grid w-full gap-4 bg-slate-950/50 px-5 py-5 text-left transition duration-300 hover:bg-slate-950/80 lg:grid-cols-[1fr_1fr_1fr_120px_140px_100px]"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{incident.incidentId}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Match: {incident.matchId} • {incident.createdAtRelative}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-white">{incident.playerName}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {incident.playerId} • {incident.region}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-cyan-300">{incident.cheatType}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {incident.detectionReason}
                  </p>
                </div>

                <div className="lg:self-center">
                  <StatusBadge
                    label={incident.severity}
                    tone={severityTone(incident.severity)}
                  />
                </div>

                <div className="lg:self-center">
                  <StatusBadge
                    label={incident.status}
                    tone={statusTone(incident.status)}
                  />
                </div>

                <div className="lg:self-center">
                  <span className="text-sm font-semibold text-white">
                    {incident.riskScore}
                  </span>
                </div>
              </button>
            ))}

            {filteredIncidents.length === 0 && (
              <EmptyState
                title="No incidents matched"
                description="Try changing the search term or selected status filter."
              />
            )}
          </div>
        </div>
      </div>

      <IncidentReplayDrawer
        incident={selectedIncident}
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdating}
      />
    </>
  );
}

export default IncidentTable;