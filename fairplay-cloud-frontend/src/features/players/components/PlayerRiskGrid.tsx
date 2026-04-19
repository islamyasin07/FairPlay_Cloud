import { useMemo, useState } from "react";
import StatusBadge from "../../../components/ui/StatusBadge";
import { usePlayers } from "../hooks/usePlayers";
import type { PlayerRiskRecord } from "../../../types/dashboard";
import LoadingState from "../../../components/ui/LoadingState";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";

function playerStatusTone(status: string) {
  if (status === "Flagged") return "warning";
  if (status === "Under Observation") return "info";
  if (status === "Banned") return "danger";
  return "success";
}

function riskTone(score: number) {
  if (score >= 85) return "danger";
  if (score >= 60) return "warning";
  if (score >= 40) return "info";
  return "success";
}

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
          <div
            key={player.playerId}
            className="glass-panel rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{player.username}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {player.playerId} • {player.region}
                </p>
              </div>

              <StatusBadge
                label={player.status}
                tone={playerStatusTone(player.status)}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">Risk Score</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-semibold text-white">
                    {player.riskScore}
                  </span>
                  <StatusBadge
                    label={
                      player.riskScore >= 85
                        ? "High Risk"
                        : player.riskScore >= 60
                        ? "Watchlist"
                        : "Low Risk"
                    }
                    tone={riskTone(player.riskScore)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs text-slate-400">Incidents</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {player.totalIncidents}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Primary Suspicious Pattern</p>
              <p className="mt-2 text-sm font-medium text-cyan-300">
                {player.primaryPattern}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Last active: {player.lastSeen}
              </p>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  player.riskScore >= 85
                    ? "bg-gradient-to-r from-red-500 to-orange-400"
                    : player.riskScore >= 60
                    ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                    : "bg-gradient-to-r from-cyan-400 to-emerald-400"
                }`}
                style={{ width: `${player.riskScore}%` }}
              />
            </div>
          </div>
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