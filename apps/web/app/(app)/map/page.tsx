"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GitMerge,
  Hospital,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { CatIcon, DogIcon, PawIcon, AnimalIcon } from "@/components/icons/pets";
import { mockSightings } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Sighting, Species, SightingStatus, Urgency, VerificationStatus } from "@/types";
import type { CareLocationMarker, LeafletMapProps } from "@/components/map/leaflet-map";
import { cn } from "@/lib/utils";

const LeafletMap = dynamic<LeafletMapProps>(
  () => import("@/components/map/leaflet-map").then((module) => module.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[#eef3ed] text-primary">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin" />
          <p className="mt-3 text-sm font-bold">Loading map...</p>
        </div>
      </div>
    ),
  },
);

// ── Merge localStorage + mock sightings ────────────────────────────────────────

function useAllSightings(): Sighting[] {
  const [extra, setExtra] = useState<Sighting[]>([]);
  useEffect(() => {
    try {
      const stored: Array<Record<string, unknown>> = JSON.parse(
        localStorage.getItem("petradar:sightings") ?? "[]"
      );
      setExtra(
        stored.map((item) => ({
          id: (item.id as string) ?? `R-${Date.now()}`,
          species: (item.species as Species) ?? "OTHER",
          color: (item.color as string) ?? "Unknown",
          description: (item.description as string) ?? "",
          status: "STRAY" as SightingStatus,
          urgency: (item.urgency as Urgency) ?? "LOW",
          verificationStatus: "PENDING" as VerificationStatus,
          location: {
            latitude: (item.lat as number) ?? 13.7563,
            longitude: (item.lng as number) ?? 100.5018,
            district: (item.district as string) ?? "Bangkok",
            isExact: false,
          },
          photoUrls: Array.isArray(item.photos) ? (item.photos as string[]) : [],
          seenAt: (item.seenAt as string) ?? new Date().toISOString(),
          createdAt: (item.createdAt as string) ?? new Date().toISOString(),
          reporter: { id: "me", displayName: "You", role: "REPORTER" as const },
        }))
      );
    } catch {
      setExtra([]);
    }
  }, []);
  return useMemo(() => [...extra, ...mockSightings], [extra]);
}

function useAnimalCareLocations(center: { latitude: number; longitude: number } | null, radiusKm: number) {
  const [locations, setLocations] = useState<CareLocation[]>(FALLBACK_CARE_LOCATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!center) return;
    const controller = new AbortController();
    const queryCenter = center;
    const radiusMeters = Math.round(radiusKm * 1000);
    const fallbackInRange = FALLBACK_CARE_LOCATIONS.filter(
      (care) => distanceKm(queryCenter, care) <= radiusKm
    );

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const query = `
          [out:json][timeout:12];
          (
            node(around:${radiusMeters},${queryCenter.latitude},${queryCenter.longitude})["amenity"="veterinary"];
            way(around:${radiusMeters},${queryCenter.latitude},${queryCenter.longitude})["amenity"="veterinary"];
            relation(around:${radiusMeters},${queryCenter.latitude},${queryCenter.longitude})["amenity"="veterinary"];
            node(around:${radiusMeters},${queryCenter.latitude},${queryCenter.longitude})["healthcare"="veterinary"];
            way(around:${radiusMeters},${queryCenter.latitude},${queryCenter.longitude})["healthcare"="veterinary"];
            relation(around:${radiusMeters},${queryCenter.latitude},${queryCenter.longitude})["healthcare"="veterinary"];
          );
          out center tags;
        `;
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: query,
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Overpass request failed");
        const data: {
          elements?: Array<{
            id: number;
            type: "node" | "way" | "relation";
            lat?: number;
            lon?: number;
            center?: { lat: number; lon: number };
            tags?: Record<string, string>;
          }>;
        } = await response.json();

        const osmLocations = (data.elements ?? [])
          .flatMap((item): CareLocation[] => {
            const latitude = item.lat ?? item.center?.lat;
            const longitude = item.lon ?? item.center?.lon;
            if (typeof latitude !== "number" || typeof longitude !== "number") return [];
            const tags = item.tags ?? {};
            const name = tags.name || tags["name:en"] || tags["name:th"] || "Animal care location";
            const area = tags["addr:subdistrict"] || tags["addr:district"] || tags["addr:city"] || "Nearby";
            const phone = tags.phone || tags["contact:phone"];
            return [{
              id: `osm-${item.type}-${item.id}`,
              name,
              type: /hospital/i.test(name) ? "Animal hospital" : "Animal clinic",
              area,
              latitude,
              longitude,
              phone,
              sourceUrl: `https://www.openstreetmap.org/${item.type}/${item.id}`,
            }];
          })
          .filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index)
          .sort((a, b) => distanceKm(queryCenter, a) - distanceKm(queryCenter, b))
          .slice(0, 80);

        const merged = [...osmLocations];
        fallbackInRange.forEach((fallback) => {
          const alreadyCovered = merged.some(
            (item) => distanceKm(item, fallback) < 0.08 || item.name.toLowerCase() === fallback.name.toLowerCase()
          );
          if (!alreadyCovered) merged.push(fallback);
        });
        setLocations(merged.length ? merged : fallbackInRange);
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
          setLocations(fallbackInRange.length ? fallbackInRange : FALLBACK_CARE_LOCATIONS);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [center, radiusKm]);

  return { locations, loading, error };
}

