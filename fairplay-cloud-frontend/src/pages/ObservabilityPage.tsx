import { useState } from "react";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import ApiLiveStatusGrid from "../features/observability/components/ApiLiveStatusGrid";
import ApiRoutesTable from "../features/observability/components/ApiRoutesTable";
import ApplicationHealthPanel from "../features/observability/components/ApplicationHealthPanel";
import CriticalEndpointTester from "../features/observability/components/CriticalEndpointTester";
import ObservabilityStatCard from "../features/observability/components/ObservabilityStatCard";
import TrafficMetricsPanel from "../features/observability/components/TrafficMetricsPanel";
import { useObservabilityData } from "../features/observability/hooks/useObservabilityData";
import type {
  ApiLiveStatusRecord,
  ApiRouteRecord,
  ApplicationHealthSummary,
  CommunicationMetrics,
  RequestLogRecord,
} from "../types/observability";

type TerminalMode = "stream" | "json";

function getStatusToneClass(statusCode: number) {
  if (statusCode >= 500) return "text-rose-300";
  if (statusCode >= 400) return "text-amber-300";
  if (statusCode >= 300) return "text-sky-300";
  return "text-emerald-300";
}

function buildTerminalLines({
  requestLogs,
  liveStatuses,
  routes,
  applicationHealth,
  communicationMetrics,
  lastUpdated,
}: {
  requestLogs: RequestLogRecord[];
  liveStatuses: ApiLiveStatusRecord[];
  routes: ApiRouteRecord[];
  applicationHealth: ApplicationHealthSummary;
  communicationMetrics: CommunicationMetrics;
  lastUpdated: string;
}) {
  const healthLine = {
    id: "health-summary",
    timestamp: lastUpdated,
    toneClass:
      applicationHealth.healthSummaryScore >= 80
        ? "text-emerald-300"
        : applicationHealth.healthSummaryScore >= 60
        ? "text-amber-300"
        : "text-rose-300",
    line: `[SYS] backend=${applicationHealth.backendStatus} db=${applicationHealth.databaseStatus} storage=${applicationHealth.storageStatus} score=${applicationHealth.healthSummaryScore}/100 uptime=${applicationHealth.uptime}`,
  };

  const communicationLine = {
    id: "comm-summary",
    timestamp: lastUpdated,
    toneClass:
      communicationMetrics.connectionStability === "Stable"
        ? "text-emerald-300"
        : communicationMetrics.connectionStability === "Fluctuating"
        ? "text-amber-300"
        : "text-rose-300",
    line: `[NET] requests=${communicationMetrics.totalRequestsSent} responses=${communicationMetrics.totalResponsesReceived} failed=${communicationMetrics.failedResponses} rtt=${communicationMetrics.averageRoundTripTime} stability=${communicationMetrics.connectionStability}`,
  };

  const routeInventoryLine = {
    id: "route-inventory",
    timestamp: lastUpdated,
    toneClass: "text-slate-300",
    line: `[CFG] routes=${routes.length} liveChecks=${liveStatuses.length} requestLogs=${requestLogs.length}`,
  };

  const statusLines = liveStatuses.slice(0, 4).map((status) => ({
    id: `status-${status.id}`,
    timestamp: status.lastCheckedAt || lastUpdated,
    toneClass: status.success ? "text-cyan-300" : "text-amber-300",
    line: `[CHK] ${status.label} ${status.state} status=${status.statusCode} latency=${status.latencyMs}ms`,
  }));

  const requestLogLines = requestLogs.slice(0, 8).map((log) => ({
    id: `request-${log.id}`,
    timestamp: log.timestamp || lastUpdated,
    toneClass: getStatusToneClass(log.statusCode),
    line: `[REQ] ${log.method} ${log.route} -> ${log.statusCode} ${log.durationMs}ms trace=${log.traceId} ${log.message}`,
  }));

  return [
    healthLine,
    communicationLine,
    routeInventoryLine,
    ...statusLines,
    ...requestLogLines,
  ];
}

function formatCoveragePercent(observedRoutes: number, totalRoutes: number) {
  if (totalRoutes <= 0) return 0;
  return Math.round((observedRoutes / totalRoutes) * 100);
}

