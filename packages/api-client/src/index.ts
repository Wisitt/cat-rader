import type {
  AnalyticsSummary,
  AnimalSighting,
  AuditLog,
  CMSPage,
  FAQ,
  RescueCase,
  User,
} from "@petradar/types";
export { calculateMatchScore } from "./matching.js";

const animalPhoto =
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80";
const dogPhoto =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80";
const cat2Photo =
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=600&q=80";
const dog2Photo =
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80";

export const mockReports: AnimalSighting[] = [
  { id: "CAT-00021", species: "CAT", condition: "Normal stray", color: "Orange tabby", area: "Ari, Bangkok", reporter: "Nicha P.", reporterTrust: 92, urgency: "MEDIUM", verificationStatus: "PENDING", duplicateRisk: "HIGH", createdAt: "2026-06-26T09:20:00Z", photoUrl: animalPhoto, publicLatitude: 13.7762, publicLongitude: 100.5498 },
  { id: "DOG-00014", species: "DOG", condition: "Injured", color: "Golden retriever", area: "Victory Monument", reporter: "Somchai R.", reporterTrust: 74, urgency: "HIGH", verificationStatus: "PENDING", duplicateRisk: "MEDIUM", createdAt: "2026-06-26T08:50:00Z", photoUrl: dogPhoto, publicLatitude: 13.7652, publicLongitude: 100.5373 },
  { id: "CAT-00022", species: "CAT", condition: "Possible lost pet", color: "Gray", area: "Phahon Yothin", reporter: "Karn T.", reporterTrust: 85, urgency: "MEDIUM", verificationStatus: "PENDING", duplicateRisk: "HIGH", createdAt: "2026-06-26T08:20:00Z", photoUrl: cat2Photo, publicLatitude: 13.789, publicLongitude: 100.545 },
  { id: "DOG-00009", species: "DOG", condition: "Needs rescue", color: "Black", area: "Chatuchak", reporter: "Anon User", reporterTrust: 61, urgency: "HIGH", verificationStatus: "VERIFIED", duplicateRisk: "LOW", createdAt: "2026-06-25T18:10:00Z", photoUrl: dog2Photo, publicLatitude: 13.7999, publicLongitude: 100.5505 },
  { id: "CAT-00023", species: "CAT", condition: "Injured", color: "White", area: "Lat Phrao", reporter: "Lek A.", reporterTrust: 78, urgency: "HIGH", verificationStatus: "PENDING", duplicateRisk: "LOW", createdAt: "2026-06-25T15:30:00Z", photoUrl: animalPhoto, publicLatitude: 13.8102, publicLongitude: 100.5704 },
  { id: "DOG-00015", species: "DOG", condition: "Normal stray", color: "Brown mixed", area: "Ratchada", reporter: "Mint K.", reporterTrust: 88, urgency: "LOW", verificationStatus: "VERIFIED", duplicateRisk: "LOW", createdAt: "2026-06-25T14:15:00Z", photoUrl: dogPhoto, publicLatitude: 13.7791, publicLongitude: 100.5712 },
  { id: "CAT-00024", species: "CAT", condition: "Possible lost pet", color: "Siamese", area: "Ekkamai", reporter: "Pim R.", reporterTrust: 90, urgency: "MEDIUM", verificationStatus: "PENDING", duplicateRisk: "MEDIUM", createdAt: "2026-06-25T12:00:00Z", photoUrl: cat2Photo, publicLatitude: 13.7221, publicLongitude: 100.5850 },
  { id: "DOG-00016", species: "DOG", condition: "Injured", color: "Dalmatian", area: "Huai Khwang", reporter: "Bee T.", reporterTrust: 67, urgency: "EMERGENCY", verificationStatus: "PENDING", duplicateRisk: "LOW", createdAt: "2026-06-25T10:45:00Z", photoUrl: dog2Photo, publicLatitude: 13.7890, publicLongitude: 100.5673 },
  { id: "OTHER-00005", species: "OTHER", condition: "Normal stray", color: "Tabby mix", area: "Silom", reporter: "Jan W.", reporterTrust: 72, urgency: "LOW", verificationStatus: "REJECTED", duplicateRisk: "LOW", createdAt: "2026-06-25T09:00:00Z", photoUrl: animalPhoto, publicLatitude: 13.7258, publicLongitude: 100.5235 },
  { id: "CAT-00025", species: "CAT", condition: "Needs rescue", color: "Calico", area: "Nana", reporter: "Wut P.", reporterTrust: 81, urgency: "HIGH", verificationStatus: "PENDING", duplicateRisk: "MEDIUM", createdAt: "2026-06-24T20:30:00Z", photoUrl: animalPhoto, publicLatitude: 13.7407, publicLongitude: 100.5555 },
];

