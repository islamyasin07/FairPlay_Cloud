type LoadingStateProps = {
  title?: string;
  description?: string;
};

function LoadingState({
  title = "Loading",
  description = "Please wait while data is being prepared.",
}: LoadingStateProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/50 px-5 py-10 text-center">
      <div className="mx-auto h-10 w-10 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export default LoadingState;