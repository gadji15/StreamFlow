import withPWA from 'next-pwa';

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
  
  // Configuration d'en-têtes HTTP (sécurité)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  }
};

// Configuration PWA simplifiée
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
};

export default withPWA(pwaConfig)(nextConfig);