import type {
  QueueHealthRecord,
  ReliabilityMetric,
  ServiceHealthRecord,
} from "../types/dashboard";
import { apiFetch } from "./api";

type RawHealthItem = {
  metricId?: string;
  service?: string;
  status?: string;
  uptime?: string;
  latency?: string;
  notes?: string;
  updatedAt?: string;
  queueName?: string;
  depth?: number | string;
  processingRate?: string;
  retryRate?: string;
  state?: string;
  value?: string | number;
  metricValue?: string | number;
  cpuLoad?: string | number;
  memoryUse?: string | number;
  errorRate?: string | number;
};

function normalizeServiceStatus(status?: string): ServiceHealthRecord["status"] {
  if (status === "Healthy" || status === "Warning" || status === "Degraded") {
    return status;
  }

  return "Healthy";
}

function normalizeQueueState(status?: string, notes?: string): QueueHealthRecord["state"] {
  const text = `${status ?? ""} ${notes ?? ""}`.toLowerCase();

  if (text.includes("recover") || text.includes("retry")) {
    return "Recovering";
  }

  if (text.includes("warn") || text.includes("elevat") || text.includes("slow")) {
    return "Elevated";
  }

  return "Stable";
}

function toCompactString(value: string | number | undefined, fallback: string) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return fallback;
}

async function fetchHealthItems(): Promise<RawHealthItem[]> {
  const response = await apiFetch("/health");

  if (!response.ok) {
    throw new Error("Failed to fetch health metrics");
  }

  return response.json() as Promise<RawHealthItem[]>;
}

function buildServiceHealthRecords(items: RawHealthItem[]): ServiceHealthRecord[] {
  return items
    .filter((item) => Boolean(item.service || item.metricId))
    .map((item, index) => ({
      service: item.service ?? item.metricId ?? `Service ${index + 1}`,
      status: normalizeServiceStatus(item.status),
      uptime: item.uptime ?? "N/A",
      latency: item.latency ?? "N/A",
      notes: item.notes ?? "No notes available.",
    }));
}

function buildQueueHealthRecords(items: RawHealthItem[]): QueueHealthRecord[] {
  return items
    .filter((item) => {
      const text = `${item.queueName ?? ""} ${item.metricId ?? ""} ${item.service ?? ""} ${item.notes ?? ""}`.toLowerCase();
      return Boolean(item.queueName || text.includes("queue"));
    })
    .map((item, index) => ({
      queueName: item.queueName ?? item.metricId ?? `Queue ${index + 1}`,
      depth: Number(item.depth ?? item.value ?? item.metricValue ?? 0) || 0,
      processingRate: toCompactString(item.processingRate, "N/A"),
      retryRate: toCompactString(item.retryRate, "N/A"),
      state: normalizeQueueState(item.state, item.notes),
    }));
}

function buildReliabilityMetrics(
  items: RawHealthItem[],
  services: ServiceHealthRecord[],
  queues: QueueHealthRecord[]
): ReliabilityMetric[] {
  const healthyServices = services.filter((service) => service.status === "Healthy").length;
  const warningServices = services.filter((service) => service.status === "Warning").length;
  const degradedServices = services.filter((service) => service.status === "Degraded").length;
  const recentUpdates = items.filter((item) => Boolean(item.updatedAt)).length;

  return [
    {
      label: "Healthy Services",
      value: `${healthyServices}/${Math.max(services.length, 1)}`,
      tone: degradedServices > 0 ? "warning" : "success",
    },
    {
      label: "Queue Signals",
      value: `${queues.length}`,
      tone: queues.some((queue) => queue.state !== "Stable") ? "info" : "success",
    },
    {
      label: "Warning Surface",
      value: `${warningServices + degradedServices}`,
      tone: warningServices + degradedServices > 0 ? "warning" : "success",
    },
    {
      label: "Updated Metrics",
      value: `${recentUpdates}`,
      tone: recentUpdates > 0 ? "info" : "danger",
    },
  ];
}

export async function getHealthDashboardData(): Promise<{
  services: ServiceHealthRecord[];
  queues: QueueHealthRecord[];
  metrics: ReliabilityMetric[];
}> {
  const items = await fetchHealthItems();

  if (items.length === 0) {
    return { services: [], queues: [], metrics: [] };
  }

  const services = buildServiceHealthRecords(items);
  const queues = buildQueueHealthRecords(items);
  const metrics = buildReliabilityMetrics(items, services, queues);

  return { services, queues, metrics };
}

export async function getQueueHealthRecords(): Promise<QueueHealthRecord[]> {
  const { queues } = await getHealthDashboardData();
  return queues;
}

export async function getReliabilityMetrics(): Promise<ReliabilityMetric[]> {
  const { services, queues, metrics } = await getHealthDashboardData();
  return metrics.length > 0 ? metrics : buildReliabilityMetrics([], services, queues);
}

export async function getServiceHealthRecords(): Promise<ServiceHealthRecord[]> {
  const { services } = await getHealthDashboardData();
  return services;
}
