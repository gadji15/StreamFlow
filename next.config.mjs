import withPWA from 'next-pwa';

// Configuration PWA
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
};

// Configuration Next.js
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
  
  // Configuration des packages externes côté serveur
  serverExternalPackages: ['cloudinary'],
  
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

// Export avec la syntaxe ES Modules
export default withPWA(pwaConfig)(nextConfig);