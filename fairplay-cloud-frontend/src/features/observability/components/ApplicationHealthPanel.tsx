import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatusBadge from "../../../components/ui/StatusBadge";
import type {
  ApplicationHealthSummary,
  ResourcePoint,
} from "../../../types/observability";

type ApplicationHealthPanelProps = {
  summary: ApplicationHealthSummary;
  resourceTrend: ResourcePoint[];
};

function healthTone(state: ApplicationHealthSummary["backendStatus"]) {
  if (state === "Healthy") return "success";
  if (state === "Warning") return "warning";
  return "danger";
}

function ApplicationHealthPanel({
  summary,
  resourceTrend,
}: ApplicationHealthPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Backend</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">{summary.backendStatus}</h3>
            <StatusBadge label={summary.backendStatus} tone={healthTone(summary.backendStatus)} />
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Database</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">{summary.databaseStatus}</h3>
            <StatusBadge label={summary.databaseStatus} tone={healthTone(summary.databaseStatus)} />
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Storage</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">{summary.storageStatus}</h3>
            <StatusBadge label={summary.storageStatus} tone={healthTone(summary.storageStatus)} />
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-sm text-slate-400">Health Score</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{summary.healthSummaryScore}/100</h3>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
              style={{ width: `${summary.healthSummaryScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white">Resource Utilization Trend</h3>
            <p className="mt-1 text-sm text-slate-400">
              Memory, CPU, and error rate tracking ready to bind to backend monitoring feeds.
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resourceTrend}>
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
                <Line type="monotone" dataKey="memory" stroke="#22d3ee" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="cpu" stroke="#a855f7" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="errorRate" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Uptime", value: summary.uptime },
            { label: "Memory Use", value: summary.memoryUse },
            { label: "CPU Load", value: summary.cpuLoad },
            { label: "Request Error Rate", value: summary.requestErrorRate },
          ].map((item) => (
            <div key={item.label} className="glass-panel rounded-3xl p-5">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          ))}

          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-400">DynamoDB / Cloud Readiness</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This panel assumes the backend exposes aggregated health metrics from AWS resources such as
              DynamoDB, storage, and container runtime probes.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">Error Pressure</h3>
          <p className="mt-1 text-sm text-slate-400">
            Lightweight area chart to spot error-rate drift across the monitoring window.
          </p>
        </div>

        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={resourceTrend}>
              <defs>
                <linearGradient id="errorAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.04} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="errorRate"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#errorAreaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ApplicationHealthPanel;
