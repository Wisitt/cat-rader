import { NotificationType } from "@prisma/client";

export type NotificationResponse = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: Date | null;
  metadata: unknown;
  createdAt: Date;
};
