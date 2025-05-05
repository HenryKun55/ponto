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
  // O basePath deve corresponder ao nome do seu repositório se não estiver usando um domínio personalizado
  // Por exemplo, se seu repositório for github.com/seunome/ponto-app
  basePath: '/ponto',
  
  // Descomente e ajuste a linha acima quando for fazer o deploy
};

export default nextConfig;
