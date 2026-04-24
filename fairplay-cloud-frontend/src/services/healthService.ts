import type {
  QueueHealthRecord,
  ReliabilityMetric,
  ServiceHealthRecord,
} from "../types/dashboard";
import { buildApiUrl } from "./api";

type RawHealthItem = {
  metricId?: string;
  service?: string;
  status?: string;
  uptime?: string;
  latency?: string;
  notes?: string;
  updatedAt?: string;
};

export async function getServiceHealthRecords(): Promise<ServiceHealthRecord[]> {
  const response = await fetch(buildApiUrl("/health"));

  if (!response.ok) {
    throw new Error("Failed to fetch health metrics");
  }

  const data: RawHealthItem[] = await response.json();

  return data.map((item) => ({
    service: item.service ?? "Unknown Service",
    status:
      item.status === "Healthy" || item.status === "Warning" || item.status === "Degraded"
        ? item.status
        : "Healthy",
    uptime: item.uptime ?? "N/A",
    latency: item.latency ?? "N/A",
    notes: item.notes ?? "No notes available.",
  }));
}

export async function getQueueHealthRecords(): Promise<QueueHealthRecord[]> {
  return [
    {
      queueName: "incident-review-queue",
      depth: 7,
      processingRate: "420 / min",
      retryRate: "0.1%",
      state: "Stable",
    },
    {
      queueName: "alert-dispatch-queue",
      depth: 12,
      processingRate: "650 / min",
      retryRate: "0.4%",
      state: "Stable",
    },
  ];
}

export async function getReliabilityMetrics(): Promise<ReliabilityMetric[]> {
  return [
    {
      label: "Burst Handling",
      value: "Passed",
      tone: "success",
    },
    {
      label: "Queue Backpressure",
      value: "Controlled",
      tone: "info",
    },
    {
      label: "Retry Stability",
      value: "Nominal",
      tone: "success",
    },
    {
      label: "Latency Spike Risk",
      value: "Moderate",
      tone: "warning",
    },
  ];
}
