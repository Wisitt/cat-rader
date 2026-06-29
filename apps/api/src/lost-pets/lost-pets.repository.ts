import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class LostPetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LostPetUncheckedCreateInput) {
    return this.prisma.lostPet.create({ data });
  }

  list(where: Prisma.LostPetWhereInput = {}) {
    return this.prisma.lostPet.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  findById(id: string) {
    return this.prisma.lostPet.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.LostPetUncheckedUpdateInput) {
    return this.prisma.lostPet.update({ where: { id }, data });
  }
}
