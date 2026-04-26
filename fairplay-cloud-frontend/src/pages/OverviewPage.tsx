import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatusBadge from "../components/ui/StatusBadge";
import KpiCard from "../features/dashboard/components/KpiCard";
import {
  getCheatDistribution,
  getIncidentTrend,
  getOverviewKpis,
  getRecentIncidents,
  getLiveFeed,
} from "../services/dashboardService";
import type {
  AuditRecord,
  CheatDistributionItem,
  KpiMetric,
  OverviewTrendPoint,
  RecentIncident,
} from "../types/dashboard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const pieColors = ["#22d3ee", "#38bdf8", "#a855f7", "#f97316", "#ef4444"];

function severityTone(severity: string) {
  if (severity === "Critical") return "danger";
  if (severity === "High") return "warning";
  if (severity === "Medium") return "info";
  return "neutral";
}

function statusTone(status: string) {
  if (status === "Open") return "info";
  if (status === "Under Review") return "warning";
  if (status === "Confirmed") return "danger";
  return "neutral";
}

function OverviewPage() {
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [trend, setTrend] = useState<OverviewTrendPoint[]>([]);
  const [distribution, setDistribution] = useState<CheatDistributionItem[]>([]);
  const [incidents, setIncidents] = useState<RecentIncident[]>([]);
  const [liveFeed, setLiveFeed] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOverviewData() {
      try {
        const [kpiData, trendData, distributionData, recentIncidentData, liveFeedData] =
          await Promise.all([
            getOverviewKpis(),
            getIncidentTrend(),
            getCheatDistribution(),
            getRecentIncidents(),
            getLiveFeed(),
          ]);

        setKpis(kpiData);
        setTrend(trendData);
        setDistribution(distributionData);
        setIncidents(recentIncidentData);
        setLiveFeed(liveFeedData);
      } finally {
        setIsLoading(false);
      }
    }

    loadOverviewData();
  }, []);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Overview"
          description="Monitor suspicious activity trends, incident volume, and platform health from a centralized anti-cheat operations dashboard."
          badge="Loading..."
        />

        <SectionCard title="Loading Overview" description="Fetching dashboard data...">
          <p className="text-sm text-slate-400">Preparing system overview modules.</p>
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Overview"
        description="Monitor suspicious activity trends, incident volume, and platform health from a centralized anti-cheat operations dashboard."
        badge="Live Monitoring"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SectionCard
          title="Threat Activity Trend"
          description="Suspicious incident volume across the latest monitoring window."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.96)",
                    border: "1px solid rgba(34,211,238,0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22d3ee" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Cheat Type Distribution"
          description="Detected suspicious patterns by category."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.96)",
                    border: "1px solid rgba(34,211,238,0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid gap-2">
            {distribution.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="text-sm text-slate-200">{item.name}</span>
                </div>
                <span className="text-sm text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Recent Suspicious Incidents"
          description="Latest flagged cases surfaced for moderator attention."
        >
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div
                key={incident.incidentId}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition duration-300 hover:border-cyan-500/20 hover:bg-slate-950"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        {incident.incidentId}
                      </h3>
                      <StatusBadge
                        label={incident.severity}
                        tone={severityTone(incident.severity)}
                      />
                      <StatusBadge
                        label={incident.status}
                        tone={statusTone(incident.status)}
                      />
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      <span className="font-medium text-white">{incident.playerName}</span>{" "}
                      was flagged for{" "}
                      <span className="text-cyan-300">{incident.cheatType}</span> in{" "}
                      {incident.region}.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Risk Score: {incident.riskScore} • {incident.createdAtRelative}
                    </p>
                  </div>

                  <div className="text-sm text-slate-400">
                    Player ID:{" "}
                    <span className="text-slate-200">{incident.playerId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Live Feed Snapshot"
          description="Recent moderation-relevant activity generated by the detection pipeline."
        >
          <div className="space-y-3">
            {liveFeed.length > 0 ? (
              liveFeed.map((item, index) => (
                <div
                  key={item.actionId}
                  className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 transition duration-300 hover:border-cyan-500/20"
                  style={{
                    animationDelay: `${index * 120}ms`,
                  }}
                >
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.7)]" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">{item.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.actor} • {item.timestampRelative}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <p className="text-sm text-slate-400">No audit activity yet.</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default OverviewPage;