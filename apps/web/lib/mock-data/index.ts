export { mockSightings } from "./sightings";
export { mockPets } from "./pets";
export { mockVaccinations } from "./vaccinations";
export { mockLostPets } from "./lost-pets";
export { mockMatches } from "./matches";
export { mockRescueCases } from "./rescue-cases";
export { mockNotifications } from "./notifications";
export { mockAnalytics } from "./analytics";

export const mockUser = {
  id: "u1",
  email: "nicha@petradar.app",
  displayName: "Nicha P.",
  avatarUrl: undefined,
  role: "VOLUNTEER" as const,
  bio: "Animal rescue volunteer based in Bangkok. 3+ years with PetRadar.",
  phone: "082-999-0001",
  createdAt: "2023-01-15T00:00:00Z",
};
