import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { RescueStatus } from "@prisma/client";

export class UpdateRescueStatusDto {
  @IsEnum(RescueStatus)
  status!: RescueStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
