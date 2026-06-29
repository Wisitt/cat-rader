import { Injectable, NotFoundException } from "@nestjs/common";
import { User, UserRole } from "@prisma/client";
import { SafeUser } from "./entities/user.entity";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email.endsWith("@oauth.petradar.local") ? "" : user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? undefined,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async findByIdOrThrow(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async list() {
    const users = await this.usersRepository.list();
    return users.map((user) => this.toSafeUser(user));
  }

  async updateRole(userId: string, role: UserRole) {
    const user = await this.usersRepository.updateRole(userId, role);
    return this.toSafeUser(user);
  }
}
