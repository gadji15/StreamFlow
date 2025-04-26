import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { ToastProvider } from "@/components/ui/toaster";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import PWAInstallPrompt from "@/components/pwa-install-prompt"; // Ajout du composant

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // ... métadonnées comme dans l'étape 4 ...
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* ... liens comme dans l'étape 4 ... */}
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
          <PWAInstallPrompt /> {/* Ajout du composant */}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}