import { Injectable } from "@nestjs/common";
import { NotificationType, Prisma } from "@prisma/client";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationsRepository } from "./notifications.repository";

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  create(dto: CreateNotificationDto | (Omit<CreateNotificationDto, "type"> & { type: keyof typeof NotificationType })) {
    return this.notificationsRepository.create({
      userId: dto.userId,
      type: dto.type as NotificationType,
      title: dto.title,
      body: dto.body,
      metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
    });
  }

  listForUser(userId: string) {
    return this.notificationsRepository.listForUser(userId);
  }

  markRead(id: string, userId: string) {
    return this.notificationsRepository.markRead(id, userId);
  }
}
