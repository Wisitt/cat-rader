// ── Enumerations ─────────────────────────────────────────────────────────────

export type Species = "DOG" | "CAT" | "OTHER";

export type SightingStatus =
  | "STRAY"
  | "INJURED"
  | "POSSIBLE_LOST"
  | "RESCUE_NEEDED"
  | "RESOLVED";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "DUPLICATE";

export type Urgency = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export type LostPetStatus = "ACTIVE" | "FOUND" | "CLOSED";

export type MatchStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export type RescueStatus = "OPEN" | "IN_PROGRESS" | "RESCUED" | "CLOSED";

export type UserRole = "GUEST" | "REPORTER" | "PET_OWNER" | "VOLUNTEER" | "ADMIN";

export type NotificationType =
  | "MATCH_FOUND"
  | "RESCUE_UPDATE"
  | "SIGHTING_NEAR"
  | "STATUS_CHANGE"
  | "SYSTEM";

// ── Location ──────────────────────────────────────────────────────────────────

export interface PublicLocation {
  latitude: number;
  longitude: number;
  district?: string;
  isExact: boolean;
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  createdAt: string;
}

// ── Sighting ─────────────────────────────────────────────────────────────────

export interface Sighting {
  id: string;
  species: Species;
  color: string;
  pattern?: string;
  description: string;
  status: SightingStatus;
  urgency: Urgency;
  verificationStatus: VerificationStatus;
  photoUrls: string[];
  location: PublicLocation;
  seenAt: string;
  createdAt: string;
  reporter?: {
    id: string;
    displayName: string;
    role: UserRole;
  };
}

// ── Lost Pet ──────────────────────────────────────────────────────────────────

export interface LostPet {
  id: string;
  petName: string;
  species: Species;
  color: string;
  pattern?: string;
  description: string;
  hasCollar: boolean;
  collarDescription?: string;
  status: LostPetStatus;
  photoUrls: string[];
  location: PublicLocation;
  lastSeenAt: string;
  createdAt: string;
  matchCount?: number;
  owner?: {
    id: string;
    displayName: string;
    phone?: string;
  };
}

// ── Match ─────────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  lostPet: LostPet;
  sighting: Sighting;
  score: number;
  distanceKm: number;
  status: MatchStatus;
  createdAt: string;
}

// ── Rescue Case ───────────────────────────────────────────────────────────────

export interface RescueCase {
  id: string;
  sighting: Sighting;
  status: RescueStatus;
  priority: Urgency;
  assignedTo?: User;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface DailySighting {
  date: string;
  count: number;
}

export interface SpeciesBreakdown {
  species: Species;
  count: number;
  pct: number;
}

export interface StatusBreakdown {
  status: SightingStatus;
  count: number;
}

export interface Analytics {
  totalSightings: number;
  totalLostPets: number;
  totalMatches: number;
  matchSuccessRate: number;
  dailySightings: DailySighting[];
  speciesBreakdown: SpeciesBreakdown[];
  statusBreakdown: StatusBreakdown[];
}

// ── Forms ─────────────────────────────────────────────────────────────────────

export interface ReportForm {
  species: Species;
  color: string;
  pattern: string;
  description: string;
  urgency: Urgency;
  status: SightingStatus;
  photoUrls: string[];
  location: { latitude: number; longitude: number };
  seenAt: string;
}

// ── Pet Passport ──────────────────────────────────────────────────────────────

export type PetSex = "MALE" | "FEMALE" | "UNKNOWN";
export type PetSize = "SMALL" | "MEDIUM" | "LARGE";
export type PetPassportStatus = "ACTIVE" | "LOST" | "FOUND" | "ARCHIVED" | "DECEASED";

export interface PetPassport {
  id: string;
  ownerId: string;
  name: string;
  species: Species;
  breed?: string;
  sex: PetSex;
  size: PetSize;
  color: string;
  pattern?: string;
  birthDate?: string;
  microchipId?: string;
  description?: string;
  hasCollar: boolean;
  collarDescription?: string;
  photoUrl: string;
  status: PetPassportStatus;
  lostPetId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Pet Vaccination ───────────────────────────────────────────────────────────

export type VaccineCategory = "CORE" | "RABIES" | "PARASITE_PREVENTION" | "DEWORMING" | "OTHER";
export type VaccineVisibility = "PRIVATE" | "OWNER_ONLY" | "SHARED_WITH_VOLUNTEER" | "PUBLIC_SUMMARY";

export interface PetVaccinationRecord {
  id: string;
  petPassportId: string;
  vaccineName: string;
  vaccineCategory: VaccineCategory;
  vaccinationDate: string;
  nextDueDate?: string;
  clinicName: string;
  veterinarianName?: string;
  batchNumber?: string;
  notes?: string;
  proofFiles: string[];
  reminderEnabled: boolean;
  visibility: VaccineVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface LostPetForm {
  petName: string;
  species: Species;
  color: string;
  pattern: string;
  description: string;
  hasCollar: boolean;
  collarDescription: string;
  photoUrls: string[];
  location: { latitude: number; longitude: number };
  lastSeenAt: string;
  contactPhone: string;
}
