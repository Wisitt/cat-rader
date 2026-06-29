import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { AddNoteDto } from "./dto/add-note.dto";
import { AssignVolunteerDto } from "./dto/assign-volunteer.dto";
import { CreateRescueCaseDto } from "./dto/create-rescue-case.dto";
import { UpdateRescueStatusDto } from "./dto/update-rescue-status.dto";
import { RescueCasesService } from "./rescue-cases.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("rescue-cases")
export class RescueCasesController {
  constructor(private readonly rescueCasesService: RescueCasesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateRescueCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rescueCasesService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
  list() {
    return this.rescueCasesService.list();
  }

  @Get(":id")
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
  get(@Param("id") id: string) {
    return this.rescueCasesService.get(id);
  }

  @Patch(":id/status")
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateRescueStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rescueCasesService.updateStatus(id, dto, user);
  }

  @Post(":id/assign-volunteer")
  @Roles(UserRole.ADMIN)
  assignVolunteer(@Param("id") id: string, @Body() dto: AssignVolunteerDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rescueCasesService.assignVolunteer(id, dto, user);
  }

  @Post(":id/notes")
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
  addNote(@Param("id") id: string, @Body() dto: AddNoteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rescueCasesService.addNote(id, dto.body, user);
  }

  @Get(":id/timeline")
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
  timeline(@Param("id") id: string) {
    return this.rescueCasesService.timeline(id);
  }
}
