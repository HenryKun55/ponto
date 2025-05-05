/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Configura para exportação estática
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Necessário para exportação estática
  },
  // Configuração dinâmica do basePath
  basePath: process.env.NODE_ENV === 'production' ? '/ponto' : '',

  // Caso você não precise do basePath em produção, apenas deixe a linha comentada.
};

export default nextConfig;
