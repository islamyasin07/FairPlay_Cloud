import StatusBadge from "../../../components/ui/StatusBadge";
import type { ApiLiveStatusRecord } from "../../../types/observability";

type ApiLiveStatusGridProps = {
  statuses: ApiLiveStatusRecord[];
};

function statusTone(record: ApiLiveStatusRecord) {
  if (!record.success || record.state === "Offline") return "danger";
  if (record.state === "Degraded") return "warning";
  return "success";
}

function ApiLiveStatusGrid({ statuses }: ApiLiveStatusGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {statuses.map((status) => (
        <div
          key={status.id}
          className="glass-panel rounded-3xl p-5 transition duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{status.label}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{status.state}</h3>
            </div>
            <StatusBadge
              label={status.success ? "Success" : "Failure"}
              tone={statusTone(status)}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs text-slate-400">HTTP Status</p>
              <p className="mt-2 text-lg font-semibold text-white">{status.statusCode}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-xs text-slate-400">Latency</p>
              <p className="mt-2 text-lg font-semibold text-white">{status.latencyMs} ms</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">Last checked {status.lastCheckedAt}</p>
        </div>
      ))}
    </div>
  );
}

export default ApiLiveStatusGrid;
