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
  const { data: records = [], isLoading, isError } = useAuditRecords();

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
      title="No audit records available"
      description="No moderation or system actions are currently available."
    />
  );
}

  return (
    <div className="space-y-4">
      {records.map((record: AuditRecord, index: number) => (
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