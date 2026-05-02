import authRoutes from "../routes/authRoutes.js";
import observabilityRoutes from "../routes/observabilityRoutes.js";
import monitoringRoutes from "../routes/monitoringRoutes.js";
import incidentRoutes from "../routes/incidentRoutes.js";
import playerRoutes from "../routes/playerRoutes.js";
import auditRoutes from "../routes/auditRoutes.js";
import healthRoutes from "../routes/healthRoutes.js";
import caseCommandRoutes from "../routes/caseCommandRoutes.js";

export const directRouteDefinitions = [
  {
    path: "/",
    method: "GET",
    module: "Core",
    authRequired: false,
    testable: false,
  },
  {
    path: "/health/live",
    method: "GET",
    module: "Core Health",
    authRequired: false,
    testable: true,
  },
  {
    path: "/health/ready",
    method: "GET",
    module: "Core Health",
    authRequired: false,
    testable: true,
  },
];

export const mountedRouteDefinitions = [
  {
    basePath: "/auth",
    module: "Auth",
    authRequired: false,
    router: authRoutes,
  },
  {
    basePath: "/observability",
    module: "Observability",
    authRequired: false,
    router: observabilityRoutes,
  },
  {
    basePath: "/monitoring",
    module: "Monitoring",
    authRequired: false,
    router: monitoringRoutes,
  },
  {
    basePath: "/incidents",
    module: "Incidents",
    authRequired: true,
    router: incidentRoutes,
  },
  {
    basePath: "/players",
    module: "Players",
    authRequired: true,
    router: playerRoutes,
  },
  {
    basePath: "/audit",
    module: "Audit",
    authRequired: true,
    router: auditRoutes,
  },
  {
    basePath: "/health",
    module: "Health",
    authRequired: false,
    router: healthRoutes,
  },
  {
    basePath: "/case-commands",
    module: "Case Command",
    authRequired: true,
    router: caseCommandRoutes,
  },
];
