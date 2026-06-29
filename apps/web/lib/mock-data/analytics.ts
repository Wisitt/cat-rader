import type { Analytics } from "@/types";

export const mockAnalytics: Analytics = {
  totalSightings: 248,
  totalLostPets: 37,
  totalMatches: 19,
  matchSuccessRate: 68,
  dailySightings: Array.from({ length: 30 }, (_, i) => {
    const d = new Date("2026-05-27");
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      count: Math.floor(4 + Math.random() * 12),
    };
  }),
  speciesBreakdown: [
    { species: "CAT", count: 136, pct: 55 },
    { species: "DOG", count: 94, pct: 38 },
    { species: "OTHER", count: 18, pct: 7 },
  ],
  statusBreakdown: [
    { status: "STRAY", count: 82 },
    { status: "POSSIBLE_LOST", count: 74 },
    { status: "INJURED", count: 41 },
    { status: "RESCUE_NEEDED", count: 23 },
    { status: "RESOLVED", count: 28 },
  ],
};
