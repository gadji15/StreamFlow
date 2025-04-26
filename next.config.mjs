// Configuration Next.js simplifiée sans PWA pour déboguer
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
  },
  
  // Webpack config
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
      };
    }
    return config;
  }
};

// Export sans PWA
export default nextConfig;