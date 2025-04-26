import "./globals.css";
import type { Metadata, Viewport } from "next";

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
  },
};

// Déplacer themeColor et viewport ici selon les nouvelles directives de Next.js 15
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
    <html lang="fr">
      <body>
        <div style={{ color: "white", background: "#111", minHeight: "100vh", padding: "20px" }}>
          <h1>Test StreamFlow</h1>
          {children}
        </div>
      </body>
    </html>
  );
}