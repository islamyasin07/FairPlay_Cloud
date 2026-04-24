import { getAllAuditLogs } from "./auditService.js";
import { getAllHealthMetrics } from "./healthService.js";
import { getAllIncidents } from "./incidentService.js";
import { getAllPlayers } from "./playerService.js";

const routeCatalog = [
  {
    id: "root-status",
    path: "/",
    method: "GET",
    module: "Core",
    authRequired: false,
    description: "Basic backend status response for service reachability.",
    metricKeywords: ["backend", "api", "gateway", "core"],
    testable: false,
  },
  {
    id: "observability-snapshot",
    path: "/observability",
    method: "GET",
    module: "Observability",
    authRequired: false,
    description: "Aggregated operational snapshot for the admin observability dashboard.",
    metricKeywords: ["observability", "backend", "api"],
    testable: true,
  },
  {
    id: "incidents-list",
    path: "/incidents",
    method: "GET",
    module: "Incidents",
    authRequired: false,
    description: "Retrieves incident records stored in the incidents table.",
    metricKeywords: ["incident", "backend", "api"],
    testable: true,
  },
  {
    id: "players-list",
    path: "/players",
    method: "GET",
    module: "Players",
    authRequired: false,
    description: "Retrieves player records from the players table.",
    metricKeywords: ["player", "backend", "api"],
    testable: true,
  },
  {
    id: "audit-list",
    path: "/audit",
    method: "GET",
    module: "Audit",
    authRequired: false,
    description: "Retrieves audit log records from the audit logs table.",
    metricKeywords: ["audit", "log", "backend"],
    testable: true,
  },
  {
    id: "health-list",
    path: "/health",
    method: "GET",
    module: "Health",
    authRequired: false,
    description: "Reads health metrics and service checks from the system health table.",
    metricKeywords: ["health", "uptime", "backend", "database", "storage"],
    testable: true,
  },
  {
    id: "case-commands-list",
    path: "/case-commands",
    method: "GET",
    module: "Case Command",
    authRequired: false,
    description: "Retrieves moderation case command records stored for operational workflows.",
    metricKeywords: ["case", "queue", "backend"],
    testable: true,
  },
];

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

