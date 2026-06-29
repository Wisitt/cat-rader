import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "./types/request-user.type";

export function canViewExactLocation(user?: AuthenticatedUser | null) {
  return user?.role === UserRole.ADMIN || user?.role === UserRole.VOLUNTEER;
}

export function approximateCoordinate(value: number) {
  return Number((Math.round(value * 500) / 500).toFixed(6));
}
