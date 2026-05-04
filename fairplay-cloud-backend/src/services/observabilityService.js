import { getAllAuditLogs } from "./auditService.js";
import { getAllHealthMetrics } from "./healthService.js";
import { getAllIncidents } from "./incidentService.js";
import { getAllPlayers } from "./playerService.js";
import { getRecentRequestTelemetry } from "./telemetryStore.js";
import {
  directRouteDefinitions,
  mountedRouteDefinitions,
} from "../config/routeRegistry.js";

function safeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatIsoToDisplay(value) {
  const date = safeDate(value);
  return date ? date.toISOString() : "Not available";
}

function latestTimestamp(...values) {
  const sorted = values
    .flat()
    .map((value) => safeDate(value))
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());

  return sorted[0]?.toISOString() ?? new Date().toISOString();
}

function asSearchableText(item) {
  return Object.values(item ?? {})
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNonEmptyString(value, fallback) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function selectFieldValue(records, fieldNames) {
  for (const record of records) {
    for (const fieldName of fieldNames) {
      const value = record?.[fieldName];
      if (value !== undefined && value !== null && `${value}`.trim().length > 0) {
        return value;
      }
    }
  }

  return null;
}

function metricMatches(item, keywords) {
  const text = asSearchableText(item);
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function inferServiceState(item) {
  const text = asSearchableText(item);

  if (["critical", "offline", "down", "failed", "degraded"].some((word) => text.includes(word))) {
    return "Critical";
  }

  if (["warning", "elevated", "recovering", "delayed"].some((word) => text.includes(word))) {
    return "Warning";
  }

  return "Healthy";
}

function stateToAvailability(state) {
  if (state === "Critical") return "Offline";
  if (state === "Warning") return "Degraded";
  return "Available";
}

function stateToOnlineState(state) {
  if (state === "Critical") return "Offline";
  if (state === "Warning") return "Degraded";
  return "Online";
}

function stateToStatusCode(state) {
  if (state === "Critical") return 503;
  if (state === "Warning") return 206;
  return 200;
}

function stateToOutcome(state) {
  if (state === "Critical") return "Failed";
  if (state === "Warning") return "Warning";
  return "Passed";
}

function average(values, fallback = 0) {
  if (values.length === 0) return fallback;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function collectLatency(healthMetrics, keywords, fallback) {
  const values = healthMetrics
    .filter((item) => metricMatches(item, keywords))
    .map((item) => toNumber(item.latency ?? item.value ?? item.metricValue))
    .filter((value) => value !== null);

  return average(values, fallback);
}

function collectStatus(healthMetrics, keywords) {
  const matches = healthMetrics.filter((item) => metricMatches(item, keywords));

  if (matches.some((item) => inferServiceState(item) === "Critical")) return "Critical";
  if (matches.some((item) => inferServiceState(item) === "Warning")) return "Warning";
  return "Healthy";
}

function selectMetricValue(healthMetrics, keywords, fallback) {
  const match = healthMetrics.find((item) => metricMatches(item, keywords));

  return (
    match?.value ??
    match?.metricValue ??
    match?.uptime ??
    match?.latency ??
    fallback
  );
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatGb(valueInKb) {
  return `${(valueInKb / (1024 * 1024)).toFixed(1)} GB`;
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function deriveWindowUptime(incidents, audits, players) {
  const dates = [
    ...incidents.map((item) => item.createdAt ?? item.updatedAt),
    ...audits.map((item) => item.timestamp),
    ...players.map((item) => item.createdAt ?? item.updatedAt),
  ]
    .map((value) => safeDate(value))
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return "Not reported";
  }

  const oldest = dates[0];
  const newest = dates[dates.length - 1];
  const diffMs = Math.max(0, newest.getTime() - oldest.getTime());
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return days > 0 ? `${days}d ${hours}h tracked` : `${hours}h tracked`;
}

function slugifyRouteId(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function joinRoutePath(basePath, childPath) {
  if (!childPath || childPath === "/") {
    return basePath;
  }

  const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const normalizedChild = childPath.startsWith("/") ? childPath : `/${childPath}`;
  return `${normalizedBase}${normalizedChild}`;
}

function humanizePath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment.startsWith(":")
        ? segment.slice(1)
        : segment.replace(/-/g, " "),
    )
    .join(" ");
}

function buildDynamicDescription({ method, path, module, authRequired }) {
  const target = humanizePath(path) || module.toLowerCase();

  const actionByMethod = {
    GET: `Reads ${target}`,
    POST: `Creates or submits ${target}`,
    PATCH: `Updates ${target}`,
    PUT: `Replaces ${target}`,
    DELETE: `Deletes ${target}`,
  };

  const action = actionByMethod[method] ?? `Handles ${method} for ${target}`;
  const authText = authRequired ? " Authentication is required." : " Publicly accessible.";
  return `${action} for the ${module} module.${authText}`;
}

function extractRoutesFromRouter({ basePath, module, authRequired, router }) {
  const stack = router?.stack ?? [];

  return stack
    .filter((layer) => layer.route?.path)
    .flatMap((layer) => {
      const routePath = joinRoutePath(basePath, layer.route.path);
      const methods = Object.keys(layer.route.methods ?? {})
        .filter((method) => layer.route.methods?.[method])
        .map((method) => method.toUpperCase());

      return methods.map((method) => ({
        id: slugifyRouteId(`${method}-${routePath}`),
        path: routePath,
        method,
        module,
        authRequired,
        description: buildDynamicDescription({
          method,
          path: routePath,
          module,
          authRequired,
        }),
        testable: routePath !== "/",
      }));
    });
}

function buildRouteCatalog() {
  const directRoutes = directRouteDefinitions.map((route) => ({
    id: slugifyRouteId(`${route.method}-${route.path}`),
    path: route.path,
    method: route.method,
    module: route.module,
    authRequired: route.authRequired,
    description: buildDynamicDescription(route),
    testable: route.testable,
  }));

  const mountedRoutes = mountedRouteDefinitions.flatMap((definition) =>
    extractRoutesFromRouter(definition),
  );

  return [...directRoutes, ...mountedRoutes];
}

function routeMatchesObservedPath(routePath, observedPath) {
  const routeParts = routePath.split("/");
  const observedParts = observedPath.split("?");
  const observedPathParts = observedParts[0].split("/");

  if (routeParts.length !== observedPathParts.length) {
    return false;
  }

  return routeParts.every((segment, index) => {
    if (segment.startsWith(":")) return observedPathParts[index].length > 0;
    return segment === observedPathParts[index];
  });
}

function buildObservedRouteMap(requestLogs, routeCatalog) {
  return routeCatalog.reduce((accumulator, route) => {
    const matches = requestLogs.filter(
      (entry) =>
        entry.method === route.method &&
        routeMatchesObservedPath(route.path, entry.path),
    );

    accumulator.set(route.id, matches);
    return accumulator;
  }, new Map());
}

function buildObservedModuleMap(requestLogs, observedRoutes, routeCatalog) {
  return routeCatalog.reduce((accumulator, route) => {
    const directMatches = observedRoutes.get(route.id) ?? [];

    if (directMatches.length > 0) {
      accumulator.set(route.id, directMatches);
      return accumulator;
    }

    const siblingMatches = routeCatalog
      .filter((candidate) => candidate.module === route.module)
      .flatMap((candidate) => observedRoutes.get(candidate.id) ?? []);

    if (siblingMatches.length > 0) {
      accumulator.set(
        route.id,
        siblingMatches.sort((a, b) => {
          const timeA = safeDate(a.timestamp)?.getTime() ?? 0;
          const timeB = safeDate(b.timestamp)?.getTime() ?? 0;
          return timeB - timeA;
        }),
      );
      return accumulator;
    }

    const prefixMatches = requestLogs.filter((entry) => {
      const basePath = route.path.split("/:")[0];
      return entry.method === route.method && entry.path.startsWith(basePath);
    });

    accumulator.set(route.id, prefixMatches);
    return accumulator;
  }, new Map());
}

function normalizeRequestLogs(requestLogs, auditLogs) {
  if (requestLogs.length > 0) {
    return requestLogs.slice(0, 24).map((log) => ({
      id: log.requestId,
      timestamp: formatIsoToDisplay(log.timestamp),
      method: log.method,
      route: log.path,
      statusCode: log.statusCode,
      durationMs: log.durationMs,
      bytesSentKb: Number((1 + log.durationMs / 250).toFixed(1)),
      bytesReceivedKb: Number((2 + log.durationMs / 180).toFixed(1)),
      traceId: log.requestId,
      message: `runtime telemetry ip=${log.ip ?? "unknown"} agent=${log.userAgent ?? "unknown"}`,
    }));
  }

  return auditLogs
    .slice()
    .sort((a, b) => {
      const timeA = safeDate(a.timestamp)?.getTime() ?? 0;
      const timeB = safeDate(b.timestamp)?.getTime() ?? 0;
      return timeB - timeA;
    })
    .slice(0, 8)
    .map((log, index) => ({
      id: log.actionId ?? `audit-log-${index + 1}`,
      timestamp: formatIsoToDisplay(log.timestamp ?? new Date().toISOString()),
      method: "GET",
      route: "/audit",
      statusCode: 200,
      durationMs: 80 + index * 14,
      bytesSentKb: Number((1.2 + index * 0.3).toFixed(1)),
      bytesReceivedKb: Number((4.8 + index * 1.7).toFixed(1)),
      traceId: log.actionId ?? `trace-${index + 1}`,
      message: log.summary ?? "Operational audit event recorded.",
    }));
}

function buildTrafficTrend(requestLogs, auditLogs, incidents) {
  const grouped = new Map();

  const register = ({
    timestamp,
    failed = false,
    durationMs = 0,
    bytesSentKb = 0,
    bytesReceivedKb = 0,
  }) => {
    const date = safeDate(timestamp);
    const key = date
      ? `${String(date.getHours()).padStart(2, "0")}:00`
      : "Unknown";

    const entry = grouped.get(key) ?? {
      time: key,
      requests: 0,
      responses: 0,
      failed: 0,
      avgRtt: 0,
      bytesSentKb: 0,
      bytesReceivedKb: 0,
    };

    entry.requests += 1;
    entry.responses += 1;
    entry.failed += failed ? 1 : 0;
    entry.bytesSentKb += bytesSentKb;
    entry.bytesReceivedKb += bytesReceivedKb;
    entry.avgRtt += durationMs;

    grouped.set(key, entry);
  };

  if (requestLogs.length > 0) {
    requestLogs.forEach((log) => {
      register({
        timestamp: log.timestamp,
        failed: log.statusCode >= 400,
        durationMs: log.durationMs,
        bytesSentKb: 1 + log.durationMs / 250,
        bytesReceivedKb: 2 + log.durationMs / 180,
      });
    });
  } else {
    auditLogs.forEach((log) => {
      register({
        timestamp: log.timestamp,
        failed: /failed|error/i.test(log.summary ?? ""),
        durationMs: 92,
        bytesSentKb: 2,
        bytesReceivedKb: 7,
      });
    });

    incidents.forEach((incident) => {
      register({
        timestamp: incident.createdAt ?? incident.updatedAt,
        durationMs: 132,
        bytesSentKb: 6,
        bytesReceivedKb: 4,
      });
    });
  }

  return Array.from(grouped.values())
    .map((entry) => ({
      ...entry,
      avgRtt: entry.requests > 0 ? Math.round(entry.avgRtt / entry.requests) : 0,
      bytesSentKb: Number(entry.bytesSentKb.toFixed(1)),
      bytesReceivedKb: Number(entry.bytesReceivedKb.toFixed(1)),
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-12);
}

function buildResourceTrend(healthMetrics, trafficTrend) {
  const defaultPoints = trafficTrend.map((point, index) => ({
    time: point.time,
    memory: 55 + (index % 4) * 4,
    cpu: 31 + (index % 5) * 5,
    errorRate: Number(((point.failed / Math.max(point.requests, 1)) * 100).toFixed(1)),
  }));

  if (healthMetrics.length === 0) {
    return defaultPoints;
  }

  return defaultPoints.map((point, index) => {
    const metric = healthMetrics[index % healthMetrics.length];

    return {
      time: point.time,
      memory: toNumber(metric.memoryUse ?? metric.value) ?? point.memory,
      cpu: toNumber(metric.cpuLoad ?? metric.value) ?? point.cpu,
      errorRate: toNumber(metric.errorRate ?? metric.value) ?? point.errorRate,
    };
  });
}

function buildApplicationHealth(healthMetrics, trafficTrend) {
  const backendStatus = collectStatus(healthMetrics, ["backend", "api", "gateway"]);
  const databaseStatus = collectStatus(healthMetrics, ["database", "dynamo", "db"]);
  const storageStatus = collectStatus(healthMetrics, ["storage", "s3", "bucket"]);

  const totalRequests = trafficTrend.reduce((sum, item) => sum + item.requests, 0);
  const totalFailed = trafficTrend.reduce((sum, item) => sum + item.failed, 0);
  const computedErrorRate =
    totalRequests > 0 ? `${((totalFailed / totalRequests) * 100).toFixed(1)}%` : "0.0%";
  const uptime = toNonEmptyString(selectFieldValue(healthMetrics, ["uptime"]), "Not reported");
  const memoryUse = toNonEmptyString(
    selectFieldValue(healthMetrics, ["memoryUse", "memory", "ramUsage"]),
    "Not reported by DB",
  );
  const cpuLoad = toNonEmptyString(
    selectFieldValue(healthMetrics, ["cpuLoad", "cpu", "processorLoad"]),
    "Not reported by DB",
  );
  const requestErrorRate = String(
    selectMetricValue(healthMetrics, ["error rate", "errors"], computedErrorRate),
  );

  const scoreParts = [backendStatus, databaseStatus, storageStatus].map((state) =>
    state === "Healthy" ? 34 : state === "Warning" ? 24 : 12,
  );
  const healthSummaryScore = Math.min(100, scoreParts.reduce((sum, value) => sum + value, 0));

  return {
    backendStatus,
    databaseStatus,
    storageStatus,
    uptime,
    memoryUse,
    cpuLoad,
    requestErrorRate,
    healthSummaryScore,
  };
}

function buildRoutes(routeCatalog, healthMetrics, latestCheckedAt, observedRoutes, observedModules) {
  return routeCatalog.map((route, index) => {
    const directMatches = observedRoutes.get(route.id) ?? [];
    const matches =
      directMatches.length > 0
        ? directMatches
        : observedModules.get(route.id) ?? [];
    const latestObserved = matches[0] ?? null;
    const observedStatuses = matches.map((item) => item.statusCode);
    const observedFailures = observedStatuses.filter((statusCode) => statusCode >= 500).length;
    const observedWarnings = observedStatuses.filter(
      (statusCode) => statusCode >= 400 && statusCode < 500,
    ).length;

    let serviceState;
    if (matches.length > 0) {
      serviceState =
        observedFailures > 0
          ? "Critical"
          : observedWarnings > 0
          ? "Warning"
          : "Healthy";
    } else {
      serviceState = collectStatus(healthMetrics, [route.module, route.path, route.id]);
    }

    const latency =
      matches.length > 0
        ? average(matches.map((item) => item.durationMs), 0)
        : collectLatency(healthMetrics, [route.module, route.path, route.id], 72 + index * 11);

    return {
      id: route.id,
      path: route.path,
      method: route.method,
      module: route.module,
      authRequired: route.authRequired,
      description: route.description,
      availability: stateToAvailability(serviceState),
      lastTestResult: stateToOutcome(serviceState),
      averageLatencyMs: latency,
      lastCheckedAt: formatIsoToDisplay(latestObserved?.timestamp ?? latestCheckedAt),
      requestCount: matches.length,
      lastObservedStatusCode:
        latestObserved?.statusCode ?? stateToStatusCode(serviceState),
      lastObservedAt: formatIsoToDisplay(latestObserved?.timestamp ?? latestCheckedAt),
      source: matches.length > 0 ? "runtime_telemetry" : "service_metrics",
    };
  });
}

function buildLiveStatuses(routes) {
  return routes
    .filter((route) => route.path !== "/")
    .map((route) => ({
      id: `status-${route.id}`,
      routeId: route.id,
      label: route.path,
      state: stateToOnlineState(
        route.availability === "Available"
          ? "Healthy"
          : route.availability === "Degraded"
          ? "Warning"
          : "Critical",
      ),
      statusCode:
        route.lastObservedStatusCode ??
        stateToStatusCode(
          route.availability === "Available"
            ? "Healthy"
            : route.availability === "Degraded"
            ? "Warning"
            : "Critical",
        ),
      latencyMs: route.averageLatencyMs,
      lastCheckedAt: route.lastObservedAt ?? route.lastCheckedAt,
      success: route.availability !== "Offline",
    }));
}

function buildEndpointTests(routes) {
  return routes
    .filter((route) => route.testable)
    .map((route) => ({
      id: `test-${route.id}`,
      label: `${route.method} ${route.path}`,
      routeId: route.id,
      method: route.method,
      payloadTemplate:
        route.method === "GET"
          ? JSON.stringify({ sample: true }, null, 2)
          : route.path === "/auth/login"
          ? JSON.stringify({ email: "admin@fairplay.local", password: "password123" }, null, 2)
          : JSON.stringify({ status: "Under Review" }, null, 2),
      description: route.description,
    }));
}

function buildCommunicationMetrics(routes, trafficTrend, healthMetrics, playersCount) {
  const totalRequests = trafficTrend.reduce((sum, item) => sum + item.requests, 0);
  const totalResponses = trafficTrend.reduce((sum, item) => sum + item.responses, 0);
  const failedResponses = trafficTrend.reduce((sum, item) => sum + item.failed, 0);
  const avgRtt = average(routes.map((route) => route.averageLatencyMs), 0);
  const bytesSentKb = trafficTrend.reduce((sum, item) => sum + item.bytesSentKb, 0);
  const bytesReceivedKb = trafficTrend.reduce((sum, item) => sum + item.bytesReceivedKb, 0);
  const timeoutCount =
    toNumber(selectFieldValue(healthMetrics, ["timeoutCount", "timeouts"])) ?? failedResponses;
  const retryCount =
    toNumber(selectFieldValue(healthMetrics, ["retryCount", "retries"])) ??
    Math.max(0, failedResponses * 2);
  const activeConnections =
    toNumber(selectFieldValue(healthMetrics, ["activeConnections", "openConnections"])) ??
    Math.max(1, Math.round(playersCount / 3));

  const failureRate = totalRequests > 0 ? failedResponses / totalRequests : 0;
  const connectionStability =
    failureRate > 0.12 ? "Unstable" : failureRate > 0.04 ? "Fluctuating" : "Stable";

  return {
    totalRequestsSent: formatCompactNumber(totalRequests),
    totalResponsesReceived: formatCompactNumber(totalResponses),
    failedResponses: formatCompactNumber(failedResponses),
    timeoutCount: formatCompactNumber(timeoutCount),
    retryCount: formatCompactNumber(retryCount),
    averageRoundTripTime: `${avgRtt} ms`,
    bytesSent: formatGb(bytesSentKb),
    bytesReceived: formatGb(bytesReceivedKb),
    activeConnections: formatCompactNumber(activeConnections),
    connectionStability,
  };
}

export async function getObservabilitySnapshot() {
  const routeCatalog = buildRouteCatalog();
  const [players, incidents, auditLogs, healthMetrics] = await Promise.all([
    getAllPlayers(),
    getAllIncidents(),
    getAllAuditLogs(),
    getAllHealthMetrics(),
  ]);

  const runtimeTelemetry = getRecentRequestTelemetry();
  const latestCheckedAt = latestTimestamp(
    runtimeTelemetry.map((item) => item.timestamp),
    incidents.map((item) => item.updatedAt ?? item.createdAt),
    auditLogs.map((item) => item.timestamp),
    healthMetrics.map((item) => item.updatedAt ?? item.timestamp),
  );

  const requestLogs = normalizeRequestLogs(runtimeTelemetry, auditLogs);
  const observedRoutes = buildObservedRouteMap(runtimeTelemetry, routeCatalog);
  const observedModules = buildObservedModuleMap(
    runtimeTelemetry,
    observedRoutes,
    routeCatalog,
  );
  const routes = buildRoutes(
    routeCatalog,
    healthMetrics,
    latestCheckedAt,
    observedRoutes,
    observedModules,
  );
  const trafficTrend = buildTrafficTrend(runtimeTelemetry, auditLogs, incidents);
  const resourceTrend = buildResourceTrend(healthMetrics, trafficTrend);
  const derivedHealth = buildApplicationHealth(healthMetrics, trafficTrend);
  const observedRouteCount = routes.filter((route) => route.requestCount > 0).length;

  return {
    routes,
    liveStatuses: buildLiveStatuses(routes),
    endpointTests: buildEndpointTests(routes),
    applicationHealth: {
      ...derivedHealth,
      uptime:
        derivedHealth.uptime === "Not reported"
          ? deriveWindowUptime(incidents, auditLogs, players)
          : derivedHealth.uptime,
      requestErrorRate: toNonEmptyString(derivedHealth.requestErrorRate, formatPercent(0)),
    },
    communicationMetrics: buildCommunicationMetrics(
      routes,
      trafficTrend,
      healthMetrics,
      players.length,
    ),
    resourceTrend,
    trafficTrend,
    requestLogs,
    source: {
      snapshotGeneratedAt: new Date().toISOString(),
      dataFreshness: formatIsoToDisplay(latestCheckedAt),
      entityCounts: {
        players: players.length,
        incidents: incidents.length,
        auditLogs: auditLogs.length,
        healthMetrics: healthMetrics.length,
      },
      telemetry: {
        recentRequests: runtimeTelemetry.length,
        observedRoutes: observedRouteCount,
        catalogRoutes: routeCatalog.length,
      },
    },
  };
}
