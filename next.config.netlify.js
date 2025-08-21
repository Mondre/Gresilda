/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {}
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurazione per Netlify
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
