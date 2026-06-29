import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { AdminService } from "./admin.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("reports/pending")
  pendingReports() {
    return this.adminService.pendingReports();
  }

  @Get("verification-queue")
  verificationQueue() {
    return this.adminService.pendingReports();
  }

  @Post("reports/:id/approve")
  approve(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.approveReport(id, user);
  }

  @Post("reports/:id/reject")
  reject(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.rejectReport(id, user);
  }

  @Post("reports/:id/merge")
  merge(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.mergeReport(id, user);
  }

  @Post("reports/:id/convert-to-rescue")
  convertToRescue(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.convertToRescue(id, user);
  }
}
