import { Injectable, NotFoundException } from "@nestjs/common";
import { AnimalSighting, LostPet, MatchDecision } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { MatchScore } from "./entities/match.entity";
import { MatchingRepository } from "./matching.repository";

@Injectable()
export class MatchingService {
  constructor(
    private readonly matchingRepository: MatchingRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async runForLostPet(lostPetId: string) {
    const lostPet = await this.matchingRepository.findLostPet(lostPetId);
    if (!lostPet) {
      throw new NotFoundException("Lost pet not found");
    }

    const sightings = await this.matchingRepository.findNearbySightingsForLostPet(lostPetId);
    const matches = await Promise.all(
      sightings.map((sighting) => this.saveScore(lostPet, sighting)),
    );

    return matches.sort((a, b) => b.score - a.score);
  }

  async runForNewSighting(sightingId: string) {
    const sighting = await this.matchingRepository.findSighting(sightingId);
    if (!sighting) {
      throw new NotFoundException("Sighting not found");
    }

    const lostPets = await this.matchingRepository.findActiveLostPetsNearSighting(sightingId);
    const matches = await Promise.all(lostPets.map((lostPet) => this.saveScore(lostPet, sighting)));
    await Promise.all(
      matches
        .filter((match) => match.score >= 40)
        .map((match) =>
          this.notificationsService.create({
            userId: match.lostPet.ownerId,
            type: "MATCH_FOUND",
            title: `${match.level} possible match for ${match.lostPet.petName}`,
            body: `A nearby ${match.sighting.species.toLowerCase()} sighting scored ${match.score}/100.`,
            metadata: { matchId: match.id, lostPetId: match.lostPetId, sightingId: match.sightingId },
          }),
        ),
    );

    return matches;
  }

  list() {
    return this.matchingRepository.list();
  }

  async get(id: string) {
    const match = await this.matchingRepository.findById(id);
    if (!match) {
      throw new NotFoundException("Match not found");
    }

    return match;
  }

  forLostPet(lostPetId: string) {
    return this.matchingRepository.findForLostPet(lostPetId);
  }

  confirm(id: string) {
    return this.matchingRepository.updateDecision(id, MatchDecision.CONFIRMED);
  }

  reject(id: string) {
    return this.matchingRepository.updateDecision(id, MatchDecision.REJECTED);
  }

  calculateScore(lostPet: LostPet, sighting: AnimalSighting): MatchScore {
    let score = 0;
    const reasons: string[] = [];
    const normalizedLostColor = lostPet.color.toLowerCase();
    const normalizedSightingColor = sighting.color.toLowerCase();
    const description = `${lostPet.description} ${lostPet.pattern ?? ""} ${sighting.description} ${
      sighting.pattern ?? ""
    }`.toLowerCase();

    if (lostPet.species === sighting.species) {
      score += 30;
      reasons.push("Species match");
    }

    if (
      normalizedLostColor === normalizedSightingColor ||
      normalizedLostColor.includes(normalizedSightingColor) ||
      normalizedSightingColor.includes(normalizedLostColor)
    ) {
      score += 20;
      reasons.push("Color match");
    }

    if (lostPet.hasCollar && description.includes("collar")) {
      score += 15;
      reasons.push("Collar mentioned");
    }

    const distanceMeters = distanceBetweenMeters(
      Number(lostPet.exactLatitude),
      Number(lostPet.exactLongitude),
      Number(sighting.exactLatitude),
      Number(sighting.exactLongitude),
    );
    if (distanceMeters <= 1000) {
      score += 20;
      reasons.push("Within 1 km");
    }

    const daysApart = Math.abs(lostPet.lastSeenAt.getTime() - sighting.seenAt.getTime()) / 86_400_000;
    if (daysApart <= 7) {
      score += 15;
      reasons.push("Seen within 7 days");
    }

    if (hasSharedTerms(`${lostPet.pattern ?? ""} ${lostPet.description}`, `${sighting.pattern ?? ""} ${sighting.description}`)) {
      score += 10;
      reasons.push("Similar pattern or description");
    }

    return {
      score: Math.min(score, 100),
      level: score >= 70 ? "High" : score >= 40 ? "Medium" : "Low",
      reasons,
      distanceMeters,
    };
  }

  private saveScore(lostPet: LostPet, sighting: AnimalSighting) {
    const result = this.calculateScore(lostPet, sighting);
    return this.matchingRepository.upsert({
      lostPetId: lostPet.id,
      sightingId: sighting.id,
      score: result.score,
      level: result.level,
      reasons: [...result.reasons, `${Math.round(result.distanceMeters)} meters away`],
    });
  }
}

function distanceBetweenMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusMeters = 6_371_000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function hasSharedTerms(left: string, right: string) {
  const stopWords = new Set(["the", "and", "with", "near", "very", "small", "large", "pet"]);
  const leftTerms = new Set(
    left
      .toLowerCase()
      .split(/\W+/)
      .filter((term) => term.length > 3 && !stopWords.has(term)),
  );
  return right
    .toLowerCase()
    .split(/\W+/)
    .some((term) => leftTerms.has(term));
}
