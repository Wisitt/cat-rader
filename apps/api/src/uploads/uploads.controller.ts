import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { IsString, MaxLength, MinLength } from "class-validator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UploadsService } from "./uploads.service";

class CreateUploadDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  fileName!: string;
}

@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("photos")
  createPhotoUpload(@Body() dto: CreateUploadDto) {
    return this.uploadsService.createSignedPhotoUpload(dto.fileName);
  }
}
