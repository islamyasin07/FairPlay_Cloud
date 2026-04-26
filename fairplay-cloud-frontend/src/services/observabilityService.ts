import type {
  ApiLiveStatusRecord,
  ApiRouteRecord,
  ApplicationHealthSummary,
  CommunicationMetrics,
  EndpointTestResult,
  EndpointTestScenario,
  HttpMethod,
  ObservabilitySnapshot,
  RequestLogRecord,
  ResourcePoint,
  TestOutcome,
  TrafficPoint,
} from "../types/observability";
import { buildApiUrl } from "./api";

function normalizeRoutes(routes: unknown): ApiRouteRecord[] {
  if (!Array.isArray(routes)) return [];

  return routes.map((route, index) => {
    const item = (route ?? {}) as Partial<ApiRouteRecord>;

    return {
      id: item.id ?? `route-${index + 1}`,
      path: item.path ?? "/unknown",
      method: item.method ?? "GET",
      module: item.module ?? "Unknown",
      authRequired: Boolean(item.authRequired),
      description: item.description ?? "No description provided.",
      availability: item.availability ?? "Offline",
      lastTestResult: item.lastTestResult ?? "Failed",
      averageLatencyMs: Number(item.averageLatencyMs ?? 0),
      lastCheckedAt: item.lastCheckedAt ?? "Not available",
    };
  });
}

function normalizeStatuses(statuses: unknown): ApiLiveStatusRecord[] {
  if (!Array.isArray(statuses)) return [];

  return statuses.map((status, index) => {
    const item = (status ?? {}) as Partial<ApiLiveStatusRecord>;

    return {
      id: item.id ?? `status-${index + 1}`,
      routeId: item.routeId ?? `route-${index + 1}`,
      label: item.label ?? "Unknown",
      state: item.state ?? "Offline",
      statusCode: Number(item.statusCode ?? 0),
      latencyMs: Number(item.latencyMs ?? 0),
      lastCheckedAt: item.lastCheckedAt ?? "Not available",
      success: Boolean(item.success),
    };
  });
}

function normalizeEndpointTests(endpointTests: unknown): EndpointTestScenario[] {
  if (!Array.isArray(endpointTests)) return [];

  return endpointTests.map((scenario, index) => {
    const item = (scenario ?? {}) as Partial<EndpointTestScenario>;

    return {
      id: item.id ?? `test-${index + 1}`,
      label: item.label ?? "Unknown endpoint",
      routeId: item.routeId ?? `route-${index + 1}`,
      method: item.method ?? "GET",
      payloadTemplate: item.payloadTemplate ?? "{}",
      description: item.description ?? "No description provided.",
    };
  });
}

function normalizeApplicationHealth(value: unknown): ApplicationHealthSummary {
  const item = (value ?? {}) as Partial<ApplicationHealthSummary>;

  return {
    backendStatus: item.backendStatus ?? "Critical",
    databaseStatus: item.databaseStatus ?? "Critical",
    storageStatus: item.storageStatus ?? "Critical",
    uptime: item.uptime ?? "Not reported",
    memoryUse: item.memoryUse ?? "Not reported",
    cpuLoad: item.cpuLoad ?? "Not reported",
    requestErrorRate: item.requestErrorRate ?? "Not reported",
    healthSummaryScore: Number(item.healthSummaryScore ?? 0),
  };
}

function normalizeCommunicationMetrics(value: unknown): CommunicationMetrics {
  const item = (value ?? {}) as Partial<CommunicationMetrics>;

  return {
    totalRequestsSent: item.totalRequestsSent ?? "0",
    totalResponsesReceived: item.totalResponsesReceived ?? "0",
    failedResponses: item.failedResponses ?? "0",
    timeoutCount: item.timeoutCount ?? "0",
    retryCount: item.retryCount ?? "0",
    averageRoundTripTime: item.averageRoundTripTime ?? "0 ms",
    bytesSent: item.bytesSent ?? "0 GB",
    bytesReceived: item.bytesReceived ?? "0 GB",
    activeConnections: item.activeConnections ?? "0",
    connectionStability: item.connectionStability ?? "Unstable",
  };
}

function normalizeResourceTrend(points: unknown): ResourcePoint[] {
  if (!Array.isArray(points)) return [];

  return points.map((point, index) => {
    const item = (point ?? {}) as Partial<ResourcePoint>;

    return {
      time: item.time ?? `Point ${index + 1}`,
      memory: Number(item.memory ?? 0),
      cpu: Number(item.cpu ?? 0),
      errorRate: Number(item.errorRate ?? 0),
    };
  });
}

