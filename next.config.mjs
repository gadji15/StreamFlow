import withPWA from "next-pwa";

/**
 * Configuration Next.js avec PWA support
 * @type {import('next').NextConfig}
 */
const nextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
})({
  reactStrictMode: true,
  
  // Configuration pour les images externes
  images: {
    domains: [
      'res.cloudinary.com',
      'firebasestorage.googleapis.com'
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression pour optimiser la performance
  compress: true,
  
  // En-têtes HTTP pour la sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: 'block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  
  // Configuration pour Cloudinary
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
});

export default nextConfig;