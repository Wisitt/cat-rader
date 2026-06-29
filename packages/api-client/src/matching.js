export function calculateMatchScore(lostPet, sighting) {
  let score = 0;
  const reasons = [];
  const lostSpecies = String(lostPet.species ?? "").toUpperCase();
  const sightingSpecies = String(sighting.species ?? "").toUpperCase();
  const lostColor = String(lostPet.color ?? "").toLowerCase();
  const sightingColor = String(sighting.color ?? "").toLowerCase();
  const lostPattern = String(lostPet.pattern ?? lostPet.description ?? "").toLowerCase();
  const sightingPattern = String(sighting.pattern ?? sighting.description ?? "").toLowerCase();

  if (lostSpecies && lostSpecies === sightingSpecies) {
    score += 30;
    reasons.push("Same species");
  }
  if (lostColor && sightingColor && (lostColor.includes(sightingColor) || sightingColor.includes(lostColor) || lostColor.split(" ").some((part) => part.length > 2 && sightingColor.includes(part)))) {
    score += 20;
    reasons.push("Similar color");
  }
  if ((lostPet.hasCollar || lostPet.collarDescription) && /collar|bell|tag/i.test(`${sighting.description ?? ""} ${sighting.collarDescription ?? ""}`)) {
    score += 15;
    reasons.push("Collar match");
  }
  const distanceKm = Number(sighting.distanceKm ?? lostPet.distanceKm ?? 0.65);
  if (distanceKm <= 1) {
    score += 20;
    reasons.push("Within 1 km");
  }
  const lostDate = new Date(lostPet.lastSeenAt ?? lostPet.createdAt ?? Date.now()).getTime();
  const sightingDate = new Date(sighting.seenAt ?? sighting.createdAt ?? Date.now()).getTime();
  const days = Math.abs(lostDate - sightingDate) / 86400000;
  if (days <= 7) {
    score += 15;
    reasons.push("Seen within 7 days");
  }
  if (lostPattern && sightingPattern && lostPattern.split(/\W+/).some((part) => part.length > 3 && sightingPattern.includes(part))) {
    score += 10;
    reasons.push("Similar pattern or description");
  }
  const capped = Math.min(100, score);
  const level = capped >= 70 ? "High" : capped >= 40 ? "Medium" : "Low";
  return { score: capped, level, reasons };
}
