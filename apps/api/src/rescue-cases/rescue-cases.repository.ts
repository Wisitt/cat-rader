import { Injectable } from "@nestjs/common";
import { Prisma, RescueStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

const rescueInclude = {
  sighting: true,
  assignedVolunteer: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
};

@Injectable()
export class RescueCasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.RescueCaseUncheckedCreateInput) {
    return this.prisma.rescueCase.create({
      data,
      include: rescueInclude,
    });
  }

  list() {
    return this.prisma.rescueCase.findMany({
      include: rescueInclude,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  }

  findById(id: string) {
    return this.prisma.rescueCase.findUnique({
      where: { id },
      include: {
        ...rescueInclude,
        internalNotes: { include: { author: { select: { id: true, displayName: true } } } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  findBySighting(sightingId: string) {
    return this.prisma.rescueCase.findUnique({
      where: { sightingId },
      include: rescueInclude,
    });
  }

  updateStatus(id: string, status: RescueStatus) {
    return this.prisma.rescueCase.update({
      where: { id },
      data: { status },
      include: rescueInclude,
    });
  }

  assignVolunteer(id: string, volunteerId: string) {
    return this.prisma.rescueCase.update({
      where: { id },
      data: { assignedVolunteerId: volunteerId, status: "ASSIGNED" },
      include: rescueInclude,
    });
  }

  addHistory(data: Prisma.CaseStatusHistoryUncheckedCreateInput) {
    return this.prisma.caseStatusHistory.create({ data });
  }

  addNote(data: Prisma.InternalNoteUncheckedCreateInput) {
    return this.prisma.internalNote.create({
      data,
      include: { author: { select: { id: true, displayName: true } } },
    });
  }

  timeline(id: string) {
    return this.prisma.caseStatusHistory.findMany({
      where: { rescueCaseId: id },
      orderBy: { createdAt: "desc" },
    });
  }
}
