import { Injectable } from "@nestjs/common";
import { VerificationStatus } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { RescueCasesService } from "../rescue-cases/rescue-cases.service";
import { SightingsService } from "../sightings/sightings.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly sightingsService: SightingsService,
    private readonly rescueCasesService: RescueCasesService,
  ) {}

  pendingReports() {
    return this.sightingsService.list({
      verificationStatus: VerificationStatus.PENDING,
      page: 1,
      pageSize: 100,
    });
  }

  approveReport(id: string, actor: AuthenticatedUser) {
    return this.sightingsService.verify(id, actor);
  }

  rejectReport(id: string, actor: AuthenticatedUser) {
    return this.sightingsService.reject(id, actor);
  }

  mergeReport(id: string, actor: AuthenticatedUser) {
    return this.sightingsService.markDuplicate(id, actor);
  }

  convertToRescue(id: string, actor: AuthenticatedUser) {
    return this.rescueCasesService.createFromSighting(id, actor);
  }
}
