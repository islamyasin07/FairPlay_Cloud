import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import SystemHealthPanel from "../features/health/components/SystemHealthPanel";

function HealthPage() {
  return (
    <>
      <PageHeader
        title="System Health"
        description="Monitor ingestion reliability, service status, and cloud-side operational health across the platform."
        badge="Observability"
      />

      <SectionCard
        title="Operational Health Overview"
        description="A monitoring-focused view of platform stability, queue behavior, and reliability indicators."
      >
        <SystemHealthPanel />
      </SectionCard>
    </>
  );
}

export default HealthPage;