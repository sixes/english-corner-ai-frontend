/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.englishcorner.cyou',
      },
    ],
  },
  experimental: {
    // Turbopack is experimental in Next.js 16
  },
}

module.exports = nextConfig
