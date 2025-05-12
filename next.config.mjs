import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [

      'image.tmdb.org',
      'lh3.googleusercontent.com',
    ],
  },
  // La propriété serverActions a été supprimée car elle est maintenant activée par défaut
  // et était incorrectement définie comme booléen au lieu d'un objet
};

// Configuration PWA
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Désactive le PWA en dev
});

// Exporter la configuration combinée
export default pwaConfig(nextConfig);