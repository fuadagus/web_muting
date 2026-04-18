import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Layers, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MUTING_CENTER: [number, number] = [-7.5, 140.5];

const sampleVillages = [
  { name: "SP 1 Muting", lat: -7.45, lng: 140.48, pop: 650 },
  { name: "SP 2 Muting", lat: -7.52, lng: 140.55, pop: 820 },
  { name: "SP 3 Muting", lat: -7.48, lng: 140.42, pop: 540 },
  { name: "SP 4 Muting", lat: -7.55, lng: 140.50, pop: 730 },
];

const sampleFacilities = [
  { name: "SD Negeri 1 Muting", type: "education", lat: -7.46, lng: 140.49 },
  { name: "Puskesmas Muting", type: "health", lat: -7.50, lng: 140.52 },
  { name: "SD Negeri 2 Muting", type: "education", lat: -7.53, lng: 140.47 },
  { name: "Posyandu SP 4", type: "health", lat: -7.54, lng: 140.51 },
];

function createIcon(color: string) {
  return L.divIcon({
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

const villageIcon = createIcon("hsl(199,89%,40%)");
const eduIcon = createIcon("hsl(38,92%,55%)");
const healthIcon = createIcon("hsl(0,72%,50%)");

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 11, { duration: 1.2 });
  }, [center, map]);
  return null;
}

export default function InteractiveMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVillages, setShowVillages] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showHealth, setShowHealth] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MUTING_CENTER);

  const filteredVillages = sampleVillages.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex relative">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-r bg-card flex-shrink-0 relative z-10`}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-semibold">Layer & Filter</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari lokasi..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Layer toggles */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Layer
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={showVillages} onCheckedChange={(v) => setShowVillages(!!v)} />
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm">Kampung</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={showEducation} onCheckedChange={(v) => setShowEducation(!!v)} />
                  <div className="h-3 w-3 rounded-full bg-accent" />
                  <span className="text-sm">Pendidikan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={showHealth} onCheckedChange={(v) => setShowHealth(!!v)} />
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="text-sm">Kesehatan</span>
                </label>
              </div>
            </div>

            {/* Search results */}
            {searchQuery && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Hasil Pencarian
                </h3>
                {filteredVillages.length === 0 && (
                  <p className="text-sm text-muted-foreground">Tidak ditemukan.</p>
                )}
                {filteredVillages.map((v) => (
                  <button
                    key={v.name}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors"
                    onClick={() => setMapCenter([v.lat, v.lng])}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Legenda
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span>Kampung Ex-Transmigrasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-accent" />
                  <span>Fasilitas Pendidikan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <span>Fasilitas Kesehatan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-6 bg-muted-foreground rounded" />
                  <span>Jaringan Jalan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle sidebar button */}
      <button
        className="absolute top-4 z-20 bg-card border rounded-md p-1.5 shadow-sm hover:bg-muted transition-colors"
        style={{ left: sidebarOpen ? "calc(20rem + 0.5rem)" : "0.5rem" }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={MUTING_CENTER}
          zoom={10}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <MapUpdater center={mapCenter} />

          {showVillages &&
            sampleVillages.map((v) => (
              <Marker key={v.name} position={[v.lat, v.lng]} icon={villageIcon}>
                <Popup>
                  <strong>{v.name}</strong>
                  <br />
                  Populasi: {v.pop}
                </Popup>
              </Marker>
            ))}
          {showEducation &&
            sampleFacilities
              .filter((f) => f.type === "education")
              .map((f) => (
                <Marker key={f.name} position={[f.lat, f.lng]} icon={eduIcon}>
                  <Popup>
                    <strong>{f.name}</strong>
                    <br />
                    Fasilitas Pendidikan
                  </Popup>
                </Marker>
              ))}
          {showHealth &&
            sampleFacilities
              .filter((f) => f.type === "health")
              .map((f) => (
                <Marker key={f.name} position={[f.lat, f.lng]} icon={healthIcon}>
                  <Popup>
                    <strong>{f.name}</strong>
                    <br />
                    Fasilitas Kesehatan
                  </Popup>
                </Marker>
              ))}
        </MapContainer>
      </div>
    </div>
  );
}
