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
  // Vous pouvez ajouter d'autres options valides selon vos besoins
};

export default nextConfig;