import Link from "next/link";
import { Home, Search, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-6">Page non trouvée</h2>
      <p className="text-gray-400 max-w-md mb-8">
        Désolé, la page que vous recherchez ne semble pas exister ou a été déplacée.
      </p>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/">
          <Button className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Button>
        </Link>
        
        <Link href="/films">
          <Button variant="outline" className="flex items-center">
            <Film className="mr-2 h-4 w-4" />
            Films
          </Button>
        </Link>
        
        <Link href="/series">
          <Button variant="outline" className="flex items-center">
            <Tv className="mr-2 h-4 w-4" />
            Séries
          </Button>
        </Link>
      </div>
      
      <div className="mt-12 bg-gray-800 p-6 rounded-lg max-w-lg">
        <h3 className="font-semibold mb-4">Suggestions populaires</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/films" className="text-purple-400 hover:underline flex items-center justify-center">
              <Film className="mr-2 h-4 w-4" />
              Explorer tous les films
            </Link>
          </li>
          <li>
            <Link href="/series" className="text-purple-400 hover:underline flex items-center justify-center">
              <Tv className="mr-2 h-4 w-4" />
              Explorer toutes les séries
            </Link>
          </li>
          <li>
            <Link href="/categories" className="text-purple-400 hover:underline flex items-center justify-center">
              <Search className="mr-2 h-4 w-4" />
              Parcourir les catégories
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}