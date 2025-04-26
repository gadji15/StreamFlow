import withPWA from 'next-pwa';

// Configuration PWA
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
};

// Configuration Next.js existante
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
  // Conservez vos autres configurations existantes ici
};

// Export avec la syntaxe ES modules
export default withPWA(pwaConfig)(nextConfig);