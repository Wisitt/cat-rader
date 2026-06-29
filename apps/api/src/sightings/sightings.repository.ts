import { Injectable } from "@nestjs/common";
import { Prisma, VerificationStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

const reporterSelect = {
  id: true,
  displayName: true,
};

@Injectable()
export class SightingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AnimalSightingUncheckedCreateInput) {
    return this.prisma.animalSighting.create({
      data,
      include: { reporter: { select: reporterSelect } },
    });
  }

  async list(where: Prisma.AnimalSightingWhereInput, page: number, pageSize: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.animalSighting.findMany({
        where,
        include: { reporter: { select: reporterSelect } },
        orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.animalSighting.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return this.prisma.animalSighting.findUnique({
      where: { id },
      include: { reporter: { select: reporterSelect }, rescueCase: true },
    });
  }

  update(id: string, data: Prisma.AnimalSightingUncheckedUpdateInput) {
    return this.prisma.animalSighting.update({
      where: { id },
      data,
      include: { reporter: { select: reporterSelect } },
    });
  }

  delete(id: string) {
    return this.prisma.animalSighting.delete({ where: { id } });
  }

  setVerificationStatus(id: string, verificationStatus: VerificationStatus) {
    return this.prisma.animalSighting.update({
      where: { id },
      data: { verificationStatus },
      include: { reporter: { select: reporterSelect } },
    });
  }
}
