const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true
  });
  
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    
    images: {
      domains: [
        'res.cloudinary.com',
        'firebasestorage.googleapis.com'
      ],
    },
    
    compress: true,
    
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
    
    // Correction: déplacé de experimental.serverComponentsExternalPackages à serverExternalPackages
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
  
  module.exports = withPWA(nextConfig);