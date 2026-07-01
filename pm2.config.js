module.exports = {
  apps: [
    {
      name: 'medsync-api',
      script: 'dist/main.js',
      cwd: '/opt/medsync/server',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/opt/medsync/logs/api-error.log',
      out_file:   '/opt/medsync/logs/api-out.log',
      merge_logs: true,
      restart_delay: 3000,
    },
  ],
};