// ── Filter chips ───────────────────────────────────────────────────────────────

type ChipKey = "cats" | "dogs" | "other" | "injured" | "match" | "rescue" | "reunited";
const CHIPS: { key: ChipKey; label: string; tone: string; activeTone: string }[] = [
  { key: "cats",     label: "Cats",           tone: "text-blue-600 hover:border-blue-200 hover:bg-blue-50", activeTone: "bg-blue-600 text-white" },
  { key: "dogs",     label: "Dogs",           tone: "text-amber-600 hover:border-amber-200 hover:bg-amber-50", activeTone: "bg-amber-500 text-white" },
  { key: "other",    label: "Other animals",  tone: "text-primary hover:border-teal-200 hover:bg-mint", activeTone: "bg-primary text-white" },
  { key: "injured",  label: "Injured",        tone: "text-emergency-red hover:border-red-200 hover:bg-red-50", activeTone: "bg-emergency-red text-white" },
  { key: "match",    label: "Possible match", tone: "text-match-purple hover:border-purple-200 hover:bg-purple-50", activeTone: "bg-match-purple text-white" },
  { key: "rescue",   label: "Rescue needed",  tone: "text-orange-600 hover:border-orange-200 hover:bg-orange-50", activeTone: "bg-orange-500 text-white" },
  { key: "reunited", label: "Reunited",       tone: "text-reunited-green hover:border-green-200 hover:bg-green-50", activeTone: "bg-reunited-green text-white" },
];

interface CareLocation {
  id: string;
  name: string;
  type: "Animal hospital" | "Animal clinic";
  area: string;
  latitude: number;
  longitude: number;
  phone?: string;
  sourceUrl: string;
}

const CARE_RADIUS_KM = 8;
const BANGKOK_CENTER = { latitude: 13.7563, longitude: 100.5018 };

const FALLBACK_CARE_LOCATIONS: CareLocation[] = [
  {
    id: "fallback-chula-small-animal",
    name: "Chulalongkorn Small Animal Teaching Hospital",
    type: "Animal hospital",
    area: "Pathum Wan",
    latitude: 13.7339,
    longitude: 100.5324,
    phone: "02-218-9751",
    sourceUrl: "https://www.vet.chula.ac.th/",
  },
  {
    id: "fallback-kasetsart-vth",
    name: "Kasetsart University Veterinary Teaching Hospital",
    type: "Animal hospital",
    area: "Bang Khen",
    latitude: 13.8467,
    longitude: 100.5709,
    phone: "02-797-1900",
    sourceUrl: "https://vet.ku.ac.th/",
  },
  {
    id: "fallback-happy-pet",
    name: "Happy Pet Hospital",
    type: "Animal hospital",
    area: "Ratchada",
    latitude: 13.7772,
    longitude: 100.5747,
    phone: "02-276-4131",
    sourceUrl: "https://www.happypethospital.com/",
  },
  {
    id: "fallback-vet4",
    name: "Vet 4 Animal Hospital",
    type: "Animal clinic",
    area: "Sukhumvit",
    latitude: 13.7373,
    longitude: 100.5666,
    phone: "02-662-2777",
    sourceUrl: "https://www.vet4hospital.com/",
  },
];

