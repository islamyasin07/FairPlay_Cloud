import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
      {(title || description) && (
        <div className="mb-5">
          {title ? <h2 className="text-xl font-semibold text-white">{title}</h2> : null}
          {description ? (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}

export default SectionCard;