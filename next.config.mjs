import withPWAInit from 'next-pwa';

/** @type {import('next-pwa').PWAConfig} */
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Vous pouvez ajouter d'autres configurations PWA ici si nécessaire
  // runtimeCaching: [...] // Décommenter pour des stratégies de cache personnalisées
};

const withPWA = withPWAInit(pwaConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // Ajoutez d'autres domaines si nécessaire (ex: pour les avatars)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Pour Google Sign-In Avatars
      }
    ],
  },
  compress: true,
  
  headers() {
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
  
  // Option pour ignorer les erreurs TypeScript pendant le build (temporaire)
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // Option pour ignorer les erreurs ESLint pendant le build (temporaire)
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  webpack: (config, { isServer }) => {
    // Exclure certains modules Node.js du bundle client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Important pour éviter les erreurs avec Cloudinary côté serveur
    config.externals = config.externals || [];
    config.externals.push('cloudinary');

    return config;
  },
  // Déplacé hors de 'experimental' pour Next.js 14+
  serverExternalPackages: ['cloudinary'],
};

export default withPWA(nextConfig);