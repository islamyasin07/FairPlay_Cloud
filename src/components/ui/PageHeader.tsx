type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
};

function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-[0_0_14px_rgba(34,211,238,0.08)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {badge ? (
        <div className="inline-flex w-fit items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
          {badge}
        </div>
      ) : null}
    </div>
  );
}

export default PageHeader;