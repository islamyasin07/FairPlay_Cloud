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
    <div className="glass-panel relative isolate overflow-hidden rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_34px_rgba(34,211,238,0.14)]">
      <div className="pointer-events-none absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</h3>
          <p className="mt-3 text-xs text-slate-400">{hint}</p>
        </div>
        <StatusBadge label="Live" tone={tone} />
      </div>
    </div>
  );
}

export default ObservabilityStatCard;
