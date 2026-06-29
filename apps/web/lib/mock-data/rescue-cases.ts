import type { RescueCase } from "@/types";
import { mockSightings } from "./sightings";

export const mockRescueCases: RescueCase[] = [
  {
    id: "RC-001",
    sighting: mockSightings[2],
    status: "IN_PROGRESS",
    priority: "EMERGENCY",
    assignedTo: { id: "u1", displayName: "Nicha P.", email: "nicha@petradar.app", role: "VOLUNTEER", createdAt: "2026-01-01T00:00:00Z" },
    notes: "Volunteer is on the way. Tuxedo cat with injured back leg near Victory Monument food stalls.",
    createdAt: "2026-06-26T07:15:00Z",
    updatedAt: "2026-06-26T07:45:00Z",
  },
  {
    id: "RC-002",
    sighting: mockSightings[6],
    status: "OPEN",
    priority: "HIGH",
    notes: "Large black dog near Bang Sue station, thin and limping. Needs transport to vet.",
    createdAt: "2026-06-24T09:40:00Z",
    updatedAt: "2026-06-24T09:40:00Z",
  },
  {
    id: "RC-003",
    sighting: mockSightings[1],
    status: "OPEN",
    priority: "HIGH",
    notes: "Golden dog with red collar. Needs a volunteer to check if collar has hidden tag.",
    createdAt: "2026-06-26T10:25:00Z",
    updatedAt: "2026-06-26T10:25:00Z",
  },
  {
    id: "RC-004",
    sighting: mockSightings[3],
    status: "RESCUED",
    priority: "MEDIUM",
    assignedTo: { id: "u1", displayName: "Nicha P.", email: "nicha@petradar.app", role: "VOLUNTEER", createdAt: "2026-01-01T00:00:00Z" },
    notes: "Beagle mix rescued and taken to temporary foster home.",
    createdAt: "2026-06-25T17:00:00Z",
    updatedAt: "2026-06-26T08:00:00Z",
  },
  {
    id: "RC-005",
    sighting: mockSightings[7],
    status: "OPEN",
    priority: "LOW",
    notes: "Domestic rabbit in Din Daeng. Needs a foster until owner is found.",
    createdAt: "2026-06-24T13:15:00Z",
    updatedAt: "2026-06-24T13:15:00Z",
  },
];
