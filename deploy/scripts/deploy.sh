#!/usr/bin/env bash
# iStyle Pro — Deploy to Tencent Cloud Lightweight Server
# Usage: ./deploy/scripts/deploy.sh [production|staging]
#
# Prerequisites:
#   1. SSH key added to server: ssh-copy-id root@<server-ip>
#   2. Server has Node.js 22+, pnpm, PM2, Nginx installed
#   3. Certbot SSL cert already issued for istyle.app

set -euo pipefail

ENV="${1:-production}"
SERVER_IP="${DEPLOY_SERVER_IP:-}"
SERVER_USER="${DEPLOY_SERVER_USER:-root}"
REMOTE_DIR="/var/www/istyle.app"

if [ -z "$SERVER_IP" ]; then
  echo "❌ Set DEPLOY_SERVER_IP env var or pass server IP"
  echo "   Example: DEPLOY_SERVER_IP=1.2.3.4 ./deploy/scripts/deploy.sh"
  exit 1
fi

SSH="ssh ${SERVER_USER}@${SERVER_IP}"

echo "🚀 Deploying iStyle Pro (${ENV}) to ${SERVER_IP}..."

# ── 1. Build PWA ──
echo "📱 Building PWA..."
cd apps/mobile
npx expo export --platform web 2>&1 | tail -3
node scripts/pwa-postbuild.cjs
cd ../..

# ── 2. Build API ──
echo "🔧 Building API..."
cd apps/api
pnpm build 2>&1 | tail -3
cd ../..

# ── 3. Sync files to server ──
echo "📦 Syncing files to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.expo' \
  --exclude '*.log' \
  apps/mobile/dist/ \
  ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'src' \
  --exclude '*.log' \
  apps/api/dist/ \
  apps/api/package.json \
  ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/

# ── 4. Sync deployment configs ──
echo "⚙️ Syncing configs..."
rsync -avz \
  deploy/nginx/istyle.app.conf \
  ${SERVER_USER}@${SERVER_IP}:/etc/nginx/sites-available/istyle.app

rsync -avz \
  deploy/pm2/ecosystem.config.cjs \
  ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/ecosystem.config.cjs

# ── 5. Install API deps & restart services ──
echo "🔄 Restarting services on server..."
$SSH "bash -s" << 'REMOTE_SCRIPT'
  set -e

  # Install API deps
  cd /var/www/istyle.app/api
  pnpm install --prod --frozen-lockfile 2>&1 | tail -5

  # Reload Nginx
  nginx -t && systemctl reload nginx
  echo "✓ Nginx reloaded"

  # Restart API with PM2
  cd /var/www/istyle.app
  pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
  pm2 save
  echo "✓ PM2 restarted"
REMOTE_SCRIPT

# ── 6. Health check ──
echo "🏥 Health check..."
sleep 3
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "https://istyle.app/api/styles" || echo "000")
if [ "$HEALTH" = "200" ]; then
  echo "✅ Deploy complete — API returns $HEALTH"
else
  echo "⚠️  API returned $HEALTH — check server logs: pm2 logs istyle-api"
fi

echo ""
echo "📋 Post-deploy checklist:"
echo "   https://istyle.app                   — PWA homepage"
echo "   https://istyle.app/api/styles         — API health"
echo "   https://istyle.app/download/          — Desktop downloads"
echo "   ssh ${SERVER_USER}@${SERVER_IP} pm2 logs istyle-api   — API logs"
