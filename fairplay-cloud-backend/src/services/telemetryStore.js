const MAX_REQUEST_LOGS = 250;

const requestLogs = [];

export function recordRequestTelemetry(entry) {
  requestLogs.unshift(entry);

  if (requestLogs.length > MAX_REQUEST_LOGS) {
    requestLogs.length = MAX_REQUEST_LOGS;
  }
}

export function getRecentRequestTelemetry() {
  return requestLogs.slice();
}
