import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import proj4 from "proj4";
import "leaflet/dist/leaflet.css";
import { Sliders, CircleDot, Clock } from "lucide-react";
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

type IsochroneDataset = {
  key: string;
  facility: string;
  mode: string;
  minutes: number;
  url: string;
};

type PoiFeatureItem = {
  id: string;
  category: string;
  categoryLabel: string;
  coordinates: [number, number];
  properties: Record<string, any>;
};

type PoiSymbolStyle = {
  color: string;
  pictogram: string;
};

const RAW_ISOCHRONE_FILES = import.meta.glob(
  "../data/kesenjangan/Isochrone/**/*.geojson",
  { query: "?url", import: "default", eager: true },
) as Record<string, string>;

const RAW_POI_FILES = import.meta.glob(
  "../data/POI/*.geojson",
  { query: "?url", import: "default", eager: true },
) as Record<string, string>;

const DEFAULT_MODE_BY_FACILITY: Record<string, string> = {
  posyandu: "cycling",
};

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

const MODE_LABEL_MAP: Record<string, string> = {
  cycling: "bersepeda",
  driving: "berkendara",
  walking: "berjalan kaki",
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

function getModeLabel(mode: string) {
  return MODE_LABEL_MAP[mode] ?? toTitleCase(mode);
}

function getCrsName(raw: any) {
  return String(raw?.crs?.properties?.name || "").toLowerCase();
}

function getSourceCrs(raw: any): "EPSG:32754" | "EPSG:4326" {
  const crsName = getCrsName(raw);

  if (crsName.includes("32754")) {
    return "EPSG:32754";
  }

  return "EPSG:4326";
}

function parseIsochroneDataset(path: string, url: string): IsochroneDataset | null {
  const segments = path.split("/");
  const facilitySegment = segments[segments.length - 2];
  const fileName = segments[segments.length - 1]?.replace(".geojson", "");

  if (!facilitySegment || !fileName) {
    return null;
  }

  const parts = fileName.split("_");
  const minutes = Number(parts[0]);

  if (Number.isNaN(minutes)) {
    return null;
  }

  const facility = facilitySegment.toLowerCase();
  const mode = (parts[2] || DEFAULT_MODE_BY_FACILITY[facility] || "unknown").toLowerCase();

  return {
    key: `${facility}|${mode}|${minutes}`,
    facility,
    mode,
    minutes,
    url,
  };
}

const ISOCHRONE_DATASETS = Object.entries(RAW_ISOCHRONE_FILES)
  .map(([path, url]) => parseIsochroneDataset(path, url))
  .filter((dataset): dataset is IsochroneDataset => dataset !== null)
  .sort((a, b) => {
    if (a.facility !== b.facility) {
      return a.facility.localeCompare(b.facility);
    }

    if (a.mode !== b.mode) {
      return a.mode.localeCompare(b.mode);
    }

    return a.minutes - b.minutes;
  });

const ISOCHRONE_COMBINATIONS = Array.from(
  new Map(
    ISOCHRONE_DATASETS.map((dataset) => {
      const key = `${dataset.facility}|${dataset.mode}`;
      return [
        key,
        {
          key,
          facility: dataset.facility,
          mode: dataset.mode,
          label: `${getModeLabel(dataset.mode)} - ${getFacilityLabel(dataset.facility)}`,
        },
      ];
    }),
  ).values(),
);

const POI_CATEGORIES = Object.entries(RAW_POI_FILES)
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
  .filter((item): item is { key: string; label: string; url: string } => item !== null)
  .sort((a, b) => a.label.localeCompare(b.label));

proj4.defs(
  "EPSG:32754",
  "+proj=utm +zone=54 +south +datum=WGS84 +units=m +no_defs",
);

function convertCoordinateToWGS84(coordinates: any, sourceCrs: "EPSG:32754" | "EPSG:4326"): any {
  if (!Array.isArray(coordinates)) {
    return coordinates;
  }

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    if (sourceCrs === "EPSG:4326") {
      return [coordinates[0], coordinates[1]];
    }

    const [lng, lat] = proj4("EPSG:32754", "EPSG:4326", [coordinates[0], coordinates[1]]);
    return [lng, lat];
  }

  return coordinates.map((item) => convertCoordinateToWGS84(item, sourceCrs));
}

function transformGeojsonToWGS84(raw: any, sourceCrs: "EPSG:32754" | "EPSG:4326") {
  if (!raw || raw.type !== "FeatureCollection" || !Array.isArray(raw.features)) {
    return null;
  }

  return {
    ...raw,
    crs: undefined,
    features: raw.features.map((feature: any) => {
      if (!feature?.geometry?.coordinates) {
        return feature;
      }

      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: convertCoordinateToWGS84(feature.geometry.coordinates, sourceCrs),
        },
      };
    }),
  };
}

