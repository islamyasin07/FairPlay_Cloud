import StatusBadge from "../../../components/ui/StatusBadge";
import { useHealthData } from "../hooks/useHealthData";
import LoadingState from "../../../components/ui/LoadingState";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";

import type {
  QueueHealthRecord,
  ReliabilityMetric,
  ServiceHealthRecord,
} from "../../../types/dashboard";

function serviceTone(status: string) {
  if (status === "Healthy") return "success";
  if (status === "Warning") return "warning";
  return "danger";
}

function queueTone(state: string) {
  if (state === "Stable") return "success";
  if (state === "Elevated") return "warning";
  return "info";
}

function SystemHealthPanel() {
  const { data, isLoading, isError } = useHealthData();

  if (isLoading) {
  return (
    <LoadingState
      title="Loading health metrics"
      description="Preparing platform observability and service health indicators."
    />
  );
}

  if (isError || !data) {
  return (
    <ErrorState
      title="Failed to load health metrics"
      description="The health monitoring module could not be loaded at this time."
    />
  );
}

if (
  data.metrics.length === 0 &&
  data.services.length === 0 &&
  data.queues.length === 0
) {
  return (
    <EmptyState
      title="No health data available"
      description="No system health or reliability metrics are available right now."
    />
  );
}

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric: ReliabilityMetric) => (
          <div
            key={metric.label}
            className="glass-panel rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/20"
          >
            <p className="text-sm text-slate-400">{metric.label}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <h3 className="text-2xl font-semibold text-white">{metric.value}</h3>
              <StatusBadge label={metric.value} tone={metric.tone} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="glass-panel rounded-3xl p-6">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-white">Service Health</h3>
            <p className="mt-1 text-sm text-slate-400">
              Simulated operational status across core platform services.
            </p>
          </div>

          <div className="space-y-4">
            {data.services.map((service: ServiceHealthRecord) => (
              <div
                key={service.service}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition duration-300 hover:border-cyan-500/20"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold text-white">
                        {service.service}
                      </h4>
                      <StatusBadge
                        label={service.status}
                        tone={serviceTone(service.status)}
                      />
                    </div>

                    <p className="mt-2 text-sm text-slate-300">{service.notes}</p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>
                        Uptime: <span className="text-slate-200">{service.uptime}</span>
                      </span>
                      <span>
                        Latency: <span className="text-slate-200">{service.latency}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-white">Queue Health</h3>
            <p className="mt-1 text-sm text-slate-400">
              Mock platform queue states used to support the reliability story.
            </p>
          </div>

          <div className="space-y-4">
            {data.queues.map((queue: QueueHealthRecord) => (
              <div
                key={queue.queueName}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">{queue.queueName}</h4>
                  <StatusBadge label={queue.state} tone={queueTone(queue.state)} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Depth</p>
                    <p className="mt-1 font-medium text-white">{queue.depth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Processing</p>
                    <p className="mt-1 font-medium text-white">{queue.processingRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Retry Rate</p>
                    <p className="mt-1 font-medium text-white">{queue.retryRate}</p>
                  </div>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      queue.state === "Stable"
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                        : queue.state === "Elevated"
                        ? "bg-gradient-to-r from-amber-400 to-orange-400"
                        : "bg-gradient-to-r from-cyan-400 to-sky-400"
                    }`}
                    style={{
                      width:
                        queue.state === "Stable"
                          ? "35%"
                          : queue.state === "Elevated"
                          ? "72%"
                          : "52%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemHealthPanel;