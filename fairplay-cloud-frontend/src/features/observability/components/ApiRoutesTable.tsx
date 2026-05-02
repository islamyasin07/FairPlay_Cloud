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

function sourceTone(source: ApiRouteRecord["source"]) {
  return source === "runtime_telemetry" ? "success" : "neutral";
}

function sourceLabel(source: ApiRouteRecord["source"]) {
  return source === "runtime_telemetry" ? "Runtime" : "Derived";
}

function formatDisplayTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function MetricTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function ApiRoutesTable({ routes }: ApiRoutesTableProps) {
  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <div
          key={route.id}
          className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 transition duration-300 hover:border-cyan-500/20 hover:bg-slate-950/80"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={route.method} tone="info" />
                <StatusBadge
                  label={route.authRequired ? "Auth Required" : "Public"}
                  tone={route.authRequired ? "warning" : "neutral"}
                />
                <StatusBadge
                  label={route.availability}
                  tone={availabilityTone(route.availability)}
                />
                <StatusBadge
                  label={route.lastTestResult}
                  tone={resultTone(route.lastTestResult)}
                />
                <StatusBadge
                  label={sourceLabel(route.source)}
                  tone={sourceTone(route.source)}
                />
              </div>

              <div className="mt-4">
                <p className="font-mono text-base font-semibold text-white">{route.path}</p>
                <p className="mt-2 text-sm text-slate-400">{route.module}</p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  {route.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
              <MetricTile
                label="Last Checked"
                value={formatDisplayTime(route.lastCheckedAt)}
              />
              <MetricTile
                label="Last Observed"
                value={formatDisplayTime(route.lastObservedAt)}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MetricTile
              label="Latency"
              value={`${route.averageLatencyMs} ms`}
            />
            <MetricTile
              label="Requests"
              value={`${route.requestCount}`}
            />
            <MetricTile
              label="HTTP Status"
              value={`${route.lastObservedStatusCode ?? "n/a"}`}
            />
            <MetricTile
              label="Source"
              value={sourceLabel(route.source)}
            />
            <MetricTile
              label="Module"
              value={route.module}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ApiRoutesTable;
