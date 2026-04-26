import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MUTING_CENTER: [number, number] = [-7.5, 140.5];

type PoiSource = {
  key: string;
  label: string;
  url: string;
};

type PoiFeatureItem = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  coordinates: [number, number];
  properties: Record<string, any>;
};

type PoiSymbolStyle = {
  color: string;
  pictogram: string;
};

const RAW_POI_FILES = import.meta.glob("../data/POI/*.geojson", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

const FACILITY_LABEL_MAP: Record<string, string> = {
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
  posyandu: "Posyandu",
  puskesmas: "Puskesmas",
  pustu: "Pustu",
  pasar: "Pasar",
  kesehatan: "Kesehatan",
  kantor_kampung: "Kantor Kampung",
};

const POI_SYMBOL_STYLE_MAP: Record<string, PoiSymbolStyle> = {
  kantor_kampung: { color: "hsl(216, 70%, 45%)", pictogram: "🏢" },
  kesehatan: { color: "hsl(8, 74%, 52%)", pictogram: "🩺" },
  pasar: { color: "hsl(27, 92%, 52%)", pictogram: "🛒" },
  posyandu: { color: "hsl(342, 82%, 52%)", pictogram: "👶" },
  puskesmas: { color: "hsl(168, 72%, 34%)", pictogram: "🏥" },
  pustu: { color: "hsl(176, 66%, 41%)", pictogram: "🚑" },
  sd: { color: "hsl(44, 92%, 48%)", pictogram: "📘" },
  smp: { color: "hsl(251, 66%, 54%)", pictogram: "📗" },
  sma: { color: "hsl(272, 58%, 52%)", pictogram: "🎓" },
};

const DEFAULT_POI_SYMBOL_STYLE: PoiSymbolStyle = {
  color: "hsl(215, 16%, 47%)",
  pictogram: "📍",
};

function toTitleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getFacilityLabel(facility: string) {
  return FACILITY_LABEL_MAP[facility] ?? toTitleCase(facility);
}

const POI_SOURCES: PoiSource[] = Object.entries(RAW_POI_FILES)
  .map(([path, url]) => {
    const fileName = path.split("/").pop()?.replace(".geojson", "").toLowerCase();

    if (!fileName) {
      return null;
    }

    return {
      key: fileName,
      label: getFacilityLabel(fileName),
      url,
    };
  })
  .filter((item): item is PoiSource => item !== null)
  .sort((a, b) => a.label.localeCompare(b.label));

function getPoiSymbolStyle(category: string) {
  return POI_SYMBOL_STYLE_MAP[category] ?? DEFAULT_POI_SYMBOL_STYLE;
}

function createPoiIcon(style: PoiSymbolStyle) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 2px solid #ffffff;
        background: ${style.color};
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      ">${style.pictogram}</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!center) {
      return;
    }

    map.flyTo(center, 14, { duration: 1.2 });
  }, [center, map]);

  return null;
}

