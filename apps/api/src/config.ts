import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  REPLICATE_API_TOKEN: z.string(),
  REPLICATE_MODEL: z.string().default('prunaai/z-image-turbo-img2img'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  WEEKLY_COST_LIMIT_USD: z.coerce.number().default(100),
});

export const config = envSchema.parse(process.env);
