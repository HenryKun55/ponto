/** @type {import('next').NextConfig} */
const nextConfig = {
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
  basePath: '',

  // Caso você não precise do basePath em produção, apenas deixe a linha comentada.
};

export default nextConfig;
