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
  
  // Configuration d'images
  images: {
    domains: [
      'res.cloudinary.com',
      'firebasestorage.googleapis.com'
    ],
  },
  
  // Compression
  compress: true,
  
  // Configuration d'en-têtes HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: 'block' },
        ],
      },
    ];
  },
  
  // Important: déplacé de experimental.serverComponentsExternalPackages à serverExternalPackages
  // pour Next.js 15.3.1
  serverExternalPackages: ['cloudinary'],
  
  // Configurer webpack pour gérer les imports de modules Node.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Empêcher les modules Node.js d'être inclus dans le bundle client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false
      };
    }
    
    return config;
  }
};

// Export avec la syntaxe ES Modules
export default withPWA(pwaConfig)(nextConfig);