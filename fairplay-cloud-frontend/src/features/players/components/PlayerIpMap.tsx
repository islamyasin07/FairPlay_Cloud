import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPinOff, Flame } from "lucide-react";
import { launchRpg } from "../../../utils/rpgAnimation";

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

interface PlayerIpMapProps {
  ipAddress: string;
  region?: string;
}

const regionCoordinates: Record<string, [number, number]> = {
  "NA-East": [39.5, -77.0],
  "EU-West": [53.0, -6.0],
  "ME-Central": [25.0, 45.0],
  "APAC-East": [35.0, 139.0],
  "SA-South": [-23.5, -46.6],
};

function coordinatesForRegion(region?: string): [number, number] | null {
  if (!region) {
    return null;
  }

  return regionCoordinates[region] ?? null;
}

export default function PlayerIpMap({ ipAddress, region }: PlayerIpMapProps) {
  const coordinates = useMemo(() => coordinatesForRegion(region), [region]);

  if (!coordinates) {
    return (
      <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center text-slate-400">
        <MapPinOff className="mb-2 h-6 w-6 text-slate-500" />
        <span className="text-xs">Regional map unavailable for {ipAddress}</span>
      </div>
    );
  }

  return (
    <div className="relative z-0 mt-3 h-48 w-full overflow-hidden rounded-xl border border-slate-800 shadow-inner">
      <MapContainer
        center={coordinates}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates}>
          <Popup>
            <div className="text-xs pb-1">
              <strong>IP:</strong> {ipAddress}
              <button 
                onClick={launchRpg}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded bg-red-900/40 px-2 py-1.5 text-center font-bold text-red-400 hover:bg-red-800/80 hover:text-white transition shadow-sm border border-red-800/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              >
                <Flame className="h-3 w-3" />
                Send RPG
              </button>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
