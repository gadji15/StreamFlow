import withPWA from 'next-pwa';

// Configuration PWA améliorée
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  sw: '/sw-custom.js', // Utiliser notre service worker personnalisé
  buildExcludes: [/middleware-manifest\.json$/],
  // Configurer les routes à précacher
  publicExcludes: [
    '!*.png',
    '!*.jpg',
    '!*.svg',
    '!favicon.ico',
    '!sw-custom.js',
  ],
  // Configuration du mode hors ligne
  fallbacks: {
    // Spécifier une page hors ligne personnalisée
    document: '/offline',
    // Fallback pour les images (image vide/placeholder)
    image: '/images/fallback.png',
  },
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
    // Formats d'image optimisés
    formats: ['image/avif', 'image/webp'],
  },
  
  // Important pour les packages avec modules Node.js côté serveur
  serverExternalPackages: ['cloudinary'],
  
  // En-têtes pour améliorer la sécurité et le cache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: 'block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Mise en cache des ressources statiques
        source: '/(images|icons|fonts)/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
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

// Export avec PWA activé
export default withPWA(pwaConfig)(nextConfig);