import { Metadata } from 'next';
import AuthGuard from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'Mon compte - StreamFlow',
  description: 'Gérez votre compte et vos préférences sur StreamFlow',
};

export default function MonCompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mon compte</h1>
        {children}
      </div>
    </AuthGuard>
  );
}