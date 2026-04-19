import StatusBadge from "../../../components/ui/StatusBadge";
import type { IncidentRecord, IncidentStatus } from "../../../types/dashboard";

type IncidentReplayDrawerProps = {
  incident: IncidentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (incidentId: string, status: IncidentStatus) => Promise<void> | void;
  isUpdating?: boolean;
};

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

function metricTone(tone?: string) {
  if (tone === "danger") return "danger";
  if (tone === "warning") return "warning";
  if (tone === "success") return "success";
  if (tone === "info") return "info";
  return "neutral";
}

function IncidentReplayDrawer({
  incident,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating = false,
}: IncidentReplayDrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-[100] h-dvh w-full max-w-full overflow-hidden border-l border-slate-800 bg-slate-950/95 shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 sm:max-w-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {incident ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Incident Replay Panel
                </p>
                <h2 className="mt-2 truncate text-xl font-semibold text-white sm:text-2xl">
                  {incident.incidentId}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Forensic summary and evidence review for suspicious player activity.
                </p>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-32 sm:px-6 sm:py-6 sm:pb-36">
              <div className="space-y-6">
                <section className="glass-panel rounded-3xl p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {incident.playerName}
                    </h3>
                    <StatusBadge
                      label={incident.severity}
                      tone={severityTone(incident.severity)}
                    />
                    <StatusBadge
                      label={incident.status}
                      tone={statusTone(incident.status)}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoItem label="Player ID" value={incident.playerId} />
                    <InfoItem label="Match ID" value={incident.matchId} />
                    <InfoItem label="Cheat Type" value={incident.cheatType} />
                    <InfoItem label="Region" value={incident.region} />
                    <InfoItem label="Risk Score" value={String(incident.riskScore)} />
                    <InfoItem label="Detected" value={incident.createdAtRelative} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Detection Reason
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {incident.detectionReason}
                    </p>
                  </div>
                </section>

                <section className="glass-panel rounded-3xl p-5">
                  <h3 className="text-lg font-semibold text-white">Evidence Clip</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Review captured gameplay evidence linked to this incident.
                  </p>

                  <div className="mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-black">
                    {incident.evidenceVideo ? (
                      <video
                        controls
                        className="h-[220px] w-full bg-black object-cover sm:h-[260px]"
                        poster={incident.evidenceThumbnail}
                      >
                        <source src={incident.evidenceVideo} />
                      </video>
                    ) : (
                      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 sm:h-[260px]">
                        No evidence video available.
                      </div>
                    )}
                  </div>
                </section>

                <section className="glass-panel rounded-3xl p-5">
                  <h3 className="text-lg font-semibold text-white">Suspicious Metrics</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Signals and metrics that contributed to the incident score.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {incident.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          {metric.label}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold text-white">{metric.value}</p>
                          <StatusBadge
                            label={metric.tone ? metric.tone.toUpperCase() : "INFO"}
                            tone={metricTone(metric.tone)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="glass-panel rounded-3xl p-5">
                  <h3 className="text-lg font-semibold text-white">Status Timeline</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Incident lifecycle and moderation history.
                  </p>

                  <div className="mt-4 space-y-4">
                    {incident.timeline.map((entry, index) => (
                      <div key={entry.id} className="relative flex gap-4">
                        <div className="relative flex flex-col items-center">
                          <div className="z-10 mt-1 h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.6)]" />
                          {index !== incident.timeline.length - 1 && (
                            <div className="mt-2 h-full w-px bg-gradient-to-b from-cyan-500/40 to-slate-800" />
                          )}
                        </div>

                        <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-white">
                              {entry.label}
                            </h4>
                            <span className="text-xs text-slate-400">{entry.time}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {entry.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-800 bg-slate-950/98 px-4 py-4 backdrop-blur-xl sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusChange(incident.incidentId, "Under Review")}
                  className="w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
                >
                  {isUpdating ? "Updating..." : "Mark Under Review"}
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusChange(incident.incidentId, "Confirmed")}
                  className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
                >
                  {isUpdating ? "Updating..." : "Confirm Cheat"}
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusChange(incident.incidentId, "Dismissed")}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
                >
                  {isUpdating ? "Updating..." : "Dismiss Incident"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export default IncidentReplayDrawer;