export const mockRescueCases: RescueCase[] = [
  { id: "RC-1001", title: "Orange tabby with collar", species: "CAT", area: "Ari", status: "NEW_REPORT", urgency: "MEDIUM", updatedAt: "2026-06-26T09:20:00Z", photoUrl: animalPhoto },
  { id: "RC-1002", title: "Injured golden retriever", species: "DOG", area: "Victory Monument", status: "NEEDS_RESCUE", urgency: "HIGH", assignedTo: "Nicha P.", updatedAt: "2026-06-26T08:50:00Z", photoUrl: dogPhoto },
  { id: "RC-1003", title: "Black dog limping", species: "DOG", area: "Chatuchak", status: "VOLUNTEER_ASSIGNED", urgency: "HIGH", assignedTo: "Mai R.", updatedAt: "2026-06-25T18:10:00Z", photoUrl: dog2Photo },
  { id: "RC-1004", title: "Gray cat possible lost pet", species: "CAT", area: "Phahon Yothin", status: "WATCHING", urgency: "LOW", updatedAt: "2026-06-25T14:10:00Z", photoUrl: cat2Photo },
  { id: "RC-1005", title: "White injured cat", species: "CAT", area: "Lat Phrao", status: "AT_CLINIC", urgency: "HIGH", assignedTo: "Nicha P.", updatedAt: "2026-06-25T12:30:00Z", photoUrl: animalPhoto },
  { id: "RC-1006", title: "Brown stray dog rehoming", species: "DOG", area: "Ratchada", status: "FOSTER_NEEDED", urgency: "MEDIUM", assignedTo: "Priya S.", updatedAt: "2026-06-25T10:00:00Z", photoUrl: dogPhoto },
  { id: "RC-1007", title: "Siamese cat reunited", species: "CAT", area: "Ekkamai", status: "REUNITED_ADOPTED", urgency: "LOW", assignedTo: "Lek A.", updatedAt: "2026-06-24T16:45:00Z", photoUrl: cat2Photo },
  { id: "RC-1008", title: "Emergency dalmatian", species: "DOG", area: "Huai Khwang", status: "NEEDS_VERIFICATION", urgency: "EMERGENCY", updatedAt: "2026-06-25T10:45:00Z", photoUrl: dog2Photo },
  { id: "RC-1009", title: "Calico rescue complete", species: "CAT", area: "Nana", status: "CLOSED", urgency: "MEDIUM", assignedTo: "Mai R.", updatedAt: "2026-06-23T09:00:00Z", photoUrl: animalPhoto },
];

export const mockUsers: User[] = [
  { id: "USR-001", name: "Nicha P.", email: "nicha@petradar.app", role: "VERIFIED_VOLUNTEER", trustScore: 92, status: "ACTIVE", reportsSubmitted: 24, lostPetPosts: 3, createdAt: "2024-03-12" },
  { id: "USR-002", name: "Somchai R.", email: "somchai@example.com", role: "REPORTER", trustScore: 74, status: "ACTIVE", reportsSubmitted: 18, lostPetPosts: 0, createdAt: "2025-01-20" },
  { id: "USR-003", name: "Priya S.", email: "priya@example.com", role: "PET_OWNER", trustScore: 81, status: "ACTIVE", reportsSubmitted: 2, lostPetPosts: 4, createdAt: "2025-06-11" },
  { id: "USR-004", name: "Mai R.", email: "mai@example.com", role: "RESCUE_COORDINATOR", trustScore: 96, status: "ACTIVE", reportsSubmitted: 41, lostPetPosts: 1, createdAt: "2023-11-04" },
  { id: "USR-005", name: "Karn T.", email: "karn@example.com", role: "VOLUNTEER", trustScore: 85, status: "ACTIVE", reportsSubmitted: 12, lostPetPosts: 2, createdAt: "2025-02-18" },
  { id: "USR-006", name: "Lek A.", email: "lek@example.com", role: "VERIFIED_VOLUNTEER", trustScore: 78, status: "ACTIVE", reportsSubmitted: 30, lostPetPosts: 0, createdAt: "2024-07-01" },
  { id: "USR-007", name: "Pim R.", email: "pim@example.com", role: "REPORTER", trustScore: 90, status: "ACTIVE", reportsSubmitted: 7, lostPetPosts: 1, createdAt: "2025-09-14" },
  { id: "USR-008", name: "Bee T.", email: "bee@example.com", role: "REPORTER", trustScore: 67, status: "SUSPENDED", reportsSubmitted: 3, lostPetPosts: 0, createdAt: "2026-01-05" },
  { id: "USR-009", name: "Jan W.", email: "jan@example.com", role: "GUEST", trustScore: 72, status: "ACTIVE", reportsSubmitted: 1, lostPetPosts: 0, createdAt: "2026-04-22" },
  { id: "USR-010", name: "Wut P.", email: "wut@example.com", role: "PET_OWNER", trustScore: 81, status: "ACTIVE", reportsSubmitted: 4, lostPetPosts: 3, createdAt: "2025-11-30" },
  { id: "USR-011", name: "Mint K.", email: "mint@example.com", role: "ANALYST", trustScore: 88, status: "ACTIVE", reportsSubmitted: 0, lostPetPosts: 0, createdAt: "2024-12-01" },
];