function normalizeTrafficTrend(points: unknown): TrafficPoint[] {
  if (!Array.isArray(points)) return [];

  return points.map((point, index) => {
    const item = (point ?? {}) as Partial<TrafficPoint>;

    return {
      time: item.time ?? `Point ${index + 1}`,
      requests: Number(item.requests ?? 0),
      responses: Number(item.responses ?? 0),
      failed: Number(item.failed ?? 0),
      avgRtt: Number(item.avgRtt ?? 0),
      bytesSentKb: Number(item.bytesSentKb ?? 0),
      bytesReceivedKb: Number(item.bytesReceivedKb ?? 0),
    };
  });
}

function normalizeRequestLogs(logs: unknown): RequestLogRecord[] {
  if (!Array.isArray(logs)) return [];

  return logs.map((log, index) => {
    const item = (log ?? {}) as Partial<RequestLogRecord>;

    return {
      id: item.id ?? `log-${index + 1}`,
      timestamp: item.timestamp ?? "Not available",
      method: item.method ?? "GET",
      route: item.route ?? "/unknown",
      statusCode: Number(item.statusCode ?? 0),
      durationMs: Number(item.durationMs ?? 0),
      bytesSentKb: Number(item.bytesSentKb ?? 0),
      bytesReceivedKb: Number(item.bytesReceivedKb ?? 0),
      traceId: item.traceId ?? "Unavailable",
      message: item.message ?? "No message provided.",
    };
  });
}

function normalizeSnapshot(data: unknown): ObservabilitySnapshot {
  const snapshot = (data ?? {}) as Partial<ObservabilitySnapshot>;

  return {
    routes: normalizeRoutes(snapshot.routes),
    liveStatuses: normalizeStatuses(snapshot.liveStatuses),
    endpointTests: normalizeEndpointTests(snapshot.endpointTests),
    applicationHealth: normalizeApplicationHealth(snapshot.applicationHealth),
    communicationMetrics: normalizeCommunicationMetrics(snapshot.communicationMetrics),
    resourceTrend: normalizeResourceTrend(snapshot.resourceTrend),
    trafficTrend: normalizeTrafficTrend(snapshot.trafficTrend),
    requestLogs: normalizeRequestLogs(snapshot.requestLogs),
  };
}

export async function getObservabilitySnapshot(): Promise<ObservabilitySnapshot> {
  const response = await fetch(buildApiUrl("/observability"));

  if (!response.ok) {
    throw new Error("Failed to fetch observability snapshot");
  }

  const data = await response.json();
  return normalizeSnapshot(data);
}

type RunEndpointTestInput = {
  endpointId: string;
  routePath: string;
  method: HttpMethod;
  payload: string;
};

function determineOutcome(statusCode: number): TestOutcome {
  if (statusCode >= 200 && statusCode < 300) return "Passed";
  if (statusCode >= 400) return "Failed";
  return "Warning";
}

export async function runCriticalEndpointTest({
  endpointId,
  routePath,
  method,
  payload,
}: RunEndpointTestInput): Promise<EndpointTestResult> {
  const requestUrl = new URL(buildApiUrl(routePath), window.location.origin);
  let parsedPayload: unknown = null;

  if (payload.trim().length > 0) {
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      parsedPayload = payload;
    }
  }

  if (method === "GET" && parsedPayload && typeof parsedPayload === "object" && !Array.isArray(parsedPayload)) {
    Object.entries(parsedPayload as Record<string, unknown>).forEach(([key, value]) => {
      requestUrl.searchParams.set(key, String(value));
    });
  }

  const startedAt = performance.now();
  const response = await fetch(requestUrl.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body:
      method === "GET" || method === "DELETE"
        ? undefined
        : typeof parsedPayload === "string"
        ? parsedPayload
        : JSON.stringify(parsedPayload ?? {}),
  });
  const executionTimeMs = Math.round(performance.now() - startedAt);
  const rawResponse = await response.text();
  const responseBody = rawResponse || JSON.stringify({ message: "Empty response body" }, null, 2);

  return {
    endpointId,
    statusCode: response.status,
    executionTimeMs,
    outcome: determineOutcome(response.status),
    responseBody,
    executedAt: new Date().toLocaleTimeString(),
  };
}