function getPoiSymbolStyle(category: string): PoiSymbolStyle {
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

function MapAutoFitExtent({
  analysisType,
  poiFeatures,
  isochroneGeojson,
  bufferRadius,
}: {
  analysisType: string;
  poiFeatures: PoiFeatureItem[];
  isochroneGeojson: any | null;
  bufferRadius: number;
}) {
  const map = useMap();

  useEffect(() => {
    let bounds: L.LatLngBounds | null = null;

    const poiLatLngs = poiFeatures.map((poi) => L.latLng(poi.coordinates[1], poi.coordinates[0]));

    if (analysisType === "buffer") {
      if (poiLatLngs.length === 0) {
        return;
      }

      bounds = L.latLngBounds(poiLatLngs);

      // Expand bounds to include full buffer area around each POI.
      poiLatLngs.forEach((latLng) => {
        const pointBufferBounds = latLng.toBounds(bufferRadius * 2);
        bounds?.extend(pointBufferBounds.getSouthWest());
        bounds?.extend(pointBufferBounds.getNorthEast());
      });
    }

    if (analysisType === "isochrone") {
      if (isochroneGeojson) {
        const isochroneBounds = L.geoJSON(isochroneGeojson).getBounds();
        if (isochroneBounds.isValid()) {
          bounds = isochroneBounds;
        }
      }

      if (poiLatLngs.length > 0) {
        const poiBounds = L.latLngBounds(poiLatLngs);
        bounds = bounds ? bounds.extend(poiBounds) : poiBounds;
      }
    }

    if (!bounds || !bounds.isValid()) {
      return;
    }

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16,
      animate: true,
    });
  }, [analysisType, bufferRadius, isochroneGeojson, map, poiFeatures]);

  return null;
}

const BUFFER_LEGEND_RANGES = [
  { min: 0, max: 3000, label: "0–3 km", color: "hsl(122,25%,68%)" },
  { min: 3000, max: 6000, label: ">3–6 km", color: "hsl(56,70%,72%)" },
  { min: 6000, max: 9000, label: ">6–9 km", color: "hsl(8,70%,74%)" },
  { min: 9000, max: 20000, label: ">9–20 km", color: "hsl(348,60%,70%)" },
];

const ISOCHRONE_TIME_CLASSES = [
  { minute: 3, label: "3 Menit", color: "hsl(122,25%,68%)" },
  { minute: 9, label: "9 Menit", color: "hsl(60,68%,74%)" },
  { minute: 12, label: "12 Menit", color: "hsl(8,70%,74%)" },
];

