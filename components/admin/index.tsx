import React from 'react';
import AdminGuard from '@/components/auth/admin-guard';

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
        {/* Placez ici le contenu réel de votre admin */}
        <p>Bienvenue dans l’interface d’administration sécurisée.</p>
      </div>
    </AdminGuard>
  );
}