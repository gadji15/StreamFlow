import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";

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

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark" enableSystem={true}>
          <div style={{ minHeight: "100vh", padding: "20px" }}>
            <h1 className="text-2xl font-bold mb-6">StreamFlow</h1>
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}