#!/usr/bin/env bash
# iStyle Pro — Tencent Cloud Server Initialization
# Run as root on a fresh lightweight server.
# Usage: ssh root@82.156.254.121 'bash -s' < deploy/scripts/init-server.sh

set -euo pipefail
echo "🚀 Initializing iStyle Pro server..."

# ── 1. System update ──
echo "📦 Updating system..."
apt update -qq && apt upgrade -y -qq

# ── 2. Node.js 22 LTS ──
echo "📦 Installing Node.js 22..."
if ! command -v node || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi
echo "   Node: $(node -v)"

# ── 3. pnpm (should already exist, upgrade if needed) ──
npm install -g pnpm@latest
echo "   pnpm: $(pnpm -v)"

# ── 4. PM2 ──
npm install -g pm2@latest
echo "   PM2: $(pm2 -v)"

# ── 5. Redis ──
echo "📦 Installing Redis..."
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
echo "   Redis: $(redis-cli ping)"

# ── 6. Nginx ──
echo "📦 Installing Nginx..."
apt install -y nginx
systemctl enable nginx
echo "   Nginx installed"

# ── 7. Certbot (Let's Encrypt SSL) ──
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# ── 8. Create directories ──
echo "📁 Creating directories..."
mkdir -p /var/www/istyle.app/downloads
mkdir -p /var/log/istyle

# ── 9. Clone repo ──
echo "📥 Cloning iStyle Pro..."
cd /var/www/istyle.app
if [ -d ".git" ]; then
  git pull origin main
else
  git clone https://github.com/One-Mipham/istyle-pro.git /var/www/istyle.app
fi

# ── 10. Install API deps + build ──
echo "🔧 Building API..."
cd /var/www/istyle.app
pnpm install --filter @istyle/shared --filter @istyle/api
cd apps/api
pnpm build

# ── 11. Nginx config ──
echo "⚙️ Configuring Nginx..."
cp /var/www/istyle.app/deploy/nginx/istyle.app.conf /etc/nginx/sites-available/istyle.app
ln -sf /etc/nginx/sites-available/istyle.app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "   Nginx configured"

# ── 12. SSL cert ──
echo "🔒 Requesting SSL certificate..."
certbot --nginx -d istyle.app -d www.istyle.app --non-interactive --agree-tos -m admin@onemipham.com || echo "⚠️ SSL cert skipped (DNS may not be pointing here yet)"

# ── 13. PM2 startup ──
echo "🚀 Starting API..."
cd /var/www/istyle.app
pm2 start deploy/pm2/ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "✅ Server initialization complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Point DNS: istyle.app A → 82.156.254.121"
echo "   2. Edit PM2 config: vim /var/www/istyle.app/deploy/pm2/ecosystem.config.cjs"
echo "   3. Fill in Supabase + Hunyuan + Replicate credentials"
echo "   4. pm2 restart istyle-api"
echo "   5. Test: curl https://istyle.app/api/styles"
echo ""
echo "   PM2 logs: pm2 logs istyle-api"
echo "   Nginx:    nginx -t && systemctl reload nginx"
