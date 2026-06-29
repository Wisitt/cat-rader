import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { UsersModule } from "../users/users.module";
import { RescueCasesController } from "./rescue-cases.controller";
import { RescueCasesRepository } from "./rescue-cases.repository";
import { RescueCasesService } from "./rescue-cases.service";

@Module({
  imports: [NotificationsModule, UsersModule],
  controllers: [RescueCasesController],
  providers: [RescueCasesRepository, RescueCasesService],
  exports: [RescueCasesRepository, RescueCasesService],
})
export class RescueCasesModule {}
