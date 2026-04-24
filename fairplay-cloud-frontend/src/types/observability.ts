export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteAvailability = "Available" | "Degraded" | "Offline";

export type TestOutcome = "Passed" | "Failed" | "Warning";

export type ServiceState = "Healthy" | "Warning" | "Critical";

export type ConnectionStability = "Stable" | "Fluctuating" | "Unstable";

export type ApiRouteRecord = {
  id: string;
  path: string;
  method: HttpMethod;
  module: string;
  authRequired: boolean;
  description: string;
  availability: RouteAvailability;
  lastTestResult: TestOutcome;
  averageLatencyMs: number;
  lastCheckedAt: string;
};

export type ApiLiveStatusRecord = {
  id: string;
  routeId: string;
  label: string;
  state: "Online" | "Offline" | "Degraded";
  statusCode: number;
  latencyMs: number;
  lastCheckedAt: string;
  success: boolean;
};

export type EndpointTestScenario = {
  id: string;
  label: string;
  routeId: string;
  method: HttpMethod;
  payloadTemplate: string;
  description: string;
};

export type EndpointTestResult = {
  endpointId: string;
  statusCode: number;
  executionTimeMs: number;
  outcome: TestOutcome;
  responseBody: string;
  executedAt: string;
};

export type ResourcePoint = {
  time: string;
  memory: number;
  cpu: number;
  errorRate: number;
};

export type TrafficPoint = {
  time: string;
  requests: number;
  responses: number;
  failed: number;
  avgRtt: number;
  bytesSentKb: number;
  bytesReceivedKb: number;
};

export type RequestLogRecord = {
  id: string;
  timestamp: string;
  method: HttpMethod;
  route: string;
  statusCode: number;
  durationMs: number;
  bytesSentKb: number;
  bytesReceivedKb: number;
  traceId: string;
  message: string;
};

export type ApplicationHealthSummary = {
  backendStatus: ServiceState;
  databaseStatus: ServiceState;
  storageStatus: ServiceState;
  uptime: string;
  memoryUse: string;
  cpuLoad: string;
  requestErrorRate: string;
  healthSummaryScore: number;
};

export type CommunicationMetrics = {
  totalRequestsSent: string;
  totalResponsesReceived: string;
  failedResponses: string;
  timeoutCount: string;
  retryCount: string;
  averageRoundTripTime: string;
  bytesSent: string;
  bytesReceived: string;
  activeConnections: string;
  connectionStability: ConnectionStability;
};

export type ObservabilitySnapshot = {
  routes: ApiRouteRecord[];
  liveStatuses: ApiLiveStatusRecord[];
  endpointTests: EndpointTestScenario[];
  applicationHealth: ApplicationHealthSummary;
  communicationMetrics: CommunicationMetrics;
  resourceTrend: ResourcePoint[];
  trafficTrend: TrafficPoint[];
  requestLogs: RequestLogRecord[];
};
