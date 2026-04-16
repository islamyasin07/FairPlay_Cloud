import type { KpiMetric } from "../../../types/dashboard";
import StatusBadge from "../../../components/ui/StatusBadge";

type KpiCardProps = {
  metric: KpiMetric;
};

function KpiCard({ metric }: KpiCardProps) {
  return (
    <div className="glass-panel rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_26px_rgba(34,211,238,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{metric.label}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {metric.value}
          </h3>
          <p className="mt-3 text-xs text-slate-400">{metric.hint}</p>
        </div>

        <StatusBadge label="Live" tone={metric.tone ?? "info"} />
      </div>

      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
      </div>
    </div>
  );
}

export default KpiCard;