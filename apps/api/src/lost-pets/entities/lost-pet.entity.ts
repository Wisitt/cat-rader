import { LostPetStatus, Species } from "@prisma/client";

export type LostPetResponse = {
  id: string;
  petName: string;
  species: Species;
  color: string;
  pattern: string | null;
  description: string;
  hasCollar: boolean;
  status: LostPetStatus;
  photoUrls: string[];
  location: {
    latitude: number;
    longitude: number;
    isExact: boolean;
  };
  exactLocation?: {
    latitude: number;
    longitude: number;
  };
  lastSeenAt: Date;
  createdAt: Date;
};
