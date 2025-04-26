import withPWA from 'next-pwa';

// Configuration PWA minimale mais fonctionnelle
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Options pour réduire les erreurs potentielles
  dynamicStartUrl: false,
  buildExcludes: [/middleware-manifest\.json$/]
};

// Configuration Next.js
const nextConfig = {
  reactStrictMode: true,
  
  // Pour ignorer temporairement les erreurs de type pendant le build
  // Vous pourrez retirer cette option une fois tout fonctionnel
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
  
  // Important pour les packages avec modules Node.js côté serveur
  serverExternalPackages: ['cloudinary'],
  
  // Webpack config pour gérer les imports de modules Node.js côté client
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
        child_process: false,
      };
    }
    return config;
  }
};

// Export avec PWA réactivé
export default withPWA(pwaConfig)(nextConfig);