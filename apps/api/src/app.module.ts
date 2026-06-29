import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { LostPetsModule } from "./lost-pets/lost-pets.module";
import { MapModule } from "./map/map.module";
import { MatchingModule } from "./matching/matching.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { RescueCasesModule } from "./rescue-cases/rescue-cases.module";
import { SightingsModule } from "./sightings/sightings.module";
import { UploadsModule } from "./uploads/uploads.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    SightingsModule,
    LostPetsModule,
    MatchingModule,
    RescueCasesModule,
    AdminModule,
    NotificationsModule,
    AnalyticsModule,
    UploadsModule,
    MapModule,
  ],
})
export class AppModule {}
