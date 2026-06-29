"use client";
import { useEffect, useRef, useState } from "react";
import L, { type Circle, type Map as LMap, type Marker } from "leaflet";
import type { Sighting } from "@/types";

export interface CareLocationMarker {
  id: string;
  name: string;
  type: string;
  area: string;
  latitude: number;
  longitude: number;
  phone?: string;
  sourceUrl: string;
}

// ── Pin colors ────────────────────────────────────────────────────────────────

function pinColor(s: Sighting): string {
  if (s.urgency === "EMERGENCY") return "#EF4444";
  switch (s.status) {
    case "RESCUE_NEEDED": return "#F97316";
    case "INJURED":       return "#EF4444";
    case "POSSIBLE_LOST": return "#8B5CF6";
    case "RESOLVED":      return "#22C55E";
    default:
      if (s.species === "CAT") return "#3B82F6";
      if (s.species === "DOG") return "#F59E0B";
      return "#0F766E";
  }
}

// ── SVG pin bodies ────────────────────────────────────────────────────────────

function catSvg(c: string, sw: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <path d="M17 2C9.3 2 3 8.3 3 16C3 27 17 42 17 42S31 27 31 16C31 8.3 24.7 2 17 2Z" fill="${c}" stroke="white" stroke-width="${sw}"/>
    <path d="M11 11L9 6L14 11" fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>
    <path d="M23 11L25 6L20 11" fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>
    <circle cx="17" cy="18" r="7.5" fill="white" fill-opacity="0.96"/>
    <ellipse cx="14.5" cy="17" rx="1.4" ry="1.8" fill="${c}"/>
    <ellipse cx="19.5" cy="17" rx="1.4" ry="1.8" fill="${c}"/>
    <path d="M16.5 19.5L17 20.5L17.5 19.5" fill="${c}" stroke="${c}" stroke-width="0.4"/>
    <line x1="13" y1="19" x2="10" y2="18.5" stroke="${c}" stroke-width="0.8"/>
    <line x1="21" y1="19" x2="24" y2="18.5" stroke="${c}" stroke-width="0.8"/>
  </svg>`;
}

function dogSvg(c: string, sw: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <path d="M17 2C9.3 2 3 8.3 3 16C3 27 17 42 17 42S31 27 31 16C31 8.3 24.7 2 17 2Z" fill="${c}" stroke="white" stroke-width="${sw}"/>
    <ellipse cx="10" cy="12" rx="4" ry="5.5" fill="white" fill-opacity="0.9" transform="rotate(-20 10 12)"/>
    <ellipse cx="24" cy="12" rx="4" ry="5.5" fill="white" fill-opacity="0.9" transform="rotate(20 24 12)"/>
    <circle cx="17" cy="18" r="7.5" fill="white" fill-opacity="0.96"/>
    <circle cx="14.5" cy="16.5" r="1.5" fill="${c}"/>
    <circle cx="19.5" cy="16.5" r="1.5" fill="${c}"/>
    <rect x="14" y="19" width="6" height="3" rx="1.5" fill="${c}"/>
  </svg>`;
}

