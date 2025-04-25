import { Bell, User } from "lucide-react";

export default function AdminHeader({ title = "Tableau de bord" }) {
  return (
    // Header fixe au-dessus du contenu principal
    // Note: Le `left-64` correspond à la largeur de la sidebar fixe
    <header className="fixed top-0 right-0 left-64 h-16 bg-gray-900 border-b border-gray-800 shadow-md z-40 px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-white">{title}</h1>
      
      {/* Icônes d'action simplifiées */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </button>
        <button className="text-gray-400 hover:text-white">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}