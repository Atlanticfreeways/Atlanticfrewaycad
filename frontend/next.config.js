/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Note: rewrites are ignored in 'export' mode, handled by server.js in production
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/:path*',
      },
    ]
  },
};

module.exports = nextConfig;
