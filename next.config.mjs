import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'image.tmdb.org',
      'lh3.googleusercontent.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
};

// Configuration PWA
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

// Exporter la configuration combinée
export default pwaConfig(nextConfig);