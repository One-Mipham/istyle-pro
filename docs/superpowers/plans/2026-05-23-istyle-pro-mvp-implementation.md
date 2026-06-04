# iStyle Pro MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered virtual try-on mobile app where users upload a full-body photo, select clothing/hair styles, and receive AI-generated photorealistic images of themselves in the selected outfits.

**Architecture:** Monorepo with Expo React Native mobile app and Fastify API server. The API handles auth (Supabase), photo uploads, and AI image generation via Replicate API with BullMQ async job processing. Shared TypeScript types ensure consistency across frontend and backend.

**Tech Stack:** Expo Router (React Native), Fastify (Node.js 22+), TypeScript strict, Supabase (Auth + PostgreSQL + Storage), Replicate API (virtual try-on models), BullMQ + Redis

---

## File Structure

```
iStyle-Pro/
├── packages/shared/
│   ├── src/types.ts          # Shared TypeScript types
│   ├── src/constants.ts      # Style categories, API endpoints
│   └── package.json
├── apps/api/
│   ├── src/index.ts          # Fastify server entry
│   ├── src/config.ts         # Environment config
│   ├── src/lib/
│   │   ├── supabase.ts       # Supabase client (auth + db + storage)
│   │   ├── replicate.ts      # Replicate API client
│   │   ├── quota.ts          # Daily quota checker
│   │   └── queue.ts          # BullMQ setup
│   ├── src/routes/
│   │   ├── auth.ts           # POST /register, POST /login
│   │   ├── users.ts          # GET/PATCH /users/me
│   │   ├── styles.ts         # GET /styles
│   │   ├── upload.ts         # POST /upload
│   │   └── generate.ts       # POST /generate, GET /generate/:taskId
│   ├── src/middleware/
│   │   ├── auth.ts           # JWT verification hook
│   │   └── error-handler.ts  # Global error formatter
│   ├── src/workers/
│   │   └── generate.worker.ts # BullMQ background processor
│   └── src/seed/
│       └── style-templates.ts # MVP 3 clothing + 1 hair style templates
├── apps/mobile/
│   ├── app/
│   │   ├── _layout.tsx        # Root layout (providers)
│   │   ├── onboarding.tsx     # 3-screen onboarding
│   │   ├── (auth)/
│   │   │   ├── register.tsx
│   │   │   └── login.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx    # Tab navigator
│   │   │   ├── index.tsx      # Home (dual entry)
│   │   │   ├── explore.tsx    # Style browsing
│   │   │   ├── history.tsx    # Generation history
│   │   │   └── profile.tsx    # User profile + subscription
│   │   ├── camera.tsx         # Full-body photo capture
│   │   ├── generate.tsx       # Generation in progress
│   │   └── result.tsx         # Before/After reveal
│   ├── components/
│   │   ├── StyleCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── BeforeAfter.tsx
│   │   ├── QuotaBadge.tsx
│   │   ├── ImageUploader.tsx
│   │   └── GenerationProgress.tsx
│   ├── lib/
│   │   ├── api.ts             # API client (fetch wrapper)
│   │   ├── auth.ts            # Supabase auth hook
│   │   ├── quota.ts           # Client-side quota state
│   │   └── storage.ts         # Image caching utilities
│   └── app.json               # Expo config
└── .github/
    └── workflows/
        └── ci.yml             # Lint + typecheck + test
```

---

## Phase 0: Monorepo Scaffolding

