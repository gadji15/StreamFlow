import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ToastProvider } from "@/components/ui/toaster";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/scroll-to-top";
import ConnectivityIndicator from "@/components/connectivity-indicator";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import PWAUpdatePrompt from "@/components/pwa-update-prompt";

// Métadonnées pour le SEO et les partages sociaux
export const metadata: Metadata = {
  title: "StreamFlow - Plateforme de streaming",
  description: "Découvrez des films et séries en streaming sur StreamFlow",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "StreamFlow",
    statusBarStyle: "default",
  },
};

// Propriétés de viewport séparées selon la nouvelle API Next.js
export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-gray-900">
        <AuthProvider>
          <ThemeProvider 
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              <Header />
              <main className="flex-1 pt-24">
                {children}
              </main>
              <Footer />
              <ScrollToTop />
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