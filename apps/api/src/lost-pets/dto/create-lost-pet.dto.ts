import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Species } from "@prisma/client";

export class CreateLostPetDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  petName!: string;

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
  @IsBoolean()
  hasCollar = false;

  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @IsDateString()
  lastSeenAt!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  photoUrls?: string[];
}
