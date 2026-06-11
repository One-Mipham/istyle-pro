# iStyle Pro

AI-powered intelligent fashion & style platform — virtual try-on, AI outfit generation, and personal style management.

## Architecture

```
apps/
├── api/         Express API server (Replicate, Supabase, auth)
├── mobile/      React Native (Expo) mobile app
│
packages/
└── shared/      Shared types, constants
│
infrastructure/
└── supabase-migration.sql
```

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Mobile**: React Native (Expo)
- **AI**: Replicate API (image generation models)
- **Database**: Supabase (PostgreSQL)
- **Infra**: Supabase + Vercel

## License

Proprietary. Copyright © 2026 One Mipham Corporation.
