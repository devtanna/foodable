module.exports = {
  apps: [
    {
      name: 'foodable',
      watch: true,
      instances: 4,
      exec_mode: 'cluster',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        MONGO_ENV: 'atlas',
        ENABLE_AZURE: 'true',
      },
    },
  ],
};
