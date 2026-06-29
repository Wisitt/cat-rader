import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional } from "class-validator";
import { LostPetStatus } from "@prisma/client";
import { CreateLostPetDto } from "./create-lost-pet.dto";

export class UpdateLostPetDto extends PartialType(CreateLostPetDto) {
  @IsOptional()
  @IsEnum(LostPetStatus)
  status?: LostPetStatus;
}
