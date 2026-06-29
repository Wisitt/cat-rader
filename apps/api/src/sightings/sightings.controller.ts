import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../common/guards/optional-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { RescueCasesService } from "../rescue-cases/rescue-cases.service";
import { CreateSightingDto } from "./dto/create-sighting.dto";
import { QuerySightingsDto } from "./dto/query-sightings.dto";
import { UpdateSightingDto } from "./dto/update-sighting.dto";
import { SightingsService } from "./sightings.service";

@Controller("sightings")
export class SightingsController {
  constructor(
    private readonly sightingsService: SightingsService,
    private readonly rescueCasesService: RescueCasesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.REPORTER, UserRole.PET_OWNER, UserRole.VOLUNTEER, UserRole.ADMIN)
  create(@Body() dto: CreateSightingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.sightingsService.create(dto, user);
  }

  @Public()
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(@Query() query: QuerySightingsDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.sightingsService.list(query, user);
  }

  @Public()
  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  get(@Param("id") id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.sightingsService.get(id, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() dto: UpdateSightingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.sightingsService.update(id, dto, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  delete(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.sightingsService.delete(id, user);
  }

  @Post(":id/verify")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  verify(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.sightingsService.verify(id, user);
  }

  @Post(":id/reject")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reject(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.sightingsService.reject(id, user);
  }

  @Post(":id/convert-to-rescue")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  convertToRescue(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rescueCasesService.createFromSighting(id, user);
  }
}
