import { IsEnum, IsObject, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { NotificationType } from "@prisma/client";

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  @MinLength(2)
  @MaxLength(140)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(500)
  body!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
