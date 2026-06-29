import { IsString, MinLength } from "class-validator";

export class SocialExchangeDto {
  @IsString()
  @MinLength(32)
  token!: string;
}
