import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Species, SightingStatus, Urgency } from "@prisma/client";

export class CreateSightingDto {
  @IsEnum(Species)
  species!: Species;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  color!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pattern?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsEnum(SightingStatus)
  status?: SightingStatus;

  @IsOptional()
  @IsEnum(Urgency)
  urgency?: Urgency;

  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @IsDateString()
  seenAt!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  photoUrls?: string[];
}
