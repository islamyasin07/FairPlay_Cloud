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

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDisplayTime(value: string) {
  const date = parseDate(value);

  if (!date) {
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

function getFreshness(route: ApiRouteRecord) {
  const observedDate = parseDate(route.lastObservedAt);
  const checkedDate = parseDate(route.lastCheckedAt);
  const referenceDate = observedDate ?? checkedDate;

  if (!referenceDate) {
    return {
      label: "Unknown",
      tone: "neutral" as const,
      minutesAgo: Number.POSITIVE_INFINITY,
    };
  }

  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - referenceDate.getTime()) / 60000),
  );

  if (diffMinutes <= 1) {
    return { label: "Just now", tone: "success" as const, minutesAgo: diffMinutes };
  }

  if (diffMinutes <= 5) {
    return { label: `${diffMinutes}m ago`, tone: "success" as const, minutesAgo: diffMinutes };
  }

  if (diffMinutes <= 15) {
    return { label: `${diffMinutes}m ago`, tone: "warning" as const, minutesAgo: diffMinutes };
  }

  return { label: `${diffMinutes}m ago`, tone: "danger" as const, minutesAgo: diffMinutes };
}

function getRoutePriority(route: ApiRouteRecord) {
  if (route.availability === "Offline") return 0;
  if (route.availability === "Degraded") return 1;
  if (route.source === "service_metrics") return 2;
  return 3;
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
  const sortedRoutes = routes
    .slice()
    .sort((a, b) => {
      const priorityDiff = getRoutePriority(a) - getRoutePriority(b);
      if (priorityDiff !== 0) return priorityDiff;

      const freshnessDiff = getFreshness(a).minutesAgo - getFreshness(b).minutesAgo;
      if (freshnessDiff !== 0) return freshnessDiff;

      return b.requestCount - a.requestCount;
    });

  const runtimeBackedCount = routes.filter(
    (route) => route.source === "runtime_telemetry",
  ).length;
  const degradedCount = routes.filter(
    (route) => route.availability === "Degraded" || route.availability === "Offline",
  ).length;
  const staleCount = routes.filter(
    (route) => getFreshness(route).minutesAgo > 15,
  ).length;
  const averageLatency = routes.length
    ? Math.round(
        routes.reduce((sum, route) => sum + route.averageLatencyMs, 0) / routes.length,
      )
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Runtime Coverage</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-white">
              {runtimeBackedCount}/{routes.length}
            </h3>
            <StatusBadge label="Live" tone="success" />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Routes currently backed by observed request telemetry.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Attention Needed</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-white">{degradedCount}</h3>
            <StatusBadge
              label={degradedCount > 0 ? "Watch" : "Healthy"}
              tone={degradedCount > 0 ? "warning" : "success"}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Routes currently degraded, offline, or returning warning outcomes.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Freshness Drift</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-white">{staleCount}</h3>
            <StatusBadge
              label={staleCount > 0 ? "Stale" : "Fresh"}
              tone={staleCount > 0 ? "warning" : "success"}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Routes not refreshed recently enough for a live operations view.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Average Latency</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-white">{averageLatency} ms</h3>
            <StatusBadge label="Rolling" tone="info" />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Aggregate latency across the currently tracked API surface.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRoutes.map((route) => {
          const freshness = getFreshness(route);

          return (
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
                    <StatusBadge
                      label={freshness.label}
                      tone={freshness.tone}
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
          );
        })}
      </div>
    </div>
  );
}

export default ApiRoutesTable;

