/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supprimer l'option serverExternalPackages non reconnue
  // serverExternalPackages: [...],
  
  // Options valides pour Next.js
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'image.tmdb.org',
      'lh3.googleusercontent.com',
    ],
  },
  experimental: {
    // Si vous avez besoin de fonctionnalités expérimentales, les placer ici
    serverActions: true,
  },
  // Autres options valides
};

export default nextConfig;