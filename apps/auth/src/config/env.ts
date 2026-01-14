import 'dotenv/config';
import { z } from 'zod';
import { ERRORCODES } from '@/modules/auth/auth.constants';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  REDIS_URL: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(ERRORCODES.INVALID_ENV, parsed.error.flatten().fieldErrors);
  throw new Error(ERRORCODES.INVALID_ENV);
}

export const env = parsed.data;
