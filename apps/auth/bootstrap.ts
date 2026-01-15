import 'dotenv/config';
import { App } from './app';
import { RedisClient } from '@/config/redis';
import { PrismaService } from 'db/client';
import { ERRORCODES } from '@/modules/auth/auth.constants';
import { UserRepository } from '@/repositories/user.repository';

async function bootstrap() {
  try {
    const redis = new RedisClient(process.env.REDIS_URL as string);
    await redis.connect();
    const prisma = new PrismaService();
    await prisma.connect();
    const userRepository = new UserRepository(prisma.getClient());

    const app = new App(redis, prisma, userRepository);
    app.start();

    process.on('SIGINT', async () => {
      await redis.disconnect();
      await prisma.disconnect();
      process.exit(0);
    });
  } catch (err) {
    console.error(ERRORCODES.FAILED_TO_START, err);
    process.exit(1);
  }
}

bootstrap();
