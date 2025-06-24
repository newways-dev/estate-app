module.exports = {
  apps: [
    {
      name: 'rentiful-estate',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
}
