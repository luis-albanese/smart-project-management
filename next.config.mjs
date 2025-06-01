/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Deshabilitar standalone para evitar conflictos
  // Usar build normal que funciona en todas las plataformas
  output: undefined,
  // Configuración para mejorar compatibilidad con Windows
  outputFileTracingRoot: process.cwd(),
  // Configuración webpack para Windows
  webpack: (config, { isServer }) => {
    if (isServer && process.platform === 'win32') {
      // Mejorar resolución de módulos en Windows
      config.resolve.symlinks = false;
    }
    return config;
  },
  experimental: {
    // Habilitar características experimentales si es necesario
  },
}

export default nextConfig
