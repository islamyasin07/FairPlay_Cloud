import { useEffect, useMemo, useState } from "react";
import StatusBadge from "../../../components/ui/StatusBadge";
import type {
  ApiRouteRecord,
  EndpointTestResult,
  EndpointTestScenario,
  HttpMethod,
} from "../../../types/observability";
import { runCriticalEndpointTest } from "../../../services/observabilityService";

type CriticalEndpointTesterProps = {
  routes: ApiRouteRecord[];
  scenarios: EndpointTestScenario[];
};

function outcomeTone(outcome: EndpointTestResult["outcome"]) {
  if (outcome === "Passed") return "success";
  if (outcome === "Warning") return "warning";
  return "danger";
}

function CriticalEndpointTester({
  routes,
  scenarios,
}: CriticalEndpointTesterProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0]?.id ?? "");
  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0],
    [scenarios, selectedScenarioId],
  );
  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedScenario?.routeId),
    [routes, selectedScenario],
  );
  const [method, setMethod] = useState<HttpMethod>(selectedScenario?.method ?? "GET");
  const [payload, setPayload] = useState(selectedScenario?.payloadTemplate ?? "");
  const [result, setResult] = useState<EndpointTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!selectedScenario) return;
    setMethod(selectedScenario.method);
    setPayload(selectedScenario.payloadTemplate);
  }, [selectedScenario]);

  async function handleRunTest() {
    if (!selectedRoute) return;
    setIsRunning(true);

    try {
      const testResult = await runCriticalEndpointTest({
        endpointId: selectedRoute.id,
        routePath: selectedRoute.path,
        method,
        payload,
      });
      setResult(testResult);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">Choose endpoint</span>
            <select
              value={selectedScenarioId}
              onChange={(event) => setSelectedScenarioId(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/40"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-300">Choose method</span>
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value as HttpMethod)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/40"
            >
              {(["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={method} tone="info" />
            <p className="text-sm font-semibold text-white">{selectedRoute?.path}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{selectedScenario?.description}</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Enter payload</span>
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            rows={14}
            className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-4 font-mono text-sm text-slate-200 outline-none transition focus:border-cyan-500/40"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunTest}
            disabled={isRunning || !selectedRoute}
            className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Sending Request..." : "Send Request"}
          </button>
          <p className="text-xs text-slate-400">
            This runner now sends a real request to the selected backend route.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Test Response Inspector</h3>
            <p className="mt-1 text-sm text-slate-400">
              Inspect response body, status code, execution time, and final verdict.
            </p>
          </div>
          {result ? (
            <StatusBadge label={result.outcome} tone={outcomeTone(result.outcome)} />
          ) : (
            <StatusBadge label="Waiting" tone="neutral" />
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Status Code</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {result?.statusCode ?? "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Execution Time</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {result ? `${result.executionTimeMs} ms` : "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Executed At</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {result?.executedAt ?? "--"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-200">Response</p>
            <p className="text-xs text-slate-500">Marked automatically from the real HTTP response</p>
          </div>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-900/80 p-4 text-xs leading-6 text-slate-300">
            {result?.responseBody ?? "Run a test to inspect the live backend response here."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CriticalEndpointTester;
