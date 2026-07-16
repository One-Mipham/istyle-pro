# iStyle Pro — Build & Deploy Guide

## CI (GitHub Actions)

`api` + `mobile` jobs run on every push/PR: typecheck + tests.

## PWA (Web) Build

```bash
cd apps/mobile
pnpm build:pwa
# Output: apps/mobile/dist/
```

## Desktop Build (Windows / Mac)

```bash
# 1. Build PWA first (desktop loads it)
pnpm --filter @istyle/mobile build:pwa

# 2. Install desktop deps
pnpm install --filter @istyle/desktop

# 3. Build
cd apps/desktop

# Windows (.exe installer)
pnpm build:win

# Mac (.dmg)
pnpm build:mac

# Output: apps/desktop/dist/
```

## Deploy to Tencent Cloud

```bash
DEPLOY_SERVER_IP=<server-ip> bash deploy/scripts/deploy.sh production
```

Or via scp/rsync manually:

```bash
# 1. Build PWA
pnpm --filter @istyle/mobile build:pwa

# 2. Build API
pnpm --filter @istyle/api build

# 3. Copy to server
rsync -avz apps/mobile/dist/ root@<server>:/var/www/istyle.app/
rsync -avz apps/api/dist/ apps/api/package.json root@<server>:/var/www/istyle.app/api/

# 4. Install deps + restart
ssh root@<server> "cd /var/www/istyle.app/api && pnpm install --prod"
ssh root@<server> "pm2 reload ecosystem.config.cjs --env production"
```
