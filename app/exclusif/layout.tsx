import { Metadata } from 'next';
import AuthGuard from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'Contenu Exclusif VIP - StreamFlow',
  description: 'Accédez à notre contenu exclusif réservé aux membres VIP',
};

export default function ExclusifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireVIP={true}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Contenu Exclusif VIP</h1>
        {children}
      </div>
    </AuthGuard>
  );
}