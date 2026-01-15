import { hashPassword } from '@/utils/password.util';
import { SUCCESS_CODES } from '@/modules/auth/auth.constants';
import { AppError } from '@/errors/AppError';
import type { PrismaClient } from 'db/client';
import type { RedisClientType } from 'redis';
import type { RegisterUser } from './auth.types';
import { UserRepository } from '@/repositories/user.repository';
import { ERRORCODES } from '@/modules/auth/auth.constants';
import { User } from '@/entities/user.entity';

export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: RedisClientType,
    private readonly userRepository: UserRepository,
  ) {}
  async login(data: { email: string; password: string }) {
    return {
      message: SUCCESS_CODES.MESSAGE_SENT,
      email: data.email,
    };
  }

  async register(data: RegisterUser) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(ERRORCODES.USER_ALREADY_EXISTS, 409, 'USER_ALREADY_EXISTS');
    }
    const hashedPassword = await hashPassword(data.password);

    const user = User.createNew({
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role,
      isActive: true,
    });

    const savedUser = await this.userRepository.create(user);

    return {
      message: SUCCESS_CODES.USER_REGISTERED,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
    };
  }
}