function selectMetricNumber(healthMetrics, keywords, fallback) {
  const selected = selectMetricValue(healthMetrics, keywords, fallback);
  const parsed = toNumber(selected);
  return parsed ?? fallback;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
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

function buildRequestLogs(auditLogs) {
  const routeByAction = {
    "Incident Created": { route: "/incidents", method: "GET", statusCode: 201 },
    "Status Updated": { route: "/incidents", method: "PATCH", statusCode: 200 },
    "Player Flagged": { route: "/players", method: "GET", statusCode: 200 },
    "Player Banned": { route: "/players", method: "GET", statusCode: 200 },
    "Incident Dismissed": { route: "/incidents", method: "PATCH", statusCode: 200 },
    "System Note": { route: "/health", method: "GET", statusCode: 200 },
  };

  return auditLogs
    .slice()
    .sort((a, b) => {
      const timeA = safeDate(a.timestamp)?.getTime() ?? 0;
      const timeB = safeDate(b.timestamp)?.getTime() ?? 0;
      return timeB - timeA;
    })
    .slice(0, 8)
    .map((log, index) => {
      const mapped = routeByAction[log.actionType] ?? {
        route: "/audit",
        method: "GET",
        statusCode: 200,
      };

      return {
        id: log.actionId ?? `audit-log-${index + 1}`,
        timestamp: formatIsoToDisplay(log.timestamp ?? new Date().toISOString()),
        method: mapped.method,
        route: mapped.route,
        statusCode: mapped.statusCode,
        durationMs: 80 + index * 14,
        bytesSentKb: Number((1.2 + index * 0.3).toFixed(1)),
        bytesReceivedKb: Number((4.8 + index * 1.7).toFixed(1)),
        traceId: log.actionId ?? `trace-${index + 1}`,
        message: log.summary ?? "Operational audit event recorded.",
      };
    });
}

function buildTrafficTrend(auditLogs, incidents) {
  const grouped = new Map();

  const register = (timestamp, kind) => {
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
    entry.failed += kind === "failed" ? 1 : 0;
    entry.bytesSentKb += kind === "incident" ? 6 : 2;
    entry.bytesReceivedKb += kind === "incident" ? 4 : 7;
    entry.avgRtt += kind === "incident" ? 132 : 98;

    grouped.set(key, entry);
  };

  auditLogs.forEach((log) => {
    register(log.timestamp, /failed|error/i.test(log.summary ?? "") ? "failed" : "audit");
  });

  incidents.forEach((incident) => {
    register(incident.createdAt ?? incident.updatedAt, "incident");
  });

  return Array.from(grouped.values())
    .map((entry) => ({
      ...entry,
      avgRtt: entry.requests > 0 ? Math.round(entry.avgRtt / entry.requests) : 0,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-8);
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
  const computedErrorRate = totalRequests > 0 ? `${((totalFailed / totalRequests) * 100).toFixed(1)}%` : "0.0%";
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

function buildRoutes(healthMetrics, latestCheckedAt) {
  return routeCatalog.map((route, index) => {
    const serviceState = collectStatus(healthMetrics, route.metricKeywords);
    const latency = collectLatency(healthMetrics, route.metricKeywords, 72 + index * 11);

    return {
      id: route.id,
      path: route.path,
      method: route.method,
      module: route.module,
      authRequired: route.authRequired,
      description: route.description,
      currentAvailability: stateToAvailability(serviceState),
      availability: stateToAvailability(serviceState),
      lastTestResult: stateToOutcome(serviceState),
      averageLatencyMs: latency,
      lastCheckedAt: formatIsoToDisplay(latestCheckedAt),
    };
  });
}

function buildLiveStatuses(routes) {
  return routes
    .filter((route) => route.path !== "/")
    .map((route) => ({
      id: `status-${route.id}`,
      routeId: route.id,
      label: route.module,
      state: stateToOnlineState(
        route.availability === "Available"
          ? "Healthy"
          : route.availability === "Degraded"
          ? "Warning"
          : "Critical",
      ),
      statusCode: stateToStatusCode(
        route.availability === "Available"
          ? "Healthy"
          : route.availability === "Degraded"
          ? "Warning"
          : "Critical",
      ),
      latencyMs: route.averageLatencyMs,
      lastCheckedAt: route.lastCheckedAt,
      success: route.availability !== "Offline",
    }));
}

function buildEndpointTests(routes) {
  return routes
    .filter((route) => routeCatalog.find((item) => item.id === route.id)?.testable)
    .map((route) => ({
      id: `test-${route.id}`,
      label: `${route.module} ${route.method}`,
      routeId: route.id,
      method: route.method,
      payloadTemplate:
        route.method === "GET"
          ? JSON.stringify({ sample: true }, null, 2)
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
  const [players, incidents, auditLogs, healthMetrics] = await Promise.all([
    getAllPlayers(),
    getAllIncidents(),
    getAllAuditLogs(),
    getAllHealthMetrics(),
  ]);

  const latestCheckedAt = latestTimestamp(
    incidents.map((item) => item.updatedAt ?? item.createdAt),
    auditLogs.map((item) => item.timestamp),
    healthMetrics.map((item) => item.updatedAt ?? item.timestamp),
  );

  const routes = buildRoutes(healthMetrics, latestCheckedAt);
  const trafficTrend = buildTrafficTrend(auditLogs, incidents);
  const resourceTrend = buildResourceTrend(healthMetrics, trafficTrend);
  const requestLogs = buildRequestLogs(auditLogs);
  const derivedHealth = buildApplicationHealth(healthMetrics, trafficTrend);

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
      memoryUse: derivedHealth.memoryUse,
      cpuLoad: derivedHealth.cpuLoad,
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
      players: players.length,
      incidents: incidents.length,
      auditLogs: auditLogs.length,
      healthMetrics: healthMetrics.length,
    },
  };
}
