/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow larger image uploads (up to 20MB) via API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

module.exports = nextConfig;
