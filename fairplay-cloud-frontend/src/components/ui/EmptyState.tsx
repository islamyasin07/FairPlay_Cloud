import type { ReactNode } from "react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
};

function EmptyState({
  title = "No results found",
  description = "There is currently nothing to display here.",
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/50 px-5 py-10 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;