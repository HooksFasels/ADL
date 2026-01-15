import { comparePassword, hashPassword } from '@/utils/password.util';
import type { UserRole } from '@/modules/auth/auth.types';

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static createNew(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
  }): User {
    return new User(
      '',
      data.name,
      data.email,
      data.role,
      data.isActive,
      data.passwordHash,
      new Date(),
      new Date(),
    );
  }

  async verifyPassword(password: string): Promise<boolean> {
    return comparePassword(password, this.passwordHash);
  }
  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }
  async createNew(data: any): Promise<User> {
    return new User(
      data.id,
      data.name,
      data.email,
      data.role,
      data.isActive,
      data.passwordHash,
      data.createdAt,
      data.updatedAt,
    );
  }

  hasEmail(email: string): boolean {
    return this.email === email;
  }
}
