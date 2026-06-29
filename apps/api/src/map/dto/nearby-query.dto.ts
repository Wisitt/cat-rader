import { Type } from "class-transformer";
import { IsLatitude, IsLongitude, IsOptional, Max, Min } from "class-validator";

export class NearbyQueryDto {
  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @Type(() => Number)
  @Min(100)
  @Max(20000)
  radiusMeters = 3000;
}
