/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {}
  },
  eslint: {
    // Durante il build, ignora gli errori ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Durante il build, ignora gli errori TypeScript
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
