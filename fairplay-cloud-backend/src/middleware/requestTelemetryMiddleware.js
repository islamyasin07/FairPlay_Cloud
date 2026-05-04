import crypto from "node:crypto";
import { recordRequestTelemetry } from "../services/telemetryStore.js";

function toSampleRate(value, fallback = 1) {
  const parsed = Number(value);

  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
    return parsed;
  }

  return fallback;
}

export function requestTelemetry(req, res, next) {
  const requestId = req.get("x-request-id") ?? crypto.randomUUID();
  const startedAt = process.hrtime.bigint();
  const sampleRate = toSampleRate(process.env.MONITORING_SAMPLE_RATE, 1);

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    if (Math.random() > sampleRate) {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const payload = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
      userAgent: req.get("user-agent") ?? "Unknown",
      ip: req.ip,
    };

    recordRequestTelemetry(payload);
    console.log(JSON.stringify(payload));
  });

  next();
}
