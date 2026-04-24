import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatusBadge from "../../../components/ui/StatusBadge";
import type {
  CommunicationMetrics,
  RequestLogRecord,
  TrafficPoint,
} from "../../../types/observability";

type TrafficMetricsPanelProps = {
  metrics: CommunicationMetrics;
  trafficTrend: TrafficPoint[];
  requestLogs: RequestLogRecord[];
};

function stabilityTone(stability: CommunicationMetrics["connectionStability"]) {
  if (stability === "Stable") return "success";
  if (stability === "Fluctuating") return "warning";
  return "danger";
}

function logTone(statusCode: number) {
  if (statusCode >= 500) return "danger";
  if (statusCode >= 400) return "warning";
  return "success";
}

function TrafficMetricsPanel({
  metrics,
  trafficTrend,
  requestLogs,
}: TrafficMetricsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Requests Sent", value: metrics.totalRequestsSent },
          { label: "Responses Received", value: metrics.totalResponsesReceived },
          { label: "Failed Responses", value: metrics.failedResponses },
          { label: "Timeout Count", value: metrics.timeoutCount },
          { label: "Retry Count", value: metrics.retryCount },
          { label: "Avg Round-Trip", value: metrics.averageRoundTripTime },
          { label: "Bytes Sent", value: metrics.bytesSent },
          { label: "Bytes Received", value: metrics.bytesReceived },
          { label: "Active Connections", value: metrics.activeConnections },
        ].map((item) => (
          <div key={item.label} className="glass-panel rounded-3xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}

        <div className="glass-panel rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Connection Stability</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold text-white">{metrics.connectionStability}</p>
            <StatusBadge
              label={metrics.connectionStability}
              tone={stabilityTone(metrics.connectionStability)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white">Request / Response Trend</h3>
            <p className="mt-1 text-sm text-slate-400">
              Requests, responses, failures, and round-trip time across the latest sample window.
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficTrend}>
                <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis yAxisId="count" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis yAxisId="latency" orientation="right" stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.96)",
                    border: "1px solid rgba(34,211,238,0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line yAxisId="count" type="monotone" dataKey="requests" stroke="#22d3ee" strokeWidth={3} dot={false} />
                <Line yAxisId="count" type="monotone" dataKey="responses" stroke="#38bdf8" strokeWidth={3} dot={false} />
                <Line yAxisId="count" type="monotone" dataKey="failed" stroke="#f97316" strokeWidth={3} dot={false} />
                <Line yAxisId="latency" type="monotone" dataKey="avgRtt" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white">Payload Volume</h3>
            <p className="mt-1 text-sm text-slate-400">
              UI is structured to consume transport metrics from a backend observability endpoint.
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficTrend}>
                <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.96)",
                    border: "1px solid rgba(34,211,238,0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="bytesSentKb" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="bytesReceivedKb" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">Sample Request / Response Logs</h3>
          <p className="mt-1 text-sm text-slate-400">
            Synthetic trace records representing API monitoring output and transport summaries.
          </p>
        </div>

        <div className="space-y-3">
          {requestLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 transition duration-300 hover:border-cyan-500/20"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={log.method} tone="info" />
                    <p className="text-sm font-semibold text-white">{log.route}</p>
                    <StatusBadge label={`${log.statusCode}`} tone={logTone(log.statusCode)} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{log.message}</p>
                  <p className="mt-2 text-xs text-slate-500">Trace ID {log.traceId}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-400 lg:min-w-[240px]">
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="mt-1 text-slate-200">{log.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Duration</p>
                    <p className="mt-1 text-slate-200">{log.durationMs} ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bytes Sent</p>
                    <p className="mt-1 text-slate-200">{log.bytesSentKb} KB</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bytes Received</p>
                    <p className="mt-1 text-slate-200">{log.bytesReceivedKb} KB</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrafficMetricsPanel;
