import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, MapPinOff } from "lucide-react";

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
}

export default function PlayerIpMap({ ipAddress }: PlayerIpMapProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocation() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://get.geojs.io/v1/ip/geo/${ipAddress}.json`);
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          setCoordinates([lat, lon]);
        } else {
          setError(data.reason || "Failed to locate IP");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    if (ipAddress) {
      fetchLocation();
    }
  }, [ipAddress]);

  if (loading) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center text-slate-400">
        <MapPinOff className="mb-2 h-6 w-6 text-slate-500" />
        <span className="text-xs">{error || "Location unavailable"}</span>
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
            <div className="text-xs">
              <strong>IP:</strong> {ipAddress}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
