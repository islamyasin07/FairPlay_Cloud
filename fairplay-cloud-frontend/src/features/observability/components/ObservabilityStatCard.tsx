import StatusBadge from "../../../components/ui/StatusBadge";

type ObservabilityStatCardProps = {
  label: string;
  value: string;
  hint: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
};

function ObservabilityStatCard({
  label,
  value,
  hint,
  tone = "info",
}: ObservabilityStatCardProps) {
  return (
    <div className="glass-panel group relative isolate overflow-hidden rounded-[28px] border border-slate-800/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_20px_60px_rgba(15,23,42,0.4)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_30%)] opacity-80" />
      <div className="pointer-events-none absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-cyan-400/12 blur-3xl transition duration-300 group-hover:bg-cyan-400/18" />
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-300/10 blur-3xl transition duration-300 group-hover:bg-amber-300/15" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</h3>
          <p className="mt-3 max-w-[28ch] text-xs leading-6 text-slate-400">{hint}</p>
        </div>
        <StatusBadge label="Live" tone={tone} />
      </div>
    </div>
  );
}

export default ObservabilityStatCard;
