/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.englishcorner.pro',
      },
    ],
  },
  experimental: {
    // Turbopack is experimental in Next.js 16
  },
}

module.exports = withNextIntl(nextConfig);
