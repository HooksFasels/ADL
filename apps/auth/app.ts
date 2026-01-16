import { Server } from './server';
import dotenv from 'dotenv';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthController } from '@/modules/auth/auth.controller';
import { createAuthRoutes } from '@/modules/auth/auth.routes';
import { RedisClient } from '@/config/redis';
import { PrismaService } from 'db/client';
import { UserRepository } from '@/repositories/user.repository';
import { JwtService } from '@/config/jwt';
dotenv.config();

export class App {
  private readonly server: Server;

  constructor(redis: RedisClient, prisma: PrismaService, userRepository: UserRepository, jwtService: JwtService) {
    const prismaClient = prisma.getClient();
    const redisClient = redis.getClient();
    const port = Number(process.env.AUTH_PORT) || Number(process.env.PORT) || 3006;
    this.server = new Server(port);
    const authService = new AuthService(prismaClient, redisClient, userRepository, jwtService);
    const authController = new AuthController(authService);
    const authRoutes = createAuthRoutes(authController);

    this.server.getApp().use('/api/auth', authRoutes);
  }

  public start() {
    this.server.start();
  }
}
