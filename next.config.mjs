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
  // Standalone solo en Linux (evita problemas de symlinks en Windows)
  output: process.platform === 'linux' ? 'standalone' : undefined,
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
}

export default nextConfig
