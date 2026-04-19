import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-cyan-500/15 bg-slate-900/62 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_22px_60px_rgba(2,6,23,0.45),0_0_48px_rgba(34,211,238,0.08)] backdrop-blur-xl transition duration-300 hover:border-cyan-400/25 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_64px_rgba(2,6,23,0.5),0_0_60px_rgba(34,211,238,0.14)]">
      <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-violet-400/10 blur-3xl" />
      {(title || description) && (
        <div className="relative z-10 mb-5">
          {title ? <h2 className="text-xl font-semibold text-white">{title}</h2> : null}
          {description ? (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export default SectionCard;