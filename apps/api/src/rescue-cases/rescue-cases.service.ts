import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RescueStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersRepository } from "../users/users.repository";
import { AssignVolunteerDto } from "./dto/assign-volunteer.dto";
import { CreateRescueCaseDto } from "./dto/create-rescue-case.dto";
import { UpdateRescueStatusDto } from "./dto/update-rescue-status.dto";
import { RescueCasesRepository } from "./rescue-cases.repository";

@Injectable()
export class RescueCasesService {
  constructor(
    private readonly rescueCasesRepository: RescueCasesRepository,
    private readonly notificationsService: NotificationsService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(dto: CreateRescueCaseDto, actor: AuthenticatedUser) {
    const existing = await this.rescueCasesRepository.findBySighting(dto.sightingId);
    if (existing) {
      throw new ConflictException("This sighting already has a rescue case");
    }

    const rescueCase = await this.rescueCasesRepository.create({
      sightingId: dto.sightingId,
      summary: dto.summary,
      priority: dto.priority ?? "MEDIUM",
    });
    await this.rescueCasesRepository.addHistory({
      rescueCaseId: rescueCase.id,
      toStatus: RescueStatus.NEW,
      note: "Rescue case opened",
      createdById: actor.id,
    });

    return rescueCase;
  }

  async createFromSighting(sightingId: string, actor: AuthenticatedUser) {
    return this.create(
      {
        sightingId,
        summary: "Converted from verified community sighting.",
      },
      actor,
    );
  }

  list() {
    return this.rescueCasesRepository.list();
  }

  async get(id: string) {
    const rescueCase = await this.rescueCasesRepository.findById(id);
    if (!rescueCase) {
      throw new NotFoundException("Rescue case not found");
    }

    return rescueCase;
  }

  async updateStatus(id: string, dto: UpdateRescueStatusDto, actor: AuthenticatedUser) {
    const current = await this.get(id);
    const updated = await this.rescueCasesRepository.updateStatus(id, dto.status);
    await this.rescueCasesRepository.addHistory({
      rescueCaseId: id,
      fromStatus: current.status,
      toStatus: dto.status,
      note: dto.note,
      createdById: actor.id,
    });

    if (updated.assignedVolunteerId) {
      await this.notificationsService.create({
        userId: updated.assignedVolunteerId,
        type: "STATUS_UPDATED",
        title: "Rescue case status updated",
        body: `Case is now ${dto.status.replace("_", " ").toLowerCase()}.`,
        metadata: { rescueCaseId: id },
      });
    }

    return updated;
  }

  async assignVolunteer(id: string, dto: AssignVolunteerDto, actor: AuthenticatedUser) {
    const volunteer = await this.usersRepository.findById(dto.volunteerId);
    if (!volunteer || volunteer.role !== UserRole.VOLUNTEER) {
      throw new NotFoundException("Volunteer not found");
    }

    const current = await this.get(id);
    const updated = await this.rescueCasesRepository.assignVolunteer(id, dto.volunteerId);
    await this.rescueCasesRepository.addHistory({
      rescueCaseId: id,
      fromStatus: current.status,
      toStatus: RescueStatus.ASSIGNED,
      note: `Assigned to ${volunteer.displayName}`,
      createdById: actor.id,
    });
    await this.notificationsService.create({
      userId: dto.volunteerId,
      type: "RESCUE_ASSIGNED",
      title: "New rescue case assigned",
      body: updated.summary,
      metadata: { rescueCaseId: id },
    });

    return updated;
  }

  addNote(id: string, body: string, actor: AuthenticatedUser) {
    return this.rescueCasesRepository.addNote({
      rescueCaseId: id,
      authorId: actor.id,
      body,
    });
  }

  timeline(id: string) {
    return this.rescueCasesRepository.timeline(id);
  }
}
