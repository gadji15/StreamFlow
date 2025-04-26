/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
  // Toutes vos autres configurations existantes...
}

module.exports = withPWA(nextConfig)