import { Injectable } from "@nestjs/common";
import { AuthProvider, Prisma, UserRole } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  list() {
    return this.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findByAuthAccount(provider: AuthProvider, providerAccountId: string) {
    return this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: { user: true },
    });
  }

  linkAuthAccount(data: {
    userId: string;
    provider: AuthProvider;
    providerAccountId: string;
    avatarUrl?: string;
  }) {
    return this.prisma.user.update({
      where: { id: data.userId },
      data: {
        avatarUrl: data.avatarUrl,
        authAccounts: {
          create: {
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        },
      },
    });
  }

  createAuthHandoff(data: {
    userId: string;
    tokenHash: string;
    returnTo: string;
    expiresAt: Date;
  }) {
    return this.prisma.authHandoff.create({ data });
  }

  async consumeAuthHandoff(tokenHash: string) {
    return this.prisma.$transaction(async (tx) => {
      const handoff = await tx.authHandoff.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
      if (!handoff || handoff.consumedAt || handoff.expiresAt <= new Date()) return null;

      const consumed = await tx.authHandoff.updateMany({
        where: { id: handoff.id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      return consumed.count === 1 ? handoff : null;
    });
  }

  updateRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  updateRole(userId: string, role: UserRole) {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }
}
