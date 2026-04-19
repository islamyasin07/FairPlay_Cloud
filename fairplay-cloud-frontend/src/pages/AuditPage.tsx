import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import AuditTimeline from "../features/audit/components/AuditTimeline";

function AuditPage() {
  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Track moderator actions, case updates, and administrative decisions for accountability and traceability."
        badge="Operational Visibility"
      />

      <SectionCard
        title="Moderation Activity Timeline"
        description="A chronological record of system actions, moderator decisions, and incident handling events."
      >
        <AuditTimeline />
      </SectionCard>
    </>
  );
}

export default AuditPage;