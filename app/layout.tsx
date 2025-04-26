import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { ToastProvider } from "@/components/ui/toaster";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StreamFlow - Plateforme de streaming",
  description: "Regardez vos films et séries préférés en streaming HD",
  // Ajout des méta-tags PWA
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StreamFlow"
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1
  },
  themeColor: "#7C3AED",
  verification: {
    other: {
      "mobile-web-app-capable": ["yes"],
      "apple-mobile-web-app-capable": ["yes"],
      "application-name": ["StreamFlow"],
      "apple-mobile-web-app-title": ["StreamFlow"],
      "msapplication-starturl": ["/"],
      "msapplication-TileColor": ["#7C3AED"]
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Liens alternatifs pour PWA */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#7C3AED" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 pt-24">{children}</main>
          <Footer />
          <ScrollToTop />
          <PWAInstallPrompt />
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}