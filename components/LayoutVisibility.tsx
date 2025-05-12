'use client';
import { usePathname } from 'next/navigation';

export default function LayoutVisibility({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  // Si adminOnly, on affiche les children SEULEMENT dans l'admin
  // Sinon, on affiche les children SEULEMENT si on N'EST PAS dans l'admin
  if (adminOnly) return isAdmin ? <>{children}</> : null;
  return isAdmin ? null : <>{children}</>;
}