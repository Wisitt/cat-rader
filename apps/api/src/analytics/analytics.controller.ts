import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AnalyticsService } from "./analytics.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  summary() {
    return this.analyticsService.summary();
  }

  @Get("by-species")
  bySpecies() {
    return this.analyticsService.bySpecies();
  }

  @Get("by-status")
  byStatus() {
    return this.analyticsService.byStatus();
  }

  @Get("hotspots")
  hotspots() {
    return this.analyticsService.hotspots();
  }
}