export const mockAnalytics: AnalyticsSummary = {
  totalSightings: 1248,
  injuredCases: 156,
  lostPetMatches: 89,
  rescueCases: 412,
  resolvedCases: 356,
};

export const mockAuditLogs: AuditLog[] = [
  { id: "AUD-0001", actor: "Admin Nicha", action: "APPROVED_REPORT", entityType: "AnimalSighting", entityId: "CAT-00021", timestamp: "2026-06-26T09:41:00Z", ipAddress: "192.0.2.14" },
  { id: "AUD-0002", actor: "Mai R.", action: "VIEWED_EXACT_LOCATION", entityType: "RescueCase", entityId: "RC-1002", timestamp: "2026-06-26T09:33:00Z", ipAddress: "192.0.2.22" },
  { id: "AUD-0003", actor: "Content Admin", action: "UPDATED_FAQ", entityType: "FAQ", entityId: "FAQ-014", timestamp: "2026-06-25T17:10:00Z", ipAddress: "192.0.2.18" },
  { id: "AUD-0004", actor: "Admin Nicha", action: "ASSIGNED_VOLUNTEER", entityType: "RescueCase", entityId: "RC-1003", timestamp: "2026-06-25T18:05:00Z", ipAddress: "192.0.2.14" },
  { id: "AUD-0005", actor: "Admin Nicha", action: "REJECTED_REPORT", entityType: "AnimalSighting", entityId: "OTHER-00005", timestamp: "2026-06-25T09:30:00Z", ipAddress: "192.0.2.14" },
  { id: "AUD-0006", actor: "Mai R.", action: "UPDATED_RESCUE_STATUS", entityType: "RescueCase", entityId: "RC-1005", timestamp: "2026-06-25T12:00:00Z", ipAddress: "192.0.2.22" },
  { id: "AUD-0007", actor: "Super Admin", action: "CHANGED_USER_ROLE", entityType: "User", entityId: "USR-005", timestamp: "2026-06-24T16:00:00Z", ipAddress: "192.0.2.1" },
  { id: "AUD-0008", actor: "Content Admin", action: "PUBLISHED_CONTENT", entityType: "CMSPage", entityId: "PAGE-002", timestamp: "2026-06-24T14:20:00Z", ipAddress: "192.0.2.18" },
];

export const mockPages: CMSPage[] = [
  { id: "PAGE-001", title: "Landing Page", slug: "/", status: "PUBLISHED", updatedAt: "2026-06-24" },
  { id: "PAGE-002", title: "Safety Guidelines", slug: "/safety", status: "PUBLISHED", updatedAt: "2026-06-20" },
  { id: "PAGE-003", title: "Volunteer Help Center", slug: "/help/volunteers", status: "DRAFT", updatedAt: "2026-06-18" },
  { id: "PAGE-004", title: "Privacy Policy", slug: "/privacy", status: "PUBLISHED", updatedAt: "2026-06-10" },
  { id: "PAGE-005", title: "About PetRadar", slug: "/about", status: "DRAFT", updatedAt: "2026-06-01" },
];

export const mockFaqs: FAQ[] = [
  { id: "FAQ-001", question: "Why are exact locations hidden?", category: "Privacy", status: "PUBLISHED" },
  { id: "FAQ-002", question: "How do I verify a report?", category: "Volunteers", status: "PUBLISHED" },
  { id: "FAQ-003", question: "Can I contact a pet owner directly?", category: "Lost Pets", status: "DRAFT" },
  { id: "FAQ-004", question: "What happens after a rescue case is opened?", category: "Rescue", status: "PUBLISHED" },
  { id: "FAQ-005", question: "How is the trust score calculated?", category: "Community", status: "DRAFT" },
  { id: "FAQ-006", question: "How do I report an injured animal?", category: "Reports", status: "PUBLISHED" },
];

export const adminClient = {
  dashboard: async () => ({ reports: mockReports, rescueCases: mockRescueCases, users: mockUsers, analytics: mockAnalytics }),
  reports: async () => mockReports,
  rescueCases: async () => mockRescueCases,
  users: async () => mockUsers,
  auditLogs: async () => mockAuditLogs,
};

export const cmsClient = {
  pages: async () => mockPages,
  faqs: async () => mockFaqs,
};

export const authClient = { login: async () => ({ token: "mock-admin-token" }) };
export const sightingsClient = { list: async () => mockReports };
export const lostPetsClient = { list: async () => [] };
export const matchingClient = { list: async () => [] };
export const rescueClient = { list: async () => mockRescueCases };
export const analyticsClient = { summary: async () => mockAnalytics };
export const uploadClient = { signedUrl: async () => ({ url: "mock://upload" }) };
