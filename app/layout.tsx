import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { ToastProvider } from "@/components/ui/toaster"; // Import correct
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StreamFlow - Plateforme de streaming",
  description: "Regardez vos films et séries préférés en streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
          <ToastProvider /> {/* Correction: Utiliser ToastProvider au lieu de Toaster */}
        </ThemeProvider>
      </body>
    </html>
  );
}