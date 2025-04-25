import React from "react";

// Ce layout est très simple pour le moment, sans AuthGuard
// pour tester l'affichage de base.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {children}
    </div>
  );
}