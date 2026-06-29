"use client";
import { create } from "zustand";
import type { Sighting, Species, SightingStatus, Urgency } from "@/types";

interface MapFilters {
  species: Species | "";
  status: SightingStatus | "";
  urgency: Urgency | "";
}

interface MapStore {
  selectedSighting: Sighting | null;
  filters: MapFilters;
  isDrawerOpen: boolean;
  selectSighting: (sighting: Sighting | null) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<MapFilters>) => void;
  resetFilters: () => void;
  toggleDrawer: () => void;
}

const defaultFilters: MapFilters = { species: "", status: "", urgency: "" };

export const useMapStore = create<MapStore>((set) => ({
  selectedSighting: null,
  filters: defaultFilters,
  isDrawerOpen: false,
  selectSighting: (sighting) => set({ selectedSighting: sighting, isDrawerOpen: !!sighting }),
  clearSelection: () => set({ selectedSighting: null, isDrawerOpen: false }),
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
}));
