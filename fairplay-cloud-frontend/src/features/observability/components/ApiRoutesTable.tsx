import StatusBadge from "../../../components/ui/StatusBadge";
import type { ApiRouteRecord } from "../../../types/observability";

type ApiRoutesTableProps = {
  routes: ApiRouteRecord[];
};

function availabilityTone(availability: ApiRouteRecord["availability"]) {
  if (availability === "Available") return "success";
  if (availability === "Degraded") return "warning";
  return "danger";
}

function resultTone(result: ApiRouteRecord["lastTestResult"]) {
  if (result === "Passed") return "success";
  if (result === "Warning") return "warning";
  return "danger";
}

function ApiRoutesTable({ routes }: ApiRoutesTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60">
      <div className="hidden min-w-full grid-cols-[1.4fr_120px_140px_120px_1.5fr_130px_130px_110px] gap-4 border-b border-slate-800 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid">
        <span>Endpoint</span>
        <span>Method</span>
        <span>Module</span>
        <span>Auth</span>
        <span>Description</span>
        <span>Availability</span>
        <span>Last Test</span>
        <span>Latency</span>
      </div>

      <div className="divide-y divide-slate-800">
        {routes.map((route) => (
          <div
            key={route.id}
            className="grid gap-4 px-5 py-5 lg:grid-cols-[1.4fr_120px_140px_120px_1.5fr_130px_130px_110px] lg:items-center"
          >
            <div>
              <p className="text-sm font-semibold text-white">{route.path}</p>
              <p className="mt-1 text-xs text-slate-400">Last checked {route.lastCheckedAt}</p>
            </div>
            <div>
              <StatusBadge label={route.method} tone="info" />
            </div>
            <p className="text-sm text-slate-200">{route.module}</p>
            <div>
              <StatusBadge
                label={route.authRequired ? "Required" : "Public"}
                tone={route.authRequired ? "warning" : "neutral"}
              />
            </div>
            <p className="text-sm leading-6 text-slate-300">{route.description}</p>
            <div>
              <StatusBadge
                label={route.availability}
                tone={availabilityTone(route.availability)}
              />
            </div>
            <div>
              <StatusBadge label={route.lastTestResult} tone={resultTone(route.lastTestResult)} />
            </div>
            <p className="text-sm font-medium text-white">{route.averageLatencyMs} ms</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApiRoutesTable;
