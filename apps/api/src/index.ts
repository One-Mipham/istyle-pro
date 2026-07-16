import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { styleRoutes } from './routes/styles.js';
import { uploadRoutes } from './routes/upload.js';
import { generateRoutes } from './routes/generate.js';
import { paymentRoutes } from './routes/payment.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

const app = Fastify({ logger: true, bodyLimit: 5 * 1024 * 1024 }); // 5MB max body

await app.register(cors, {
  origin: [
    'http://localhost:8081',          // Expo web dev
    'http://localhost:19006',         // Expo web alt
    'capacitor://localhost',          // Capacitor mobile
    'https://istyle.app',             // production web
  ],
  credentials: true,
});

app.setErrorHandler(errorHandler);

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip,
});

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(userRoutes, { prefix: '/api/users' });
await app.register(styleRoutes, { prefix: '/api/styles' });
await app.register(uploadRoutes, { prefix: '/api/upload' });
await app.register(generateRoutes, { prefix: '/api/generate' });
await app.register(paymentRoutes, { prefix: '/api/payment' });

try {
  await app.listen({ port: config.PORT, host: config.HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
