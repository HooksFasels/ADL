import type { PrismaClient } from 'db/client';
import type { Repository } from '@/core/repository.interface';
import { User } from '@/entities/user.entity';

export class UserRepository implements Repository<User> {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.toEntity(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!record) return null;

    return this.toEntity(record);
  }

  async create(user: User): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
      },
    });

    return this.toEntity(record);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
      },
    });

    return this.toEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private toEntity(record: any): User {
    return new User(
      record.id,
      record.name,
      record.email,
      record.role,
      record.isActive,
      record.password,
      record.createdAt,
      record.updatedAt,
    );
  }
}
