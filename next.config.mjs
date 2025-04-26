import withPWA from 'next-pwa';

// Configuration PWA de base
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Désactiver temporairement certains composants qui pourraient causer des problèmes
  dynamicStartUrl: false,
  buildExcludes: [/middleware-manifest\.json$/]
};

// Configuration Next.js simplifiée
const nextConfig = {
  reactStrictMode: true,
  
  // Pour ignorer temporairement les erreurs de type pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuration d'images
  images: {
    domains: [
      'res.cloudinary.com',
      'firebasestorage.googleapis.com'
    ],
  },
  
  // Webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        net: false,
        tls: false,
      };
    }
    return config;
  }
};

// Export avec PWA réactivé
export default withPWA(pwaConfig)(nextConfig);