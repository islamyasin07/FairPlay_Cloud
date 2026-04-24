import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import CaseCommandBoard from "../features/case-command/components/CaseCommandBoard";

function CaseCommandPage() {
  return (
    <>
      <PageHeader
        title="Case Command Center"
        description="Prioritize active investigations, resolve stale queues, and keep moderation SLA under control across all suspicious cases."
        badge="Queue Orchestration"
      />

      <SectionCard
        title="Moderator Queue Control"
        description="Group, triage, and update cases using risk-aware lanes and bulk moderation actions."
      >
        <CaseCommandBoard />
      </SectionCard>
    </>
  );
}

export default CaseCommandPage;