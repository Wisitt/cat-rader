import type { Match } from "@/types";
import { mockLostPets } from "./lost-pets";
import { mockSightings } from "./sightings";

export const mockMatches: Match[] = [
  {
    id: "MATCH-001",
    lostPet: mockLostPets[0],
    sighting: mockSightings[0],
    score: 91,
    distanceKm: 0.3,
    status: "PENDING",
    createdAt: "2026-06-26T09:00:00Z",
  },
  {
    id: "MATCH-002",
    lostPet: mockLostPets[1],
    sighting: mockSightings[1],
    score: 78,
    distanceKm: 0.8,
    status: "PENDING",
    createdAt: "2026-06-26T10:30:00Z",
  },
  {
    id: "MATCH-003",
    lostPet: mockLostPets[0],
    sighting: mockSightings[4],
    score: 62,
    distanceKm: 1.2,
    status: "REJECTED",
    createdAt: "2026-06-25T15:00:00Z",
  },
];
