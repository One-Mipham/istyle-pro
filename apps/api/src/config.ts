import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  REPLICATE_API_TOKEN: z.string().min(1),
  REPLICATE_MODEL: z.string().default('prunaai/z-image-turbo-img2img'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  WEEKLY_COST_LIMIT_USD: z.coerce.number().default(100),
  WECHAT_PAY_MCH_ID: z.string().optional(),
  WECHAT_PAY_API_KEY: z.string().optional(),
  WECHAT_PAY_NOTIFY_URL: z.string().url().default('https://istyle.app/api/payment/notify'),
  // Tencent Hunyuan (primary — 国内首选)
  TENCENT_SECRET_ID: z.string().optional(),
  TENCENT_SECRET_KEY: z.string().optional(),
  HUNYUAN_MODEL: z.string().default('hunyuan-image'),
  AI_PROVIDER: z.enum(['hunyuan', 'replicate', 'auto']).default('auto'),
});

export const config = envSchema.parse(process.env);
