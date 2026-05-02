import express from "express";
import cors from "cors";
import { requestTelemetry } from "./middleware/requestTelemetryMiddleware.js";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { mountedRouteDefinitions } from "./config/routeRegistry.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestTelemetry);

app.get("/", (req, res) => {
  res.json({
    message: "FairPlay Cloud backend is running.",
  });
});

app.get("/health/live", (req, res) => {
  res.json({
    status: "ok",
    service: "fairplay-cloud-backend",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    requestId: req.requestId ?? null,
  });
});

app.get("/health/ready", (req, res) => {
  const requiredSettings = [
    env.awsRegion,
    env.jwtSecret,
    env.playersTable,
    env.incidentsTable,
    env.auditLogsTable,
    env.systemHealthTable,
    env.adminUsersTable,
  ];

  const isReady = requiredSettings.every(Boolean);

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    service: "fairplay-cloud-backend",
    timestamp: new Date().toISOString(),
    requestId: req.requestId ?? null,
    awsRegion: env.awsRegion,
    dependenciesConfigured: {
      playersTable: Boolean(env.playersTable),
      incidentsTable: Boolean(env.incidentsTable),
      auditLogsTable: Boolean(env.auditLogsTable),
      systemHealthTable: Boolean(env.systemHealthTable),
      adminUsersTable: Boolean(env.adminUsersTable),
    },
  });
});

mountedRouteDefinitions.forEach((definition) => {
  if (definition.authRequired) {
    app.use(definition.basePath, requireAuth, definition.router);
    return;
  }

  app.use(definition.basePath, definition.router);
});

export default app;
