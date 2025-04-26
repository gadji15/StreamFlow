import { ReactNode } from "react";
import { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import ScrollToTop from "@/components/scroll-to-top";
import { ToastProvider } from "@/components/ui/toaster";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamFlow - Plateforme de streaming",
  description: "Découvrez des films et séries en streaming sur StreamFlow",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StreamFlow",
  },
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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <Header />
            <main className="flex-1 pt-24">{children}</main>
            <Footer />
            <ScrollToTop />
            <PWAInstallPrompt />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}