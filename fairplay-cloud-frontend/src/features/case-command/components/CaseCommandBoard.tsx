import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import LoadingState from "../../../components/ui/LoadingState";
import StatusBadge from "../../../components/ui/StatusBadge";
import {
  bootstrapCaseCommands,
  updateCaseCommandRecord,
} from "../../../services/caseCommandService";
import type { CaseCommandRecord, CaseQueueStatus } from "../../../types/dashboard";
import { useCaseCommands } from "../hooks/useCaseCommands";

type LaneDefinition = {
  title: string;
  description: string;
  filter: (record: CaseCommandRecord) => boolean;
};

function parseTime(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function hoursSince(dateString: string): number {
  const time = parseTime(dateString);
  if (!time) return 0;
  return (Date.now() - time) / (1000 * 60 * 60);
}

function isOverdue(record: CaseCommandRecord): boolean {
  if (record.queueStatus === "Resolved") {
    return false;
  }

  const dueAt = parseTime(record.slaDueAt);
  return dueAt > 0 && dueAt < Date.now();
}

function severityTone(severity: string) {
  if (severity === "Critical") return "danger";
  if (severity === "High") return "warning";
  if (severity === "Medium") return "info";
  return "neutral";
}

function priorityTone(priority: string) {
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  if (priority === "P2") return "info";
  return "neutral";
}

function queueTone(status: string) {
  if (status === "Resolved") return "success";
  if (status === "Needs Decision") return "warning";
  if (status === "Under Review") return "info";
  return "neutral";
}

function CaseCommandBoard() {
  const { data: records, isLoading, isError, refetch } = useCaseCommands();
  const [localRecords, setLocalRecords] = useState<CaseCommandRecord[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  useEffect(() => {
    if (records) {
      setLocalRecords(records);
    }
  }, [records]);

  const visibleRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      return localRecords;
    }

    return localRecords.filter((record) => {
      return (
        record.caseId.toLowerCase().includes(q) ||
        record.incidentId.toLowerCase().includes(q) ||
        record.playerName.toLowerCase().includes(q) ||
        record.playerId.toLowerCase().includes(q) ||
        record.assignee.toLowerCase().includes(q) ||
        record.region.toLowerCase().includes(q)
      );
    });
  }, [localRecords, search]);

  const kpis = useMemo(() => {
    const openCases = localRecords.filter((record) => record.queueStatus !== "Resolved");
    const overdueCases = openCases.filter(isOverdue);
    const needsDecision = localRecords.filter(
      (record) => record.queueStatus === "Needs Decision"
    );

    const totalOpenHours = openCases.reduce((sum, record) => {
      return sum + hoursSince(record.createdAt);
    }, 0);

    const averageOpenHours = openCases.length > 0 ? totalOpenHours / openCases.length : 0;

    return {
      openCount: openCases.length,
      overdueCount: overdueCases.length,
      needsDecisionCount: needsDecision.length,
      averageOpenHours,
    };
  }, [localRecords]);

  const lanes = useMemo<LaneDefinition[]>(
    () => [
      {
        title: "Critical Open",
        description: "Critical severity cases requiring immediate triage.",
        filter: (record) =>
          record.severity === "Critical" && record.queueStatus !== "Resolved",
      },
      {
        title: "Under Review",
        description: "Investigations actively assigned to moderators.",
        filter: (record) => record.queueStatus === "Under Review",
      },
      {
        title: "Needs Decision",
        description: "Cases waiting for ban, dismissal, or escalation decisions.",
        filter: (record) => record.queueStatus === "Needs Decision",
      },
      {
        title: "Stale Cases",
        description: "Open cases older than 24 hours and still unresolved.",
        filter: (record) => record.queueStatus !== "Resolved" && hoursSince(record.createdAt) > 24,
      },
    ],
    []
  );

  async function runBulkUpdate(nextStatus: CaseQueueStatus) {
    const selectedIds = Array.from(selectedCaseIds);

    if (selectedIds.length === 0) {
      return;
    }

    try {
      setIsUpdating(true);

      const updatedRecords = await Promise.all(
        selectedIds.map((caseId) =>
          updateCaseCommandRecord(caseId, {
            queueStatus: nextStatus,
          })
        )
      );

      const byId = new Map(updatedRecords.map((record) => [record.caseId, record]));

      setLocalRecords((prev) =>
        prev.map((record) => byId.get(record.caseId) ?? record)
      );
      setSelectedCaseIds(new Set());
    } catch (error) {
      console.error("Failed to update selected cases:", error);
      alert("Failed to update selected cases.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function runBootstrap() {
    try {
      setIsBootstrapping(true);
      await bootstrapCaseCommands(200);
      await refetch();
    } catch (error) {
      console.error("Failed to bootstrap case commands:", error);
      alert("Failed to bootstrap case commands.");
    } finally {
      setIsBootstrapping(false);
    }
  }

  function toggleSelected(caseId: string) {
    setSelectedCaseIds((prev) => {
      const next = new Set(prev);

      if (next.has(caseId)) {
        next.delete(caseId);
      } else {
        next.add(caseId);
      }

      return next;
    });
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Loading case command center"
        description="Preparing queue lanes, SLA risk, and moderation priorities."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load command center"
        description="Case command data could not be loaded from the backend."
      />
    );
  }

  if (localRecords.length === 0) {
    return (
      <EmptyState
        title="No command cases yet"
        description="Bootstrap from incidents to generate the first moderation case queue."
        action={
          <button
            disabled={isBootstrapping}
            onClick={runBootstrap}
            className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBootstrapping ? "Generating cases..." : "Generate Cases from Incidents"}
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open Cases" value={String(kpis.openCount)} hint="Active queue load" />
        <MetricCard
          label="Overdue SLA"
          value={String(kpis.overdueCount)}
          hint="Cases past due time"
        />
        <MetricCard
          label="Needs Decision"
          value={String(kpis.needsDecisionCount)}
          hint="Awaiting moderator action"
        />
        <MetricCard
          label="Avg Open Age"
          value={`${Math.round(kpis.averageOpenHours)}h`}
          hint="Average unresolved case age"
        />
      </div>

      <div className="glass-panel rounded-3xl p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search case, incident, player, region, or assignee"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/30"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={isUpdating}
              onClick={() => runBulkUpdate("Under Review")}
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark Under Review
            </button>
            <button
              disabled={isUpdating}
              onClick={() => runBulkUpdate("Needs Decision")}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark Needs Decision
            </button>
            <button
              disabled={isUpdating}
              onClick={() => runBulkUpdate("Resolved")}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resolve Selected
            </button>
            <button
              disabled={isBootstrapping}
              onClick={runBootstrap}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBootstrapping ? "Refreshing..." : "Refresh from Incidents"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {lanes.map((lane) => {
          const laneRecords = visibleRecords.filter(lane.filter);

          return (
            <div
              key={lane.title}
              className="glass-panel rounded-3xl border border-slate-800 p-4"
            >
              <div className="mb-4">
                <h3 className="text-base font-semibold text-white">{lane.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{lane.description}</p>
                <p className="mt-2 text-xs text-slate-500">{laneRecords.length} cases</p>
              </div>

              <div className="space-y-3">
                {laneRecords.map((record) => {
                  const selected = selectedCaseIds.has(record.caseId);

                  return (
                    <article
                      key={record.caseId}
                      className={`rounded-2xl border bg-slate-950/70 p-4 transition duration-300 ${
                        selected
                          ? "border-cyan-500/40 shadow-[0_0_26px_rgba(34,211,238,0.15)]"
                          : "border-slate-800 hover:border-cyan-500/20"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelected(record.caseId)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                          />
                          Select
                        </label>

                        <StatusBadge label={record.priority} tone={priorityTone(record.priority)} />
                      </div>

                      <p className="text-sm font-semibold text-white">{record.caseId}</p>
                      <p className="mt-1 text-xs text-slate-400">{record.incidentId}</p>

                      <p className="mt-3 text-sm text-slate-200">{record.playerName}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {record.playerId} • {record.region}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge label={record.severity} tone={severityTone(record.severity)} />
                        <StatusBadge
                          label={record.queueStatus}
                          tone={queueTone(record.queueStatus)}
                        />
                      </div>

                      <div className="mt-3 text-xs text-slate-400">
                        Risk {record.riskScore} • Assignee: {record.assignee}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        SLA due: {record.slaDueAt || "Not set"}
                      </div>

                      {isOverdue(record) ? (
                        <p className="mt-2 text-xs text-red-300">SLA overdue</p>
                      ) : null}
                    </article>
                  );
                })}

                {laneRecords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-center text-xs text-slate-500">
                    No cases in this lane.
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default CaseCommandBoard;