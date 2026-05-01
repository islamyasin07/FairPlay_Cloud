import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event: "backend-started",
      service: "fairplay-cloud-backend",
      port: env.port,
      healthCheck: "/health/live",
      readinessCheck: "/health/ready",
      monitoringEndpoint: "/monitoring",
    })
  );
});