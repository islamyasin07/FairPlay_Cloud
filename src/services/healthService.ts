import {
  queueHealthRecords,
  reliabilityMetrics,
  serviceHealthRecords,
} from "../lib/mock-data/dashboard.ts";

export async function getServiceHealthRecords() {
  return Promise.resolve(serviceHealthRecords);
}

export async function getQueueHealthRecords() {
  return Promise.resolve(queueHealthRecords);
}

export async function getReliabilityMetrics() {
  return Promise.resolve(reliabilityMetrics);
}