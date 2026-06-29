import { Module } from "@nestjs/common";
import { AnalyticsModule } from "../analytics/analytics.module";
import { SightingsModule } from "../sightings/sightings.module";
import { MapController } from "./map.controller";
import { MapRepository } from "./map.repository";
import { MapService } from "./map.service";

@Module({
  imports: [AnalyticsModule, SightingsModule],
  controllers: [MapController],
  providers: [MapRepository, MapService],
})
export class MapModule {}
