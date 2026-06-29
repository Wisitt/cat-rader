import { UserRole } from "@prisma/client";
import { IsEnum, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class GoogleAuthDto {
  @IsString()
  @MinLength(20)
  credential!: string;

  @IsOptional()
  @IsEnum(UserRole)
  @IsIn([UserRole.REPORTER, UserRole.PET_OWNER, UserRole.VOLUNTEER])
  role?: UserRole;
}
