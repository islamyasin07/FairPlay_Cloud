type ErrorStateProps = {
  title?: string;
  description?: string;
};

function ErrorState({
  title = "Something went wrong",
  description = "The requested data could not be loaded.",
}: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-10 text-center">
      <h3 className="text-base font-semibold text-red-300">{title}</h3>
      <p className="mt-2 text-sm text-red-200/80">{description}</p>
    </div>
  );
}

export default ErrorState;