function ObservabilityPage() {
  const [terminalMode, setTerminalMode] = useState<TerminalMode>("stream");
  const { data, dataUpdatedAt, isLoading, isError, isFetching } = useObservabilityData();

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Observability"
          description="Unified frontend observability workspace for routes, health, endpoint validation, and network communication metrics."
          badge="Loading..."
        />
        <LoadingState
          title="Loading observability dashboard"
          description="Preparing API route inventory, health telemetry, and communication trends from backend."
        />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <PageHeader
          title="Observability"
          description="Unified frontend observability workspace for routes, health, endpoint validation, and network communication metrics."
          badge="Unavailable"
        />
        <ErrorState
          title="Unable to load observability data"
          description="The observability module could not retrieve its monitoring snapshot from the backend. Please ensure the backend service is running on port 3001."
        />
      </>
    );
  }

  const routes = data.routes || [];
  const liveStatuses = data.liveStatuses || [];
  const applicationHealth = data.applicationHealth;
  const communicationMetrics = data.communicationMetrics;
  const endpointTests = data.endpointTests || [];
  const resourceTrend = data.resourceTrend || [];
  const trafficTrend = data.trafficTrend || [];
  const requestLogs = data.requestLogs || [];
  const source = data.source;
  const terminalLines = buildTerminalLines({
    requestLogs,
    liveStatuses,
    routes,
    applicationHealth,
    communicationMetrics,
    lastUpdated: lastUpdated || "pending",
  });
  const visibleTerminalLines = terminalLines.slice(0, 6);

  const healthyChecks = liveStatuses.filter((item) => item.success).length;
  const totalChecks = liveStatuses.length;
  const observedRoutes = routes.filter((route) => route.requestCount > 0).length;
  const derivedRoutes = routes.length - observedRoutes;
  const failedRequests = requestLogs.filter((log) => log.statusCode >= 400).length;
  const coveragePercent = formatCoveragePercent(observedRoutes, routes.length);

  return (
    <>
      <PageHeader
        title="Observability"
        description="Developer and admin control center for API inventory, live route status, endpoint testing, application health, and request/response monitoring."
        badge={
          isFetching
            ? "Updating..."
            : lastUpdated
            ? `Live Data | ${lastUpdated}`
            : "Live Data"
        }
      />

      <div className="mb-6 overflow-hidden rounded-[32px] border border-slate-800/80 bg-[linear-gradient(135deg,rgba(8,47,73,0.55),rgba(15,23,42,0.92)_45%,rgba(69,26,3,0.55))] shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1.3fr_0.7fr] lg:px-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Backend Telemetry Active
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                refresh every 30s
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              This workspace is now driven by the backend observability snapshot, with
              runtime request telemetry used first for route health, latency, and live
              activity whenever available.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Coverage</p>
                <p className="mt-2 text-2xl font-semibold text-white">{coveragePercent}%</p>
                <p className="mt-1 text-xs text-slate-400">
                  {observedRoutes} of {routes.length} routes observed live
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Requests</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {source.telemetry.recentRequests}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {failedRequests} warning or failure responses
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Freshness</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {lastUpdated || "Pending"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Snapshot at {source.snapshotGeneratedAt}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-cyan-500/10 bg-slate-950/55 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Route Coverage
              </p>
              <span className="font-mono text-xs text-cyan-300">
                {observedRoutes}/{routes.length}
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#34d399,#f59e0b)]"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
                <span className="text-slate-400">Runtime-backed routes</span>
                <span className="font-medium text-white">{observedRoutes}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
                <span className="text-slate-400">Derived fallback routes</span>
                <span className="font-medium text-white">{derivedRoutes}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
                <span className="text-slate-400">Connection stability</span>
                <span className="font-medium text-white">
                  {communicationMetrics.connectionStability}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ObservabilityStatCard
          label="Route Coverage"
          value={`${observedRoutes}/${routes.length}`}
          hint={`${derivedRoutes} routes are still using derived service metrics instead of runtime telemetry.`}
          tone="info"
        />
        <ObservabilityStatCard
          label="Healthy Live Checks"
          value={`${healthyChecks}/${Math.max(totalChecks, 1)}`}
          hint="Route health is now computed from observed request outcomes when telemetry exists."
          tone={healthyChecks === totalChecks ? "success" : "warning"}
        />
        <ObservabilityStatCard
          label="Recent Requests"
          value={`${source.telemetry.recentRequests}`}
          hint={`${failedRequests} recent requests returned warning or failure HTTP codes.`}
          tone={failedRequests === 0 ? "success" : failedRequests < 4 ? "warning" : "danger"}
        />
        <ObservabilityStatCard
          label="Snapshot Freshness"
          value={source.dataFreshness === "Not available" ? "Pending" : "Live"}
          hint={`Snapshot generated ${source.snapshotGeneratedAt} from ${source.entityCounts.players} players, ${source.entityCounts.incidents} incidents, and ${source.entityCounts.auditLogs} audit logs.`}
          tone={
            source.telemetry.observedRoutes === source.telemetry.catalogRoutes
              ? "success"
              : source.telemetry.observedRoutes > 0
              ? "warning"
              : "danger"
          }
        />
      </div>

      <div className="mt-6 space-y-6">
        <SectionCard
          title="Backend Data Sources"
          description="Production-oriented provenance view showing where the observability page is pulling live state from right now."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Snapshot Time</p>
              <p className="mt-3 text-lg font-semibold text-white">{source.snapshotGeneratedAt}</p>
              <p className="mt-2 text-sm text-slate-400">Latest freshness marker: {source.dataFreshness}</p>
            </div>
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Runtime Telemetry</p>
              <p className="mt-3 text-lg font-semibold text-white">{source.telemetry.recentRequests} requests</p>
              <p className="mt-2 text-sm text-slate-400">
                {source.telemetry.observedRoutes} of {source.telemetry.catalogRoutes} catalog routes observed live.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Domain Data</p>
              <p className="mt-3 text-lg font-semibold text-white">{source.entityCounts.incidents} incidents</p>
              <p className="mt-2 text-sm text-slate-400">
                {source.entityCounts.players} players and {source.entityCounts.auditLogs} audit events are in the current snapshot.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">System Metrics</p>
              <p className="mt-3 text-lg font-semibold text-white">{source.entityCounts.healthMetrics} records</p>
              <p className="mt-2 text-sm text-slate-400">
                Health, uptime, and fallback route state are enriched from backend metric storage.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Live Backend Activity"
          description="Terminal stream data surfaced directly in the observability page for faster scanning."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleTerminalLines.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[24px] border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.9))] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-slate-500">
                    {entry.timestamp}
                  </span>
                  <span className={`font-mono text-xs ${entry.toneClass}`}>
                    {entry.line.split(" ")[0]}
                  </span>
                </div>
                <p className={`mt-3 font-mono text-sm leading-6 ${entry.toneClass}`}>
                  {entry.line}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {routes.length > 0 && (
          <SectionCard
            title="API Routes"
            description="Complete route catalog including method, owning module, authentication requirements, test outcomes, and average latency."
          >
            <ApiRoutesTable routes={routes} />
          </SectionCard>
        )}

        {liveStatuses.length > 0 && (
          <SectionCard
            title="API Live Status"
            description="Route-level runtime status built from observed HTTP traffic first, with backend metrics used only as fallback coverage."
          >
            <ApiLiveStatusGrid statuses={liveStatuses} />
          </SectionCard>
        )}

        {endpointTests.length > 0 && (
          <SectionCard
            title="Critical Endpoint Tester"
            description="Built-in request console to validate login, dashboard, incident, user, audit, and health endpoints from the frontend."
          >
            <CriticalEndpointTester routes={routes} scenarios={endpointTests} />
          </SectionCard>
        )}

        {Object.keys(applicationHealth).length > 0 && (
          <SectionCard
            title="Application Health"
            description="Full-stack operational view with service status, resource usage, uptime, request error pressure, and cloud readiness notes."
          >
            <ApplicationHealthPanel
              summary={applicationHealth}
              resourceTrend={resourceTrend}
            />
          </SectionCard>
        )}

        {trafficTrend.length > 0 && (
          <SectionCard
            title="Request / Response / TCP Communication"
            description="Transport-centric metrics driven by recent backend request telemetry, retries, bytes in flight, and sampled trace records."
          >
            <TrafficMetricsPanel
              metrics={communicationMetrics}
              trafficTrend={trafficTrend}
              requestLogs={requestLogs}
            />
          </SectionCard>
        )}

        <SectionCard
          title="Backend Snapshot Terminal"
          description="Live backend observability output rendered as a terminal stream, with an optional raw JSON view for deeper inspection."
        >
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-400">
              <span>observability@backend: /observability</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTerminalMode("stream")}
                  className={`rounded-full px-3 py-1 transition ${
                    terminalMode === "stream"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Stream
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalMode("json")}
                  className={`rounded-full px-3 py-1 transition ${
                    terminalMode === "json"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  JSON
                </button>
                <span>{lastUpdated ? `refreshed ${lastUpdated}` : "waiting for data"}</span>
              </div>
            </div>

            {terminalMode === "stream" ? (
              <div className="max-h-[480px] overflow-auto px-4 py-4 font-mono text-xs leading-6">
                <div className="mb-3 text-slate-500">$ tail -f observability.log</div>
                {terminalLines.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[120px_1fr] gap-4 border-b border-slate-900/70 py-2 last:border-b-0"
                  >
                    <span className="text-slate-500">{entry.timestamp}</span>
                    <span className={entry.toneClass}>{entry.line}</span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="max-h-[480px] overflow-auto p-4 text-xs leading-6 text-emerald-300">
{JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default ObservabilityPage;
