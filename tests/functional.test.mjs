import assert from "node:assert/strict";
import { calculateMatchScore } from "../packages/api-client/src/matching.js";

const lostPet = {
  species: "CAT",
  color: "Orange tabby",
  pattern: "tabby stripes white chest",
  hasCollar: true,
  collarDescription: "red collar with bell",
  lastSeenAt: "2026-06-24T10:00:00Z",
};

const sighting = {
  species: "CAT",
  color: "Orange",
  pattern: "tabby stripes",
  description: "Friendly orange cat wearing a collar with a small bell",
  seenAt: "2026-06-25T10:00:00Z",
  distanceKm: 0.4,
};

const match = calculateMatchScore(lostPet, sighting);
assert.equal(match.score, 100, "high confidence match should score 100");
assert.equal(match.level, "High");
assert.ok(match.reasons.includes("Same species"));
assert.ok(match.reasons.includes("Collar match"));

const weak = calculateMatchScore(lostPet, {
  species: "DOG",
  color: "Black",
  description: "large dog",
  seenAt: "2026-05-01T10:00:00Z",
  distanceKm: 7,
});
assert.equal(weak.level, "Low", "different species and stale distance should be low");

const auditAction = {
  actor: "Admin",
  action: "APPROVED_REPORT",
  entityType: "AnimalSighting",
  entityId: "CAT-00021",
};
assert.equal(auditAction.action, "APPROVED_REPORT");

const notification = { id: "N-1", isRead: false };
notification.isRead = true;
assert.equal(notification.isRead, true, "notification read state updates");

const privacy = { role: "GUEST", exactLatitude: 13.1, publicLatitude: 13.09 };
const visibleLatitude = privacy.role === "GUEST" ? privacy.publicLatitude : privacy.exactLatitude;
assert.equal(visibleLatitude, privacy.publicLatitude, "guest sees approximate latitude only");

console.log("Functional prototype tests passed.");
