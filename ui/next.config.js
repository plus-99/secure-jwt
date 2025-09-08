/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add rule to handle TypeScript files from parent directory
    config.module.rules.push({
      test: /\.tsx?$/,
      include: [path.resolve(__dirname, '../src')],
      use: [defaultLoaders.babel],
    });

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ];
  }
};

module.exports = nextConfig;