import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/scroll-to-top";
import { ToastProvider } from "@/components/ui/toaster";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import PWAUpdatePrompt from "@/components/pwa-update-prompt";
import ConnectivityIndicator from "@/components/connectivity-indicator";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalErrorLogger from "@/components/GlobalErrorLogger";

const inter = Inter({ subsets: ['latin'] });

// Métadonnées pour le SEO et les partages sociaux
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "StreamFlow - Plateforme de streaming Films et Séries",
    template: "%s | StreamFlow",
  },
  description: "Découvrez et regardez des milliers de films et séries en streaming sur StreamFlow. Catalogue mis à jour régulièrement.",
  manifest: "/manifest.json",
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#7c3aed' },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "StreamFlow",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "StreamFlow - Plateforme de streaming Films et Séries",
    description: "Regardez des films et séries en ligne sur StreamFlow.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'StreamFlow',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Logo StreamFlow',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "StreamFlow - Plateforme de streaming Films et Séries",
    description: "Regardez des films et séries en ligne sur StreamFlow.",
    images: ['/og-image.png'],
  },
};

// Propriétés de viewport séparées selon la nouvelle API Next.js
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'dark light',
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-bg text-text`}>
        <AuthProvider>
          <ErrorBoundary>
            <GlobalErrorLogger />
            <ThemeProvider>
              {/* Ajout du Header pour avoir la navbar sur toutes les pages */}
              <Header />
              <main style={{
                maxWidth: 1440,
                margin: '0 auto',
                padding: '2.5rem 2rem',
                minHeight: 'calc(100vh - 160px)' // adapte selon la hauteur du header/footer
              }}>
                {children}
              </main>
              <Footer />
            </ThemeProvider>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}