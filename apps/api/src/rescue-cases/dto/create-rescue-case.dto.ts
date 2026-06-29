import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { Urgency } from "@prisma/client";

export class CreateRescueCaseDto {
  @IsUUID()
  sightingId!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(800)
  summary!: string;

  @IsOptional()
  @IsEnum(Urgency)
  priority?: Urgency;
}
