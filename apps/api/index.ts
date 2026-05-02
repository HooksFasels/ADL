import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import v1Router from './src/routes/index';
import { errorHandler } from './src/middlewares/error.middleware';
import { ApiError } from './src/utils/ApiError';
import { connectKafka, isKafkaConnected } from './src/config/kafka';
import { connectRedis, redisClient } from './config/redis.config';
import { prismaService } from './src/config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(express.json());
app.use(cors());

const databaseStatus = async () =>
  prismaService.getClient().$queryRaw`SELECT 1`
    .then(() => 'UP' as const)
    .catch(() => 'DOWN' as const);

const redisStatus = async () =>
  Promise.resolve(
    redisClient.isOpen
      ? redisClient
          .ping()
          .then(() => 'UP' as const)
          .catch(() => 'DOWN' as const)
      : ('DOWN' as const),
  );

const kafkaStatus = async () => (isKafkaConnected() ? ('UP' as const) : ('DOWN' as const));

app.get('/health', async (_req, res) => {
  const [database, redis, kafka] = await Promise.all([
    databaseStatus(),
    redisStatus(),
    kafkaStatus(),
  ]);
  const api = 'UP';
  const overallHealthy = api === 'UP' && database === 'UP' && redis === 'UP';

  res.status(overallHealthy ? 200 : 503).json({
    status: overallHealthy ? 'UP' : 'DEGRADED',
    module: 'ADL-API',
    services: {
      api,
      database,
      redis,
      kafka,
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/api', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    module: 'ADL-API',
    service: 'api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/database', async (_req, res) => {
  const database = await databaseStatus();

  res.status(database === 'UP' ? 200 : 503).json({
    status: database,
    module: 'ADL-API',
    service: 'database',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/redis', async (_req, res) => {
  const redis = await redisStatus();

  res.status(redis === 'UP' ? 200 : 503).json({
    status: redis,
    module: 'ADL-API',
    service: 'redis',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/kafka', async (_req, res) => {
  const kafka = await kafkaStatus();

  res.status(kafka === 'UP' ? 200 : 503).json({
    status: kafka,
    module: 'ADL-API',
    service: 'kafka',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', v1Router);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  await Promise.allSettled([connectRedis(), connectKafka()]);

  app.listen(PORT, () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
    console.log(`📍 API Base: http://localhost:${PORT}/api/v1`);
  });
};

void startServer();
