import { Controller, Get, Query } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { QuerySightingsDto } from "../sightings/dto/query-sightings.dto";
import { NearbyQueryDto } from "./dto/nearby-query.dto";
import { MapService } from "./map.service";

@Public()
@Controller("map")
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get("sightings")
  sightings(@Query() query: QuerySightingsDto) {
    return this.mapService.sightings(query);
  }

  @Get("nearby")
  nearby(@Query() query: NearbyQueryDto) {
    return this.mapService.nearby(query);
  }

  @Get("heatmap")
  heatmap() {
    return this.mapService.heatmap();
  }
}
