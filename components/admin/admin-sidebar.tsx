import Link from "next/link";
import { LayoutDashboard, Film, Users, Settings, Home } from "lucide-react";

export default function AdminSidebar() {
  // Barre latérale fixe non repliable pour le test
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 flex items-center border-b border-gray-800 px-4">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            StreamFlow Admin
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
              <LayoutDashboard className="h-5 w-5" />
              <span>Tableau de bord</span>
            </Link>
            <Link href="/admin/movies" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
              <Film className="h-5 w-5" />
              <span>Films</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
              <Users className="h-5 w-5" />
              <span>Utilisateurs</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white">
              <Settings className="h-5 w-5" />
              <span>Paramètres</span>
            </Link>
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800/50">
            <Home className="h-5 w-5" />
            <span>Retour au site</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}