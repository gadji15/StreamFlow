import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      {/* La sidebar est maintenant fixe et prend sa propre place */}
      <AdminSidebar />

      {/* Conteneur principal qui prend le reste de l'espace */}
      {/* ml-64 correspond à la largeur de la sidebar */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Le header est fixe et prend toute la largeur de ce conteneur */}
        <AdminHeader title="Tableau de bord Test" />

        {/* Contenu principal */}
        {/* pt-16 ajoute un padding en haut égal à la hauteur du header */}
        <main className="flex-1 p-6 pt-16 bg-gray-950">
          <h2 className="text-2xl font-semibold text-white">Contenu du tableau de bord</h2>
          <p className="text-gray-400 mt-2">Si vous voyez ceci, la structure de base fonctionne.</p>
          
          {/* Espace réservé pour le contenu */}
          <div className="mt-6 border-2 border-dashed border-gray-700 rounded-lg h-96 flex items-center justify-center">
            <span className="text-gray-500">Contenu de la page ici</span>
          </div>
        </main>
      </div>
    </div>
  );
}