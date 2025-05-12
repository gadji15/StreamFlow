import dynamic from "next/dynamic";

// Chargement dynamique pour éviter les soucis "use client"
// (optionnel selon votre structure)
const AdminUsers = dynamic(() => import("@/components/admin/AdminUsers"), {
  ssr: false,
});

export default function AdminUsersPage() {
  return <AdminUsers />;
}