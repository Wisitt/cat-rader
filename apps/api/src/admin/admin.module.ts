import { Module } from "@nestjs/common";
import { RescueCasesModule } from "../rescue-cases/rescue-cases.module";
import { SightingsModule } from "../sightings/sightings.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [SightingsModule, RescueCasesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
