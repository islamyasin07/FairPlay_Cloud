import { useState } from "react";
import { MapPin } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import type { PlayerRiskRecord } from "../../../types/dashboard";
import PlayerIpMap from "./PlayerIpMap";

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

interface PlayerCardProps {
  player: PlayerRiskRecord;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="glass-panel h-fit rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]">
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
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Last active: {player.lastSeen}</span>
          {player.ipAddress && (
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              <MapPin className="h-3 w-3" />
              {showMap ? "Hide Map" : "IP Map"}
            </button>
          )}
        </div>
      </div>

      {showMap && player.ipAddress && (
        <PlayerIpMap ipAddress={player.ipAddress} />
      )}

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
  );
}