function ChipIcon({ chipKey }: { chipKey: ChipKey }) {
  if (chipKey === "cats")     return <CatIcon className="h-3.5 w-3.5 shrink-0" />;
  if (chipKey === "dogs")     return <DogIcon className="h-3.5 w-3.5 shrink-0" />;
  if (chipKey === "other")    return <PawIcon className="h-3.5 w-3.5 shrink-0" />;
  if (chipKey === "injured")  return <AlertTriangle className="h-3.5 w-3.5 shrink-0" />;
  if (chipKey === "match")    return <GitMerge className="h-3.5 w-3.5 shrink-0" />;
  if (chipKey === "rescue")   return <AlertOctagon className="h-3.5 w-3.5 shrink-0" />;
  return <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />;
}

function timeAgo(date: string) {
  const h = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 36e5));
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}
function formatAnimal(s: Sighting) {
  return `${s.color} ${s.species.charAt(0) + s.species.slice(1).toLowerCase()}`;
}

function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const earthRadiusKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCareFor(location: { latitude: number; longitude: number } | null, careLocations: CareLocation[]) {
  if (!location) return null;
  return careLocations
    .map((care) => ({
      ...care,
      distanceKm: distanceKm(location, care),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
}

type NearestCare = NonNullable<ReturnType<typeof nearestCareFor>>;

function CareCard({ care, compact = false, onSelect }: { care: NearestCare; compact?: boolean; onSelect?: () => void }) {
  const mapsUrl = `https://www.google.com/maps?q=${care.latitude},${care.longitude}`;

  return (
    <div className={cn("rounded-2xl border border-border bg-white shadow-card", compact ? "p-3" : "p-4")}>
      <button type="button" onClick={onSelect} className="flex w-full items-start gap-3 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint text-primary">
          <Hospital className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-primary">Nearest animal care</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-text-strong">{care.name}</h3>
          <p className="mt-1 text-xs font-semibold text-text-muted">
            {care.type} · {care.area} · {care.distanceKm.toFixed(1)} km away
          </p>
        </div>
      </button>
      <div className="mt-3 flex gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-white transition hover:bg-primary-dark"
        >
          <Navigation className="h-3.5 w-3.5" />
          Directions
        </a>
        {care.phone ? (
          <a href={`tel:${care.phone}`} className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 text-xs font-bold text-primary transition hover:bg-mint">
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
        ) : null}
      </div>
    </div>
  );
}

function CareDetailSheet({ care, onClose }: { care: CareLocation & { distanceKm?: number }; onClose: () => void }) {
  const mapsUrl = `https://www.google.com/maps?q=${care.latitude},${care.longitude}`;
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white shadow-elevated">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-bold text-primary">Animal care location</p>
          <h2 className="mt-0.5 text-base font-bold text-text-strong">{care.name}</h2>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-strong">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex h-32 items-center justify-center rounded-2xl bg-mint text-primary">
          <Hospital className="h-16 w-16 opacity-80" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="mb-1 text-xs font-bold text-text-muted">Type</p>
            <p className="text-sm font-bold text-text-strong">{care.type}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="mb-1 text-xs font-bold text-text-muted">Area</p>
            <p className="text-sm font-bold text-text-strong">{care.area}</p>
          </div>
          {care.distanceKm !== undefined && (
            <div className="rounded-2xl border border-border bg-background p-3">
              <p className="mb-1 text-xs font-bold text-text-muted">Distance</p>
              <p className="text-sm font-bold text-text-strong">{care.distanceKm.toFixed(1)} km away</p>
            </div>
          )}
          {care.phone && (
            <div className="rounded-2xl border border-border bg-background p-3">
              <p className="mb-1 text-xs font-bold text-text-muted">Phone</p>
              <p className="text-sm font-bold text-text-strong">{care.phone}</p>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            <Navigation className="h-4 w-4" />
            Open in Google Maps
          </a>
          {care.phone && (
            <a
              href={`tel:${care.phone}`}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm font-bold text-primary transition hover:bg-mint"
            >
              <Phone className="h-4 w-4" />
              {care.phone}
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-background p-3 text-xs leading-5 text-text-muted">
          Location data from OpenStreetMap contributors. Hours and contact details may vary — verify before visiting.
        </div>
      </div>
    </div>
  );
}

function HealthLayerCard({
  count,
  radiusKm,
  loading,
  error,
  nearestCare,
}: {
  count: number;
  radiusKm: number;
  loading: boolean;
  error: boolean;
  nearestCare: NearestCare | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint text-primary">
          <Hospital className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-primary">Animal care layer</p>
          <h3 className="mt-1 text-sm font-bold text-text-strong">
            {loading ? "Loading nearby hospitals..." : `${count} veterinary places within ${radiusKm} km`}
          </h3>
          <p className="mt-1 text-xs leading-5 text-text-muted">
            {error ? "Showing saved PetRadar locations because live map data is unavailable." : "Live pins from OpenStreetMap veterinary data."}
          </p>
        </div>
      </div>
      {nearestCare ? (
        <div className="mt-3 rounded-xl border border-border bg-background/60 px-3 py-2">
          <p className="text-xs font-bold text-text-muted">Closest to selected area</p>
          <p className="mt-0.5 truncate text-sm font-bold text-text-strong">{nearestCare.name}</p>
          <p className="text-xs font-semibold text-primary">{nearestCare.distanceKm.toFixed(1)} km away</p>
        </div>
      ) : null}
    </div>
  );
}

// ── CaseCard ───────────────────────────────────────────────────────────────────

function CaseCard({ s, active, onClick }: { s: Sighting; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border text-left transition-all hover:shadow-soft",
        active ? "border-primary/40 bg-mint/40 shadow-soft" : "border-border bg-white hover:border-primary/20"
      )}
    >
      <div className="flex gap-3 p-3">
        {s.photoUrls[0] ? (
          <img src={s.photoUrls[0]} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-mint text-primary">
            <AnimalIcon species={s.species} className="h-8 w-8" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-strong">{formatAnimal(s)}</p>
          <div className="my-1"><StatusBadge value={s.status} /></div>
          <p className="truncate text-xs text-text-muted">
            {s.location.district ?? "Bangkok"} · {timeAgo(s.seenAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

// ── DetailSheet ────────────────────────────────────────────────────────────────

function DetailSheet({ sighting, nearestCare, onClose }: { sighting: Sighting; nearestCare: NearestCare | null; onClose: () => void }) {
  const mapsUrl = `https://www.google.com/maps?q=${sighting.location.latitude},${sighting.location.longitude}`;
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white shadow-elevated">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-bold text-text-muted">{sighting.id}</p>
          <h2 className="mt-0.5 text-base font-bold text-text-strong">{formatAnimal(sighting)}</h2>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-strong">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sighting.photoUrls[0] ? (
          <img src={sighting.photoUrls[0]} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <div className="grid aspect-video w-full place-items-center bg-mint text-primary">
            <AnimalIcon species={sighting.species} className="h-16 w-16" />
          </div>
        )}
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge value={sighting.status} />
            <StatusBadge value={sighting.urgency} />
            <StatusBadge value={sighting.verificationStatus} />
          </div>
          {sighting.description && (
            <p className="text-sm leading-6 text-text-muted">{sighting.description}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-border bg-background p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-text-muted"><Clock className="h-3.5 w-3.5" /> Last seen</p>
              <p className="text-sm font-semibold text-text-strong">
                {new Date(sighting.seenAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-text-muted"><MapPin className="h-3.5 w-3.5" /> Area</p>
              <p className="text-sm font-semibold text-text-strong">{sighting.location.district ?? "Bangkok"}</p>
              <p className="text-xs text-text-muted">Approx. only</p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex gap-2 text-xs leading-5 text-amber-800">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              Exact location is protected. Coordinate through a verified volunteer before approaching.
            </div>
          </div>
          {nearestCare ? <CareCard care={nearestCare} compact /> : null}
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/sightings/${sighting.id}`} className="flex h-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white transition-colors hover:bg-primary-dark">
              View case
            </Link>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white text-sm font-semibold text-text-strong transition-colors hover:bg-background">
              <Navigation className="h-3.5 w-3.5" /> Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MapPage() {
  const allSightings = useAllSightings();
  const [selected, setSelected]         = useState<Sighting | null>(null);
  const [selectedCare, setSelectedCare] = useState<CareLocation | null>(null);
  const [search, setSearch]             = useState("");
  const [activeChips, setActiveChips]   = useState<Set<ChipKey>>(new Set());
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating]         = useState(false);
  const [showList, setShowList]         = useState(false);

  function selectCare(care: CareLocation | null) {
    setSelectedCare(care);
    if (care) { setSelected(null); setShowList(false); }
  }

  function selectSighting(s: Sighting) {
    setSelected(s);
    setSelectedCare(null);
    setShowList(false);
  }

  function toggleChip(key: ChipKey) {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const filtered = useMemo(() => allSightings.filter((s) => {
    const speciesFilters: Species[] = [];
    if (activeChips.has("cats")) speciesFilters.push("CAT");
    if (activeChips.has("dogs")) speciesFilters.push("DOG");
    if (activeChips.has("other")) speciesFilters.push("OTHER");

    const statusFilters: SightingStatus[] = [];
    if (activeChips.has("injured")) statusFilters.push("INJURED");
    if (activeChips.has("match")) statusFilters.push("POSSIBLE_LOST");
    if (activeChips.has("rescue")) statusFilters.push("RESCUE_NEEDED");
    if (activeChips.has("reunited")) statusFilters.push("RESOLVED");

    if (speciesFilters.length && !speciesFilters.includes(s.species)) return false;
    if (statusFilters.length && !statusFilters.includes(s.status)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![s.color, s.description, s.location.district ?? "", s.species].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [allSightings, activeChips, search]);

  const summaryCounts = useMemo(() => ({
    cats: filtered.filter((s) => s.species === "CAT").length,
    dogs: filtered.filter((s) => s.species === "DOG").length,
    other: filtered.filter((s) => s.species === "OTHER").length,
    injured: filtered.filter((s) => s.status === "INJURED").length,
    match: filtered.filter((s) => s.status === "POSSIBLE_LOST").length,
    rescue: filtered.filter((s) => s.status === "RESCUE_NEEDED").length,
    reunited: filtered.filter((s) => s.status === "RESOLVED").length,
  }), [filtered]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSelected(null); setSelectedCare(null); setShowList(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleNearMe() {
    if (!navigator.geolocation) {
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Location not supported.", tone: "error" } }));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocating(false); setUserLocation([pos.coords.latitude, pos.coords.longitude]); window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Centered to your location." } })); },
      ()    => { setLocating(false); window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Location access denied.", tone: "error" } })); }
    );
  }

  const hasFilters = activeChips.size > 0 || !!search;
  const panelOpen = showList || !!selected || !!selectedCare;
  const careCenter = useMemo(() => {
    if (selected) return selected.location;
    if (userLocation) return { latitude: userLocation[0], longitude: userLocation[1] };
    return filtered[0]?.location ?? BANGKOK_CENTER;
  }, [filtered, selected, userLocation]);
  const { locations: careLocations, loading: careLoading, error: careError } = useAnimalCareLocations(careCenter, CARE_RADIUS_KM);
  const nearestCare = nearestCareFor(selected?.location ?? careCenter, careLocations);

  return (
    <div className="relative h-full overflow-hidden">

      {/* Full-screen map */}
      <LeafletMap
        sightings={filtered}
        selected={selected}
        onSelect={selectSighting}
        selectedCare={selectedCare as CareLocationMarker | null}
        onCareSelect={(c) => selectCare(c as CareLocation | null)}
        userLocation={userLocation}
        careLocations={careLocations as CareLocationMarker[]}
        careCenter={careCenter}
        careRadiusKm={CARE_RADIUS_KM}
      />

      {/* Floating search + Near Me */}
      <div
        className={cn(
          "pointer-events-none absolute left-4 right-4 top-8 z-[300] flex gap-3 transition-[left,right,top] sm:left-8 sm:right-8 lg:right-14 lg:top-5",
          showList ? "lg:left-[380px]" : "lg:left-14",
          selected && "lg:right-[420px]"
        )}
      >
        <div className="pointer-events-auto relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pet, breed, color, area, or landmark..."
            className="h-14 w-full rounded-[1.35rem] border border-border bg-white pl-12 pr-10 text-sm font-semibold text-text-strong shadow-card outline-none placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/15 sm:pr-24"
          />
          <button
            type="button"
            aria-label="Open filters"
            onClick={() => window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Use the filter chips below to refine the map." } }))}
            className="absolute right-11 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-text-muted transition hover:bg-background hover:text-primary sm:flex"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-strong">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleNearMe}
          disabled={locating}
          className="pointer-events-auto flex h-14 shrink-0 items-center gap-2 rounded-[1.35rem] border border-border bg-white px-4 text-sm font-bold text-text-strong shadow-card hover:border-primary/30 hover:text-primary disabled:opacity-60 sm:px-5"
        >
          <LocateFixed className={cn("h-4 w-4", locating && "animate-spin")} />
          <span className="hidden sm:block">{locating ? "Locating…" : "Near me"}</span>
        </button>
      </div>

      {/* Floating filter chips */}
      <div
        className={cn(
          "pointer-events-none absolute left-4 right-4 top-[104px] z-[300] transition-[left,right,top] sm:left-8 sm:right-8 lg:right-14 lg:top-[88px]",
          showList ? "lg:left-[380px]" : "lg:left-14",
          selected && "lg:right-[420px]"
        )}
      >
        <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CHIPS.map(({ key, label, tone, activeTone }) => (
            <button
              key={key}
              onClick={() => toggleChip(key)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-bold shadow-card transition-all focus:outline-none focus:ring-4 focus:ring-primary/15",
                activeChips.has(key)
                  ? activeTone
                  : tone
              )}
            >
              <ChipIcon chipKey={key} />
              <span>{label}</span>
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={() => { setActiveChips(new Set()); setSearch(""); }}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-semibold text-emergency-red shadow-card"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Desktop active case summary */}
      {!showList && !selected ? (
      <div className="absolute bottom-8 left-8 z-[300] hidden w-72 rounded-[1.5rem] border border-border bg-white p-5 shadow-elevated lg:block">
        <div>
          <h2 className="text-base font-bold text-text-strong">Active cases</h2>
          <p className="mt-1 text-sm font-semibold text-text-muted">{filtered.length} cases found</p>
        </div>
        <div className="mt-4 space-y-3">
          {CHIPS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleChip(key)}
              className="flex w-full items-center gap-3 rounded-xl text-left text-sm font-bold text-text-strong transition hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                activeChips.has(key) ? "bg-primary text-white" : "bg-background text-primary"
              )}>
                <ChipIcon chipKey={key} />
              </span>
              <span className="flex-1">{label}</span>
              <span className="text-text-muted">{summaryCounts[key]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { setShowList(true); setSelected(null); }}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-bold text-primary shadow-inner-sm transition hover:bg-mint"
        >
          View all cases
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      ) : null}

      {nearestCare && !panelOpen ? (
        <div className="absolute right-8 top-[148px] z-[290] hidden w-80 lg:block">
          <HealthLayerCard
            count={careLocations.length}
            radiusKm={CARE_RADIUS_KM}
            loading={careLoading}
            error={careError}
            nearestCare={nearestCare}
          />
        </div>
      ) : null}

      {/* Report CTA — bottom right */}
      {!panelOpen ? (
      <Link
        href="/report"
        className="absolute bottom-28 right-4 z-[300] flex items-center gap-3 overflow-hidden rounded-[1.5rem] bg-primary px-5 py-4 text-white shadow-elevated transition hover:bg-primary-dark sm:bottom-8 sm:right-24 sm:min-w-72 lg:right-28"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/14">
          <Plus className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-bold leading-tight">Report Animal</span>
          <span className="hidden text-sm font-semibold text-white/78 sm:block">Help a pet today</span>
        </span>
        <span className="ml-auto hidden items-end gap-1 text-white/92 sm:flex">
          <DogIcon className="h-8 w-8" />
          <CatIcon className="h-7 w-7" />
        </span>
      </Link>
      ) : null}

      {/* Mobile cases list toggle */}
      {!panelOpen ? (
      <button
        onClick={() => { setShowList((v) => !v); if (showList) setSelected(null); }}
        className="absolute bottom-28 left-4 z-[300] flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-strong shadow-card hover:border-primary/30 hover:text-primary sm:bottom-8 sm:left-8 lg:hidden"
      >
        {showList ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        <span>{showList ? "Hide list" : `${filtered.length} cases`}</span>
      </button>
      ) : null}

      {/* Count badge center bottom */}
      {!panelOpen ? (
      <div className="pointer-events-none absolute bottom-28 left-1/2 z-[290] hidden -translate-x-1/2 sm:bottom-8 sm:block">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-text-strong shadow-card">
          <Users className="h-4 w-4 text-text-muted" /> {filtered.length} cases shown
        </div>
      </div>
      ) : null}

      {/* Desktop: slide-in list panel (left) */}
      <div className={cn(
        "absolute bottom-0 left-0 top-0 z-[450] hidden w-[340px] flex-col bg-white transition-transform duration-300 lg:flex",
        showList ? "translate-x-0 shadow-elevated" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-bold text-text-strong">{filtered.length} cases</p>
            <p className="text-xs text-text-muted">Click to highlight on map</p>
          </div>
          <button onClick={() => setShowList(false)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-strong">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {filtered.length ? (
            filtered.map((s) => (
              <CaseCard key={s.id} s={s} active={selected?.id === s.id} onClick={() => setSelected((prev) => (prev?.id === s.id ? null : s))} />
            ))
          ) : (
            <div className="py-16 text-center text-sm text-text-muted">
              <MapPin className="mx-auto mb-3 h-8 w-8 opacity-30" />
              No cases match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Desktop: slide-in detail drawer (right) — sighting OR care */}
      <div className={cn(
        "absolute bottom-0 right-0 top-0 z-[445] hidden w-[380px] transition-transform duration-300 lg:block",
        (selected || selectedCare) ? "translate-x-0" : "translate-x-full"
      )}>
        {selected && <DetailSheet sighting={selected} nearestCare={nearestCare} onClose={() => setSelected(null)} />}
        {!selected && selectedCare && (
          <CareDetailSheet
            care={{ ...selectedCare, distanceKm: distanceKm(careCenter, selectedCare) }}
            onClose={() => setSelectedCare(null)}
          />
        )}
      </div>

      {/* Mobile: selected case bottom sheet */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-[460] flex flex-col rounded-t-3xl bg-white pb-20 shadow-elevated lg:hidden">
          <div className="flex justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>
          <div className="flex gap-3 px-4 pb-4 pt-2">
            {selected.photoUrls[0] ? (
              <img src={selected.photoUrls[0]} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-mint text-primary"><AnimalIcon species={selected.species} className="h-10 w-10" /></div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1"><StatusBadge value={selected.status} /></div>
              <p className="truncate font-bold text-text-strong">{formatAnimal(selected)}</p>
              <p className="text-xs text-text-muted">{selected.location.district ?? "Bangkok"} · {timeAgo(selected.seenAt)}</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/sightings/${selected.id}`} className="flex h-9 flex-1 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white">
                  View Case
                </Link>
                <button onClick={() => setSelected(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {nearestCare ? (
                <a
                  href={`https://www.google.com/maps?q=${nearestCare.latitude},${nearestCare.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1.5 rounded-xl bg-mint px-3 py-2 text-xs font-bold text-primary"
                >
                  <Hospital className="h-3.5 w-3.5" />
                  Nearest care: {nearestCare.name} · {nearestCare.distanceKm.toFixed(1)} km
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Mobile: care location bottom sheet */}
      {selectedCare && !selected && (
        <div className="absolute inset-x-0 bottom-0 z-[460] flex flex-col rounded-t-3xl bg-white pb-20 shadow-elevated lg:hidden">
          <div className="flex justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint text-primary">
              <Hospital className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-bold text-text-strong text-sm">{selectedCare.name}</p>
              <p className="text-xs text-text-muted">{selectedCare.type} · {selectedCare.area}</p>
            </div>
            <button onClick={() => setSelectedCare(null)}><X className="h-4 w-4 text-text-muted" /></button>
          </div>
          <div className="p-4 space-y-3">
            {selectedCare.phone && (
              <div className="flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-bold text-text-strong">{selectedCare.phone}</span>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={`https://www.google.com/maps?q=${selectedCare.latitude},${selectedCare.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-white"
              >
                <Navigation className="h-4 w-4" /> Open in Google Maps
              </a>
              {selectedCare.phone && (
                <a
                  href={`tel:${selectedCare.phone}`}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm font-bold text-primary"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile: cases list bottom sheet */}
      {showList && !selected && (
        <div className="absolute inset-x-0 bottom-0 z-[460] flex max-h-[65vh] flex-col rounded-t-3xl bg-white pb-20 shadow-elevated lg:hidden">
          <div className="flex justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-text-strong">{filtered.length} cases nearby</p>
            <button onClick={() => setShowList(false)}><X className="h-4 w-4 text-text-muted" /></button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {filtered.map((s) => (
              <CaseCard key={s.id} s={s} active={false} onClick={() => { setSelected(s); setShowList(false); }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