export default function InteractiveMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [poiFeatures, setPoiFeatures] = useState<PoiFeatureItem[]>([]);
  const [poiLoading, setPoiLoading] = useState(false);
  const [poiError, setPoiError] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(POI_SOURCES.map((source) => [source.key, true])),
  );

  useEffect(() => {
    setVisibleCategories((previous) => {
      const next = { ...previous };
      POI_SOURCES.forEach((source) => {
        if (typeof next[source.key] !== "boolean") {
          next[source.key] = true;
        }
      });
      return next;
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadPoi = async () => {
      setPoiLoading(true);
      setPoiError(null);

      try {
        const datasets = await Promise.all(
          POI_SOURCES.map(async (source) => {
            const response = await fetch(source.url, { signal: controller.signal });

            if (!response.ok) {
              throw new Error(`Gagal memuat data POI (${response.status})`);
            }

            const rawGeojson = await response.json();
            const features = Array.isArray(rawGeojson?.features) ? rawGeojson.features : [];

            return features
              .filter((feature: any) => feature?.geometry?.type === "Point")
              .map((feature: any, index: number) => {
                const coordinates = feature.geometry.coordinates || [];
                const lng = Number(coordinates[0]);
                const lat = Number(coordinates[1]);
                const properties = feature.properties || {};
                const name =
                  String(
                    properties.Name ??
                    properties.Nama ??
                    properties.nama ??
                    `${source.label} ${index + 1}`,
                  ) || `${source.label} ${index + 1}`;

                return {
                  id: `${source.key}-${index}`,
                  name,
                  category: source.key,
                  categoryLabel: source.label,
                  coordinates: [lng, lat] as [number, number],
                  properties,
                };
              })
              .filter(
                (item: PoiFeatureItem) =>
                  Number.isFinite(item.coordinates[0]) && Number.isFinite(item.coordinates[1]),
              );
          }),
        );

        if (!mounted || controller.signal.aborted) {
          return;
        }

        setPoiFeatures(datasets.flat());
      } catch {
        if (!mounted || controller.signal.aborted) {
          return;
        }

        setPoiFeatures([]);
        setPoiError("Gagal memuat data POI.");
      } finally {
        if (mounted) {
          setPoiLoading(false);
        }
      }
    };

    loadPoi();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const poiIconsByCategory = useMemo(() => {
    const icons = new Map<string, L.DivIcon>();

    POI_SOURCES.forEach((source) => {
      icons.set(source.key, createPoiIcon(getPoiSymbolStyle(source.key)));
    });

    return icons;
  }, []);

  const visiblePoiFeatures = useMemo(
    () => poiFeatures.filter((poi) => visibleCategories[poi.category]),
    [poiFeatures, visibleCategories],
  );

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return visiblePoiFeatures
      .filter(
        (poi) =>
          poi.name.toLowerCase().includes(query) || poi.categoryLabel.toLowerCase().includes(query),
      )
      .slice(0, 30);
  }, [searchQuery, visiblePoiFeatures]);

  const toggleCategory = (key: string, nextValue: boolean) => {
    setVisibleCategories((previous) => ({
      ...previous,
      [key]: nextValue,
    }));
  };

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
                {POI_SOURCES.map((source) => {
                  const style = getPoiSymbolStyle(source.key);

                  return (
                    <label key={source.key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={visibleCategories[source.key] ?? true}
                        onCheckedChange={(checked) => toggleCategory(source.key, !!checked)}
                      />
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white text-xs leading-none shadow"
                        style={{ backgroundColor: style.color }}
                      >
                        {style.pictogram}
                      </span>
                      <span className="text-sm">{source.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Search results */}
            {searchQuery && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Hasil Pencarian
                </h3>
                {searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground">Tidak ditemukan.</p>
                )}
                {searchResults.map((poi) => (
                  <button
                    key={`search-${poi.id}`}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors"
                    onClick={() => setMapCenter([poi.coordinates[1], poi.coordinates[0]])}
                  >
                    <span className="font-medium">{poi.name}</span>
                    <span className="block text-xs text-muted-foreground">{poi.categoryLabel}</span>
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
                  <span className="text-muted-foreground">
                    Total titik POI aktif: {visiblePoiFeatures.length}
                  </span>
                </div>
                {POI_SOURCES.map((source) => {
                  const style = getPoiSymbolStyle(source.key);
                  const count = visiblePoiFeatures.filter((poi) => poi.category === source.key).length;

                  return (
                    <div key={`legend-${source.key}`} className="flex items-center gap-2">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white text-xs leading-none shadow"
                        style={{ backgroundColor: style.color }}
                      >
                        {style.pictogram}
                      </span>
                      <span>
                        {source.label} ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(poiLoading || poiError) && (
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                {poiLoading && <p className="text-muted-foreground">Memuat data POI...</p>}
                {poiError && <p className="text-destructive">{poiError}</p>}
              </div>
            )}
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

          {visiblePoiFeatures.map((poi) => (
            <Marker
              key={poi.id}
              position={[poi.coordinates[1], poi.coordinates[0]]}
              icon={poiIconsByCategory.get(poi.category) ?? createPoiIcon(DEFAULT_POI_SYMBOL_STYLE)}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{poi.name}</p>
                  <p className="text-xs text-muted-foreground">{poi.categoryLabel}</p>
                  {Object.entries(poi.properties).map(([key, value]) => (
                    <p key={key} className="text-xs">
                      <span className="font-medium">{toTitleCase(key)}:</span> {String(value)}
                    </p>
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
