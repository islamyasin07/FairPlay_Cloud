import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendEnvPath = path.resolve(currentDir, "../../.env");
const workspaceEnvPath = path.resolve(currentDir, "../../../.env");

dotenv.config({ path: backendEnvPath });
dotenv.config({ path: workspaceEnvPath });

function getEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : undefined;
}

export const env = {
  port: Number(getEnv("PORT")) || 3001,
  awsRegion: getEnv("AWS_REGION") || getEnv("AWS_DEFAULT_REGION") || "us-east-1",
  awsAccessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
  awsSecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
  playersTable: getEnv("PLAYERS_TABLE"),
  incidentsTable: getEnv("INCIDENTS_TABLE"),
  auditLogsTable: getEnv("AUDITLOGS_TABLE"),
  systemHealthTable: getEnv("SYSTEMHEALTH_TABLE"),
  caseCommandsTable: getEnv("CASE_COMMANDS_TABLE") || "CASE_COMMANDS_TABLE",
  adminUsersTable: getEnv("ADMINUSERS_TABLE"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN") || "1d",
  jwtIssuer: getEnv("JWT_ISSUER") || "fairplay-cloud-backend",
  jwtAudience: getEnv("JWT_AUDIENCE") || "fairplay-cloud-frontend",
  bootstrapAdminKey: getEnv("BOOTSTRAP_ADMIN_KEY"),
  cloudWatchOverviewNamespace:
    getEnv("CLOUDWATCH_OVERVIEW_NAMESPACE") || "FairPlay/Overview",
  cloudWatchTrendMetricName:
    getEnv("CLOUDWATCH_TREND_METRIC_NAME") || "ThreatActivityCount",
  cloudWatchTrendStatistic:
    getEnv("CLOUDWATCH_TREND_STATISTIC") || "Sum",
  cloudWatchTrendPeriodSeconds:
    Number(getEnv("CLOUDWATCH_TREND_PERIOD_SECONDS")) || 3600,
  cloudWatchTrendLookbackHours:
    Number(getEnv("CLOUDWATCH_TREND_LOOKBACK_HOURS")) || 12,
  cloudWatchTrendDimensions: getEnv("CLOUDWATCH_TREND_DIMENSIONS") || "",
  cloudWatchDistributionMetricName:
    getEnv("CLOUDWATCH_DISTRIBUTION_METRIC_NAME") || "ThreatActivityCount",
  cloudWatchDistributionStatistic:
    getEnv("CLOUDWATCH_DISTRIBUTION_STATISTIC") || "Sum",
  cloudWatchDistributionDimensionName:
    getEnv("CLOUDWATCH_DISTRIBUTION_DIMENSION_NAME") || "CheatType",
  cloudWatchDistributionCategories:
    getEnv("CLOUDWATCH_DISTRIBUTION_CATEGORIES") ||
    "Aimbot,Speed Hack,No Recoil,Wallhack,Trigger Bot",
  cloudWatchBaseDimensions:
    getEnv("CLOUDWATCH_BASE_DIMENSIONS") || "",
};

function validateEnv() {
  if (!env.jwtSecret || env.jwtSecret.length < 32 || env.jwtSecret === "replace_with_a_long_random_secret") {
    throw new Error(
      "JWT_SECRET must be set to a strong secret (at least 32 characters) and not the placeholder value."
    );
  }
}

validateEnv();

console.log("ENV CHECK:", {
  port: env.port,
  awsRegion: env.awsRegion,
  playersTable: env.playersTable,
  incidentsTable: env.incidentsTable,
  auditLogsTable: env.auditLogsTable,
  systemHealthTable: env.systemHealthTable,
  caseCommandsTable: env.caseCommandsTable,
  jwtConfigured: Boolean(env.jwtSecret),
  accessKeyLoaded: !!env.awsAccessKeyId,
  secretKeyLoaded: !!env.awsSecretAccessKey,
  cloudWatchOverviewNamespace: env.cloudWatchOverviewNamespace,
  cloudWatchTrendMetricName: env.cloudWatchTrendMetricName,
  cloudWatchDistributionMetricName: env.cloudWatchDistributionMetricName,
});
