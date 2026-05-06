import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/afms',
  assetPrefix: isProduction ? '/afms/' : undefined,
  reactStrictMode: true,
  poweredByHeader: false
};

export default nextConfig;
