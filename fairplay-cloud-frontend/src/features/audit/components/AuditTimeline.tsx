import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import StatusBadge from "../../../components/ui/StatusBadge";
import { useAuditRecords } from "../hooks/useAuditRecords";
import type { AuditRecord } from "../../../types/dashboard";
import LoadingState from "../../../components/ui/LoadingState";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";

function actionTone(actionType: string) {
  if (actionType === "Player Banned") return "danger";
  if (actionType === "Incident Dismissed") return "neutral";
  if (actionType === "Player Flagged") return "warning";
  if (actionType === "Status Updated") return "info";
  if (actionType === "Incident Created") return "warning";
  return "success";
}

function AuditTimeline() {
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get("incidentId")?.trim() || undefined;
  const { data: records = [], isLoading, isError } = useAuditRecords(incidentId);

  const [query, setQuery] = useState("");

  const filteredRecords = useMemo(() => {
    if (!query) return records;
    const q = query.toLowerCase().trim();
    return records.filter((r) => {
      return (
        r.actionType?.toLowerCase().includes(q) ||
        r.summary?.toLowerCase().includes(q) ||
        r.actor?.toLowerCase().includes(q) ||
        String(r.incidentId ?? "").toLowerCase().includes(q) ||
        String(r.playerName ?? "").toLowerCase().includes(q)
      );
    });
  }, [records, query]);

  function exportCSV() {
    const rows = (filteredRecords || []).map((r) => [
      r.timestampRelative,
      r.actionType,
      r.actor,
      r.incidentId ?? "",
      r.playerName ?? "",
      '"' + (String(r.summary || "").replace(/"/g, '""')) + '"',
    ]);

    const header = ["time", "action", "actor", "incidentId", "playerName", "summary"];
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-records.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Loading audit timeline"
        description="Preparing recent moderation activity and system actions."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load audit timeline"
        description="The audit module could not be loaded at this time."
      />
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        title={incidentId ? `No audit records for ${incidentId}` : "No audit records available"}
        description={
          incidentId
            ? "No moderation or system actions were found for the selected incident."
            : "No moderation or system actions are currently available."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {incidentId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
          <span>
            Showing audit trail for incident <span className="font-semibold">{incidentId}</span>
          </span>
          <Link
            to="/app/audit"
            className="rounded-xl border border-cyan-500/20 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-slate-950/60"
          >
            Clear incident filter
          </Link>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search audit (actor, action, incident, player)"
          className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-2 text-sm text-slate-200 outline-none"
        />
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={exportCSV}
            className="rounded-2xl bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 border border-cyan-500/10"
          >
            Export CSV
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <EmptyState
          title="No matching records"
          description="Try a broader search or clear the filter."
        />
      )}

      {filteredRecords.map((record: AuditRecord, index: number) => (
        <div key={record.actionId} className="relative flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className="z-10 mt-1 h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.6)]" />
            {index !== records.length - 1 && (
              <div className="mt-2 h-full w-px bg-gradient-to-b from-cyan-500/40 to-slate-800" />
            )}
          </div>

          <div className="glass-panel mb-4 flex-1 rounded-3xl p-5 transition duration-300 hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    {record.actionType}
                  </h3>
                  <StatusBadge label={record.actionType} tone={actionTone(record.actionType)} />
                </div>

                <p className="mt-2 text-sm text-slate-300">{record.summary}</p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>Actor: <span className="text-slate-200">{record.actor}</span></span>
                  {record.incidentId ? (
                    <span>
                      Incident: <span className="text-slate-200">{record.incidentId}</span>
                    </span>
                  ) : null}
                  {record.playerName ? (
                    <span>
                      Player: <span className="text-slate-200">{record.playerName}</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="text-xs text-slate-400">{record.timestampRelative}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AuditTimeline;