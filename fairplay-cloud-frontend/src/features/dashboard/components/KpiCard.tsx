import type { KpiMetric } from "../../../types/dashboard";
import StatusBadge from "../../../components/ui/StatusBadge";

type KpiCardProps = {
  metric: KpiMetric;
};

function KpiCard({ metric }: KpiCardProps) {
  return (
    <div className="glass-panel relative isolate overflow-hidden rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_34px_rgba(34,211,238,0.14)]">
      <div className="pointer-events-none absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 top-0 h-28 w-28 rounded-full bg-violet-400/12 blur-3xl" />
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