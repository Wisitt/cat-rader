import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { MatchingController } from "./matching.controller";
import { MatchingRepository } from "./matching.repository";
import { MatchingService } from "./matching.service";

@Module({
  imports: [NotificationsModule],
  controllers: [MatchingController],
  providers: [MatchingRepository, MatchingService],
  exports: [MatchingRepository, MatchingService],
})
export class MatchingModule {}
