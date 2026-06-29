export type Role =
  | "GUEST"
  | "REPORTER"
  | "PET_OWNER"
  | "VOLUNTEER"
  | "VERIFIED_VOLUNTEER"
  | "RESCUE_COORDINATOR"
  | "CONTENT_EDITOR"
  | "ANALYST"
  | "ADMIN"
  | "SUPER_ADMIN";

export type Species = "CAT" | "DOG" | "OTHER";
export type Urgency = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "DUPLICATE";
export type RescueStatus =
  | "NEW_REPORT"
  | "NEEDS_VERIFICATION"
  | "WATCHING"
  | "NEEDS_RESCUE"
  | "VOLUNTEER_ASSIGNED"
  | "AT_CLINIC"
  | "FOSTER_NEEDED"
  | "REUNITED_ADOPTED"
  | "CLOSED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  trustScore: number;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  reportsSubmitted: number;
  lostPetPosts: number;
  createdAt: string;
}

export interface AnimalSighting {
  id: string;
  species: Species;
  condition: string;
  color: string;
  area: string;
  reporter: string;
  reporterTrust: number;
  urgency: Urgency;
  verificationStatus: VerificationStatus;
  duplicateRisk: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  photoUrl: string;
  publicLatitude: number;
  publicLongitude: number;
}

export interface LostPet {
  id: string;
  name: string;
  species: Species;
  owner: string;
  area: string;
  possibleMatches: number;
  status: "ACTIVE" | "FOUND" | "CLOSED";
}

export interface MatchResult {
  id: string;
  lostPetId: string;
  sightingId: string;
  score: number;
  distanceMeters: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
}

export interface RescueCase {
  id: string;
  title: string;
  species: Species;
  area: string;
  status: RescueStatus;
  urgency: Urgency;
  assignedTo?: string;
  updatedAt: string;
  photoUrl: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface AnalyticsSummary {
  totalSightings: number;
  injuredCases: number;
  lostPetMatches: number;
  rescueCases: number;
  resolvedCases: number;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface Announcement {
  id: string;
  title: string;
  audience: string;
  status: "SCHEDULED" | "PUBLISHED" | "DRAFT";
  publishAt: string;
}
