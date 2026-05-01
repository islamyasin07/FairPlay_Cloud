import os from "node:os";
import { env } from "../config/env.js";

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function buildDependencyStatus() {
  return {
    playersTable: hasValue(env.playersTable),
    incidentsTable: hasValue(env.incidentsTable),
    auditLogsTable: hasValue(env.auditLogsTable),
    systemHealthTable: hasValue(env.systemHealthTable),
    adminUsersTable: hasValue(env.adminUsersTable),
    jwtSecretConfigured: hasValue(env.jwtSecret),
    awsCredentialsConfigured: hasValue(env.awsAccessKeyId) && hasValue(env.awsSecretAccessKey),
  };
}

export function getMonitoringSnapshot() {
  const dependencyStatus = buildDependencyStatus();
  const configuredCount = Object.values(dependencyStatus).filter(Boolean).length;
  const totalCount = Object.keys(dependencyStatus).length;

  return {
    service: "fairplay-cloud-backend",
    status: configuredCount === totalCount ? "ready" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    pid: process.pid,
    nodeVersion: process.version,
    platform: `${os.platform()} ${os.release()}`,
    memoryUsage: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external,
    },
    cpuCount: os.cpus().length,
    awsRegion: env.awsRegion,
    dependencies: dependencyStatus,
    readinessScore: Math.round((configuredCount / totalCount) * 100),
  };
}