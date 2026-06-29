import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class MapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async nearby(latitude: number, longitude: number, radiusMeters: number) {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM animal_sightings
      WHERE verification_status = 'VERIFIED'
        AND ST_DWithin(
          public_location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY ST_Distance(
        public_location,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      )
      LIMIT 100
    `;

    return this.prisma.animalSighting.findMany({
      where: { id: { in: rows.map((row) => row.id) } },
      orderBy: { createdAt: "desc" },
    });
  }
}
