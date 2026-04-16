import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import PlayerRiskGrid from "../features/players/components/PlayerRiskGrid";

function PlayersPage() {
  return (
    <>
      <PageHeader
        title="Players"
        description="Inspect suspicious players, review risk scores, and explore incident history for moderation decisions."
        badge="Risk Tracking"
      />

      <SectionCard
        title="Player Risk Profiles"
        description="Track flagged players, review exposure levels, and monitor repeat suspicious behavior."
      >
        <PlayerRiskGrid />
      </SectionCard>
    </>
  );
}

export default PlayersPage;