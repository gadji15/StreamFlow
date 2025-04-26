import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toaster";
import AuthGuard from "@/components/admin/auth-guard"; // Importer le AuthGuard

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StreamFlow - Administration",
  description: "Interface d'administration StreamFlow",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-900`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthGuard> {/* Envelopper les enfants avec AuthGuard */}
            {children}
          </AuthGuard>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}