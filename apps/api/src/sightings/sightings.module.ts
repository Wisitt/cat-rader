import { Module } from "@nestjs/common";
import { MatchingModule } from "../matching/matching.module";
import { RescueCasesModule } from "../rescue-cases/rescue-cases.module";
import { SightingsController } from "./sightings.controller";
import { SightingsRepository } from "./sightings.repository";
import { SightingsService } from "./sightings.service";

@Module({
  imports: [MatchingModule, RescueCasesModule],
  controllers: [SightingsController],
  providers: [SightingsRepository, SightingsService],
  exports: [SightingsRepository, SightingsService],
})
export class SightingsModule {}
