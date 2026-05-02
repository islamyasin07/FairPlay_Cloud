import os from "node:os";
import {
  GetMetricDataCommand,
  ListMetricsCommand,
} from "@aws-sdk/client-cloudwatch";
import { cloudWatch } from "../config/cloudwatch.js";
import { env } from "../config/env.js";

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseDimensions(rawDimensions) {
  if (!hasValue(rawDimensions)) return [];

  return rawDimensions
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [name, ...rest] = pair.split("=");
      const value = rest.join("=").trim();

      if (!name?.trim() || !value) {
        return null;
      }

      return {
        Name: name.trim(),
        Value: value,
      };
    })
    .filter(Boolean);
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

function formatWindowLabel(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(timestamp);
}

function isCloudWatchConfigured() {
  return hasValue(env.cloudWatchOverviewNamespace);
}

async function verifyMetricExists(metricName, dimensions) {
  const command = new ListMetricsCommand({
    Namespace: env.cloudWatchOverviewNamespace,
    MetricName: metricName,
    Dimensions: dimensions.length > 0 ? dimensions : undefined,
  });
  const response = await cloudWatch.send(command);
  return (response.Metrics ?? []).length > 0;
}

async function getTimeSeriesMetric({
  metricName,
  statistic,
  periodSeconds,
  lookbackHours,
  dimensions,
  id,
}) {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - lookbackHours * 60 * 60 * 1000);

  const command = new GetMetricDataCommand({
    StartTime: startTime,
    EndTime: endTime,
    ScanBy: "TimestampAscending",
    MetricDataQueries: [
      {
        Id: id,
        MetricStat: {
          Metric: {
            Namespace: env.cloudWatchOverviewNamespace,
            MetricName: metricName,
            Dimensions: dimensions,
          },
          Period: periodSeconds,
          Stat: statistic,
        },
        ReturnData: true,
      },
    ],
  });

  const response = await cloudWatch.send(command);
  const result = response.MetricDataResults?.[0];
  const timestamps = result?.Timestamps ?? [];
  const values = result?.Values ?? [];

  const ordered = timestamps
    .map((timestamp, index) => ({
      timestamp,
      value: Number(values[index] ?? 0),
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return ordered;
}

async function getDistributionMetrics(categories) {
  const baseDimensions = parseDimensions(env.cloudWatchBaseDimensions);
  const endTime = new Date();
  const startTime = new Date(
    endTime.getTime() - env.cloudWatchTrendLookbackHours * 60 * 60 * 1000
  );

  const queries = categories.map((category, index) => ({
    Id: `dist${index + 1}`,
    MetricStat: {
      Metric: {
        Namespace: env.cloudWatchOverviewNamespace,
        MetricName: env.cloudWatchDistributionMetricName,
        Dimensions: [
          ...baseDimensions,
          {
            Name: env.cloudWatchDistributionDimensionName,
            Value: category,
          },
        ],
      },
      Period: env.cloudWatchTrendPeriodSeconds,
      Stat: env.cloudWatchDistributionStatistic,
    },
    ReturnData: true,
    Label: category,
  }));

  if (queries.length === 0) {
    return [];
  }

  const command = new GetMetricDataCommand({
    StartTime: startTime,
    EndTime: endTime,
    ScanBy: "TimestampAscending",
    MetricDataQueries: queries,
  });

  const response = await cloudWatch.send(command);
  const results = response.MetricDataResults ?? [];

  return categories.map((category, index) => {
    const result = results[index];
    const values = result?.Values ?? [];
    const total = values.reduce((sum, value) => sum + Number(value ?? 0), 0);

    return {
      name: category,
      total,
    };
  });
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

export async function getOverviewChartsSnapshot() {
  const trendDimensions = [
    ...parseDimensions(env.cloudWatchBaseDimensions),
    ...parseDimensions(env.cloudWatchTrendDimensions),
  ];

  const categories = env.cloudWatchDistributionCategories
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

  if (!isCloudWatchConfigured()) {
    return {
      source: "fallback",
      cloudWatchConfigured: false,
      trend: [],
      distribution: [],
      message: "CloudWatch overview metrics are not configured yet.",
    };
  }

  const [trendMetricExists, distributionMetricExists] = await Promise.all([
    verifyMetricExists(env.cloudWatchTrendMetricName, trendDimensions),
    verifyMetricExists(env.cloudWatchDistributionMetricName, [
      ...parseDimensions(env.cloudWatchBaseDimensions),
      {
        Name: env.cloudWatchDistributionDimensionName,
        Value: categories[0] ?? "Aimbot",
      },
    ]),
  ]);

  if (!trendMetricExists && !distributionMetricExists) {
    return {
      source: "fallback",
      cloudWatchConfigured: true,
      trend: [],
      distribution: [],
      message:
        "No matching CloudWatch metrics were found for the configured overview charts.",
    };
  }

  const [trendSeries, distributionSeries] = await Promise.all([
    trendMetricExists
      ? getTimeSeriesMetric({
          metricName: env.cloudWatchTrendMetricName,
          statistic: env.cloudWatchTrendStatistic,
          periodSeconds: env.cloudWatchTrendPeriodSeconds,
          lookbackHours: env.cloudWatchTrendLookbackHours,
          dimensions: trendDimensions,
          id: "trend",
        })
      : Promise.resolve([]),
    distributionMetricExists
      ? getDistributionMetrics(categories)
      : Promise.resolve([]),
  ]);

  const distributionTotal = distributionSeries.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    source: "cloudwatch",
    cloudWatchConfigured: true,
    trend: trendSeries.map((point) => ({
      hour: formatWindowLabel(point.timestamp),
      incidents: Math.round(point.value),
    })),
    distribution: distributionSeries.map((item) => ({
      name: item.name,
      value:
        distributionTotal > 0
          ? Math.round((item.total / distributionTotal) * 100)
          : 0,
    })),
    message: null,
  };
}
