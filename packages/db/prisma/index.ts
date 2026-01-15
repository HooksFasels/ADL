import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

export class PrismaService {
  private readonly prisma: PrismaClient;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/app_db';
    const adapter = new PrismaPg({connectionString});
    this.prisma = new PrismaClient({ adapter });
  }

  async connect() {
    await this.prisma.$connect();
    console.log('✅ Prisma connected');
  }

  async disconnect() {
    await this.prisma.$disconnect();
    console.log('🔴 Prisma disconnected');
  }

  getClient(): PrismaClient {
    return this.prisma;
  }
}

export { PrismaClient } from '../generated/prisma/client';
export * from '../generated/prisma/enums';
