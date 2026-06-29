import { Module } from "@nestjs/common";
import { MatchingModule } from "../matching/matching.module";
import { LostPetsController } from "./lost-pets.controller";
import { LostPetsRepository } from "./lost-pets.repository";
import { LostPetsService } from "./lost-pets.service";

@Module({
  imports: [MatchingModule],
  controllers: [LostPetsController],
  providers: [LostPetsRepository, LostPetsService],
  exports: [LostPetsRepository, LostPetsService],
})
export class LostPetsModule {}
