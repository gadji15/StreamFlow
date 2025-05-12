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
  // ...inchangé...
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
          <ErrorBoundary>
            <GlobalErrorLogger />
            <ThemeProvider>
              <Header />
              <main className="max-w-[1440px] mx-auto px-8 py-10 min-h-[calc(100vh-160px)] w-full flex-1">
                {children}
              </main>
              <Footer />
            </ThemeProvider>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
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
  // Ce hook ne fonctionne qu'en client, donc astuce pour SSR/CSR :
  let pathname = "";
  if (typeof window !== "undefined") {
    pathname = window.location.pathname;
  }

  // Solution hybride pour Next.js app-router : fallback sur client
  const [clientPath, setClientPath] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") setClientPath(window.location.pathname);
  }, []);

  const isAdmin = (clientPath ?? pathname).startsWith("/admin");

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <AuthProvider>
          <ErrorBoundary>
            <GlobalErrorLogger />
            <ThemeProvider>
              {/* On masque le Header/Fooer si on est sous /admin */}
              {!isAdmin && <Header />}
              <main style={{
                maxWidth: 1440,
                margin: '0 auto',
                padding: '2.5rem 2rem',
                minHeight: 'calc(100vh - 160px)'
              }}>
                {children}
              </main>
              {!isAdmin && <Footer />}
            </ThemeProvider>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}