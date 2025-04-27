import "./globals.css"; // Assurez-vous que ce fichier existe et est correct
import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google'; // Exemple de police, adaptez si nécessaire
import { ThemeProvider } from "@/components/theme-provider"; // Vérifiez l'existence et l'export
import Header from "@/components/header"; // Vérifiez l'existence et l'export
import Footer from "@/components/footer"; // Vérifiez l'existence et l'export
import ScrollToTop from "@/components/scroll-to-top"; // Vérifiez l'existence et l'export
import { ToastProvider } from "@/components/ui/toaster"; // Vérifiez l'existence et l'export
import PWAInstallPrompt from "@/components/pwa-install-prompt"; // Vérifiez l'existence et l'export
import PWAUpdatePrompt from "@/components/pwa-update-prompt"; // Vérifiez l'existence et l'export
import ConnectivityIndicator from "@/components/connectivity-indicator"; // Vérifiez l'existence et l'export
import { AuthProvider } from "@/hooks/use-auth"; // Vérifiez l'existence et l'export (doit être use-auth.tsx)

const inter = Inter({ subsets: ['latin'] }); // Exemple de configuration de police

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
    statusBarStyle: "default", // ou 'black-translucent'
  },
  openGraph: {
    title: "StreamFlow - Plateforme de streaming Films et Séries",
    description: "Regardez des films et séries en ligne sur StreamFlow.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'StreamFlow',
    images: [
      {
        url: '/og-image.png', // Créez cette image (1200x630)
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
    images: ['/og-image.png'], // Doit être une URL absolue en production
  },
};

// Propriétés de viewport séparées selon la nouvelle API Next.js
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }, // Adaptez à votre couleur de fond dark
  ],
  colorScheme: 'dark light',
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // Pour PWA sur appareils mobiles
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark" // Thème par défaut
            enableSystem // Permettre de suivre le thème système
            disableTransitionOnChange // Désactiver les transitions lors du changement de thème
          >
            <ToastProvider>
              <Header />
              <main className="flex-1 pt-16 md:pt-20"> {/* Ajuster padding top selon hauteur header */}
                {children}
              </main>
              <Footer />
              <ScrollToTop />
              {/* Composants PWA globaux */}
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
              <ConnectivityIndicator />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}