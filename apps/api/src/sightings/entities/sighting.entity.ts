import { Species, SightingStatus, Urgency, VerificationStatus } from "@prisma/client";

export type SightingResponse = {
  id: string;
  species: Species;
  color: string;
  pattern: string | null;
  description: string;
  status: SightingStatus;
  urgency: Urgency;
  verificationStatus: VerificationStatus;
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
  seenAt: Date;
  createdAt: Date;
  reporter?: {
    id: string;
    displayName: string;
  } | null;
};
