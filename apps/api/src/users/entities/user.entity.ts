import { UserRole } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
};
