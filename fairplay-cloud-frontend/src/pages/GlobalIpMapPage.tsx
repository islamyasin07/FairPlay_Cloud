import { useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import { usePlayers } from "../features/players/hooks/usePlayers";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertCircle, Flame } from "lucide-react";
import type { PlayerRiskRecord } from "../types/dashboard";
import { launchRpg } from "../utils/rpgAnimation";

// Fix leaflet icon missing issues in webpack/vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type PlayerGeo = PlayerRiskRecord & {
  lat: number;
  lon: number;
};

const regionCoordinates: Record<string, [number, number]> = {
  "NA-East": [39.5, -77.0],
  "EU-West": [53.0, -6.0],
  "ME-Central": [25.0, 45.0],
  "APAC-East": [35.0, 139.0],
  "SA-South": [-23.5, -46.6],
};

function coordinatesForRegion(region: string): [number, number] {
  return regionCoordinates[region] ?? [20, 0];
}

export default function GlobalIpMapPage() {
  const { data: players = [], isLoading: playersLoading, isError } = usePlayers();

  const geoPlayers = useMemo<PlayerGeo[]>(() => {
    return players.map((player) => {
      const [lat, lon] = coordinatesForRegion(player.region);

      return {
        ...player,
        lat,
        lon,
      };
    });
  }, [players]);

  if (playersLoading) {
    return (
      <>
        <PageHeader
          title="Global Risk Map"
          description="A privacy-safe regional map visualizing flagged and active player clusters."
          badge="Geospatial"
        />
        <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="text-slate-400">Loading player regions...</span>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader
          title="Global Risk Map"
          description="A privacy-safe regional map visualizing flagged and active player clusters."
          badge="Geospatial"
        />
        <div className="flex h-64 w-full flex-col items-center justify-center rounded-3xl border border-red-900/30 bg-red-950/20 p-4 text-center">
          <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
          <span className="text-sm text-red-400">Failed to load players.</span>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Global Risk Map"
        description="A privacy-safe regional map visualizing flagged and active player clusters."
        badge="Geospatial"
      />

      <SectionCard
        title="Active Incidents Map"
        description="Visualize potential threat clusters and geographical cheat patterns."
      >
        <div className="relative z-0 h-[65vh] w-full overflow-hidden rounded-3xl border border-slate-800 shadow-inner">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            className="h-full w-full bg-slate-950"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoPlayers.map((gp, i) => (
              <Marker key={`${gp.playerId}-${i}`} position={[gp.lat, gp.lon]}>
                <Popup>
                  <div className="text-xs pb-1">
                    <strong className="block text-sm mb-1">{gp.username}</strong>
                    <div><strong>ID:</strong> {gp.playerId}</div>
                    <div><strong>Region:</strong> {gp.region}</div>
                    <div><strong>Risk:</strong> {gp.riskScore}</div>
                    <div className="mb-2"><strong>Pattern:</strong> {gp.primaryPattern}</div>
                    <button 
                      onClick={launchRpg}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-red-900/40 px-2 py-1.5 text-center font-bold text-red-400 hover:bg-red-800/80 hover:text-white transition shadow-sm border border-red-800/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    >
                      <Flame className="h-3 w-3" />
                      Neutralize Target
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </SectionCard>
    </>
  );
}
