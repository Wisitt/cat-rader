import { Injectable } from "@nestjs/common";
import { AnalyticsRepository } from "./analytics.repository";

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  summary() {
    return this.analyticsRepository.summary();
  }

  bySpecies() {
    return this.analyticsRepository.bySpecies();
  }

  byStatus() {
    return this.analyticsRepository.byStatus();
  }

  hotspots() {
    return this.analyticsRepository.hotspots();
  }
}
