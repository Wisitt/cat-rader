import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { LostPet, UserRole } from "@prisma/client";
import { approximateCoordinate, canViewExactLocation } from "../common/privacy";
import { AuthenticatedUser } from "../common/types/request-user.type";
import { MatchingService } from "../matching/matching.service";
import { CreateLostPetDto } from "./dto/create-lost-pet.dto";
import { UpdateLostPetDto } from "./dto/update-lost-pet.dto";
import { LostPetResponse } from "./entities/lost-pet.entity";
import { LostPetsRepository } from "./lost-pets.repository";

@Injectable()
export class LostPetsService {
  constructor(
    private readonly lostPetsRepository: LostPetsRepository,
    private readonly matchingService: MatchingService,
  ) {}

  async create(dto: CreateLostPetDto, user: AuthenticatedUser) {
    const lostPet = await this.lostPetsRepository.create({
      ownerId: user.id,
      petName: dto.petName,
      species: dto.species,
      color: dto.color,
      pattern: dto.pattern,
      description: dto.description,
      hasCollar: dto.hasCollar,
      exactLatitude: dto.latitude,
      exactLongitude: dto.longitude,
      publicLatitude: approximateCoordinate(dto.latitude),
      publicLongitude: approximateCoordinate(dto.longitude),
      lastSeenAt: new Date(dto.lastSeenAt),
      photoUrls: dto.photoUrls ?? [],
    });

    const matches = await this.matchingService.runForLostPet(lostPet.id);
    return {
      lostPet: this.serialize(lostPet, user),
      matches,
    };
  }

  async list(user?: AuthenticatedUser) {
    const where = user?.role === UserRole.ADMIN ? {} : { status: "ACTIVE" as const };
    const lostPets = await this.lostPetsRepository.list(where);
    return lostPets.map((lostPet) => this.serialize(lostPet, user));
  }

  async get(id: string, user?: AuthenticatedUser) {
    const lostPet = await this.lostPetsRepository.findById(id);
    if (!lostPet) {
      throw new NotFoundException("Lost pet not found");
    }

    return this.serialize(lostPet, user);
  }

  async update(id: string, dto: UpdateLostPetDto, user: AuthenticatedUser) {
    const lostPet = await this.lostPetsRepository.findById(id);
    if (!lostPet) {
      throw new NotFoundException("Lost pet not found");
    }

    if (lostPet.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only the owner or an admin can update this lost pet post");
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

    const updated = await this.lostPetsRepository.update(id, {
      petName: dto.petName,
      species: dto.species,
      color: dto.color,
      pattern: dto.pattern,
      description: dto.description,
      hasCollar: dto.hasCollar,
      photoUrls: dto.photoUrls,
      status: dto.status,
      lastSeenAt: dto.lastSeenAt ? new Date(dto.lastSeenAt) : undefined,
      ...locationPatch,
    });

    return this.serialize(updated, user);
  }

  runMatching(id: string) {
    return this.matchingService.runForLostPet(id);
  }

  getMatches(id: string) {
    return this.matchingService.forLostPet(id);
  }

  private serialize(lostPet: LostPet, user?: AuthenticatedUser | null): LostPetResponse {
    const showExact = canViewExactLocation(user) || lostPet.ownerId === user?.id;
    const response: LostPetResponse = {
      id: lostPet.id,
      petName: lostPet.petName,
      species: lostPet.species,
      color: lostPet.color,
      pattern: lostPet.pattern,
      description: lostPet.description,
      hasCollar: lostPet.hasCollar,
      status: lostPet.status,
      photoUrls: lostPet.photoUrls,
      location: {
        latitude: Number(lostPet.publicLatitude),
        longitude: Number(lostPet.publicLongitude),
        isExact: false,
      },
      lastSeenAt: lostPet.lastSeenAt,
      createdAt: lostPet.createdAt,
    };

    if (showExact) {
      response.exactLocation = {
        latitude: Number(lostPet.exactLatitude),
        longitude: Number(lostPet.exactLongitude),
      };
      response.location = {
        latitude: Number(lostPet.exactLatitude),
        longitude: Number(lostPet.exactLongitude),
        isExact: true,
      };
    }

    return response;
  }
}
