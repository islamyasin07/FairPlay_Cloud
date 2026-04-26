import { useMemo, useState } from "react";
import { usePlayers } from "../hooks/usePlayers";
import type { PlayerRiskRecord } from "../../../types/dashboard";
import LoadingState from "../../../components/ui/LoadingState";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import PlayerCard from "./PlayerCard";

function PlayerRiskGrid() {
  const [search, setSearch] = useState("");
  const { data: players = [], isLoading, isError } = usePlayers();

  const filteredPlayers = useMemo(() => {
    return players.filter((player: PlayerRiskRecord) => {
      const q = search.toLowerCase();
      return (
        player.username.toLowerCase().includes(q) ||
        player.playerId.toLowerCase().includes(q) ||
        player.primaryPattern.toLowerCase().includes(q) ||
        player.region.toLowerCase().includes(q)
      );
    });
  }, [players, search]);

if (isLoading) {
  return (
    <LoadingState
      title="Loading player risk profiles"
      description="Preparing suspicious player summaries and risk indicators."
    />
  );
}
if (isError) {
  return (
    <ErrorState
      title="Failed to load player profiles"
      description="The player risk module could not be loaded at this time."
    />
  );
}

  return (
    <div>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search username, player ID, region, or cheat pattern"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/30"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlayers.map((player: PlayerRiskRecord) => (
          <PlayerCard key={player.playerId} player={player} />
        ))}
{filteredPlayers.length === 0 && (
  <EmptyState
    title="No players matched"
    description="Try another username, player ID, region, or suspicious pattern."
  />
)}
      </div>
    </div>
  );
}

export default PlayerRiskGrid;