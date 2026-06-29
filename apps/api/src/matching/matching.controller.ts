import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { MatchingService } from "./matching.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("matches")
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get()
  @Roles(UserRole.PET_OWNER, UserRole.VOLUNTEER, UserRole.ADMIN)
  list() {
    return this.matchingService.list();
  }

  @Get(":id")
  @Roles(UserRole.PET_OWNER, UserRole.VOLUNTEER, UserRole.ADMIN)
  get(@Param("id") id: string) {
    return this.matchingService.get(id);
  }

  @Post(":id/confirm")
  @Roles(UserRole.PET_OWNER, UserRole.ADMIN)
  confirm(@Param("id") id: string) {
    return this.matchingService.confirm(id);
  }

  @Post(":id/reject")
  @Roles(UserRole.PET_OWNER, UserRole.ADMIN)
  reject(@Param("id") id: string) {
    return this.matchingService.reject(id);
  }
}