### Task 0.1: Initialize pnpm workspace and shared package

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/index.ts`
- Create: `.gitignore`
- Create: `tsconfig.base.json`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "istyle-pro",
  "private": true,
  "scripts": {
    "dev:api": "pnpm --filter @istyle/api dev",
    "dev:mobile": "pnpm --filter @istyle/mobile start",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create packages/shared/package.json**

```json
{
  "name": "@istyle/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 5: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create packages/shared/src/types.ts**

```typescript
// ── User ──
export interface UserProfile {
  id: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  preferredStyles: StyleCategory[];
  avatarUrl: string | null;
  createdAt: string;
}

// ── Style Templates ──
export type StyleCategory = 'hair' | 'clothing' | 'shoes' | 'hat';
export type Scene = 'work' | 'sport' | 'casual' | 'ceremony' | 'daily';
export type AgeGroup = 'kids' | 'teen' | 'young' | 'middle' | 'senior';

export interface StyleTemplate {
  id: string;
  category: StyleCategory;
  scene: Scene;
  style: string;
  ageGroup: AgeGroup;
  name: string;
  previewUrl: string;
  sortOrder: number;
  isActive: boolean;
}

// ── Generations ──
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationRecord {
  id: string;
  userId: string;
  originalImageUrl: string;
  resultImageUrl: string | null;
  styleTemplateIds: string[];
  status: GenerationStatus;
  createdAt: string;
}

export interface GenerateRequest {
  originalImageUrl: string;
  styleTemplateIds: string[];
}

export interface GenerateResponse {
  taskId: string;
  status: GenerationStatus;
}

// ── Subscription ──
export type PlanTier = 'free' | 'pro_monthly' | 'pro_yearly';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  status: 'active' | 'cancelled' | 'expired';
  dailyRemaining: number;
  startedAt: string;
  expiresAt: string | null;
}

// ── API ──
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

- [ ] **Step 7: Create packages/shared/src/constants.ts**

```typescript
export const DAILY_FREE_QUOTA = 3;

export const STYLE_CATEGORIES = ['hair', 'clothing'] as const;

export const SCENES: Record<string, string> = {
  work: '职业',
  sport: '运动',
  casual: '休闲',
} as const;

export const AGE_GROUPS: Record<string, string> = {
  young: '青年',
  middle: '中年',
} as const;

export const GENERATION_TIMEOUT_MS = 60_000;
export const POLL_INTERVAL_MS = 2_000;
export const MAX_RETRIES = 3;
```

- [ ] **Step 8: Create packages/shared/src/index.ts**

```typescript
export * from './types.js';
export * from './constants.js';
```

- [ ] **Step 9: Create .gitignore**

```
node_modules/
dist/
.expo/
.env
.env.local
*.log
.DS_Store
```

- [ ] **Step 10: Install dependencies and commit**

```bash
cd /Users/sarvadaya/Rismed_Ronxin_Capital/One_Mipham_Corporation/iStyle-Pro
pnpm install
git add -A && git commit -m "feat: initialize pnpm monorepo with @istyle/shared package"
```

---

### Task 0.2: Scaffold API server

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/config.ts`

- [ ] **Step 1: Create apps/api/package.json**

```json
{
  "name": "@istyle/api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@istyle/shared": "workspace:*",
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/multipart": "^9.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "bullmq": "^5.34.0",
    "ioredis": "^5.4.0",
    "replicate": "^1.0.0",
    "zod": "^3.23.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create apps/api/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["src"],
  "references": [{ "path": "../../packages/shared" }]
}
```

- [ ] **Step 3: Create apps/api/src/config.ts**

```typescript
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  REPLICATE_API_TOKEN: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  WEEKLY_COST_LIMIT_USD: z.coerce.number().default(100),
});

export const config = envSchema.parse(process.env);
```

- [ ] **Step 4: Create apps/api/src/index.ts**

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { styleRoutes } from './routes/styles.js';
import { uploadRoutes } from './routes/upload.js';
import { generateRoutes } from './routes/generate.js';

const app = Fastify({ logger: true });

await app.register(cors);
app.setErrorHandler(errorHandler);

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(userRoutes, { prefix: '/api/users' });
await app.register(styleRoutes, { prefix: '/api/styles' });
await app.register(uploadRoutes, { prefix: '/api/upload' });
await app.register(generateRoutes, { prefix: '/api/generate' });

try {
  await app.listen({ port: config.PORT, host: config.HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
```

- [ ] **Step 5: Install and commit**

```bash
pnpm install
git add -A && git commit -m "feat: scaffold Fastify API server with config and entry"
```

---

### Task 0.3: Initialize Expo mobile app

**Files:**
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: Create apps/mobile/app.json**

```json
{
  "expo": {
    "name": "iStyle Pro",
    "slug": "istyle-pro",
    "version": "0.1.0",
    "orientation": "portrait",
    "scheme": "istyle",
    "plugins": [
      "expo-router",
      "expo-camera"
    ],
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "iStyle Pro needs camera access to take your full-body photo for AI styling."
      }
    },
    "android": {
      "permissions": ["CAMERA"],
      "adaptiveIcon": {
        "backgroundColor": "#0F172A"
      }
    }
  }
}
```

- [ ] **Step 2: Create apps/mobile/package.json**

```json
{
  "name": "@istyle/mobile",
  "version": "0.1.0",
  "type": "module",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "lint": "tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@istyle/shared": "workspace:*",
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-camera": "~16.0.0",
    "expo-image-picker": "~16.0.0",
    "expo-media-library": "~17.0.0",
    "expo-file-system": "~18.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "react-native-safe-area-context": "~4.12.0",
    "react-native-screens": "~4.0.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0",
    "@react-native-async-storage/async-storage": "~2.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "typescript": "^5.5.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create apps/mobile/tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"],
      "@istyle/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

- [ ] **Step 4: Create apps/mobile/app/_layout.tsx**

```typescript
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="generate" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
```

- [ ] **Step 5: Install and commit**

```bash
pnpm install
git add -A && git commit -m "feat: scaffold Expo mobile app with root layout"
```

---

## Phase 1: Backend Core

### Task 1.1: Supabase client + auth middleware

**Files:**
- Create: `apps/api/src/lib/supabase.ts`
- Create: `apps/api/src/middleware/auth.ts`

- [ ] **Step 1: Create apps/api/src/lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

export const supabaseAdmin = supabase;
```

- [ ] **Step 2: Create apps/api/src/middleware/auth.ts**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'unauthorized', message: 'Missing token', statusCode: 401 });
  }

  const token = header.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: 'unauthorized', message: 'Invalid token', statusCode: 401 });
  }

  request.userId = user.id;
}
```

- [ ] **Step 3: Add Fastify type augmentation — append to apps/api/src/index.ts**

In the existing `index.ts`, add before `const app = Fastify(...)`:

```typescript
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Supabase client and JWT auth middleware"
```

---

### Task 1.2: Error handler middleware

**Files:**
- Create: `apps/api/src/middleware/error-handler.ts`

- [ ] **Step 1: Create apps/api/src/middleware/error-handler.ts**

```typescript
import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'validation_error',
      message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
      statusCode: 400,
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.code ?? 'error',
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  return reply.status(500).send({
    error: 'internal_error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add global error handler with ZodError formatting"
```

---

### Task 1.3: Auth routes (register + login)

**Files:**
- Create: `apps/api/src/routes/auth.ts`

- [ ] **Step 1: Create apps/api/src/routes/auth.ts**

```typescript
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { DAILY_FREE_QUOTA } from '@istyle/shared';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().int().min(1).max(120),
  heightCm: z.number().int().min(50).max(250),
  weightKg: z.number().int().min(10).max(300),
  preferredStyles: z.array(z.enum(['casual', 'formal', 'sport'])).min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authError) {
      return reply.status(400).send({
        error: 'registration_failed',
        message: authError.message,
        statusCode: 400,
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: body.email,
        gender: body.gender,
        age: body.age,
        height_cm: body.heightCm,
        weight_kg: body.weightKg,
        preferred_styles: body.preferredStyles,
      })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return reply.status(400).send({
        error: 'profile_creation_failed',
        message: profileError.message,
        statusCode: 400,
      });
    }

    return reply.status(201).send({ user: mapProfile(profile) });
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return reply.status(401).send({
        error: 'login_failed',
        message: 'Invalid credentials',
        statusCode: 401,
      });
    }

    return reply.send({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    });
  });
};

function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    gender: row.gender,
    age: row.age,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    preferredStyles: row.preferred_styles,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add auth routes (register + login) with profile creation"
```

---

### Task 1.4: User profile routes

**Files:**
- Create: `apps/api/src/routes/users.ts`

- [ ] **Step 1: Create apps/api/src/routes/users.ts**

```typescript
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const updateSchema = z.object({
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().int().min(1).max(120).optional(),
  heightCm: z.number().int().min(50).max(250).optional(),
  weightKg: z.number().int().min(10).max(300).optional(),
  preferredStyles: z.array(z.enum(['casual', 'formal', 'sport'])).min(1).optional(),
});

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', authenticate);

  app.get('/me', async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select()
      .eq('id', request.userId)
      .single();

    if (error || !data) {
      return reply.status(404).send({ error: 'not_found', message: 'Profile not found', statusCode: 404 });
    }

    return reply.send({ user: mapProfile(data) });
  });

  app.patch('/me', async (request, reply) => {
    const body = updateSchema.parse(request.body);
    const fields: Record<string, unknown> = {};

    if (body.gender !== undefined) fields.gender = body.gender;
    if (body.age !== undefined) fields.age = body.age;
    if (body.heightCm !== undefined) fields.height_cm = body.heightCm;
    if (body.weightKg !== undefined) fields.weight_kg = body.weightKg;
    if (body.preferredStyles !== undefined) fields.preferred_styles = body.preferredStyles;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(fields)
      .eq('id', request.userId)
      .select()
      .single();

    if (error) {
      return reply.status(400).send({ error: 'update_failed', message: error.message, statusCode: 400 });
    }

    return reply.send({ user: mapProfile(data) });
  });
};

function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    gender: row.gender,
    age: row.age,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    preferredStyles: row.preferred_styles,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add user profile routes (GET/PATCH /users/me)"
```

---

### Task 1.5: Style templates route + seed data

**Files:**
- Create: `apps/api/src/routes/styles.ts`
- Create: `apps/api/src/seed/style-templates.ts`

- [ ] **Step 1: Create apps/api/src/seed/style-templates.ts**

```typescript
export const mvpStyleTemplates = [
  // Hair
  {
    category: 'hair',
    scene: 'casual',
    style: 'natural',
    age_group: 'young',
    name: '自然发型',
    preview_url: '/templates/hair-natural.jpg',
    prompt_extension: 'natural flowing hair, well-groomed, modern hairstyle',
    sort_order: 1,
  },
  // Clothing — Casual
  {
    category: 'clothing',
    scene: 'casual',
    style: 'casual',
    age_group: 'young',
    name: '休闲日常',
    preview_url: '/templates/casual-daily.jpg',
    prompt_extension: 'casual outfit, jeans and white t-shirt, relaxed fit, everyday wear, clean look',
    sort_order: 2,
  },
  // Clothing — Formal
  {
    category: 'clothing',
    scene: 'work',
    style: 'formal',
    age_group: 'young',
    name: '职业西装',
    preview_url: '/templates/formal-business.jpg',
    prompt_extension: 'professional business suit, tailored fit, navy blue, crisp white shirt, polished look',
    sort_order: 3,
  },
  // Clothing — Sport
  {
    category: 'clothing',
    scene: 'sport',
    style: 'sport',
    age_group: 'young',
    name: '运动套装',
    preview_url: '/templates/sport-active.jpg',
    prompt_extension: 'athletic wear, sports outfit, running gear, breathable fabric, dynamic fit',
    sort_order: 4,
  },
];
```

- [ ] **Step 2: Create apps/api/src/routes/styles.ts**

```typescript
import type { FastifyPluginAsync } from 'fastify';
import { mvpStyleTemplates } from '../seed/style-templates.js';

export const styleRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_request, reply) => {
    return reply.send({ styles: mvpStyleTemplates.map((t, i) => ({ id: `style-${i}`, ...t, isActive: true })) });
  });
};
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add style templates route with MVP seed data (1 hair + 3 clothing)"
```

---

### Task 1.6: Photo upload route

**Files:**
- Create: `apps/api/src/routes/upload.ts`

- [ ] **Step 1: Create apps/api/src/routes/upload.ts**

```typescript
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const uploadSchema = z.object({
  base64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', authenticate);

  app.post('/', async (request, reply) => {
    const body = uploadSchema.parse(request.body);

    const buffer = Buffer.from(body.base64, 'base64');
    const filePath = `${request.userId}/${Date.now()}.jpg`;

    const { data, error } = await supabaseAdmin.storage
      .from('user-photos')
      .upload(filePath, buffer, { contentType: body.mimeType, upsert: false });

    if (error) {
      return reply.status(500).send({ error: 'upload_failed', message: error.message, statusCode: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('user-photos').getPublicUrl(filePath);

    return reply.status(201).send({ url: urlData.publicUrl, path: filePath });
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add photo upload route with type validation"
```

---

### Task 1.7: Replicate client + quota module

**Files:**
- Create: `apps/api/src/lib/replicate.ts`
- Create: `apps/api/src/lib/quota.ts`

- [ ] **Step 1: Create apps/api/src/lib/replicate.ts**

```typescript
import Replicate from 'replicate';
import { config } from '../config.js';

export const replicate = new Replicate({ auth: config.REPLICATE_API_TOKEN });
```

- [ ] **Step 2: Create apps/api/src/lib/quota.ts**

```typescript
import { supabaseAdmin } from './supabase.js';
import { DAILY_FREE_QUOTA } from '@istyle/shared';
import type { PlanTier } from '@istyle/shared';

export async function checkAndReserveQuota(userId: string): Promise<{ allowed: boolean; remaining: number; tier: PlanTier }> {
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, daily_remaining')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (!sub) {
    const { data: newSub } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: userId, plan: 'free', daily_remaining: DAILY_FREE_QUOTA, status: 'active' })
      .select()
      .single();

    if (!newSub) {
      return { allowed: false, remaining: 0, tier: 'free' };
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({ daily_remaining: DAILY_FREE_QUOTA - 1 })
      .eq('id', newSub.id);

    return { allowed: true, remaining: DAILY_FREE_QUOTA - 1, tier: 'free' as PlanTier };
  }

  const tier = sub.plan as PlanTier;

  if (tier === 'free' && sub.daily_remaining <= 0) {
    return { allowed: false, remaining: 0, tier };
  }

  if (tier === 'free') {
    await supabaseAdmin
      .from('subscriptions')
      .update({ daily_remaining: sub.daily_remaining - 1 })
      .eq('user_id', userId);
    return { allowed: true, remaining: sub.daily_remaining - 1, tier };
  }

  return { allowed: true, remaining: -1, tier };
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Replicate client and daily quota checker with free tier"
```

---

### Task 1.8: BullMQ queue + generate worker

**Files:**
- Create: `apps/api/src/lib/queue.ts`
- Create: `apps/api/src/workers/generate.worker.ts`

- [ ] **Step 1: Create apps/api/src/lib/queue.ts**

```typescript
import { Queue } from 'bullmq';
import { config } from '../config.js';

export const generateQueue = new Queue('image-generation', {
  connection: { url: config.REDIS_URL },
});
```

- [ ] **Step 2: Create apps/api/src/workers/generate.worker.ts**

```typescript
import { Worker } from 'bullmq';
import { config } from '../config.js';
import { replicate } from '../lib/replicate.js';
import { supabaseAdmin } from '../lib/supabase.js';

interface GenerateJob {
  taskId: string;
  userId: string;
  originalImageUrl: string;
  styleTemplateIds: string[];
  prompt: string;
}

const worker = new Worker<GenerateJob>('image-generation', async (job) => {
  const { taskId, userId, originalImageUrl, styleTemplateIds, prompt } = job.data;

  await supabaseAdmin
    .from('generation_history')
    .update({ status: 'processing' })
    .eq('id', taskId);

  const output = await replicate.run(
    'stability-ai/stable-diffusion-xl',
    {
      input: {
        prompt,
        image: originalImageUrl,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }
  );

  const resultUrl = Array.isArray(output) ? output[0] : output;

  await supabaseAdmin
    .from('generation_history')
    .update({ result_image_url: resultUrl, status: 'completed' })
    .eq('id', taskId);

}, {
  connection: { url: config.REDIS_URL },
  concurrency: 3,
  attempts: 3,
});

worker.on('failed', async (job) => {
  if (job?.data) {
    const { taskId } = job.data as GenerateJob;
    await supabaseAdmin
      .from('generation_history')
      .update({ status: 'failed' })
      .eq('id', taskId);
  }
});

console.log('Generation worker started');
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add BullMQ queue and AI generation background worker"
```

---

### Task 1.9: Generate routes (submit + poll status)

**Files:**
- Create: `apps/api/src/routes/generate.ts`

- [ ] **Step 1: Create apps/api/src/routes/generate.ts**

```typescript
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { checkAndReserveQuota } from '../lib/quota.js';
import { generateQueue } from '../lib/queue.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { mvpStyleTemplates } from '../seed/style-templates.js';
import { GENERATION_TIMEOUT_MS } from '@istyle/shared';

const generateSchema = z.object({
  originalImageUrl: z.string().url(),
  styleTemplateIds: z.array(z.string()).min(1),
});

export const generateRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', authenticate);

  app.post('/', async (request, reply) => {
    const body = generateSchema.parse(request.body);
    const { allowed, remaining } = await checkAndReserveQuota(request.userId);

    if (!allowed) {
      return reply.status(429).send({
        error: 'quota_exceeded',
        message: 'Daily free quota exhausted. Upgrade to Pro for unlimited generations.',
        statusCode: 429,
      });
    }

    const styles = mvpStyleTemplates.filter((_, i) => body.styleTemplateIds.includes(`style-${i}`));
    const promptParts = styles.map(s => s.prompt_extension);
    const prompt = `virtual try-on, ${promptParts.join(', ')}, photorealistic, full body shot, standing pose, clean background, high quality`;

    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .insert({
        user_id: request.userId,
        original_image_url: body.originalImageUrl,
        style_template_ids: body.styleTemplateIds,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return reply.status(500).send({ error: 'creation_failed', message: error.message, statusCode: 500 });
    }

    await generateQueue.add('generate', {
      taskId: data.id,
      userId: request.userId,
      originalImageUrl: body.originalImageUrl,
      styleTemplateIds: body.styleTemplateIds,
      prompt,
    });

    return reply.status(201).send({ taskId: data.id, status: 'pending', remaining });
  });

  app.get('/:taskId', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };

    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .select()
      .eq('id', taskId)
      .eq('user_id', request.userId)
      .single();

    if (error || !data) {
      return reply.status(404).send({ error: 'not_found', message: 'Task not found', statusCode: 404 });
    }

    return reply.send({
      taskId: data.id,
      status: data.status,
      resultImageUrl: data.result_image_url,
    });
  });

  app.get('/history', async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .select()
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return reply.status(500).send({ error: 'fetch_failed', message: error.message, statusCode: 500 });
    }

    return reply.send({ data });
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add AI generation routes (submit + poll) with quota enforcement"
```

---

## Phase 2: Mobile App

### Task 2.1: API client + auth store

**Files:**
- Create: `apps/mobile/lib/api.ts`
- Create: `apps/mobile/lib/auth.ts`

- [ ] **Step 1: Create apps/mobile/lib/api.ts**

```typescript
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await res.json();

  if (!res.ok) {
    throw new ApiRequestError(body.message ?? 'Request failed', body.statusCode ?? res.status, body.error);
  }

  return body as T;
}

export class ApiRequestError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}
```

- [ ] **Step 2: Create apps/mobile/lib/auth.ts**

```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken } from './api';
import type { UserProfile } from '@istyle/shared';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  restore: () => Promise<void>;
}

interface RegisterInput {
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  preferredStyles: Array<'casual' | 'formal' | 'sport'>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await api<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    await AsyncStorage.setItem('auth_token', res.token);
    set({ user: res.user, token: res.token });
  },

  register: async (data) => {
    const res = await api<{ user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    set({ user: res.user });
  },

  logout: () => {
    setToken(null);
    AsyncStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  restore: async () => {
    try {
      const stored = await AsyncStorage.getItem('auth_token');
      if (!stored) return set({ isLoading: false });
      setToken(stored);
      const res = await api<{ user: UserProfile }>('/api/users/me');
      set({ user: res.user, token: stored, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add API client and Zustand auth store with token persistence"
```

---

### Task 2.2: Onboarding screen

**Files:**
- Create: `apps/mobile/app/onboarding.tsx`

- [ ] **Step 1: Create apps/mobile/app/onboarding.tsx**

```typescript
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/auth';

const STEPS = ['welcome', 'profile', 'camera-permission'] as const;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [preferredStyles, setPreferredStyles] = useState<string[]>(['casual']);
  const { register } = useAuth();

  const toggleStyle = (s: string) => {
    setPreferredStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  if (step === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>iStyle Pro</Text>
        <Text style={styles.subtitle}>你的私人 AI 形象顾问</Text>
        <Text style={styles.body}>拍照 → 30 秒 → 看到全新的自己</Text>
        <Pressable style={styles.button} onPress={() => setStep(1)}>
          <Text style={styles.buttonText}>开始</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skip}>跳过，先逛逛</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 1) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>完善档案</Text>
        <Text style={styles.body}>帮助 AI 更懂你</Text>

        <View style={styles.row}>
          {(['male', 'female', 'other'] as const).map(g => (
            <Pressable key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
              <Text style={gender === g ? styles.chipTextActive : styles.chipText}>
                {g === 'male' ? '男' : g === 'female' ? '女' : '其他'}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="年龄" keyboardType="numeric" value={age} onChangeText={setAge} />
        <TextInput style={styles.input} placeholder="身高 (cm)" keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} />
        <TextInput style={styles.input} placeholder="体重 (kg)" keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} />

        <Text style={styles.label}>偏好风格（可多选）</Text>
        <View style={styles.row}>
          {['casual', 'formal', 'sport'].map(s => (
            <Pressable key={s} style={[styles.chip, preferredStyles.includes(s) && styles.chipActive]} onPress={() => toggleStyle(s)}>
              <Text style={preferredStyles.includes(s) ? styles.chipTextActive : styles.chipText}>
                {s === 'casual' ? '休闲' : s === 'formal' ? '职业' : '运动'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.button} onPress={() => setStep(2)}>
          <Text style={styles.buttonText}>下一步</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>拍照权限</Text>
      <Text style={styles.body}>iStyle Pro 需要访问相机来拍摄你的全身照</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>允许并开始</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F172A', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8FAFC' },
  subtitle: { fontSize: 18, color: '#94A3B8' },
  body: { fontSize: 16, color: '#CBD5E1', textAlign: 'center' },
  label: { fontSize: 14, color: '#94A3B8', alignSelf: 'flex-start' },
  button: { backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skip: { color: '#64748B', marginTop: 12 },
  input: { width: '100%', backgroundColor: '#1E293B', borderRadius: 10, padding: 14, color: '#F8FAFC', fontSize: 16 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipText: { color: '#94A3B8' },
  chipTextActive: { color: '#fff' },
});
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add 3-step onboarding (welcome + profile + camera permission)"
```

---

### Task 2.3: Register and login screens

**Files:**
- Create: `apps/mobile/app/(auth)/register.tsx`
- Create: `apps/mobile/app/(auth)/login.tsx`
- Create: `apps/mobile/app/(auth)/_layout.tsx`

- [ ] **Step 1: Create apps/mobile/app/(auth)/_layout.tsx**

```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
```

- [ ] **Step 2: Create apps/mobile/app/(auth)/login.tsx**

```typescript
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  async function handleLogin() {
    try {
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>登录</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="邮箱" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholderTextColor="#64748B" />
      <TextInput style={styles.input} placeholder="密码" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#64748B" />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>登录</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>没有账号？注册</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0F172A', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8FAFC', textAlign: 'center' },
  error: { color: '#EF4444', textAlign: 'center' },
  input: { backgroundColor: '#1E293B', borderRadius: 10, padding: 14, color: '#F8FAFC', fontSize: 16 },
  button: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6366F1', textAlign: 'center', marginTop: 8 },
});
```

- [ ] **Step 3: Create apps/mobile/app/(auth)/register.tsx**

```typescript
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [preferredStyles, setPreferredStyles] = useState<string[]>(['casual']);
  const [error, setError] = useState('');
  const { register, login } = useAuth();

  const toggleStyle = (s: string) => {
    setPreferredStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  async function handleRegister() {
    try {
      setError('');
      await register({ email, password, gender, age: Number(age), heightCm: Number(heightCm), weightKg: Number(weightKg), preferredStyles: preferredStyles as Array<'casual' | 'formal' | 'sport'> });
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>注册</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="邮箱" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholderTextColor="#64748B" />
      <TextInput style={styles.input} placeholder="密码 (8位以上)" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#64748B" />

      <View style={styles.row}>
        {(['male', 'female', 'other'] as const).map(g => (
          <Pressable key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
            <Text style={gender === g ? styles.chipTextActive : styles.chipText}>{g === 'male' ? '男' : g === 'female' ? '女' : '其他'}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="年龄" keyboardType="numeric" value={age} onChangeText={setAge} placeholderTextColor="#64748B" />
      <TextInput style={styles.input} placeholder="身高 (cm)" keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} placeholderTextColor="#64748B" />
      <TextInput style={styles.input} placeholder="体重 (kg)" keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} placeholderTextColor="#64748B" />

      <Text style={styles.label}>偏好风格</Text>
      <View style={styles.row}>
        {['casual', 'formal', 'sport'].map(s => (
          <Pressable key={s} style={[styles.chip, preferredStyles.includes(s) && styles.chipActive]} onPress={() => toggleStyle(s)}>
            <Text style={preferredStyles.includes(s) ? styles.chipTextActive : styles.chipText}>{s === 'casual' ? '休闲' : s === 'formal' ? '职业' : '运动'}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>注册</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>已有账号？登录</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0F172A', gap: 14 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8FAFC', textAlign: 'center' },
  error: { color: '#EF4444', textAlign: 'center' },
  input: { backgroundColor: '#1E293B', borderRadius: 10, padding: 14, color: '#F8FAFC', fontSize: 16 },
  label: { fontSize: 14, color: '#94A3B8' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipText: { color: '#94A3B8' },
  chipTextActive: { color: '#fff' },
  button: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6366F1', textAlign: 'center' },
});
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add login and registration screens with full profile form"
```

---

### Task 2.4: Tab layout + quota badge component

**Files:**
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/components/QuotaBadge.tsx`
- Create: `apps/mobile/lib/quota.ts`

- [ ] **Step 1: Create apps/mobile/lib/quota.ts**

```typescript
import { create } from 'zustand';
import { DAILY_FREE_QUOTA } from '@istyle/shared';
import { api } from './api';

interface QuotaState {
  remaining: number;
  isLoading: boolean;
  fetchQuota: () => Promise<void>;
  decrement: () => void;
}

export const useQuota = create<QuotaState>((set) => ({
  remaining: DAILY_FREE_QUOTA,
  isLoading: false,
  fetchQuota: async () => {
    set({ isLoading: true });
    try {
      const res = await api<{ user: { subscription?: { dailyRemaining: number } } }>('/api/users/me');
      set({ remaining: res.user.subscription?.dailyRemaining ?? DAILY_FREE_QUOTA, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  decrement: () => set(state => ({ remaining: Math.max(0, state.remaining - 1) })),
}));
```

- [ ]	**Step 2: Create apps/mobile/components/QuotaBadge.tsx**

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useQuota } from '../lib/quota';

export function QuotaBadge() {
  const remaining = useQuota(s => s.remaining);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>今日剩余 {remaining} 次</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 16,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  text: { color: '#94A3B8', fontSize: 12 },
});
```

- [ ] **Step 3: Create apps/mobile/app/(tabs)/_layout.tsx**

```typescript
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: '#0F172A' },
      headerTintColor: '#F8FAFC',
      tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: '#1E293B' },
      tabBarActiveTintColor: '#6366F1',
      tabBarInactiveTintColor: '#64748B',
    }}>
      <Tabs.Screen name="index" options={{ title: '首页', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tabs.Screen name="explore" options={{ title: '探索', tabBarIcon: () => <Text>🎨</Text> }} />
      <Tabs.Screen name="history" options={{ title: '历史', tabBarIcon: () => <Text>📋</Text> }} />
      <Tabs.Screen name="profile" options={{ title: '我的', tabBarIcon: () => <Text>👤</Text> }} />
    </Tabs>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add tab navigation, quota badge, and client-side quota store"
```

---

### Task 2.5: Home screen with dual entry

**Files:**
- Create: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Create apps/mobile/app/(tabs)/index.tsx**

```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { QuotaBadge } from '../../components/QuotaBadge';
import { useQuota } from '../../lib/quota';
import { useEffect } from 'react';

export default function Home() {
  const { fetchQuota } = useQuota();
  useEffect(() => { fetchQuota(); }, []);

  return (
    <View style={styles.container}>
      <QuotaBadge />
      <Text style={styles.greeting}>iStyle Pro</Text>
      <Text style={styles.subtitle}>你的私人 AI 形象顾问</Text>

      <Pressable style={styles.primaryButton} onPress={() => router.push('/camera?mode=quick')}>
        <Text style={styles.primaryIcon}>📸</Text>
        <Text style={styles.primaryText}>快速试穿</Text>
        <Text style={styles.primaryHint}>拍照 → AI 推荐搭配</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.push('/explore')}>
        <Text style={styles.secondaryIcon}>🎨</Text>
        <Text style={styles.secondaryText}>风格探索</Text>
        <Text style={styles.secondaryHint}>浏览模板 → 选择生成</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F172A', gap: 20 },
  greeting: { fontSize: 32, fontWeight: '700', color: '#F8FAFC' },
  subtitle: { fontSize: 16, color: '#94A3B8' },
  primaryButton: { width: '100%', backgroundColor: '#6366F1', borderRadius: 16, padding: 24, alignItems: 'center', gap: 6 },
  primaryIcon: { fontSize: 32 },
  primaryText: { fontSize: 20, fontWeight: '600', color: '#fff' },
  primaryHint: { fontSize: 14, color: '#C7D2FE' },
  secondaryButton: { width: '100%', backgroundColor: '#1E293B', borderRadius: 16, padding: 24, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#334155' },
  secondaryIcon: { fontSize: 32 },
  secondaryText: { fontSize: 20, fontWeight: '600', color: '#F8FAFC' },
  secondaryHint: { fontSize: 14, color: '#94A3B8' },
});
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add home screen with dual-entry (quick try-on + style explore)"
```

---

### Task 2.6: Camera screen

**Files:**
- Create: `apps/mobile/app/camera.tsx`

- [ ] **Step 1: Create apps/mobile/app/camera.tsx**

```typescript
import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>需要相机权限</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>授权相机</Text>
        </Pressable>
      </View>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (photo?.uri) {
      setPhotoUri(photo.uri);
    }
  }

  function proceed() {
    if (!photoUri) return;
    router.push({ pathname: '/generate', params: { photoUri, source: 'quick' } });
  }

  function retake() {
    setPhotoUri(null);
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>照片已拍摄</Text>
        <Text style={styles.body}>请确认这是清晰的全身照</Text>
        <Pressable style={styles.button} onPress={proceed}>
          <Text style={styles.buttonText}>确认，开始生成</Text>
        </Pressable>
        <Pressable onPress={retake}>
          <Text style={styles.retake}>重拍</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.guide}>请站立在明亮处，拍摄全身照</Text>
        </View>
      </CameraView>
      <Pressable style={styles.captureButton} onPress={takePhoto}>
        <View style={styles.captureInner} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', gap: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  body: { fontSize: 16, color: '#94A3B8', textAlign: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: { position: 'absolute', top: 60, left: 24, right: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 12 },
  guide: { color: '#fff', fontSize: 16, textAlign: 'center' },
  captureButton: { position: 'absolute', bottom: 60, width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  button: { backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  retake: { color: '#64748B', fontSize: 16 },
  preview: { width: '100%', height: '60%', borderRadius: 16 },
});
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add camera screen with capture, preview, and retake flow"
```

---

### Task 2.7: Style card component + explore screen

**Files:**
- Create: `apps/mobile/components/StyleCard.tsx`
- Create: `apps/mobile/components/CategoryFilter.tsx`
- Create: `apps/mobile/app/(tabs)/explore.tsx`

- [ ] **Step 1: Create apps/mobile/components/StyleCard.tsx**

```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface StyleCardProps {
  name: string;
  category: string;
  scene: string;
  selected: boolean;
  onToggle: () => void;
}

export function StyleCard({ name, category, scene, selected, onToggle }: StyleCardProps) {
  const sceneLabel = { work: '职业', sport: '运动', casual: '休闲' }[scene] ?? scene;
  const catLabel = { hair: '发型', clothing: '服装' }[category] ?? category;

  return (
    <Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onToggle}>
      <View style={styles.preview}>
        <Text style={styles.previewText}>{name[0]}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.meta}>{catLabel} · {sceneLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '47%', backgroundColor: '#1E293B', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: '#6366F1' },
  preview: { height: 120, backgroundColor: '#334155', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  previewText: { fontSize: 48, color: '#94A3B8' },
  name: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 8 },
  meta: { color: '#64748B', fontSize: 12, marginTop: 4 },
});
```

- [ ] **Step 2: Create apps/mobile/components/CategoryFilter.tsx**

```typescript
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const FILTERS = [
  { key: null, label: '全部' },
  { key: 'hair', label: '发型' },
  { key: 'clothing', label: '服装' },
];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FILTERS.map(f => (
        <Pressable key={String(f.key)} style={[styles.chip, selected === f.key && styles.chipActive]} onPress={() => onSelect(f.key)}>
          <Text style={selected === f.key ? styles.chipTextActive : styles.chipText}>{f.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipText: { color: '#94A3B8', fontSize: 14 },
  chipTextActive: { color: '#fff', fontSize: 14 },
});
```

- [ ] **Step 3: Create apps/mobile/app/(tabs)/explore.tsx**

```typescript
import { useState, useEffect } from 'react';
import { View, FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { StyleCard } from '../../components/StyleCard';
import { CategoryFilter } from '../../components/CategoryFilter';
import type { StyleTemplate } from '@istyle/shared';

export default function Explore() {
  const [styles_, setStyles] = useState<StyleTemplate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    api<{ styles: StyleTemplate[] }>('/api/styles').then(res => setStyles(res.styles));
  }, []);

  const filteredStyles = filter ? styles_.filter(s => s.category === filter) : styles_;

  const toggleStyle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <CategoryFilter selected={filter} onSelect={setFilter} />
      <FlatList
        data={filteredStyles}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <StyleCard {...item} selected={selected.has(item.id)} onToggle={() => toggleStyle(item.id)} />
        )}
      />
      {selected.size > 0 && (
        <Pressable style={styles.fab} onPress={() => router.push({ pathname: '/camera', params: { mode: 'explore', styles: Array.from(selected).join(',') } })}>
          <Text style={styles.fabText}>已选 {selected.size} 项 · 去拍照</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  grid: { paddingHorizontal: 12 },
  fab: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add style card, category filter, and explore screen with multi-select"
```

---

### Task 2.8: Generation progress screen + BeforeAfter component

**Files:**
- Create: `apps/mobile/app/generate.tsx`
- Create: `apps/mobile/components/GenerationProgress.tsx`
- Create: `apps/mobile/components/BeforeAfter.tsx`

- [ ] **Step 1: Create apps/mobile/components/GenerationProgress.tsx**

```typescript
import { View, Text, StyleSheet } from 'react-native';

interface GenerationProgressProps {
  stage: 'uploading' | 'analyzing' | 'generating' | 'completed';
}

const STAGES: Array<{ key: GenerationProgressProps['stage']; label: string }> = [
  { key: 'uploading', label: '上传照片' },
  { key: 'analyzing', label: '分析体型特征' },
  { key: 'generating', label: 'AI 生成你的新形象' },
  { key: 'completed', label: '完成' },
];

export function GenerationProgress({ stage }: GenerationProgressProps) {
  return (
    <View style={styles.container}>
      {STAGES.map((s, i) => {
        const isCurrent = s.key === stage;
        const isDone = STAGES.findIndex(x => x.key === stage) > i;
        return (
          <View key={s.key} style={styles.row}>
            <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]} />
            <Text style={[styles.label, (isDone || isCurrent) && styles.labelActive]}>{s.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#334155' },
  dotDone: { backgroundColor: '#22C55E' },
  dotCurrent: { backgroundColor: '#6366F1' },
  label: { fontSize: 16, color: '#64748B' },
  labelActive: { color: '#F8FAFC' },
});
```

- [ ] **Step 2: Create apps/mobile/components/BeforeAfter.tsx**

```typescript
import { useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

interface BeforeAfterProps {
  beforeUri: string;
  afterUri: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BeforeAfter({ beforeUri, afterUri }: BeforeAfterProps) {
  const sliderX = useSharedValue(SCREEN_WIDTH / 2);

  const pan = Gesture.Pan().onUpdate((e) => {
    sliderX.value = Math.max(0, Math.min(SCREEN_WIDTH, e.absoluteX));
  });

  const afterStyle = useAnimatedStyle(() => ({
    width: sliderX.value,
    overflow: 'hidden',
  }));

  return (
    <View style={styles.container}>
      <Image source={{ uri: beforeUri }} style={styles.image} />
      <Animated.View style={[styles.overlay, afterStyle]}>
        <Image source={{ uri: afterUri }} style={styles.image} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.handle, { left: sliderX.value - 2 }]} />
      </GestureDetector>
      <View style={styles.labels}>
        <Text style={styles.label}>Before</Text>
        <Text style={styles.label}>After</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.3, position: 'relative' },
  image: { width: SCREEN_WIDTH, height: '100%', resizeMode: 'cover' },
  overlay: { position: 'absolute', top: 0, left: 0, height: '100%' },
  handle: { position: 'absolute', top: 0, width: 4, height: '100%', backgroundColor: '#fff' },
  labels: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 },
  label: { color: '#fff', fontSize: 14, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
});
```

- [ ] **Step 3: Create apps/mobile/app/generate.tsx**

```typescript
import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { api } from '../lib/api';
import { useQuota } from '../lib/quota';
import { GenerationProgress } from '../components/GenerationProgress';
import { POLL_INTERVAL_MS, GENERATION_TIMEOUT_MS } from '@istyle/shared';
import type { GenerateResponse, GenerationStatus } from '@istyle/shared';

export default function Generate() {
  const { photoUri, styles: styleParam } = useLocalSearchParams<{ photoUri: string; styles?: string }>();
  const [stage, setStage] = useState<GenerationStatus>('pending');
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [error, setError] = useState('');
  const taskIdRef = useRef<string | null>(null);
  const { decrement } = useQuota();

  useEffect(() => {
    submitAndPoll();
  }, []);

  async function submitAndPoll() {
    try {
      setStage('pending');

      const base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
      const uploadRes = await api<{ url: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ base64, mimeType: 'image/jpeg' }),
      });

      const styleIds = styleParam ? styleParam.split(',') : ['style-0', 'style-1'];
      const generateRes = await api<GenerateResponse>('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ originalImageUrl: uploadRes.url, styleTemplateIds: styleIds }),
      });

      taskIdRef.current = generateRes.taskId;
      setStage('processing');

      const startTime = Date.now();
      while (Date.now() - startTime < GENERATION_TIMEOUT_MS) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        const pollRes = await api<{ status: GenerationStatus; resultImageUrl: string | null }>(`/api/generate/${taskIdRef.current}`);

        if (pollRes.status === 'completed' && pollRes.resultImageUrl) {
          setStage('completed' as any);
          setResultUri(pollRes.resultImageUrl);
          decrement();
          return;
        }

        if (pollRes.status === 'failed') {
          setError('生成失败，请重试');
          return;
        }
      }

      setError('生成超时，请重试');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
    }
  }

  if (resultUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>你的新形象</Text>
        {/* BeforeAfter component rendered here: result.tsx handles this */}
        <Pressable style={styles.button} onPress={() => router.replace({ pathname: '/result', params: { photoUri, resultUri, taskId: taskIdRef.current } })}>
          <Text style={styles.buttonText}>查看效果</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>正在生成</Text>
      <GenerationProgress stage={stage === 'pending' ? 'uploading' : stage === 'processing' ? 'generating' : 'completed'} />
      {error ? (
        <View>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.button} onPress={submitAndPoll}>
            <Text style={styles.buttonText}>重试</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F172A', gap: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#F8FAFC' },
  error: { color: '#EF4444', fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add generation progress screen with polling and before/after slider"
```

---

### Task 2.9: Result screen, history screen, profile screen

**Files:**
- Create: `apps/mobile/app/result.tsx`
- Create: `apps/mobile/app/(tabs)/history.tsx`
- Create: `apps/mobile/app/(tabs)/profile.tsx`

- [ ] **Step 1: Create apps/mobile/app/result.tsx**

```typescript
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { BeforeAfter } from '../components/BeforeAfter';

export default function Result() {
  const { photoUri, resultUri } = useLocalSearchParams<{ photoUri: string; resultUri: string }>();

  async function saveToGallery() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相册权限');
      return;
    }

    const localPath = FileSystem.cacheDirectory + `istyle-${Date.now()}.jpg`;
    await FileSystem.downloadAsync(resultUri!, localPath);
    await MediaLibrary.saveToLibraryAsync(localPath);
    Alert.alert('已保存到相册');
  }

  return (
    <View style={styles.container}>
      <BeforeAfter beforeUri={photoUri!} afterUri={resultUri!} />
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={saveToGallery}>
          <Text style={styles.primaryButtonText}>保存到相册</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/explore')}>
          <Text style={styles.secondaryButtonText}>换一种风格</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeLink}>返回首页</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  actions: { padding: 24, gap: 12, alignItems: 'center' },
  primaryButton: { width: '100%', backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { width: '100%', backgroundColor: '#1E293B', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  secondaryButtonText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  homeLink: { color: '#64748B', fontSize: 14, marginTop: 8 },
});
```

- [ ] **Step 2: Create apps/mobile/app/(tabs)/history.tsx**

```typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { api } from '../../lib/api';
import type { GenerationRecord } from '@istyle/shared';

export default function History() {
  const [items, setItems] = useState<GenerationRecord[]>([]);

  useEffect(() => {
    api<{ data: GenerationRecord[] }>('/api/generate/history').then(res => setItems(res.data)).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>还没有生成记录</Text>
          <Text style={styles.emptyHint}>去首页开始你的第一次试穿</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.resultImageUrl && <Image source={{ uri: item.resultImageUrl }} style={styles.thumb} />}
              <View style={styles.info}>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</Text>
                <Text style={styles.status}>{item.status === 'completed' ? '✓ 完成' : item.status === 'failed' ? '✗ 失败' : '⏳ 处理中'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 18 },
  emptyHint: { color: '#64748B', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 12, padding: 12, gap: 12 },
  thumb: { width: 64, height: 96, borderRadius: 8 },
  info: { justifyContent: 'center' },
  date: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  status: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
});
```

- [ ] **Step 3: Create apps/mobile/app/(tabs)/profile.tsx**

```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../lib/auth';
import { router } from 'expo-router';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.email}>{user?.email ?? '未登录'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>档案</Text>
        {user ? (
          <View style={styles.row}>
            <Text style={styles.label}>性别</Text>
            <Text style={styles.value}>{user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>订阅</Text>
        <Text style={styles.plan}>Free 计划 · 每日 3 次免费生成</Text>
        <Pressable style={styles.upgradeButton}>
          <Text style={styles.upgradeText}>升级到 Pro</Text>
        </Pressable>
      </View>

      {user ? (
        <Pressable style={styles.logoutButton} onPress={() => { logout(); router.replace('/onboarding'); }}>
          <Text style={styles.logoutText}>退出登录</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>登录/注册</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, gap: 24 },
  header: { alignItems: 'center', gap: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  email: { color: '#F8FAFC', fontSize: 18 },
  section: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, gap: 10 },
  sectionTitle: { color: '#94A3B8', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#94A3B8' },
  value: { color: '#F8FAFC' },
  plan: { color: '#F8FAFC', fontSize: 16 },
  upgradeButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  upgradeText: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { alignItems: 'center', paddingVertical: 14 },
  logoutText: { color: '#EF4444', fontSize: 16 },
});
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add result, history, and profile screens"
```

---

## Phase 3: CI/CD & Integration

### Task 3.1: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter @istyle/shared typecheck
      - run: pnpm --filter @istyle/api typecheck
      - run: pnpm --filter @istyle/api test

  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter @istyle/mobile typecheck
      - run: pnpm --filter @istyle/mobile test
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "ci: add GitHub Actions workflow for typecheck + tests"
```

---

### Task 3.2: Supabase migration SQL + env.example

**Files:**
- Create: `infrastructure/supabase-migration.sql`
- Create: `apps/api/.env.example`
- Create: `apps/mobile/.env.example`

- [ ] **Step 1: Create infrastructure/supabase-migration.sql**

```sql
-- Run in Supabase SQL Editor

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  age INT NOT NULL,
  height_cm INT NOT NULL,
  weight_kg INT NOT NULL,
  preferred_styles TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  result_image_url TEXT,
  style_template_ids TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro_monthly', 'pro_yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  daily_remaining INT NOT NULL DEFAULT 3,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_generation_history_user ON generation_history(user_id, created_at DESC);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Storage bucket for user photos
INSERT INTO storage.buckets (id, name, public) VALUES ('user-photos', 'user-photos', true);

-- Policy: users can only read their own photos
CREATE POLICY "Users read own photos" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: users can upload to their own folder
CREATE POLICY "Users upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

- [ ] **Step 2: Create apps/api/.env.example**

```
PORT=3000
HOST=0.0.0.0
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb-secret-...
REPLICATE_API_TOKEN=r8_...
REDIS_URL=redis://localhost:6379
WEEKLY_COST_LIMIT_USD=100
```

- [ ] **Step 3: Create apps/mobile/.env.example**

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Supabase migration SQL and env.example files"
```

---

## Verification Checklist

After all tasks are complete, verify the following:

- [ ] `pnpm install` succeeds at root
- [ ] `pnpm typecheck` passes for all packages
- [ ] `pnpm --filter @istyle/api dev` starts the API server without errors
- [ ] `pnpm --filter @istyle/mobile start` starts Expo dev server without errors
- [ ] API: `POST /api/auth/register` creates user + profile
- [ ] API: `POST /api/auth/login` returns token
- [ ] API: `GET /api/users/me` returns profile with valid token
- [ ] API: `GET /api/styles` returns 4 MVP templates
- [ ] API: `POST /api/upload` with JPEG returns public URL
- [ ] API: `POST /api/generate` creates task and returns taskId
- [ ] API: `GET /api/generate/:taskId` returns completed result
- [ ] Mobile: Onboarding → Register → Login → Home flow works
- [ ] Mobile: Quick Try-On → Camera → Generate → Result flow works
- [ ] Mobile: Explore → Multi-select styles → Camera → Generate flow works
- [ ] Mobile: Before/After slider is interactive
- [ ] Mobile: Save to gallery works
- [ ] Mobile: History screen shows past generations
- [ ] Mobile: Quota badge shows remaining count
