// iStyle Pro PM2 Ecosystem File
// Deploy to Tencent Cloud: pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name: 'istyle-api',
      cwd: './apps/api',
      script: 'dist/index.js',
      // For dev on server, use tsx:
      // script: 'node_modules/.bin/tsx',
      // args: 'src/index.ts',
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
      },
      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 5000,
      // Auto-restart on crash
      max_restarts: 10,
      restart_delay: 2000,
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/istyle/api-error.log',
      out_file: '/var/log/istyle/api-out.log',
      merge_logs: true,
      // Health check
      max_memory_restart: '512M',
    },
  ],
};
