import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [sightings, activeLostPets, rescueCases, pendingReports] = await this.prisma.$transaction([
      this.prisma.animalSighting.count(),
      this.prisma.lostPet.count({ where: { status: "ACTIVE" } }),
      this.prisma.rescueCase.count(),
      this.prisma.animalSighting.count({ where: { verificationStatus: "PENDING" } }),
    ]);

    return { sightings, activeLostPets, rescueCases, pendingReports };
  }

  bySpecies() {
    return this.prisma.animalSighting.groupBy({
      by: ["species"],
      _count: { _all: true },
      orderBy: { species: "asc" },
    });
  }

  byStatus() {
    return this.prisma.animalSighting.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { status: "asc" },
    });
  }

  hotspots() {
    return this.prisma.$queryRaw<{ latitude: number; longitude: number; weight: number }[]>`
      SELECT
        ROUND(public_latitude::numeric, 3)::double precision AS latitude,
        ROUND(public_longitude::numeric, 3)::double precision AS longitude,
        COUNT(*)::integer AS weight
      FROM animal_sightings
      WHERE verification_status = 'VERIFIED'
      GROUP BY ROUND(public_latitude::numeric, 3), ROUND(public_longitude::numeric, 3)
      ORDER BY weight DESC
      LIMIT 100
    `;
  }
}
