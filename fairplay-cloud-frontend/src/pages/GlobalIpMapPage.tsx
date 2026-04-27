import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import { usePlayers } from "../features/players/hooks/usePlayers";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, AlertCircle, Flame } from "lucide-react";
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

export default function GlobalIpMapPage() {
  const { data: players = [], isLoading: playersLoading, isError } = usePlayers();
  const [geoPlayers, setGeoPlayers] = useState<PlayerGeo[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function geocodePlayers() {
      if (players.length === 0) return;
      setMapLoading(true);

      const playersWithIp = players.filter((p: PlayerRiskRecord) => !!p.ipAddress);
      const results: PlayerGeo[] = [];

      for (const player of playersWithIp) {
        try {
          const res = await fetch(
            `https://get.geojs.io/v1/ip/geo/${player.ipAddress}.json`
          );
          if (!res.ok) continue;
          
          const data = await res.json();

          const lat = parseFloat(data.latitude);
          const lon = parseFloat(data.longitude);

          if (!isNaN(lat) && !isNaN(lon)) {
            results.push({
              ...player,
              lat,
              lon,
            });
          }
        } catch (err) {
          console.warn(`Failed to geocode IP ${player.ipAddress}`, err);
        }
      }

      if (active) {
        setGeoPlayers(results);
        setMapLoading(false);
      }
    }

    geocodePlayers();

    return () => {
      active = false;
    };
  }, [players]);

  if (playersLoading || mapLoading) {
    return (
      <>
        <PageHeader
          title="Global IP Tracking"
          description="A global map visualizing the flagged and active player IPs."
          badge="Geospatial"
        />
        <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
          <span className="ml-3 text-slate-400">Locating Players...</span>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader
          title="Global IP Tracking"
          description="A global map visualizing the flagged and active player IPs."
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
        title="Global IP Tracking"
        description="A global map visualizing the flagged and active player IPs."
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
                    <div><strong>IP:</strong> {gp.ipAddress}</div>
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
