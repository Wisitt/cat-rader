import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../common/guards/optional-jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { CreateLostPetDto } from "./dto/create-lost-pet.dto";
import { UpdateLostPetDto } from "./dto/update-lost-pet.dto";
import { LostPetsService } from "./lost-pets.service";

@Controller("lost-pets")
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PET_OWNER, UserRole.ADMIN)
  create(@Body() dto: CreateLostPetDto, @CurrentUser() user: AuthenticatedUser) {
    return this.lostPetsService.create(dto, user);
  }

  @Public()
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(@CurrentUser() user?: AuthenticatedUser) {
    return this.lostPetsService.list(user);
  }

  @Public()
  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  get(@Param("id") id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.lostPetsService.get(id, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() dto: UpdateLostPetDto, @CurrentUser() user: AuthenticatedUser) {
    return this.lostPetsService.update(id, dto, user);
  }

  @Post(":id/run-matching")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PET_OWNER, UserRole.ADMIN)
  runMatching(@Param("id") id: string) {
    return this.lostPetsService.runMatching(id);
  }

  @Get(":id/matches")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PET_OWNER, UserRole.VOLUNTEER, UserRole.ADMIN)
  getMatches(@Param("id") id: string) {
    return this.lostPetsService.getMatches(id);
  }
}
