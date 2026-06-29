import { RescueStatus, Urgency } from "@prisma/client";

export type RescueCaseResponse = {
  id: string;
  status: RescueStatus;
  priority: Urgency;
  summary: string;
  sightingId: string;
  assignedVolunteerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