function pawSvg(c: string, sw: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <path d="M17 2C9.3 2 3 8.3 3 16C3 27 17 42 17 42S31 27 31 16C31 8.3 24.7 2 17 2Z" fill="${c}" stroke="white" stroke-width="${sw}"/>
    <ellipse cx="17" cy="20" rx="5.5" ry="4" fill="white" fill-opacity="0.96"/>
    <circle cx="11.5" cy="13.5" r="2.5" fill="white" fill-opacity="0.96"/>
    <circle cx="17"   cy="11.5" r="2.5" fill="white" fill-opacity="0.96"/>
    <circle cx="22.5" cy="13.5" r="2.5" fill="white" fill-opacity="0.96"/>
    <circle cx="10"   cy="18"   r="2"   fill="white" fill-opacity="0.96"/>
    <circle cx="24"   cy="18"   r="2"   fill="white" fill-opacity="0.96"/>
  </svg>`;
}

function statusSvg(c: string, sw: number, kind: "injured" | "match" | "rescue" | "reunited") {
  const icon =
    kind === "injured"
      ? `<path d="M17 25s-7-4.5-7-9.3c0-2.5 1.8-4.3 4-4.3 1.3 0 2.3.6 3 1.6 0 0 1-1.6 3-1.6 2.2 0 4 1.8 4 4.3C24 20.5 17 25 17 25Z" fill="white"/><path d="M17 14.5v5M14.5 17h5" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`
      : kind === "match"
        ? `<path d="M17 10.5l2.1 4.3 4.8.7-3.5 3.4.8 4.8-4.2-2.3-4.2 2.3.8-4.8-3.5-3.4 4.8-.7L17 10.5Z" fill="white"/>`
        : kind === "rescue"
          ? `<circle cx="17" cy="17" r="8" fill="none" stroke="white" stroke-width="3"/><circle cx="17" cy="17" r="3" fill="white"/><path d="M17 9v4M17 21v4M9 17h4M21 17h4" stroke="white" stroke-width="2" stroke-linecap="round"/>`
          : `<path d="M11 17.5l4 4 8-9" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <path d="M17 2C9.3 2 3 8.3 3 16C3 27 17 42 17 42S31 27 31 16C31 8.3 24.7 2 17 2Z" fill="${c}" stroke="white" stroke-width="${sw}"/>
    ${icon}
  </svg>`;
}

function careSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 2C8.8 2 3 7.8 3 15C3 25.5 16 38 16 38S29 25.5 29 15C29 7.8 23.2 2 16 2Z" fill="#0F766E" stroke="white" stroke-width="2.4"/>
    <circle cx="16" cy="15" r="8.5" fill="white" fill-opacity="0.97"/>
    <path d="M16 9.7v10.6M10.7 15h10.6" stroke="#0F766E" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="12" cy="23.5" r="1.3" fill="white"/>
    <circle cx="16" cy="25.3" r="1.3" fill="white"/>
    <circle cx="20" cy="23.5" r="1.3" fill="white"/>
  </svg>`;
}

// ── Pin HTML builder ──────────────────────────────────────────────────────────

