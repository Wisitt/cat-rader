import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { AnimalSighting, Prisma, UserRole, VerificationStatus } from "@prisma/client";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { approximateCoordinate, canViewExactLocation } from "../common/privacy";
import { MatchingService } from "../matching/matching.service";
import { CreateSightingDto } from "./dto/create-sighting.dto";
import { QuerySightingsDto } from "./dto/query-sightings.dto";
import { UpdateSightingDto } from "./dto/update-sighting.dto";
import { SightingResponse } from "./entities/sighting.entity";
import { SightingsRepository } from "./sightings.repository";

type SightingWithReporter = AnimalSighting & {
  reporter?: { id: string; displayName: string } | null;
};

@Injectable()
export class SightingsService {
  constructor(
    private readonly sightingsRepository: SightingsRepository,
    private readonly matchingService: MatchingService,
  ) {}

  async create(dto: CreateSightingDto, user: AuthenticatedUser) {
    const sighting = await this.sightingsRepository.create({
      reporterId: user.id,
      species: dto.species,
      color: dto.color,
      pattern: dto.pattern,
      description: dto.description,
      status: dto.status,
      urgency: dto.urgency,
      exactLatitude: dto.latitude,
      exactLongitude: dto.longitude,
      publicLatitude: approximateCoordinate(dto.latitude),
      publicLongitude: approximateCoordinate(dto.longitude),
      seenAt: new Date(dto.seenAt),
      photoUrls: dto.photoUrls ?? [],
    });

    await this.matchingService.runForNewSighting(sighting.id);
    return this.serialize(sighting, user);
  }

  async list(query: QuerySightingsDto, user?: AuthenticatedUser) {
    const where: Prisma.AnimalSightingWhereInput = {
      species: query.species,
      status: query.status,
      urgency: query.urgency,
      verificationStatus: query.verificationStatus ?? VerificationStatus.VERIFIED,
      seenAt: this.dateRange(query.from, query.to),
    };

    const result = await this.sightingsRepository.list(where, query.page, query.pageSize);
    return {
      items: result.items.map((item) => this.serialize(item, user)),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
      },
    };
  }

  async get(id: string, user?: AuthenticatedUser) {
    const sighting = await this.sightingsRepository.findById(id);
    if (!sighting) {
      throw new NotFoundException("Sighting not found");
    }

    if (!user && sighting.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new NotFoundException("Sighting not found");
    }

    return this.serialize(sighting, user);
  }

  async update(id: string, dto: UpdateSightingDto, user: AuthenticatedUser) {
    const sighting = await this.sightingsRepository.findById(id);
    if (!sighting) {
      throw new NotFoundException("Sighting not found");
    }

    const ownsReport = sighting.reporterId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isAdmin && (!ownsReport || sighting.verificationStatus !== VerificationStatus.PENDING)) {
      throw new ForbiddenException("Only pending reports owned by you can be edited");
    }

    const locationPatch =
      dto.latitude !== undefined && dto.longitude !== undefined
        ? {
            exactLatitude: dto.latitude,
            exactLongitude: dto.longitude,
            publicLatitude: approximateCoordinate(dto.latitude),
            publicLongitude: approximateCoordinate(dto.longitude),
          }
        : {};

    const updated = await this.sightingsRepository.update(id, {
      species: dto.species,
      color: dto.color,
      pattern: dto.pattern,
      description: dto.description,
      status: dto.status,
      urgency: dto.urgency,
      seenAt: dto.seenAt ? new Date(dto.seenAt) : undefined,
      photoUrls: dto.photoUrls,
      ...locationPatch,
    });

    return this.serialize(updated, user);
  }

  async delete(id: string, user: AuthenticatedUser) {
    const sighting = await this.sightingsRepository.findById(id);
    if (!sighting) {
      throw new NotFoundException("Sighting not found");
    }

    if (user.role !== UserRole.ADMIN && sighting.reporterId !== user.id) {
      throw new ForbiddenException("Only admins or owners can delete reports");
    }

    await this.sightingsRepository.delete(id);
    return { success: true };
  }

  async verify(id: string, user: AuthenticatedUser) {
    this.assertAdmin(user);
    const sighting = await this.sightingsRepository.setVerificationStatus(id, VerificationStatus.VERIFIED);
    return this.serialize(sighting, user);
  }

  async reject(id: string, user: AuthenticatedUser) {
    this.assertAdmin(user);
    const sighting = await this.sightingsRepository.setVerificationStatus(id, VerificationStatus.REJECTED);
    return this.serialize(sighting, user);
  }

  async markDuplicate(id: string, user: AuthenticatedUser) {
    this.assertAdmin(user);
    const sighting = await this.sightingsRepository.setVerificationStatus(id, VerificationStatus.DUPLICATE);
    return this.serialize(sighting, user);
  }

  serialize(sighting: SightingWithReporter, user?: AuthenticatedUser | null): SightingResponse {
    const showExact = canViewExactLocation(user);
    const response: SightingResponse = {
      id: sighting.id,
      species: sighting.species,
      color: sighting.color,
      pattern: sighting.pattern,
      description: sighting.description,
      status: sighting.status,
      urgency: sighting.urgency,
      verificationStatus: sighting.verificationStatus,
      photoUrls: sighting.photoUrls,
      location: {
        latitude: Number(sighting.publicLatitude),
        longitude: Number(sighting.publicLongitude),
        isExact: false,
      },
      seenAt: sighting.seenAt,
      createdAt: sighting.createdAt,
      reporter: sighting.reporter ?? null,
    };

    if (showExact) {
      response.exactLocation = {
        latitude: Number(sighting.exactLatitude),
        longitude: Number(sighting.exactLongitude),
      };
      response.location = {
        latitude: Number(sighting.exactLatitude),
        longitude: Number(sighting.exactLongitude),
        isExact: true,
      };
    }

    return response;
  }

  private assertAdmin(user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN) {
      throw new UnprocessableEntityException("Admin role required");
    }
  }

  private dateRange(from?: string, to?: string) {
    if (!from && !to) {
      return undefined;
    }

    return {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };
  }
}
