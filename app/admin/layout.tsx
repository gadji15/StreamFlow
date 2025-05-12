import { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'StreamFlow Admin',
  description: "Interface d'administration de StreamFlow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ici, on n'inclut PAS le Header/Footer global du site !
  // On encapsule UNIQUEMENT le layout admin (header admin, sidebar, etc.)
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}