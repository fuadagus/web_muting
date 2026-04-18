import { useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Sliders, CircleDot, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MUTING_CENTER: [number, number] = [-7.5, 140.5];

const facilities = [
  { name: "SD Negeri 1 Muting", lat: -7.46, lng: 140.49 },
  { name: "Puskesmas Muting", lat: -7.50, lng: 140.52 },
];

const isochroneOptions = [
  { label: "3 menit", value: "3", radius: 3000 },
  { label: "9 menit", value: "9", radius: 9000 },
  { label: "12 menit", value: "12", radius: 12000 },
];

export default function AnalysisMapPage() {
  const [bufferRadius, setBufferRadius] = useState([5000]);
  const [analysisType, setAnalysisType] = useState("buffer");
  const [selectedFacility, setSelectedFacility] = useState("0");
  const [selectedIsochrone, setSelectedIsochrone] = useState("3");
  const [showResult, setShowResult] = useState(false);

  const facility = facilities[Number(selectedFacility)];
  const isochroneSelection =
    isochroneOptions.find((option) => option.value === selectedIsochrone) ?? isochroneOptions[0];
  const activeRadius = analysisType === "buffer" ? bufferRadius[0] : isochroneSelection.radius;

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Control Panel */}
      <div className="w-80 border-r bg-card flex-shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-semibold">Analisis</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Pilih metode analisis aksesibilitas.
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          <Tabs value={analysisType} onValueChange={setAnalysisType}>
            <TabsList className="w-full">
              <TabsTrigger value="buffer" className="flex-1 gap-1">
                <CircleDot className="h-3.5 w-3.5" />
                Buffer
              </TabsTrigger>
              <TabsTrigger value="isochrone" className="flex-1 gap-1">
                <Clock className="h-3.5 w-3.5" />
                Isochrone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buffer" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Fasilitas</Label>
                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Radius: {(bufferRadius[0] / 1000).toFixed(1)} km</Label>
                <Slider
                  value={bufferRadius}
                  onValueChange={setBufferRadius}
                  min={1000}
                  max={20000}
                  step={500}
                />
              </div>
            </TabsContent>

            <TabsContent value="isochrone" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Fasilitas</Label>
                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pilih area isochrone</Label>
                <RadioGroup value={selectedIsochrone} onValueChange={setSelectedIsochrone} className="gap-3">
                  {isochroneOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-lg border p-3 text-sm cursor-pointer hover:bg-muted/60"
                    >
                      <RadioGroupItem value={option.value} />
                      <div className="grid gap-0.5">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          Tampilkan area isochrone {option.label}.
                        </span>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full hero-gradient border-0"
            onClick={() => setShowResult(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Jalankan Analisis
          </Button>

          {showResult && (
            <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
              <p className="font-semibold">Hasil Analisis</p>
              <p className="text-muted-foreground">
                {analysisType === "buffer"
                  ? `Buffer ${(bufferRadius[0] / 1000).toFixed(1)} km dari ${facility.name}`
                  : `Isochrone ${isochroneSelection.label} dari ${facility.name}`}
              </p>
              <p className="text-muted-foreground">Kampung tercakup: 3 dari 4</p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={MUTING_CENTER} zoom={10} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          {facilities.map((f, i) => (
            <Marker key={i} position={[f.lat, f.lng]}>
              <Popup>{f.name}</Popup>
            </Marker>
          ))}
          {showResult && (
            <Circle
              center={[facility.lat, facility.lng]}
              radius={activeRadius}
              pathOptions={{
                color: "hsl(199,89%,40%)",
                fillColor: "hsl(199,89%,40%)",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
