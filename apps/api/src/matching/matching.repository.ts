import { Injectable } from "@nestjs/common";
import { MatchDecision, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class MatchingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findNearbySightingsForLostPet(lostPetId: string, radiusMeters = 5000) {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT s.id
      FROM animal_sightings s
      JOIN lost_pets lp ON lp.id = CAST(${lostPetId} AS uuid)
      WHERE s.verification_status != 'REJECTED'
        AND ST_DWithin(s.exact_location, lp.exact_location, ${radiusMeters})
    `;
    
    return this.prisma.animalSighting.findMany({
      where: { id: { in: rows.map((row) => row.id) } },
    });
  }

  async findActiveLostPetsNearSighting(sightingId: string, radiusMeters = 5000) {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT lp.id
      FROM lost_pets lp
      JOIN animal_sightings s ON s.id = CAST(${sightingId} AS uuid)
      WHERE lp.status = 'ACTIVE'
        AND ST_DWithin(lp.exact_location, s.exact_location, ${radiusMeters})
    `;

    return this.prisma.lostPet.findMany({
      where: { id: { in: rows.map((row) => row.id) } },
      include: { owner: true },
    });
  }

  findLostPet(lostPetId: string) {
    return this.prisma.lostPet.findUnique({ where: { id: lostPetId }, include: { owner: true } });
  }

  findSighting(sightingId: string) {
    return this.prisma.animalSighting.findUnique({ where: { id: sightingId } });
  }

  upsert(data: Prisma.MatchResultUncheckedCreateInput) {
    return this.prisma.matchResult.upsert({
      where: {
        lostPetId_sightingId: {
          lostPetId: data.lostPetId,
          sightingId: data.sightingId,
        },
      },
      create: data,
      update: {
        score: data.score,
        level: data.level,
        reasons: data.reasons,
      },
      include: {
        lostPet: true,
        sighting: true,
      },
    });
  }

  list() {
    return this.prisma.matchResult.findMany({
      include: { lostPet: true, sighting: true },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    });
  }

  findById(id: string) {
    return this.prisma.matchResult.findUnique({
      where: { id },
      include: { lostPet: true, sighting: true },
    });
  }

  findForLostPet(lostPetId: string) {
    return this.prisma.matchResult.findMany({
      where: { lostPetId },
      include: { lostPet: true, sighting: true },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    });
  }

  updateDecision(id: string, decision: MatchDecision) {
    return this.prisma.matchResult.update({
      where: { id },
      data: { decision },
      include: { lostPet: true, sighting: true },
    });
  }
}
