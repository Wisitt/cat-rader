import { Injectable } from "@nestjs/common";
import { QuerySightingsDto } from "../sightings/dto/query-sightings.dto";
import { SightingsService } from "../sightings/sightings.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { NearbyQueryDto } from "./dto/nearby-query.dto";
import { MapRepository } from "./map.repository";

@Injectable()
export class MapService {
  constructor(
    private readonly sightingsService: SightingsService,
    private readonly analyticsService: AnalyticsService,
    private readonly mapRepository: MapRepository,
  ) {}

  sightings(query: QuerySightingsDto) {
    return this.sightingsService.list(query);
  }

  async nearby(query: NearbyQueryDto) {
    const items = await this.mapRepository.nearby(query.latitude, query.longitude, query.radiusMeters);
    return {
      items: items.map((item) => this.sightingsService.serialize(item)),
    };
  }

  heatmap() {
    return this.analyticsService.hotspots();
  }
}
