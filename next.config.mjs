/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Configura para exportação estática
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Necessário para exportação estática
  },
  basePath: process.env.NODE_ENV === 'production' ? '/ponto' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ponto/' : '',
}

export default nextConfig
