import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import ApiLiveStatusGrid from "../features/observability/components/ApiLiveStatusGrid";
import ApiRoutesTable from "../features/observability/components/ApiRoutesTable";
import ApplicationHealthPanel from "../features/observability/components/ApplicationHealthPanel";
import CriticalEndpointTester from "../features/observability/components/CriticalEndpointTester";
import ObservabilityStatCard from "../features/observability/components/ObservabilityStatCard";
import TrafficMetricsPanel from "../features/observability/components/TrafficMetricsPanel";
import { useObservabilityData } from "../features/observability/hooks/useObservabilityData";

function ObservabilityPage() {
  const { data, isLoading, isError } = useObservabilityData();

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Observability"
          description="Unified frontend observability workspace for routes, health, endpoint validation, and network communication metrics."
          badge="Loading..."
        />
        <LoadingState
          title="Loading observability dashboard"
          description="Preparing API route inventory, health telemetry, and communication trends."
        />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <PageHeader
          title="Observability"
          description="Unified frontend observability workspace for routes, health, endpoint validation, and network communication metrics."
          badge="Unavailable"
        />
        <ErrorState
          title="Unable to load observability data"
          description="The observability module could not retrieve its monitoring snapshot."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Observability"
        description="Developer and admin control center for API inventory, live route status, endpoint testing, application health, and request/response monitoring."
        badge="Cloud Ready"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ObservabilityStatCard
          label="Tracked API Routes"
          value={`${data.routes.length}`}
          hint="Backend inventory documented with auth, feature, and latency details."
          tone="info"
        />
        <ObservabilityStatCard
          label="Healthy Live Checks"
          value={`${data.liveStatuses.filter((item) => item.success).length}/${data.liveStatuses.length}`}
          hint="Critical route probes currently reporting successful responses."
          tone="success"
        />
        <ObservabilityStatCard
          label="Health Summary Score"
          value={`${data.applicationHealth.healthSummaryScore}/100`}
          hint="Composite score across backend, database, storage, and request reliability."
          tone="warning"
        />
        <ObservabilityStatCard
          label="Connection Stability"
          value={data.communicationMetrics.connectionStability}
          hint="Frontend-ready transport panel for TCP or backend-provided network metrics."
          tone="success"
        />
      </div>

      <div className="mt-6 space-y-6">
        <SectionCard
          title="API Routes"
          description="Complete route catalog including method, owning module, authentication requirements, test outcomes, and average latency."
        >
          <ApiRoutesTable routes={data.routes} />
        </SectionCard>

        <SectionCard
          title="API Live Status"
          description="Operational status cards for the most important backend routes and control-plane endpoints."
        >
          <ApiLiveStatusGrid statuses={data.liveStatuses} />
        </SectionCard>

        <SectionCard
          title="Critical Endpoint Tester"
          description="Built-in request console to validate login, dashboard, incident, user, audit, and health endpoints from the frontend."
        >
          <CriticalEndpointTester routes={data.routes} scenarios={data.endpointTests} />
        </SectionCard>

        <SectionCard
          title="Application Health"
          description="Full-stack operational view with service status, resource usage, uptime, request error pressure, and cloud readiness notes."
        >
          <ApplicationHealthPanel
            summary={data.applicationHealth}
            resourceTrend={data.resourceTrend}
          />
        </SectionCard>

        <SectionCard
          title="Request / Response / TCP Communication"
          description="Transport-centric metrics for request volume, retries, bytes in flight, active connections, and sample trace records."
        >
          <TrafficMetricsPanel
            metrics={data.communicationMetrics}
            trafficTrend={data.trafficTrend}
            requestLogs={data.requestLogs}
          />
        </SectionCard>
      </div>
    </>
  );
}

export default ObservabilityPage;