export default function AnalysisMapPage() {
  const [bufferRadius, setBufferRadius] = useState([5000]);
  const [analysisType, setAnalysisType] = useState("buffer");
  const [selectedPoiCategory, setSelectedPoiCategory] = useState("all");
  const [selectedIsochroneCombo, setSelectedIsochroneCombo] = useState(
    ISOCHRONE_COMBINATIONS[0]?.key ?? "",
  );
  const [selectedIsochroneMinutes, setSelectedIsochroneMinutes] = useState("");
  const [isochroneGeojson, setIsochroneGeojson] = useState<any | null>(null);
  const [isochroneLoading, setIsochroneLoading] = useState(false);
  const [isochroneError, setIsochroneError] = useState<string | null>(null);
  const [poiFeatures, setPoiFeatures] = useState<PoiFeatureItem[]>([]);
  const [poiLoading, setPoiLoading] = useState(false);
  const [poiError, setPoiError] = useState<string | null>(null);
  const latestIsochroneRequestRef = useRef(0);
  const latestPoiRequestRef = useRef(0);
  const poiIconsByCategory = useMemo(() => {
    const icons = new Map<string, L.DivIcon>();

    POI_CATEGORIES.forEach((item) => {
      icons.set(item.key, createPoiIcon(getPoiSymbolStyle(item.key)));
    });

    return icons;
  }, []);

  const selectedIsochroneCombination = useMemo(
    () => ISOCHRONE_COMBINATIONS.find((combination) => combination.key === selectedIsochroneCombo),
    [selectedIsochroneCombo],
  );
  const activePoiCategoryLabel = useMemo(() => {
    if (analysisType === "isochrone") {
      if (!selectedIsochroneCombination?.facility) {
        return "POI";
      }

      return getFacilityLabel(selectedIsochroneCombination.facility);
    }

    if (selectedPoiCategory === "all") {
      return "Semua POI";
    }

    return POI_CATEGORIES.find((item) => item.key === selectedPoiCategory)?.label ?? "POI";
  }, [analysisType, selectedIsochroneCombination?.facility, selectedPoiCategory]);
  const activePoiSources = useMemo(() => {
    if (analysisType === "isochrone") {
      if (!selectedIsochroneCombination?.facility) {
        return [];
      }

      return POI_CATEGORIES.filter((item) => item.key === selectedIsochroneCombination.facility);
    }

    if (selectedPoiCategory === "all") {
      return POI_CATEGORIES;
    }

    return POI_CATEGORIES.filter((item) => item.key === selectedPoiCategory);
  }, [analysisType, selectedIsochroneCombination?.facility, selectedPoiCategory]);
  const availableIsochroneOptions = useMemo(
    () => ISOCHRONE_DATASETS.filter((dataset) => `${dataset.facility}|${dataset.mode}` === selectedIsochroneCombo),
    [selectedIsochroneCombo],
  );
  const isochroneOptionsByCombo = useMemo(() => {
    const grouped = new Map<string, IsochroneDataset[]>();

    ISOCHRONE_DATASETS.forEach((dataset) => {
      const comboKey = `${dataset.facility}|${dataset.mode}`;
      const current = grouped.get(comboKey) ?? [];
      current.push(dataset);
      grouped.set(comboKey, current);
    });

    return grouped;
  }, []);
  const activeIsochroneDataset = useMemo(
    () =>
      availableIsochroneOptions.find(
        (dataset) => String(dataset.minutes) === selectedIsochroneMinutes,
      ),
    [availableIsochroneOptions, selectedIsochroneMinutes],
  );
  const activeIsochroneTimeClass = useMemo(() => {
    const minutes = activeIsochroneDataset?.minutes;

    if (typeof minutes !== "number") {
      return ISOCHRONE_TIME_CLASSES[0];
    }

    return ISOCHRONE_TIME_CLASSES.reduce((closest, current) => {
      const currentDiff = Math.abs(minutes - current.minute);
      const closestDiff = Math.abs(minutes - closest.minute);
      return currentDiff < closestDiff ? current : closest;
    });
  }, [activeIsochroneDataset?.minutes]);
  const activeBufferLegend = useMemo(
    () =>
      BUFFER_LEGEND_RANGES.find(
        (range) => bufferRadius[0] > range.min && bufferRadius[0] <= range.max,
      ) ?? BUFFER_LEGEND_RANGES[BUFFER_LEGEND_RANGES.length - 1],
    [bufferRadius],
  );

  const handleIsochroneComboChange = (comboKey: string) => {
    const options = isochroneOptionsByCombo.get(comboKey) ?? [];
    const matchedCurrentMinute = options.find(
      (option) => String(option.minutes) === selectedIsochroneMinutes,
    );
    const nextMinutes = String((matchedCurrentMinute ?? options[0])?.minutes ?? "");

    setSelectedIsochroneCombo(comboKey);
    setSelectedIsochroneMinutes(nextMinutes);
    setIsochroneGeojson(null);
    setIsochroneError(null);
  };

  useEffect(() => {
    const firstOption = availableIsochroneOptions[0];

    if (!firstOption) {
      setSelectedIsochroneMinutes("");
      return;
    }

    if (!availableIsochroneOptions.some((option) => String(option.minutes) === selectedIsochroneMinutes)) {
      setSelectedIsochroneMinutes(String(firstOption.minutes));
    }
  }, [availableIsochroneOptions, selectedIsochroneMinutes]);

  useEffect(() => {
    if (analysisType !== "isochrone") {
      return;
    }

    if (!activeIsochroneDataset?.url) {
      setIsochroneGeojson(null);
      setIsochroneError("Data isochrone tidak tersedia untuk pilihan ini.");
      setIsochroneLoading(false);
      return;
    }

    const controller = new AbortController();
    let mounted = true;
    const requestId = ++latestIsochroneRequestRef.current;

    const loadIsochrone = async () => {
      setIsochroneLoading(true);
      setIsochroneError(null);
      setIsochroneGeojson(null);

      try {
        const response = await fetch(activeIsochroneDataset.url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Gagal memuat data isochrone (${response.status})`);
        }

        const rawGeojson = await response.json();
        const transformedGeojson = transformGeojsonToWGS84(rawGeojson, getSourceCrs(rawGeojson));

        if (!mounted || requestId !== latestIsochroneRequestRef.current) {
          return;
        }

        if (!transformedGeojson) {
          throw new Error("Format GeoJSON tidak valid.");
        }

        setIsochroneGeojson(transformedGeojson);
      } catch (error) {
        if (!mounted || controller.signal.aborted || requestId !== latestIsochroneRequestRef.current) {
          return;
        }

        setIsochroneGeojson(null);
        const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal.";
        setIsochroneError(`Gagal memuat data isochrone GeoJSON: ${message}`);
      } finally {
        if (mounted) {
          setIsochroneLoading(false);
        }
      }
    };

    loadIsochrone();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [activeIsochroneDataset?.url, analysisType]);

  useEffect(() => {
    if (activePoiSources.length === 0) {
      setPoiFeatures([]);
      if (analysisType === "isochrone") {
        setPoiError(`Data POI untuk ${activePoiCategoryLabel} tidak tersedia.`);
      } else {
        setPoiError("Data POI tidak tersedia.");
      }
      setPoiLoading(false);
      return;
    }

    const controller = new AbortController();
    let mounted = true;
    const requestId = ++latestPoiRequestRef.current;

    const loadPoi = async () => {
      setPoiLoading(true);
      setPoiError(null);
      setPoiFeatures([]);

      try {
        const datasets = await Promise.all(
          activePoiSources.map(async (source) => {
            const response = await fetch(source.url, { signal: controller.signal });

            if (!response.ok) {
              throw new Error(`Gagal memuat data POI (${response.status})`);
            }

            const rawGeojson = await response.json();
            const transformed = transformGeojsonToWGS84(rawGeojson, getSourceCrs(rawGeojson));

            if (!transformed) {
              return [] as PoiFeatureItem[];
            }

            return transformed.features
              .filter((feature: any) => feature?.geometry?.type === "Point")
              .map((feature: any, index: number) => {
                const [lng, lat] = feature.geometry.coordinates || [];

                return {
                  id: `${source.key}-${index}`,
                  category: source.key,
                  categoryLabel: source.label,
                  coordinates: [lng, lat],
                  properties: feature.properties || {},
                } as PoiFeatureItem;
              })
              .filter(
                (item: PoiFeatureItem) =>
                  Number.isFinite(item.coordinates[0]) && Number.isFinite(item.coordinates[1]),
              );
          }),
        );

        if (!mounted || requestId !== latestPoiRequestRef.current) {
          return;
        }

        setPoiFeatures(datasets.flat());
      } catch (error) {
        if (!mounted || controller.signal.aborted || requestId !== latestPoiRequestRef.current) {
          return;
        }

        setPoiFeatures([]);
        setPoiError("Gagal memuat data POI.");
      } finally {
        if (mounted && requestId === latestPoiRequestRef.current) {
          setPoiLoading(false);
        }
      }
    };

    loadPoi();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [activePoiCategoryLabel, activePoiSources, analysisType]);

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
                <Label>Jenis POI</Label>
                <RadioGroup value={selectedPoiCategory} onValueChange={setSelectedPoiCategory} className="gap-2">
                  <div
                    className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer hover:bg-muted/60"
                    onClick={() => setSelectedPoiCategory("all")}
                  >
                    <RadioGroupItem value="all" />
                    <span>Semua</span>
                  </div>
                  {POI_CATEGORIES.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer hover:bg-muted/60"
                      onClick={() => setSelectedPoiCategory(item.key)}
                    >
                      <RadioGroupItem value={item.key} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </RadioGroup>
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
              <div className="space-y-2">
                <Label>Legenda Buffer (rentang)</Label>
                <div className="space-y-2">
                  {BUFFER_LEGEND_RANGES.map((range) => {
                    const isActive = activeBufferLegend.label === range.label;

                    return (
                      <div
                        key={range.label}
                        className={`flex items-center gap-3 rounded-md border px-2 py-1.5 ${
                          isActive ? "bg-muted" : "bg-background"
                        }`}
                      >
                        <span
                          className="h-5 w-10 rounded-sm border"
                          style={{ backgroundColor: range.color }}
                        />
                        <span className="text-sm">{range.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="isochrone" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Pilih jenis isochrone</Label>
                <Select value={selectedIsochroneCombo} onValueChange={handleIsochroneComboChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ISOCHRONE_COMBINATIONS.map((combination) => (
                      <SelectItem key={combination.key} value={combination.key}>
                        {combination.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pilih area isochrone</Label>
                <RadioGroup
                  value={selectedIsochroneMinutes}
                  onValueChange={setSelectedIsochroneMinutes}
                  className="gap-3"
                >
                  {availableIsochroneOptions.map((option) => (
                    <div
                      key={option.key}
                      className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/60"
                      onClick={() => setSelectedIsochroneMinutes(String(option.minutes))}
                    >
                      <RadioGroupItem value={String(option.minutes)} />
                      <div className="grid gap-0.5">
                        <span className="font-medium">{option.minutes} menit</span>
                        <span className="text-xs text-muted-foreground">
                          Tampilkan area isochrone {option.minutes} menit.
                        </span>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                {availableIsochroneOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">Tidak ada waktu tempuh untuk pilihan ini.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <p className="font-semibold">Hasil Analisis</p>
            <p className="text-muted-foreground">
              {analysisType === "buffer"
                ? `Buffer ${(bufferRadius[0] / 1000).toFixed(1)} km untuk ${activePoiCategoryLabel} (${poiFeatures.length} titik)`
                : `Isochrone ${selectedIsochroneCombination?.label ?? "-"} ${activeIsochroneDataset?.minutes ?? "-"} menit`}
            </p>
            {analysisType === "buffer" && poiLoading && (
              <p className="text-muted-foreground">Memuat data POI...</p>
            )}
            {analysisType === "buffer" && poiError && (
              <p className="text-destructive">{poiError}</p>
            )}
            {analysisType === "isochrone" && isochroneLoading && (
              <p className="text-muted-foreground">Memuat layer isochrone...</p>
            )}
            {analysisType === "isochrone" && isochroneError && (
              <p className="text-destructive">{isochroneError}</p>
            )}
            {analysisType === "isochrone" && poiLoading && (
              <p className="text-muted-foreground">Memuat data POI {activePoiCategoryLabel}...</p>
            )}
            {analysisType === "isochrone" && poiError && (
              <p className="text-muted-foreground">{poiError}</p>
            )}
            <p className="text-muted-foreground">Kampung tercakup: 3 dari 4</p>
          </div>

          {analysisType === "isochrone" && (
            <div className="space-y-2">
              <Label>Waktu Tempuh</Label>
              <div className="space-y-2">
                {ISOCHRONE_TIME_CLASSES.map((item) => (
                  <div key={`iso-legend-${item.minute}`} className="flex items-center gap-3 text-sm">
                    <span
                      className="inline-block h-6 w-12 rounded-sm border"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Legenda Simbol POI</Label>
            <div className="space-y-2">
              {POI_CATEGORIES.map((item) => {
                const style = getPoiSymbolStyle(item.key);

                return (
                  <div key={`poi-legend-${item.key}`} className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-sm leading-none shadow"
                      style={{ backgroundColor: style.color }}
                    >
                      {style.pictogram}
                    </span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={MUTING_CENTER} zoom={10} className="h-full w-full">
          <MapAutoFitExtent
            analysisType={analysisType}
            poiFeatures={poiFeatures}
            isochroneGeojson={isochroneGeojson}
            bufferRadius={bufferRadius[0]}
          />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          {analysisType === "buffer" && (
            <>
              {poiFeatures.map((poi) => (
                <Circle
                  key={`buffer-${poi.id}`}
                  center={[poi.coordinates[1], poi.coordinates[0]]}
                  radius={bufferRadius[0]}
                  pathOptions={{
                    color: activeBufferLegend.color,
                    fillColor: activeBufferLegend.color,
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />
              ))}
              {poiFeatures.map((poi) => (
                <Marker
                  key={`marker-${poi.id}`}
                  position={[poi.coordinates[1], poi.coordinates[0]]}
                  icon={poiIconsByCategory.get(poi.category) ?? createPoiIcon(DEFAULT_POI_SYMBOL_STYLE)}
                >
                  <Popup>
                    <div className="space-y-1">
                      <p className="font-semibold">{poi.categoryLabel}</p>
                      {Object.entries(poi.properties).map(([key, value]) => (
                        <p key={key} className="text-xs">
                          <span className="font-medium">{toTitleCase(key)}:</span> {String(value)}
                        </p>
                      ))}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}
          {analysisType === "isochrone" && isochroneGeojson && (
            <GeoJSON
              key={activeIsochroneDataset?.key ?? "isochrone-empty"}
              data={isochroneGeojson}
              style={{
                color: activeIsochroneTimeClass.color,
                fillColor: activeIsochroneTimeClass.color,
                fillOpacity: 0.3,
                weight: 2,
              }}
            />
          )}
          {analysisType === "isochrone" && poiFeatures.map((poi) => (
            <Marker
              key={`iso-poi-${poi.id}`}
              position={[poi.coordinates[1], poi.coordinates[0]]}
              icon={poiIconsByCategory.get(poi.category) ?? createPoiIcon(DEFAULT_POI_SYMBOL_STYLE)}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{poi.categoryLabel}</p>
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