function makeHtml(s: Sighting, isSelected: boolean): string {
  const color = pinColor(s);
  const sw = isSelected ? 3 : 2;
  const scaleStyle = isSelected
    ? "transform:scale(1.25);transform-origin:center bottom;display:inline-block;"
    : "display:inline-block;";
  const shadow = isSelected
    ? "filter:drop-shadow(0 4px 12px rgba(0,0,0,0.45));"
    : "filter:drop-shadow(0 1px 5px rgba(0,0,0,0.22));";

  const svgHtml =
    s.status === "INJURED" ? statusSvg(color, sw, "injured")
    : s.status === "POSSIBLE_LOST" ? statusSvg(color, sw, "match")
    : s.status === "RESCUE_NEEDED" ? statusSvg(color, sw, "rescue")
    : s.status === "RESOLVED" ? statusSvg(color, sw, "reunited")
    : s.species === "CAT" ? catSvg(color, sw)
    : s.species === "DOG" ? dogSvg(color, sw)
    : pawSvg(color, sw);

  const inner = `<div style="${scaleStyle}${shadow}">${svgHtml}</div>`;

  if (s.urgency === "EMERGENCY" || s.status === "RESCUE_NEEDED") {
    return `<div style="position:relative;width:34px;height:44px;">
      <div style="position:absolute;width:44px;height:44px;top:-5px;left:-5px;border-radius:50%;background:${color};opacity:0.3;animation:petradar-ring 1.5s ease-out infinite;pointer-events:none;"></div>
      ${inner}
    </div>`;
  }
  return inner;
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface LeafletMapProps {
  sightings: Sighting[];
  selected: Sighting | null;
  onSelect: (s: Sighting) => void;
  selectedCare?: CareLocationMarker | null;
  onCareSelect?: (c: CareLocationMarker | null) => void;
  userLocation?: [number, number] | null;
  careLocations?: CareLocationMarker[];
  careCenter?: { latitude: number; longitude: number } | null;
  careRadiusKm?: number;
}

export function LeafletMap({
  sightings,
  selected,
  onSelect,
  selectedCare,
  onCareSelect,
  userLocation,
  careLocations = [],
  careCenter,
  careRadiusKm = 8,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LMap | null>(null);
  const markersRef   = useRef<Marker[]>([]);
  const careMarkersRef = useRef<Marker[]>([]);
  const careCircleRef = useRef<Circle | null>(null);
  const userDotRef   = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // The parent loads this component with ssr:false, so Leaflet stays entirely
  // inside one browser-only chunk instead of creating nested runtime chunks.
  useEffect(() => {
    let mounted = true;
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false }).setView([13.7563, 100.5018], 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors © CARTO",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;
    if (mounted) setMapReady(true);

    return () => {
      mounted = false;
      markersRef.current = [];
      careMarkersRef.current = [];
      careCircleRef.current = null;
      userDotRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers whenever sightings/selected change, but only after map is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = sightings.map((s) => {
      const isSelected = selected?.id === s.id;
      const icon = L.divIcon({
        html: makeHtml(s, isSelected),
        className: "",
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        tooltipAnchor: [0, -48],
      });
      const marker = L.marker([s.location.latitude, s.location.longitude], { icon })
        .addTo(mapRef.current!)
        .on("click", () => onSelect(s));
      marker.bindTooltip(
        `${s.color} ${s.species.charAt(0) + s.species.slice(1).toLowerCase()} · ${s.status.replace(/_/g, " ")}`,
        { direction: "top", offset: [0, -40], className: "leaflet-petradar-tip" }
      );
      return marker;
    });
    if (markersRef.current.length && !selected) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.15), { maxZoom: 14 });
    }
  }, [sightings, selected, onSelect, mapReady]);

  // Render animal-care locations as a separate health layer.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    careMarkersRef.current.forEach((m) => m.remove());
    careMarkersRef.current = [];
    careCircleRef.current?.remove();
    careCircleRef.current = null;

    if (careCenter) {
      careCircleRef.current = L.circle([careCenter.latitude, careCenter.longitude], {
        radius: careRadiusKm * 1000,
        color: "#0F766E",
        weight: 1.5,
        opacity: 0.45,
        fillColor: "#0F766E",
        fillOpacity: 0.055,
        interactive: false,
      }).addTo(mapRef.current);
    }

    careMarkersRef.current = careLocations.map((care) => {
      const isSelected = selectedCare?.id === care.id;
      const markerIcon = L.divIcon({
        html: `<div style="filter:drop-shadow(0 ${isSelected ? "4px 14px" : "2px 8px"} rgba(15,118,110,${isSelected ? ".55" : ".32"}));${isSelected ? "transform:scale(1.25);transform-origin:center bottom;display:inline-block;" : ""}">${careSvg()}</div>`,
        className: "",
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        tooltipAnchor: [0, -40],
      });
      const marker = L.marker([care.latitude, care.longitude], { icon: markerIcon })
        .addTo(mapRef.current!);
      marker.bindTooltip(`${care.name} · ${care.area}`, {
        direction: "top",
        offset: [0, -36],
        className: "leaflet-petradar-tip",
      });
      marker.on("click", () => { onCareSelect?.(care); });
      return marker;
    });
  }, [careCenter, careLocations, careRadiusKm, mapReady, selectedCare, onCareSelect]);

  // Pan to selected sighting
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    mapRef.current.panTo([selected.location.latitude, selected.location.longitude], { animate: true });
  }, [selected]);

  // Pan to selected care location
  useEffect(() => {
    if (!mapRef.current || !selectedCare) return;
    mapRef.current.panTo([selectedCare.latitude, selectedCare.longitude], { animate: true });
  }, [selectedCare]);

  // Pan to user location and drop blue dot
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const loc: [number, number] = userLocation;
    userDotRef.current?.remove();
    const icon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.28);"></div>`,
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    userDotRef.current = L.marker(loc, { icon }).addTo(mapRef.current);
    mapRef.current.setView(loc, 14, { animate: true });
  }, [userLocation]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
