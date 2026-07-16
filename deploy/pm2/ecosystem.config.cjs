// iStyle Pro PM2 Ecosystem File
// Deploy to Tencent Cloud: pm2 start ecosystem.config.cjs --env production
//
// ⚠️ SECURITY: Replace <PLACEHOLDER> values on the server.
//    Never commit real secrets to git.

module.exports = {
  apps: [
    {
      name: 'istyle-api',
      cwd: './apps/api',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',

        // ── Supabase ──
        SUPABASE_URL: '<YOUR_SUPABASE_URL>',
        SUPABASE_SERVICE_ROLE_KEY: '<YOUR_SUPABASE_SERVICE_ROLE_KEY>',

        // ── AI: 腾讯混元 (国内首选) ──
        AI_PROVIDER: 'auto',
        TENCENT_SECRET_ID: '<YOUR_TENCENT_SECRET_ID>',
        TENCENT_SECRET_KEY: '<YOUR_TENCENT_SECRET_KEY>',

        // ── AI: Replicate (国际备用) ──
        REPLICATE_API_TOKEN: '<YOUR_REPLICATE_API_TOKEN>',
        REPLICATE_MODEL: 'prunaai/z-image-turbo-img2img',

        // ── Redis ──
        REDIS_URL: 'redis://127.0.0.1:6379',

        // ── 微信支付 (可选) ──
        // WECHAT_PAY_MCH_ID: '<YOUR_MCH_ID>',
        // WECHAT_PAY_API_KEY: '<YOUR_API_KEY>',
      },
      kill_timeout: 10000,
      listen_timeout: 5000,
      max_restarts: 10,
      restart_delay: 2000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/istyle/api-error.log',
      out_file: '/var/log/istyle/api-out.log',
      merge_logs: true,
      max_memory_restart: '512M',
    },
  ],
};
