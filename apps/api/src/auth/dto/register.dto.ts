import { IsEmail, IsEnum, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  displayName!: string;

  @IsOptional()
  @IsEnum(UserRole)
  @IsIn([UserRole.REPORTER, UserRole.PET_OWNER, UserRole.VOLUNTEER])
  role?: UserRole;
}
