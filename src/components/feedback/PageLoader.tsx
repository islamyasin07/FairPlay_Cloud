function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950">
      <div className="relative flex flex-col items-center">
        <div className="absolute h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative h-16 w-16 rounded-full border border-cyan-400/20 bg-slate-900/80">
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-sky-400" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-cyan-300">
          Loading Experience
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Initializing secure access panel
        </p>
      </div>
    </div>
  );
}

export default PageLoader;